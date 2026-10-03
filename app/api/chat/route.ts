import { NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { buildSystemPrompt, OUT_OF_SCOPE_REPLY } from '@/lib/persona';
import { retrieve, formatContext, sourcesOf, retrievalConfigured, embedderInfo } from '@/lib/rag';

// Node runtime: this route talks to an OpenAI-compatible LLM endpoint and reads
// a server-only API key from the environment. The key never reaches the browser.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- LLM endpoint (provider-agnostic, OpenAI-compatible) --------------------
// Production: Cloudflare Workers AI (OpenAI-compatible), so a single provider
// and a single token serve BOTH chat and embeddings.
// Local dev: the 9router gateway. Both are configured purely via env vars, so
// switching provider is a config change, not a code change.
//
//   LLM_BASE_URL   e.g. https://api.cloudflare.com/client/v4/accounts/<id>/ai/v1
//                       http://127.0.0.1:20128/v1           (local 9router)
//   LLM_API_KEY    server-only secret
//   LLM_MODEL      e.g. @cf/meta/llama-3.3-70b-instruct-fp8-fast
//   LLM_FALLBACKS  comma-separated fallback model ids (optional)
//
// CLOUDFLARE_* and NINE_ROUTER_* are honoured as fallbacks so one token can
// serve both chat and embeddings without duplicating the secret.
const BASE_URL = (
  process.env.LLM_BASE_URL ||
  process.env.NINE_ROUTER_BASE_URL ||
  'http://localhost:20128/v1'
).replace(/\/$/, '');

/**
 * Pick the matching credential for the configured endpoint. Deriving it from
 * the URL (rather than a flat fallback chain) means a Cloudflare token can never
 * be sent to the 9router, or vice versa — a mismatch that would otherwise fail
 * with a confusing 401.
 *
 * Cloudflare's own endpoint is the only one that wants CLOUDFLARE_API_TOKEN;
 * everything else (localhost, a quick tunnel, or a named tunnel like
 * llm.kianlabs.my.id) is the 9router gateway.
 */
function defaultKeyFor(baseUrl: string): string {
  if (baseUrl.includes('api.cloudflare.com')) {
    return process.env.CLOUDFLARE_API_TOKEN ?? '';
  }
  return (
    process.env.NINE_ROUTER_API_KEY ??
    process.env.HERMES_CUSTOM_LOCALHOST_20128_API_KEY ??
    ''
  );
}

const API_KEY = (process.env.LLM_API_KEY || defaultKeyFor(BASE_URL)).trim();

/**
 * Optional Cloudflare Access service token. When the LLM endpoint sits behind
 * an Access application (e.g. a named tunnel), requests must present these two
 * headers or Cloudflare rejects them at the edge with a 403 before they ever
 * reach the gateway. Both are server-only secrets.
 */
const CF_ACCESS_CLIENT_ID = process.env.CF_ACCESS_CLIENT_ID ?? '';
const CF_ACCESS_CLIENT_SECRET = process.env.CF_ACCESS_CLIENT_SECRET ?? '';

function accessHeaders(): Record<string, string> {
  if (!CF_ACCESS_CLIENT_ID || !CF_ACCESS_CLIENT_SECRET) return {};
  return {
    'CF-Access-Client-Id': CF_ACCESS_CLIENT_ID,
    'CF-Access-Client-Secret': CF_ACCESS_CLIENT_SECRET,
  };
}

/** Sensible default model for the configured endpoint. */
function defaultModelFor(baseUrl: string): string {
  if (baseUrl.includes('api.cloudflare.com')) {
    return '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
  }
  return 'kr/claude-haiku-4.5';
}

/** Sensible default fallback chain for the configured endpoint. */
function defaultFallbacksFor(baseUrl: string): string {
  if (baseUrl.includes('api.cloudflare.com')) {
    return '@cf/qwen/qwen2.5-coder-32b-instruct';
  }
  return 'kr/claude-sonnet-4.5,kr/auto';
}

const PRIMARY_MODEL =
  process.env.LLM_MODEL || defaultModelFor(BASE_URL);

const FALLBACK_MODELS = (
  process.env.LLM_FALLBACKS || defaultFallbacksFor(BASE_URL)
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .filter((m) => m !== PRIMARY_MODEL);

const REQUEST_TIMEOUT_MS = 45_000;
const MAX_MESSAGES = 12; // cap conversation history sent upstream
const MAX_CONTENT_CHARS = 2_000; // per-message cap
const MAX_BODY_BYTES = 24_000; // reject oversized request bodies early

// --- Abuse protection -------------------------------------------------------
// Per-IP sliding window. Defaults: 12 requests / 60s. Tune with env vars.
const RATE_LIMIT_MAX = Number(process.env.NINE_ROUTER_RATE_LIMIT_MAX ?? 12) || 12;
const RATE_LIMIT_WINDOW_MS =
  (Number(process.env.NINE_ROUTER_RATE_LIMIT_WINDOW_SEC ?? 60) || 60) * 1000;

/**
 * Only allow browser requests that come from this same site (or an explicitly
 * allowed origin). Non-browser callers (no Origin header) are left to the rate
 * limiter. This stops other websites from embedding/abusing the endpoint.
 */
function originAllowed(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // same-origin GET, curl, server-to-server
  try {
    const parsed = new URL(origin);
    const host = request.headers.get('host');
    if (host && parsed.host === host) return true;
    const allow = (
      process.env.ALLOWED_ORIGINS ??
      process.env.NINE_ROUTER_ALLOWED_ORIGINS ??
      ''
    )
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return allow.includes(origin);
  } catch {
    return false;
  }
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Validate and normalise the incoming conversation. Returns null when invalid. */
function parseMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null;
  const cleaned: ChatMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const { role, content } = item as Record<string, unknown>;
    if (role !== 'user' && role !== 'assistant') continue;
    if (typeof content !== 'string') continue;
    const text = content.trim().slice(0, MAX_CONTENT_CHARS);
    if (!text) continue;
    cleaned.push({ role, content: text });
  }
  if (!cleaned.length) return null;
  // Keep only the most recent turns to bound token usage.
  return cleaned.slice(-MAX_MESSAGES);
}

/** Strip common markdown so replies render cleanly in the plain-text bubble. */
function sanitizeReply(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1 ($2)') // [label](url) -> label (url)
    .replace(/\*\*([^*]+)\*\*/g, '$1') // **bold** -> bold
    .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$)/g, '$1$2') // *italic* -> italic
    .replace(/`([^`]+)`/g, '$1') // `code` -> code
    .replace(/^\s{0,3}#{1,6}\s+/gm, '') // headings
    .replace(/^\s{0,3}[-*]\s+/gm, '• ') // bullet markers -> •
    .trim();
}

async function callModel(
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        ...accessHeaders(),
      },
      body: JSON.stringify({
        model,
        stream: false,
        temperature: 0.6,
        max_tokens: 400,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(
        `[chat] model ${model} failed: HTTP ${res.status} ${detail.slice(0, 300)}`,
      );
      return null;
    }

    const data = await res.json().catch(() => null);
    const reply: unknown = data?.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) return null;
    return sanitizeReply(reply);
  } catch (err) {
    console.error(`[chat] model ${model} error:`, err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json(
      {
        error:
          'Chat is not configured: no LLM API key found in the server environment.',
      },
      { status: 503 },
    );
  }

  if (!retrievalConfigured()) {
    return NextResponse.json(
      {
        error:
          'Chat is not configured: the retrieval index needs its embedding credentials (e.g. CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN, or GEMINI_API_KEY), or rebuild the index with EMBED_PROVIDER=local for offline use.',
      },
      { status: 503 },
    );
  }

  // 1. Block cross-site browser abuse (same-origin or allow-listed only).
  if (!originAllowed(request)) {
    return NextResponse.json({ error: 'Forbidden origin.' }, { status: 403 });
  }

  // 2. Per-IP rate limit.
  const limit = rateLimit(
    clientIp(request),
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down and try again shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(limit.retryAfterSec),
          'X-RateLimit-Limit': String(limit.limit),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  // 3. Reject oversized bodies before parsing.
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: 'Request body too large.' },
      { status: 413 },
    );
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: 'Request body too large.' },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const rawMessages = (body as { messages?: unknown })?.messages;
  const messages = parseMessages(rawMessages);
  if (!messages) {
    return NextResponse.json(
      { error: 'A non-empty "messages" array is required.' },
      { status: 400 },
    );
  }

  // 4. Retrieval (RAG): embed the latest user question locally and pull the
  //    most relevant knowledge-base chunks. The corpus is tiny and the index
  //    is precomputed, so this is an exact in-memory cosine scan.
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  let chunks: Awaited<ReturnType<typeof retrieve>> = [];
  try {
    chunks = await retrieve(lastUser?.content ?? '', 4);
  } catch (err) {
    console.error('[chat] retrieval failed, continuing without context:', err);
  }

  const systemPrompt = buildSystemPrompt(formatContext(chunks));
  const sources = sourcesOf(chunks);

  // No grounded context for the question -> skip the model entirely and reply
  // with the out-of-scope message. Saves a call and keeps answers honest.
  if (!chunks.length) {
    return NextResponse.json(
      { reply: OUT_OF_SCOPE_REPLY, model: 'none', sources: [] },
      {
        headers: {
          'X-RateLimit-Limit': String(limit.limit),
          'X-RateLimit-Remaining': String(limit.remaining),
        },
      },
    );
  }

  for (const model of [PRIMARY_MODEL, ...FALLBACK_MODELS]) {
    const reply = await callModel(model, systemPrompt, messages);
    if (reply) {
      return NextResponse.json(
        { reply, model, sources },
        {
          headers: {
            'X-RateLimit-Limit': String(limit.limit),
            'X-RateLimit-Remaining': String(limit.remaining),
          },
        },
      );
    }
  }

  return NextResponse.json(
    { error: 'The assistant is unavailable right now. Please try again shortly.' },
    { status: 502 },
  );
}

/**
 * Health/diagnostic probe. Reports only whether the service is wired up — it
 * never echoes keys or prompt content. Useful to verify a deployment.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: !!API_KEY && retrievalConfigured(),
      llmConfigured: !!API_KEY,
      retrievalConfigured: retrievalConfigured(),
      embedder: embedderInfo(),
      model: PRIMARY_MODEL,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
