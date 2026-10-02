# Portfolio — Ridzkyan "Kyan" Buti Pratama

Personal portfolio site with an AI chat assistant ("Kai") that answers questions
about Kyan using retrieval-augmented generation over a small, editable knowledge
base. Runs entirely on Vercel's free tier — no local server, no native binaries.

Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

## How the assistant works

The chat is a real RAG pipeline, not a hard-coded prompt:

1. **Knowledge base** — markdown files in `content/kb/` (`profile`, `projects`,
   `skills`, `experience`, `faq`), one topic per `##` heading.
2. **Indexing (build time)** — `npm run build:kb` splits the KB by heading, embeds
   each chunk, and writes `content/index.json`. This file also records the
   embedding provider/model/dims and derives the out-of-scope relevance floor
   from the corpus itself, so it is never a hand-tuned constant.
3. **Retrieval (request time)** — `lib/rag.ts` embeds the visitor's question and
   runs **hybrid search**: dense cosine + BM25 lexical, fused with weighted
   Reciprocal Rank Fusion. Questions below the floor are answered without
   calling the LLM.
4. **Answering** — `app/api/chat/route.ts` grounds the LLM in the retrieved
   chunks and streams the reply with source attribution.

`content/index.json` is the single source of truth for the embedding config:
query and chunk vectors are always produced in the same space. Switching
provider (Gemini ↔ local) is a config change, no code change.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in keys (see below)
npm run build:kb             # build the retrieval index
npm run dev                  # http://localhost:3000
```

### Environment

`.env.example` documents every variable. In short:

- **LLM** (`LLM_BASE_URL` / `LLM_MODEL` / `LLM_API_KEY`) — any OpenAI-compatible
  endpoint. Production uses Google Gemini's OpenAI-compatible API.
- **Embeddings** — the provider is decided by `content/index.json`. The matching
  key must be present at runtime: `GEMINI_API_KEY` for the `gemini` provider, or
  nothing for the `local` provider (downloads a model at build time).

Secrets live only in `.env.local` (gitignored). Never commit real keys.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (runs `build:kb` first via `prebuild`) |
| `npm run build:kb` | Rebuild `content/index.json` |
| `npm run test:rag` | Retrieval test suite |
| `npm run bench:embed` | Embedding latency benchmark |
| `npm run lint` | ESLint |

## Deploy

See [DEPLOY.md](./DEPLOY.md). The short version: import the repo on Vercel, set
the environment variables from `.env.example`, and deploy. The build runs the KB
indexer automatically, so the index always matches the runtime embedding
provider.

## Project docs

- [PRD.md](./PRD.md) — product requirements and architecture
- [DESIGN.md](./DESIGN.md) — design tokens
- [DEPLOY.md](./DEPLOY.md) — deployment guide
