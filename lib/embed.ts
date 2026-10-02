/**
 * Embedding provider abstraction.
 *
 * The embedding provider/model is NOT configured by env at request time — it is
 * read from content/index.json (see lib/rag.ts), because the index and the
 * runtime MUST embed with the same model or retrieval is silently meaningless.
 * Making the index the single source of truth removes that failure mode.
 *
 * Providers:
 *   - "gemini": Google Gemini text embeddings, called server-side. No download
 *     for the visitor, no native binaries in the serverless bundle. This is the
 *     production provider.
 *   - "local":  a transformers.js model (Xenova/all-MiniLM-L6-v2). Loaded lazily
 *     with webpackIgnore so it is never traced into the serverless bundle; used
 *     for offline/local development only.
 *
 * All vectors are L2-normalised before returning, so cosine similarity is just
 * a dot product (see lib/rag.ts).
 */

export interface EmbedderConfig {
  provider: 'gemini' | 'local';
  model: string;
  dims: number;
}

export type EmbedTask = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

// --- Gemini -----------------------------------------------------------------
// Read lazily (not at module load) so a build script can load .env.local first.
function geminiKey(): string {
  return (
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_API_KEY ??
    ''
  ).trim();
}
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_BATCH = 100; // API limit per batchEmbedContents call

// --- Helpers ----------------------------------------------------------------

function l2normalize(v: number[]): number[] {
  let s = 0;
  for (const x of v) s += x * x;
  const n = Math.sqrt(s);
  return n === 0 ? v : v.map((x) => x / n);
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 400 * (i + 1)));
      }
    }
  }
  throw lastErr;
}

// --- Gemini implementation --------------------------------------------------

async function geminiEmbed(
  texts: string[],
  task: EmbedTask,
  model: string,
  dims: number,
): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += GEMINI_BATCH) {
    const slice = texts.slice(i, i + GEMINI_BATCH);
    const vectors = await withRetry(async () => {
      const res = await fetch(`${GEMINI_BASE}/models/${model}:batchEmbedContents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey(),
        },
        body: JSON.stringify({
          requests: slice.map((text) => ({
            model: `models/${model}`,
            content: { parts: [{ text }] },
            taskType: task,
            outputDimensionality: dims,
          })),
        }),
        cache: 'no-store',
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`Gemini embed HTTP ${res.status}: ${detail.slice(0, 200)}`);
      }
      const data = (await res.json()) as { embeddings?: { values?: number[] }[] };
      const vals = (data.embeddings ?? []).map((e) => e.values ?? []);
      if (vals.length !== slice.length) {
        throw new Error(
          `Gemini embed returned ${vals.length} vectors for ${slice.length} inputs`,
        );
      }
      return vals;
    });
    out.push(...vectors);
  }
  return out;
}

// --- Local implementation ---------------------------------------------------

type LocalPipe = (
  text: string,
  opts: { pooling: 'mean'; normalize: boolean },
) => Promise<{ data: Float32Array | number[] }>;

let localPipe: Promise<LocalPipe> | null = null;

function getLocalPipe(model: string): Promise<LocalPipe> {
  if (!localPipe) {
    localPipe = (async () => {
      // webpackIgnore keeps this out of the serverless bundle: it is a native
      // runtime import, only ever executed when the index says provider=local.
      const modName = '@huggingface/transformers';
      const { pipeline } = await import(/* webpackIgnore: true */ modName);
      return (await pipeline('feature-extraction', model)) as unknown as LocalPipe;
    })();
  }
  return localPipe;
}

async function localEmbed(texts: string[], model: string): Promise<number[][]> {
  const pipe = await getLocalPipe(model);
  const out: number[][] = [];
  for (const text of texts) {
    const res = await pipe(text, { pooling: 'mean', normalize: true });
    out.push(Array.from(res.data));
  }
  return out;
}

// --- Public API -------------------------------------------------------------

/** Whether the given config can actually run (e.g. has its API key). */
export function isConfigured(cfg: EmbedderConfig): boolean {
  return cfg.provider === 'local' || !!geminiKey();
}

/**
 * Embed a batch of texts with an explicit config (derived from the index).
 * `task` tells the provider whether the input is a stored document or a search
 * query — Gemini uses this to place them optimally in the shared space.
 */
export async function embedTexts(
  texts: string[],
  task: EmbedTask,
  cfg: EmbedderConfig,
): Promise<number[][]> {
  if (!texts.length) return [];
  const raw =
    cfg.provider === 'local'
      ? await localEmbed(texts, cfg.model)
      : await geminiEmbed(texts, task, cfg.model, cfg.dims);
  return raw.map(l2normalize);
}

/** Convenience: embed a single query string. */
export async function embedQuery(
  text: string,
  cfg: EmbedderConfig,
): Promise<number[]> {
  const [v] = await embedTexts([text], 'RETRIEVAL_QUERY', cfg);
  return v ?? [];
}

/** Read the embedder config from the environment (used by the build script). */
export function configFromEnv(): EmbedderConfig {
  const provider = (process.env.EMBED_PROVIDER ?? 'gemini').toLowerCase();
  if (provider === 'local') {
    return {
      provider: 'local',
      model: process.env.LOCAL_EMBED_MODEL ?? 'Xenova/all-MiniLM-L6-v2',
      dims: 384,
    };
  }
  return {
    provider: 'gemini',
    model: process.env.GEMINI_EMBED_MODEL ?? 'gemini-embedding-001',
    dims: Number(process.env.GEMINI_EMBED_DIMS ?? 768) || 768,
  };
}
