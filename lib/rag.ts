/**
 * Retrieval for the portfolio chat assistant (RAG).
 *
 * The knowledge base is embedded at build time (scripts/build-kb.mts) into
 * content/index.json; at request time we only embed the visitor's query with
 * the same model. Retrieval is hybrid — dense cosine fused with BM25 lexical
 * via Reciprocal Rank Fusion. No vector database: the corpus is tiny, so an
 * exact in-memory scan is instant. SERVER-ONLY (imported by the API route).
 */
import indexData from '@/content/index.json';
import { embedQuery, isConfigured, type EmbedderConfig } from '@/lib/embed';

interface Chunk {
  id: string;
  source: string;
  text: string;
  score: number;
}

interface IndexRecord {
  id: string;
  source: string;
  text: string;
  vector: number[];
}

const INDEX = indexData as {
  provider: 'gemini' | 'cloudflare';
  model: string;
  dims: number;
  count: number;
  minScore?: number;
  records: IndexRecord[];
};

// The index is the single source of truth for how queries must be embedded.
// There is deliberately no separate runtime model env var: a mismatch would put
// query and chunk vectors in different spaces, making retrieval silently
// meaningless.
const EMBEDDER: EmbedderConfig = {
  provider: INDEX.provider,
  model: INDEX.model,
  dims: INDEX.dims,
};

/** True when the index's embedding provider has what it needs to run. */
export function retrievalConfigured(): boolean {
  return isConfigured(EMBEDDER);
}

/** Human-readable description of the active embedder (for diagnostics). */
export function embedderInfo(): string {
  return `${INDEX.provider}/${INDEX.model} (${INDEX.dims}d, ${INDEX.count} chunks)`;
}

// --- Out-of-scope gate ------------------------------------------------------
// The floor is derived at build time from on/off-topic calibration probes and
// stored in the index, so switching provider/model recalibrates automatically
// instead of silently breaking the gate. Deliberately conservative: it only
// skips the LLM for obviously unrelated input, and the system prompt is the
// real guardrail. Rejecting a legitimate question is the worse failure.
const MIN_SCORE = INDEX.minScore ?? 0.5;
const RRF_K = 60; // standard RRF constant
// Dense (semantic) ranking is trusted more than lexical: paraphrased questions
// are the common case, and lexical overlap on short queries is noisy.
const W_DENSE = 1.0;
const W_LEXICAL = 0.5;

// --- Text normalisation -----------------------------------------------------

const STOP = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'of', 'to', 'in', 'on',
  'for', 'and', 'or', 'do', 'does', 'did', 'he', 'she', 'his', 'her', 'him',
  'it', 'its', 'this', 'that', 'these', 'those', 'what', 'which', 'who', 'how',
  'can', 'you', 'me', 'my', 'i', 'we', 'they', 'with', 'at', 'by', 'as', 'has',
  'have', 'had', 'any', 'about', 'from', 'saya', 'apa', 'yang', 'dan', 'di',
  'ke', 'dari', 'itu', 'ini', 'untuk', 'dengan', 'adalah', 'ada',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

// Precompute tokenised documents once at module load.
const DOC_TOKENS: string[][] = INDEX.records.map((r) =>
  tokenize(`${r.source} ${r.text}`),
);

// --- BM25 -------------------------------------------------------------------

const AVG_LEN =
  DOC_TOKENS.reduce((s, t) => s + t.length, 0) / (DOC_TOKENS.length || 1);
const DF = new Map<string, number>();
for (const toks of DOC_TOKENS) {
  for (const t of Array.from(new Set(toks))) DF.set(t, (DF.get(t) ?? 0) + 1);
}
const N = DOC_TOKENS.length;
const K1 = 1.5;
const B = 0.75;

function bm25Scores(queryTokens: string[]): number[] {
  const scores = new Array<number>(N).fill(0);
  for (const q of queryTokens) {
    const df = DF.get(q);
    if (!df) continue;
    const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
    for (let i = 0; i < N; i++) {
      const toks = DOC_TOKENS[i];
      const len = toks.length || 1;
      let tf = 0;
      for (const t of toks) if (t === q) tf++;
      if (!tf) continue;
      scores[i] += idf * ((tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * len) / AVG_LEN)));
    }
  }
  return scores;
}

// --- Similarity -------------------------------------------------------------

function cosine(a: number[], b: number[]): number {
  // Both vectors are L2-normalised, so the dot product is the cosine.
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

/** Indices sorted by descending score (stable enough for RRF ranks). */
function rankedIndices(scores: number[]): number[] {
  return scores
    .map((s, i) => ({ i, s }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.i);
}

/**
 * Return the most relevant knowledge-base chunks for a query.
 *
 * Hybrid retrieval: rank by cosine and by BM25, then fuse with RRF. The
 * returned `score` is the cosine similarity (used for the out-of-scope floor);
 * RRF only decides the ordering.
 */
export async function retrieve(query: string, topK = 4): Promise<Chunk[]> {
  const q = query.trim();
  if (!q) return [];

  const qv = await embedQuery(q, EMBEDDER);
  const cosineScores = INDEX.records.map((r) => cosine(qv, r.vector));
  const lexicalScores = bm25Scores(tokenize(q));

  const cosineRank = rankedIndices(cosineScores);
  const lexicalRank = rankedIndices(lexicalScores);

  // Weighted Reciprocal Rank Fusion.
  const rrf = new Map<number, number>();
  const add = (idx: number, rank: number, weight: number) =>
    rrf.set(idx, (rrf.get(idx) ?? 0) + weight / (RRF_K + rank + 1));
  cosineRank.forEach((idx, rank) => add(idx, rank, W_DENSE));
  lexicalRank.forEach((idx, rank) => add(idx, rank, W_LEXICAL));

  const fused = Array.from(rrf.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([i]) => i);

  const out: Chunk[] = [];
  for (const i of fused) {
    if (out.length >= topK) break;
    // Keep the relevance floor on the dense score so irrelevant questions
    // (no keyword match AND weak vector match) are still filtered out.
    if (cosineScores[i] < MIN_SCORE) continue;
    const r = INDEX.records[i];
    out.push({
      id: r.id,
      source: r.source,
      text: r.text,
      score: cosineScores[i],
    });
  }
  return out;
}

/** Distinct human-readable source labels for a set of retrieved chunks. */
export function sourcesOf(chunks: Chunk[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of chunks) {
    if (!seen.has(c.source)) {
      seen.add(c.source);
      out.push(c.source);
    }
  }
  return out;
}

/** Format retrieved chunks into a context block for the system prompt. */
export function formatContext(chunks: Chunk[]): string {
  return chunks
    .map((c, i) => `[${i + 1}] (source: ${c.source})\n${c.text}`)
    .join('\n\n');
}
