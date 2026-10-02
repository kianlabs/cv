#!/usr/bin/env bash
# dev-safe.sh — restart portfolio dev server TANPA menyentuh 9router.
#
# PENTING: jangan pernah `pkill -f next-server` / `pkill -f next` — 9router
# (port 20128, next-server v16) akan ikut mati. Selalu kill BERDASARKAN PORT.
#
# Pakai:  ./scripts/dev-safe.sh          → restart bersih + start dev
#         ./scripts/dev-safe.sh build    → stop dev, build, start dev lagi

set -u
PORT=3000
PROJ="/home/kian/Projects/stitchweb-portfolio-kyan"
cd "$PROJ" || exit 1

# --- 1. Kill HANYA proses yang memegang port 3000 (bukan by name) ---
pids=$(ss -tlnp 2>/dev/null | grep ":${PORT} " | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u)
if [ -n "$pids" ]; then
  for p in $pids; do
    # pastikan itu proses node/next milik portfolio, bukan proses lain
    cmd=$(ps -o cmd= -p "$p" 2>/dev/null)
    if echo "$cmd" | grep -qi "next"; then
      kill "$p" 2>/dev/null && echo "  [stop] port $PORT pid $p"
    else
      echo "  [skip] port $PORT pid $p bukan next ($cmd) — tidak disentuh"
    fi
  done
  sleep 3
  # sisa paksa (masih hanya port 3000)
  pids=$(ss -tlnp 2>/dev/null | grep ":${PORT} " | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u)
  for p in $pids; do kill -9 "$p" 2>/dev/null && echo "  [force-stop] pid $p"; done
else
  echo "  [stop] port $PORT sudah kosong"
fi

# --- 2. Bersihkan .next (sumber crash MODULE_NOT_FOUND) ---
if [ "${1:-}" = "build" ]; then
  rm -rf .next && echo "  [clean] .next dihapus"
  echo "  [build] menjalankan npm run build..."
  if ! npm run build >/tmp/kyan-build.log 2>&1; then
    echo "  [ERROR] build gagal — lihat /tmp/kyan-build.log"; tail -20 /tmp/kyan-build.log; exit 1
  fi
  echo "  [build] sukses"
fi

# --- 3. Start dev di background ---
nohup npm run dev >/tmp/kyan-dev.log 2>&1 &
echo "  [start] dev pid $!"

# --- 4. Tunggu sampai HTTP 200 (maks ~40s) ---
for i in $(seq 1 20); do
  sleep 2
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/" 2>/dev/null)
  if [ "$code" = "200" ]; then
    echo "  [ok] portfolio HTTP 200 di http://localhost:${PORT} (${i}x2s)"
    exit 0
  fi
done
echo "  [WARN] belum 200 setelah ~40s — cek /tmp/kyan-dev.log"; tail -20 /tmp/kyan-dev.log; exit 1
