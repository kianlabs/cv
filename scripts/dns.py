#!/usr/bin/env python3
"""Tiny Cloudflare DNS helper — so you never open the dashboard again.

Reads CLOUDFLARE_DNS_TOKEN from .env.local (never from argv, never printed).

Usage
-----
    python3 scripts/dns.py zones                      # list zones
    python3 scripts/dns.py ls kian.my.id              # list records
    python3 scripts/dns.py add app.kian.my.id myapp.vercel.app
    python3 scripts/dns.py add @ kian.my.id 216.198.79.1   # explicit A
    python3 scripts/dns.py cname app myapp.vercel.app      # app.<zone>
    python3 scripts/dns.py rm kian.my.id app.kian.my.id
    python3 scripts/dns.py check kian.my.id           # resolve via DoH

By default records are created DNS-only (not proxied): that is what Vercel
needs. Pass --proxied to turn Cloudflare's orange cloud on (use it for
self-hosted services, NOT for Vercel).
"""
from __future__ import annotations

import json
import os
import pathlib
import sys
import urllib.error
import urllib.request

API = "https://api.cloudflare.com/client/v4"
ROOT = pathlib.Path(__file__).resolve().parent.parent
DOH = "https://cloudflare-dns.com/dns-query"


def load_token() -> str:
    env = os.environ.get("CLOUDFLARE_DNS_TOKEN")
    if env:
        return env.strip()
    f = ROOT / ".env.local"
    if f.exists():
        for line in f.read_text().splitlines():
            line = line.strip()
            if line.startswith("CLOUDFLARE_DNS_TOKEN="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("CLOUDFLARE_DNS_TOKEN not found (env or .env.local)")


TOKEN = load_token()


def cf(path: str, method: str = "GET", body: dict | None = None):
    hdr = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(f"{API}{path}", data=data, method=method, headers=hdr)
    try:
        with urllib.request.urlopen(req, timeout=35) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        try:
            return json.load(e)
        except Exception:
            sys.exit(f"HTTP {e.code}: {e.reason}")


def die(d: dict):
    errs = d.get("errors") or []
    sys.exit("API error: " + "; ".join(e.get("message", "?") for e in errs))


def find_zone(name: str) -> dict:
    """Longest-suffix match, so app.kian.my.id resolves to zone kian.my.id."""
    d = cf("/zones?per_page=100")
    if not d.get("success"):
        die(d)
    zones = d.get("result") or []
    best = None
    for z in zones:
        zn = z["name"]
        if name == zn or name.endswith("." + zn):
            if best is None or len(zn) > len(best["name"]):
                best = z
    if not best:
        sys.exit(f"no zone in this account covers '{name}'")
    return best


def cmd_zones():
    d = cf("/zones?per_page=100")
    if not d.get("success"):
        die(d)
    for z in d.get("result") or []:
        ns = ", ".join(z.get("name_servers") or [])
        print(f"{z['name']:24} {z['status']:9} {ns}")
        print(f"{'':24} id={z['id']}")


def cmd_ls(name: str):
    z = find_zone(name)
    d = cf(f"/zones/{z['id']}/dns_records?per_page=100")
    if not d.get("success"):
        die(d)
    print(f"# zone {z['name']} ({z['status']})")
    for r in d.get("result") or []:
        prox = "proxied" if r.get("proxied") else "dns-only"
        print(f"{r['type']:6} {r['name']:28} -> {r['content']:48} [{prox}]")


def cmd_add(target: str, value: str, proxied: bool = False, rtype: str | None = None):
    z = find_zone(target)
    if rtype:
        typ = rtype.upper()
    elif value.endswith(".") or "." in value and not value.replace(".", "").isdigit():
        typ = "CNAME"
    else:
        typ = "A"
    # apex CNAME is illegal -> Vercel wants A records there
    if typ == "CNAME" and target in (z["name"], "@"):
        sys.exit("cannot CNAME an apex; use an A record (Vercel gives you IPs)")
    body = {"type": typ, "name": target, "content": value, "ttl": 1, "proxied": proxied}
    d = cf(f"/zones/{z['id']}/dns_records", "POST", body)
    if not d.get("success"):
        die(d)
    r = d["result"]
    print(f"✓ {r['type']:6} {r['name']:28} -> {r['content']}  "
          f"[{'proxied' if r['proxied'] else 'dns-only'}]")


def cmd_rm(zone_name: str, target: str):
    z = find_zone(zone_name)
    d = cf(f"/zones/{z['id']}/dns_records?per_page=100")
    if not d.get("success"):
        die(d)
    hit = [r for r in d.get("result") or [] if r["name"] == target]
    if not hit:
        sys.exit(f"no record named {target} in {z['name']}")
    for r in hit:
        rd = cf(f"/zones/{z['id']}/dns_records/{r['id']}", "DELETE")
        mark = "✓" if rd.get("success") else "✗"
        print(f"{mark} deleted {r['type']:6} {r['name']} -> {r['content']}")


def cmd_check(name: str):
    """Resolve via DNS-over-HTTPS (this box has no dig)."""
    for rtype in ("NS", "A", "AAAA", "CNAME"):
        req = urllib.request.Request(
            f"{DOH}?name={name}&type={rtype}",
            headers={"accept": "application/dns-json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                ans = json.load(r).get("Answer", [])
        except Exception:
            ans = []
        vals = [a.get("data") for a in ans if a.get("data")]
        if vals:
            print(f"{rtype:6}: {', '.join(vals)}")


def main(argv: list[str]):
    proxied = "--proxied" in argv
    argv = [a for a in argv if a != "--proxied"]
    if len(argv) < 2:
        sys.exit(__doc__)
    cmd = argv[1]
    if cmd == "zones":
        cmd_zones()
    elif cmd == "ls" and len(argv) > 2:
        cmd_ls(argv[2])
    elif cmd == "add" and len(argv) > 3:
        cmd_add(argv[2], argv[3], proxied)
    elif cmd == "cname" and len(argv) > 3:
        zone = argv[2] if "." in argv[2] else None
        if zone:
            cmd_add(argv[2], argv[3], proxied, "CNAME")
        else:
            sys.exit("cname needs the full name, e.g. app.kian.my.id")
    elif cmd == "rm" and len(argv) > 3:
        cmd_rm(argv[2], argv[3])
    elif cmd == "check" and len(argv) > 2:
        cmd_check(argv[2])
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main(sys.argv)
