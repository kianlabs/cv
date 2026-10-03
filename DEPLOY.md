# Deploy — Vercel only (no local server, no VPS)

This portfolio can run **entirely on Vercel's free (Hobby) tier**. There is no
local 9router, no separate backend host, and no always-on VPS. External services
are Cloudflare Workers AI (embeddings) and any OpenAI-compatible chat endpoint
(Gemini free tier by default).

## Why it fits on Vercel

| Concern | How it is handled |
| --- | --- |
| Native ML binary (onnxruntime, 548 MB) | **Not used in production.** Embeddings are computed by the Cloudflare API server-side. The local transformers.js path is dev-only and excluded from the bundle (`outputFileTracingExcludes`). |
| Serverless function size (250 MB limit) | The `/api/chat` function traces to **~0.8 MB** (see "Verify" below). |
| API keys leaking to the browser | All keys are server-only env vars read inside the route; nothing is prefixed `NEXT_PUBLIC_`. |
| Cold starts | No native model to load; the function is tiny, so cold starts are fast. |
| Cost | Vercel Hobby $0 + Cloudflare Workers AI free tier + Gemini free tier (no credit card). |

## What runs where

```
Browser ──POST /api/chat──▶ Vercel Serverless Function (Node)
                                   │
                                   ├─▶ Cloudflare bge-m3   (embed the query)
                                   ├─▶ content/index.json  (in-memory hybrid search)
                                   └─▶ chat endpoint       (grounded answer)
```

- **Knowledge base**: `content/kb/*.md` (your CV, projects, skills, FAQ).
- **Index**: `content/index.json`, generated at build time by `npm run build:kb`.
  It is gitignored on purpose — it must be rebuilt with the embedding provider
  the target environment will use, so it is regenerated on every deploy.

## One-time setup

### Choose your chat backend

The chat model is any OpenAI-compatible endpoint. Two practical options:

**Option A — Cloudflare Workers AI (recommended for production).** One provider,
one token, works while your PC is off.

1. Get a Cloudflare API token at
   <https://dash.cloudflare.com/profile/api-tokens> → Create Token → Custom
   token → permission `Account → Workers AI → Read`. Note your **Account ID**
   (Workers & Pages → Overview, right-hand column).
2. Chat env:
   ```
   LLM_BASE_URL=https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/ai/v1
   LLM_MODEL=@cf/meta/llama-3.3-70b-instruct-fp8-fast
   LLM_FALLBACKS=@cf/qwen/qwen2.5-coder-32b-instruct
   ```
   Leave `LLM_API_KEY` empty — the route auto-selects `CLOUDFLARE_API_TOKEN`.
   Free tier: 10,000 Neurons/day (~130 chat replies).

**Option B — 9router via a named Cloudflare Tunnel.** Uses your local models at a
**stable** URL (`llm.kianlabs.my.id`). The deployed site works while your PC and
the tunnel are running.

1. The tunnel is already set up on this machine and runs as a systemd user
   service (`cloudflared-9router`), enabled at boot. Manage it with:
   ```bash
   scripts/tunnel-9router.sh status    # URL, service state, reachability
   scripts/tunnel-9router.sh restart
   scripts/tunnel-9router.sh logs
   ```
2. Chat env:
   ```
   LLM_BASE_URL=https://llm.kianlabs.my.id/v1
   LLM_MODEL=ag/gemini-3.8-flash
   LLM_FALLBACKS=kr/claude-haiku-4.5,ag/gemini-3.7-flash
   CF_ACCESS_CLIENT_ID=<service token client id>        # ends in .access
   CF_ACCESS_CLIENT_SECRET=<service token client secret>
   ```
   Leave `LLM_API_KEY` empty — the route auto-selects `NINE_ROUTER_API_KEY`.
   The hostname is permanent, so this never needs updating.
3. One-time setup (already done here):
   ```bash
   cloudflared tunnel login                              # authorise the zone
   cloudflared tunnel create 9router                     # named tunnel
   cloudflared tunnel route dns 9router llm.kianlabs.my.id
   ```
   Config lives in `~/.cloudflared/config.yml`; the unit in
   `~/.config/systemd/user/cloudflared-9router.service`.
