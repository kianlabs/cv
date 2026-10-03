#!/usr/bin/env bash
# Expose the local 9router (port 20128) to the internet via a Cloudflare quick
# tunnel, so a DEPLOYED site can use your local models for chat.
#
# Usage:  scripts/tunnel-9router.sh
#
# IMPORTANT: a quick tunnel gets a NEW random URL every time it restarts. After
# restarting, update LLM_BASE_URL in your deploy environment (e.g. Vercel) to the
# new https://<name>.trycloudflare.com/v1 value printed below. It only works
# while this machine and the tunnel are both running.
set -euo pipefail

PORT="${NINE_ROUTER_PORT:-20128}"
LOG="${TMPDIR:-/tmp}/cftunnel-9router.log"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared not found. Install it, e.g.:"
  echo "  pacman -S cloudflared          # Arch"
  echo "  brew install cloudflared       # macOS"
  exit 1
fi

if ! curl -sf -o /dev/null "http://127.0.0.1:${PORT}/v1/models" \
     -H "Authorization: Bearer ${NINE_ROUTER_API_KEY:-x}"; then
  echo "warning: nothing answering on http://127.0.0.1:${PORT} — is 9router running?"
fi

echo "starting tunnel -> http://127.0.0.1:${PORT} (log: ${LOG})"
: >"$LOG"
nohup cloudflared tunnel --url "http://127.0.0.1:${PORT}" --no-autoupdate \
  >"$LOG" 2>&1 &

for _ in $(seq 1 30); do
  URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG" 2>/dev/null | head -1 || true)
  if [ -n "$URL" ]; then
    echo
    echo "tunnel ready: ${URL}"
    echo "set in your deploy env:  LLM_BASE_URL=${URL}/v1"
    exit 0
  fi
  sleep 1
done

echo "timed out waiting for a tunnel URL; check ${LOG}" >&2
exit 1
