#!/usr/bin/env bash
# Manage the named Cloudflare Tunnel that exposes the local 9router (port 20128)
# at a STABLE hostname: https://llm.kianlabs.my.id
#
# Unlike a quick tunnel, this URL never changes — set it once and forget it.
# It only works while this machine is running.
#
# Usage:
#   scripts/tunnel-9router.sh            # show status
#   scripts/tunnel-9router.sh start      # start (systemd user service)
#   scripts/tunnel-9router.sh stop       # stop
#   scripts/tunnel-9router.sh restart    # restart
#   scripts/tunnel-9router.sh logs       # follow logs
#   scripts/tunnel-9router.sh url        # print the public URL
#
# Setup was done once with:
#   cloudflared tunnel login
#   cloudflared tunnel create 9router
#   cloudflared tunnel route dns 9router llm.kianlabs.my.id
# Config: ~/.cloudflared/config.yml   Service: cloudflared-9router.service
set -euo pipefail

PUBLIC_HOSTNAME="${TUNNEL_HOSTNAME:-llm.kianlabs.my.id}"
SERVICE="cloudflared-9router.service"
PORT="${NINE_ROUTER_PORT:-20128}"

# Load credentials from .env.local when running from the repo, so the
# reachability check below can actually authenticate (the 9router key, plus the
# Cloudflare Access service token when the hostname is behind Access).
if [ -z "${NINE_ROUTER_API_KEY:-}" ]; then
  for envfile in "$(dirname "$0")/../.env.local" "$HOME/Projects/stitchweb-portfolio-kyan/.env.local"; do
    if [ -f "$envfile" ]; then
      val=$(sed -n 's/^NINE_ROUTER_API_KEY=//p' "$envfile" | head -1 | tr -d '"')
      if [ -n "$val" ]; then
        export NINE_ROUTER_API_KEY="$val"
        break
      fi
    fi
  done
fi

if [ -z "${CF_ACCESS_CLIENT_ID:-}" ]; then
  for envfile in "$(dirname "$0")/../.env.local" "$HOME/Projects/stitchweb-portfolio-kyan/.env.local"; do
    if [ -f "$envfile" ]; then
      cid=$(sed -n 's/^CF_ACCESS_CLIENT_ID=//p' "$envfile" | head -1 | tr -d '"')
      sec=$(sed -n 's/^CF_ACCESS_CLIENT_SECRET=//p' "$envfile" | head -1 | tr -d '"')
      if [ -n "$cid" ] && [ -n "$sec" ]; then
        export CF_ACCESS_CLIENT_ID="$cid" CF_ACCESS_CLIENT_SECRET="$sec"
        break
      fi
    fi
  done
fi

# Headers for the reachability probe: Access service token (when configured)
# plus the 9router bearer key.
probe_headers=(-H "Authorization: Bearer ${NINE_ROUTER_API_KEY:-x}")
if [ -n "${CF_ACCESS_CLIENT_ID:-}" ] && [ -n "${CF_ACCESS_CLIENT_SECRET:-}" ]; then
  probe_headers+=(-H "CF-Access-Client-Id: ${CF_ACCESS_CLIENT_ID}")
  probe_headers+=(-H "CF-Access-Client-Secret: ${CF_ACCESS_CLIENT_SECRET}")
fi

case "${1:-status}" in
  start)
    systemctl --user start "$SERVICE"
    systemctl --user --no-pager status "$SERVICE" | head -5
    ;;
  stop)
    systemctl --user stop "$SERVICE"
    echo "stopped"
    ;;
  restart)
    systemctl --user restart "$SERVICE"
    echo "restarted"
    ;;
  logs)
    journalctl --user -u "$SERVICE" -f
    ;;
  url)
    echo "https://${PUBLIC_HOSTNAME}/v1"
    ;;
  status)
    echo "public URL  : https://${PUBLIC_HOSTNAME}/v1"
    echo "local origin: http://127.0.0.1:${PORT}"
    echo
    systemctl --user --no-pager status "$SERVICE" 2>&1 | head -6 || true
    echo
    if curl -sf -o /dev/null -m 20 "${probe_headers[@]}" \
         "https://${PUBLIC_HOSTNAME}/v1/models"; then
      echo "reachable   : yes"
    else
      echo "reachable   : no (service running? PC online?)"
    fi
    ;;
  *)
    echo "usage: $0 {status|start|stop|restart|logs|url}" >&2
    exit 2
    ;;
esac
