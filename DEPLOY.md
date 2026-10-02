# Deploy — Vercel only (no local server, no VPS)

This portfolio can run **entirely on Vercel's free (Hobby) tier**. There is no
local 9router, no separate backend host, and no always-on VPS. The only external
services are two free Google Gemini endpoints (chat + embeddings).

## Why it fits on Vercel

| Concern | How it is handled |
| --- | --- |
| Native ML binary (onnxruntime, 548 MB) | **Not used in production.** Embeddings are computed by the Gemini API server-side. The local transformers.js path is dev-only and excluded from the bundle (`outputFileTracingExcludes`). |
| Serverless function size (250 MB limit) | The `/api/chat` function traces to **~0.8 MB** (see "Verify" below). |
| API keys leaking to the browser | All keys are server-only env vars read inside the route; nothing is prefixed `NEXT_PUBLIC_`. |
| Cold starts | No native model to load; the function is tiny, so cold starts are fast. |
| Cost | Vercel Hobby $0 + Gemini free tier (no credit card). |

## What runs where

```
Browser ──POST /api/chat──▶ Vercel Serverless Function (Node)
                                   │
                                   ├─▶ Gemini embeddings   (embed the query)
                                   ├─▶ content/index.json  (in-memory hybrid search)
                                   └─▶ Gemini chat         (grounded answer)
```

- **Knowledge base**: `content/kb/*.md` (your CV, projects, skills, FAQ).
- **Index**: `content/index.json`, generated at build time by `npm run build:kb`.
  It is gitignored on purpose — it must be rebuilt with the embedding provider
  the target environment will use, so it is regenerated on every deploy.

## One-time setup

1. **Get a Gemini API key** at <https://aistudio.google.com/apikey> (free, no
   credit card). One key serves both chat and embeddings.

2. **Push the repo** to GitHub (or GitLab/Bitbucket).

3. **Import the project on Vercel** → it auto-detects Next.js. Leave the build
   command as `npm run build` — the `prebuild` hook runs `build:kb` first.

4. **Add environment variables** (Project → Settings → Environment Variables),
   for the *Production* (and *Preview*) environments:

   | Name | Value |
   | --- | --- |
   | `EMBED_PROVIDER` | `gemini` |
   | `GEMINI_API_KEY` | your key |
   | `GEMINI_EMBED_MODEL` | `gemini-embedding-001` |
   | `GEMINI_EMBED_DIMS` | `768` |
   | `LLM_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta/openai` |
   | `LLM_API_KEY` | your key (same key is fine) |
   | `LLM_MODEL` | `gemini-flash-latest` |
   | `LLM_FALLBACKS` | `gemini-3.8-flash,gemini-3.5-flash` |

   > `EMBED_PROVIDER=gemini` matters: it tells the build to index the KB with
   > Gemini so the index matches the runtime embedder. If it is missing, the
   > build indexes locally and the deployed function will (correctly) refuse to
   > serve retrieval until rebuilt.

5. **Deploy.** The build runs `build:kb` (Gemini embeddings over ~30 chunks,
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

# 2. Chat endpoint (replace with your domain):
curl -s https://YOUR-APP.vercel.app/api/chat \
  -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"what projects has he built?"}]}' | head -c 400
```

## Local development (unchanged)

Local dev keeps using the offline embedding provider and the local 9router, so
no cloud key is needed and nothing is uploaded:

```bash
# .env.local (already configured):
#   EMBED_PROVIDER=local
#   NINE_ROUTER_BASE_URL=http://127.0.0.1:20128/v1
npm run build:kb   # indexes with Xenova/all-MiniLM-L6-v2 (offline)
npm run dev
```

Switching providers is a **config change only** — no code edits:

```bash
EMBED_PROVIDER=gemini npm run build:kb   # re-index with Gemini
```

## Rotating / changing the LLM

`app/api/chat/route.ts` talks to any OpenAI-compatible endpoint. To point it
elsewhere (OpenRouter, OpenAI, a different model), change only the env vars —
`LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `LLM_FALLBACKS`. No redeploy of code
logic is required beyond setting the new values.

## Troubleshooting

- **503 "retrieval index needs an embedding API key"** — the deployed index was
  built with the Gemini provider but `GEMINI_API_KEY` is missing at runtime.
  Set it in the project env vars and redeploy.
- **503 "no LLM API key"** — `LLM_API_KEY` is missing.
- **Answers say "I don't have that information"** — the query fell below the
  relevance floor stored in the index (`minScore`, derived at build time from
  the corpus). Either the topic is genuinely out of scope, or the KB
  needs a chunk about it: add to `content/kb/*.md` and redeploy (the index
  rebuilds automatically).