4. **Cloudflare Access (recommended).** The hostname is public, so it is fronted
   by an Access application that rejects any request without a service token —
   bot scans never reach the gateway. The app allows only `non_identity`
   service-token traffic. To recreate it:
   ```bash
   # Zero Trust must be enabled once in the dashboard first.
   # App: Zero Trust → Access → Applications → Self-hosted, domain
   #      llm.kianlabs.my.id, policy "Service token only" (decision: non_identity)
   # Token: Zero Trust → Access → Service Auth → Service Tokens
   ```
   Put the token's client id/secret in `CF_ACCESS_CLIENT_ID` /
   `CF_ACCESS_CLIENT_SECRET`. Without them the edge returns 403.

### Deploy

1. **Push the repo** to GitHub (or GitLab/Bitbucket).

2. **Import the project on Vercel** → it auto-detects Next.js. Leave the build
   command as `npm run build` — the `prebuild` hook runs `build:kb` first.

3. **Add environment variables** (Project → Settings → Environment Variables),
   for the *Production* (and *Preview*) environments:

   | Name | Value |
   | --- | --- |
   | `EMBED_PROVIDER` | `cloudflare` |
   | `CLOUDFLARE_ACCOUNT_ID` | your account id |
   | `CLOUDFLARE_API_TOKEN` | your Workers AI token |
   | `CLOUDFLARE_EMBED_MODEL` | `@cf/baai/bge-m3` |
   | `CLOUDFLARE_EMBED_DIMS` | `1024` |
   | `LLM_BASE_URL` | per Option A or B above |
   | `LLM_MODEL` | per Option A or B above |
   | `LLM_FALLBACKS` | per Option A or B above |

   > `EMBED_PROVIDER` matters: it tells the build which API to index the KB with,
   > so the index matches the runtime embedder. If it is missing, the build
   > indexes with the default provider and the deployed function will
   > (correctly) refuse to serve retrieval until rebuilt.

4. **Deploy.** The build runs `build:kb` (Cloudflare embeddings over ~30 chunks,
   one batched call) then `next build`.

## Verify the deployment

After deploying, confirm the function stayed small and retrieval works:

```bash
# 1. Function size — should be well under 250 MB (it is ~1 MB).
#    Download the deployment's function and check, or inspect the build log.
#    Locally you can reproduce the trace:
npm run build
python3 - <<'PY'
import json, os
p = '.next/server/app/api/chat/route.js.nft.json'
d = json.load(open(p))
base = os.path.dirname(p)
total = sum(os.path.getsize(os.path.normpath(os.path.join(base, f)))
            for f in d['files'] if os.path.exists(os.path.normpath(os.path.join(base, f))))
print(f'{total/1e6:.1f} MB traced')   # expect ~0.8 MB
PY

# 2. Health probe — reports the active embedder without leaking keys:
curl -s https://YOUR-APP.vercel.app/api/chat

# 3. Chat endpoint (replace with your domain):
curl -s https://YOUR-APP.vercel.app/api/chat \
  -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"what projects has he built?"}]}' | head -c 400
```

## Local development (unchanged)

Local dev can use the offline embedding provider and the local 9router, so no
cloud key is needed and nothing is uploaded:

```bash
# .env.local (already configured):
#   EMBED_PROVIDER=local
#   NINE_ROUTER_BASE_URL=http://127.0.0.1:20128/v1
npm run build:kb   # indexes with Xenova/all-MiniLM-L6-v2 (offline)
npm run dev
```

Switching providers is a **config change only** — no code edits:

```bash
EMBED_PROVIDER=cloudflare npm run build:kb   # re-index with Cloudflare bge-m3
EMBED_PROVIDER=gemini     npm run build:kb   # re-index with Gemini
```

## Rotating / changing the LLM

`app/api/chat/route.ts` talks to any OpenAI-compatible endpoint. To point it
elsewhere (OpenRouter, OpenAI, a different model), change only the env vars —
`LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `LLM_FALLBACKS`. No redeploy of code
logic is required beyond setting the new values.

## Troubleshooting

- **503 "retrieval index needs its embedding credentials"** — the deployed index
  was built with the Cloudflare provider but `CLOUDFLARE_ACCOUNT_ID` /
  `CLOUDFLARE_API_TOKEN` are missing at runtime. Set them and redeploy.
- **503 "no LLM API key"** — `LLM_API_KEY` is missing.
- **Replies look truncated or off-topic** — the chat model hit its quota and the
  route fell through to a fallback model. Check the primary `LLM_MODEL`'s quota.
- **Answers say "I don't have that information"** — the query fell below the
  relevance floor stored in the index (`minScore`, derived at build time from
  on/off-topic calibration probes). Either the topic is genuinely out of scope,
  or the KB needs a chunk about it: add to `content/kb/*.md` and redeploy (the
  index rebuilds automatically).
