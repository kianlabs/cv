#!/usr/bin/env python3
"""Quiet wrapper around watch-domain.py for the scheduler.

Prints ONLY when the stage changes (or when the site goes live), so a cron
tick that finds nothing new produces no output at all — the watchdog pattern.
State lives in ~/.cache/kian-my-id-watch/state.json so restarts don't re-alert.

Designed for cron `no_agent=True`: stdout is delivered verbatim, empty = silent.

Usage: python3 scripts/watch-notify.py
"""
from __future__ import annotations

import json
import pathlib
import subprocess
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
STATE_DIR = pathlib.Path.home() / ".cache" / "kian-my-id-watch"
STATE = STATE_DIR / "state.json"

ICON = {"NS_PENDING": "⏳", "NS_SWITCHED": "🔁", "ZONE_ACTIVE": "🔵",
        "VERCEL_OK": "🟡", "LIVE": "✅"}
LABEL = {
    "NS_PENDING": "Menunggu registry memindahkan NS ke Cloudflare",
    "NS_SWITCHED": "NS sudah pindah ke Cloudflare — zone sedang diaktifkan",
    "ZONE_ACTIVE": "Zone Cloudflare aktif — menunggu konfigurasi Vercel",
    "VERCEL_OK": "Vercel sudah benar — menunggu sertifikat SSL",
    "LIVE": "kian.my.id SUDAH HIDUP",
}
ORDER = ["NS_PENDING", "NS_SWITCHED", "ZONE_ACTIVE", "VERCEL_OK", "LIVE"]


def load_state() -> dict:
    try:
        return json.loads(STATE.read_text())
    except Exception:
        return {}


def save_state(d: dict):
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(d, indent=2))


def main():
    r = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "watch-domain.py"), "--json"],
        capture_output=True, text=True, timeout=180,
    )
    try:
        res = json.loads(r.stdout)
    except Exception:
        # A real failure is worth reporting once, then stay quiet.
        prev = load_state()
        if prev.get("last_error") != (r.stderr or "")[:200]:
            save_state({"last_error": (r.stderr or "")[:200]})
            print("⚠️  watch-domain gagal dijalankan:\n" + (r.stderr or r.stdout)[:500])
        return

    stage = res.get("stage", "?")
    prev = load_state()
    old = prev.get("stage")

    # First ever run: record the baseline silently (no noise on setup).
    if old is None:
        save_state({"stage": stage, "ts": res.get("ts"), "notified_live": False})
        return

    if stage == old:
        return  # nothing new -> silence

    lines = [f"{ICON.get(stage,'•')} {LABEL.get(stage, stage)}", f"   {res.get('ns','')}"]
    for k, label in (("zone", "cloudflare"), ("vercel", "vercel"), ("http", "http")):
        if res.get(k):
            lines.append(f"   {label:11}: {res[k]}")

    if stage == "LIVE":
        lines += [
            "",
            "🎉 https://kian.my.id sudah aktif dan tersertifikat.",
            "Cek: homepage, chatbot Kai, dan lightbox sertifikat.",
        ]
    elif ORDER.index(stage) > ORDER.index(old) if stage in ORDER and old in ORDER else True:
        pass  # progressing forward

    save_state({"stage": stage, "ts": res.get("ts"), "notified_live": stage == "LIVE"})
    print("\n".join(lines))


if __name__ == "__main__":
    main()
