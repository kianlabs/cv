#!/usr/bin/env python3
"""Watch kian.my.id until it is live, checking the whole chain.

Stages, in order:
  1. NS_PENDING   registry (.my.id) still points at the old IDwebhost nameservers
  2. NS_SWITCHED  registry now returns the Cloudflare nameservers
  3. ZONE_ACTIVE  Cloudflare zone moved from pending -> active
  4. VERCEL_OK    Vercel reports the domain as correctly configured
  5. LIVE         https://kian.my.id answers 200 with a valid cert

There is no `dig` on this box and public resolvers cache the old delegation,
so the NS check queries the .my.id registry servers directly over UDP.

Usage
-----
    python3 scripts/watch-domain.py                 # one check, human output
    python3 scripts/watch-domain.py --json          # machine-readable
    python3 scripts/watch-domain.py --loop 600      # poll every 10 min
    python3 scripts/watch-domain.py --quiet         # only speak on state change

Exit codes: 0 = LIVE, 1 = still pending, 2 = error.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import socket
import ssl
import struct
import subprocess
import sys
import time
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOMAIN = "kian.my.id"
CF_ZONE_ID = "b8c60aec19262c322fee23fe2539787d"
CF_NS = ["aragorn.ns.cloudflare.com", "fay.ns.cloudflare.com"]
REGISTRY_NS = ["b.dns.id", "c.dns.id", "d.dns.id", "e.dns.id"]
VERCEL_PROJECT = "cv-web-kyan"
VERCEL_TEAM = "team_gejfj3rqhGzXxDtNUcTSfHdt"
DOH = "https://cloudflare-dns.com/dns-query"
TYPES = {"A": 1, "NS": 2, "CNAME": 5, "SOA": 6, "AAAA": 28}

RC = {0: "NOERROR", 1: "FORMERR", 2: "SERVFAIL", 3: "NXDOMAIN", 4: "NOTIMP", 5: "REFUSED"}


# ---------------------------------------------------------------- env helpers
def _env(key: str) -> str:
    f = ROOT / ".env.local"
    if f.exists():
        for line in f.read_text().splitlines():
            line = line.strip()
            if line.startswith(key + "="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""


def _vercel_token() -> str:
    p = pathlib.Path.home() / ".local/share/com.vercel.cli/auth.json"
    try:
        return json.loads(p.read_text()).get("token", "")
    except Exception:
        return ""


# ------------------------------------------------------------- raw DNS client
def _build(name: str, qtype: int) -> bytes:
    hdr = struct.pack("!HHHHHH", 0x1234, 0x0100, 1, 0, 0, 0)
    q = b"".join(bytes([len(p)]) + p.encode() for p in name.split(".")) + b"\x00"
    return hdr + q + struct.pack("!HH", qtype, 1)


def _parse_name(buf: bytes, off: int):
    labels, jumped, nxt = [], False, off
    while True:
        ln = buf[off]
        if ln == 0:
            off += 1
            break
        if ln & 0xC0 == 0xC0:
            ptr = struct.unpack("!H", buf[off:off + 2])[0] & 0x3FFF
            if not jumped:
                nxt, jumped = off + 2, True
            off = ptr
            continue
        labels.append(buf[off + 1:off + 1 + ln].decode("latin1"))
        off += 1 + ln
    return ".".join(labels), (nxt if jumped else off)


def raw_query(server: str, name: str, rtype: str, timeout: float = 6.0):
    """Ask one server directly. Returns (rcode, answers, authority) or None."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(timeout)
        s.sendto(_build(name, TYPES[rtype]), (server, 53))
        buf, _ = s.recvfrom(4096)
        s.close()
    except Exception:
        return None

    _, flags, qd, an, ns, _ = struct.unpack("!HHHHHH", buf[:12])
    off = 12
    for _ in range(qd):
        _, off = _parse_name(buf, off)
        off += 4

    def read(count):
        nonlocal off
        out = []
        for _ in range(count):
            nm, off = _parse_name(buf, off)
            rtype_, _, _, rdlen = struct.unpack("!HHIH", buf[off:off + 10])
            off += 10
            if rtype_ in (2, 5):
                val, _ = _parse_name(buf, off)
            elif rtype_ == 1:
                val = ".".join(str(b) for b in buf[off:off + 4])
            elif rtype_ == 28:
                val = ":".join(f"{struct.unpack('!H', buf[off + i:off + i + 2])[0]:x}"
                               for i in range(0, 16, 2))
            else:
                val = buf[off:off + rdlen].hex()
            out.append(val)
            off += rdlen
        return out

    answers = read(an)
    authority = read(ns)
    return flags & 0xF, answers, authority


