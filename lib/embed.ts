/**
 * Embedding provider abstraction.
 *
 * The embedding provider/model is NOT configured by env at request time — it is
 * read from content/index.json (see lib/rag.ts), because the index and the
 * runtime MUST embed with the same model or retrieval is silently meaningless.
 * Making the index the single source of truth removes that failure mode.
 *
 * Providers:
 *   - "cloudflare": Cloudflare Workers AI (@cf/baai/bge-m3), called server-side.
 *     Multilingual (100+ languages), fast from the edge.
 *   - "gemini": Google Gemini text embeddings, called server-side.
 *
 * All vectors are L2-normalised before returning, so cosine similarity is just
 * a dot product (see lib/rag.ts).
 */

export interface EmbedderConfig {
  provider: 'gemini' | 'cloudflare';
  model: string;
  dims: number;
}

type EmbedTask = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

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

// --- Cloudflare Workers AI --------------------------------------------------
function cloudflareCreds(): { account: string; token: string } {
  return {
    account: (process.env.CLOUDFLARE_ACCOUNT_ID ?? '').trim(),
    token: (process.env.CLOUDFLARE_API_TOKEN ?? '').trim(),
  };
}
const CF_BATCH = 100; // API limit per call

async function cloudflareEmbed(
  texts: string[],
  model: string,
): Promise<number[][]> {
  const { account, token } = cloudflareCreds();
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += CF_BATCH) {
    const slice = texts.slice(i, i + CF_BATCH);
    const vectors = await withRetry(async () => {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: slice }),
          cache: 'no-store',
        },
      );
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(
          `Cloudflare embed HTTP ${res.status}: ${detail.slice(0, 200)}`,
        );
      }
      const data = (await res.json()) as {
        result?: { data?: number[][] };
        success?: boolean;
      };
      const vals = data.result?.data ?? [];
      if (vals.length !== slice.length) {
        throw new Error(
          `Cloudflare embed returned ${vals.length} vectors for ${slice.length} inputs`,
        );
      }
      return vals;
    });
    out.push(...vectors);
  }
  return out;
}

// --- Public API -------------------------------------------------------------

/** Whether the given config can actually run (e.g. has its API key). */
export function isConfigured(cfg: EmbedderConfig): boolean {
  if (cfg.provider === 'cloudflare') {
    const { account, token } = cloudflareCreds();
    return !!account && !!token;
  }
  return !!geminiKey();
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
    cfg.provider === 'cloudflare'
      ? await cloudflareEmbed(texts, cfg.model)
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
  const provider = (process.env.EMBED_PROVIDER ?? 'cloudflare').toLowerCase();
  if (provider === 'gemini') {
    return {
      provider: 'gemini',
      model: process.env.GEMINI_EMBED_MODEL ?? 'gemini-embedding-001',
      dims: Number(process.env.GEMINI_EMBED_DIMS ?? 768) || 768,
    };
  }
  if (provider !== 'cloudflare') {
    throw new Error(
      `Unknown EMBED_PROVIDER "${provider}" (expected "cloudflare" or "gemini")`,
    );
  }
  return {
    provider: 'cloudflare',
    model: process.env.CLOUDFLARE_EMBED_MODEL ?? '@cf/baai/bge-m3',
    dims: Number(process.env.CLOUDFLARE_EMBED_DIMS ?? 1024) || 1024,
  };
}