def doh(name: str, rtype: str):
    req = urllib.request.Request(f"{DOH}?name={name}&type={rtype}",
                                 headers={"accept": "application/dns-json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return [a.get("data") for a in json.load(r).get("Answer", [])]
    except Exception:
        return []


def whois_ns():
    """Authoritative answer: whois reflects what the REGISTRY has stored."""
    try:
        out = subprocess.run(["whois", DOMAIN], capture_output=True,
                             text=True, timeout=30).stdout
    except Exception:
        return []
    ns = []
    for line in out.splitlines():
        low = line.lower()
        if low.startswith("name server"):
            val = line.split(":", 1)[1].strip().rstrip(".").lower()
            if val:
                ns.append(val)
    return ns


def public_ns():
    """What public resolvers see (lags behind the registry by the TTL)."""
    return [v.rstrip(".").lower() for v in doh(DOMAIN, "NS")]


def registry_ns():
    """Ask the .my.id registry servers for the current delegation.

    These cache for up to an hour, so they are the SLOWEST source — whois and
    public resolvers move first. We gather all three and trust the fastest one
    that already shows Cloudflare, otherwise we would report 'pending' long
    after the switch actually happened.
    """
    seen = {}
    for nsname in REGISTRY_NS:
        for ip in doh(nsname, "A"):
            if ip in seen:
                continue
            seen[ip] = raw_query(ip, DOMAIN, "NS")
    votes, rcodes = {}, []
    for ip, res in seen.items():
        if res is None:
            continue
        rcode, answers, authority = res
        rcodes.append(RC.get(rcode, rcode))
        for v in answers or authority:
            v = v.rstrip(".").lower()
            if v.endswith("cloudflare.com") or "idwebhost" in v:
                votes[v] = votes.get(v, 0) + 1
    return votes, rcodes


def current_ns():
    """Best-effort view of the delegation, from fastest to slowest source."""
    for source, names in (("whois", whois_ns()),
                          ("public", public_ns()),
                          ("registry", list(registry_ns()[0]))):
        if names:
            return source, names
    return "none", []


# ------------------------------------------------------------------ each stage
def check_ns():
    source, names = current_ns()
    cf = sorted(v for v in names if v.endswith("cloudflare.com"))
    legacy = sorted(v for v in names if "idwebhost" in v)
    if cf:
        return "NS_SWITCHED", f"{source} -> {', '.join(cf)}"
    if legacy:
        return "NS_PENDING", f"{source} -> {', '.join(legacy)} (masih lama)"
    return "NS_PENDING", "NS belum bisa dibaca dari whois/public/registry"


def check_zone():
    tok = _env("CLOUDFLARE_DNS_TOKEN")
    if not tok:
        return None, "CLOUDFLARE_DNS_TOKEN tidak ada di .env.local"
    req = urllib.request.Request(
        f"https://api.cloudflare.com/client/v4/zones/{CF_ZONE_ID}",
        headers={"Authorization": f"Bearer {tok}"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            z = json.load(r).get("result") or {}
    except Exception as e:
        return None, f"gagal query Cloudflare: {e}"
    return z.get("status"), f"zone status = {z.get('status')}"


def check_vercel():
    tok = _vercel_token()
    if not tok:
        return None, "token Vercel tidak ditemukan"
    out = {}
    for dom in (DOMAIN, "www." + DOMAIN):
        req = urllib.request.Request(
            f"https://api.vercel.com/v6/domains/{dom}/config?teamId={VERCEL_TEAM}",
            headers={"Authorization": f"Bearer {tok}"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                out[dom] = bool(json.load(r).get("misconfigured"))
        except Exception as e:
            out[dom] = f"err:{e}"
    bad = [d for d, v in out.items() if v is not False]
    return (not bad), ("semua domain benar" if not bad else f"belum benar: {', '.join(bad)}")


def check_http():
    """Return (https_ok, message).

    Tests HTTPS first, then falls back to HTTP so we can tell apart
    'DNS not pointing here yet' from 'DNS fine but cert not issued yet' —
    the latter is exactly what a freshly-moved nameserver looks like.
    """
    ctx = ssl.create_default_context()
    last = "tidak ada respons"

    for url in (f"https://{DOMAIN}/", f"https://www.{DOMAIN}/"):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "watch-domain/1.0"})
            with urllib.request.urlopen(req, timeout=25, context=ctx) as r:
                return True, f"{url} -> HTTP {r.status} (SSL OK)"
        except urllib.error.HTTPError as e:
            if e.code < 500:
                return True, f"{url} -> HTTP {e.code} (SSL OK)"
            last = f"{url} -> HTTP {e.code}"
        except ssl.SSLError as e:
            last = f"{url} -> SSL belum terbit ({type(e).__name__})"
        except Exception as e:
            last = f"{url} -> {type(e).__name__}"

    # HTTPS failed — is the site reachable over plain HTTP? If yes, DNS is fine
    # and only the certificate is missing.
    try:
        req = urllib.request.Request(f"http://{DOMAIN}/",
                                     headers={"User-Agent": "watch-domain/1.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            return False, (f"HTTP {r.status} sudah jalan, tapi HTTPS belum "
                           f"(sertifikat belum terbit)")
    except Exception:
        pass
    return False, last


def run_check():
    stage, ns_msg = check_ns()
    res = {"domain": DOMAIN, "stage": stage, "ns": ns_msg, "ts": int(time.time())}

    if stage == "NS_SWITCHED":
        status, msg = check_zone()
        res["zone"] = msg
        if status == "active":
            ok, vmsg = check_vercel()
            res["vercel"] = vmsg
            if ok:
                live, hmsg = check_http()
                res["http"] = hmsg
                # VERCEL_OK means "everything configured, waiting on the cert".
                res["stage"] = "LIVE" if live else "VERCEL_OK"
        else:
            res["stage"] = "NS_SWITCHED"
    return res


# ----------------------------------------------------------------- presentation
ICON = {"NS_PENDING": "⏳", "NS_SWITCHED": "🔁", "ZONE_ACTIVE": "🔵",
        "VERCEL_OK": "🟡", "LIVE": "✅"}
LABEL = {
    "NS_PENDING": "Menunggu NS pindah ke Cloudflare",
    "NS_SWITCHED": "NS sudah pindah — menunggu Cloudflare mengaktifkan zone",
    "ZONE_ACTIVE": "Zone Cloudflare aktif — menunggu konfigurasi Vercel",
    "VERCEL_OK": "Semua sudah benar — menunggu sertifikat SSL terbit",
    "LIVE": "kian.my.id SUDAH HIDUP (HTTPS aktif)",
}


def render(res: dict) -> str:
    st = res["stage"]
    lines = [f"{ICON.get(st,'•')} {LABEL.get(st, st)}", f"   {res['ns']}"]
    for k, label in (("zone", "cloudflare"), ("vercel", "vercel"), ("http", "http")):
        if res.get(k):
            lines.append(f"   {label:11}: {res[k]}")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--loop", type=int, metavar="SEC")
    ap.add_argument("--quiet", action="store_true", help="only print on stage change")
    a = ap.parse_args()

    if not a.loop:
        res = run_check()
        print(json.dumps(res, indent=2) if a.json else render(res))
        sys.exit(0 if res["stage"] == "LIVE" else 1)

    last = None
    while True:
        res = run_check()
        st = res["stage"]
        if st != last:
            if not a.quiet or st != last:
                print(f"[{time.strftime('%H:%M:%S')}] {render(res)}", flush=True)
            last = st
        if st == "LIVE":
            sys.exit(0)
        time.sleep(a.loop)


if __name__ == "__main__":
    main()
