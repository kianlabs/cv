/**
 * Retrieval for the portfolio chat assistant (RAG).
 *
 * The knowledge base is embedded at build time (scripts/build-kb.mts) into
 * content/index.json; at request time we only embed the visitor's query with
 * the same model. Retrieval is hybrid — dense cosine fused with BM25 lexical
 * via Reciprocal Rank Fusion. No vector database: the corpus is tiny, so an
 * exact in-memory scan is instant. SERVER-ONLY (imported by the API route).
 *
 * Beyond the fused ranking this module layers four cheap, in-process quality
 * boosts, each degrading gracefully so retrieval never depends on any of them:
 *   1. History-aware query rewriting — resolve follow-ups ("berapa lama itu?")
 *      against the previous turn before embedding, so a pronoun-only question
 *      still lands near the right chunk.
 *   2. Bilingual (ID<->EN) expansion — the corpus is English but visitors ask
 *      in Indonesian; expanding each query token to its counterpart feeds the
 *      BM25 branch the words it would otherwise miss.
 *   3. MMR — diversify the final selection so four near-duplicate chunks do not
 *      crowd out a genuinely different, still-relevant one.
 *   4. Optional Cloudflare cross-encoder rerank — reorders the candidate pool
 *      by reading query and passage together; falls back to the fused order on
 *      any error or when unconfigured.
 */
import indexData from '@/content/index.json';
import {
  embedQuery,
  isConfigured,
  rerankModel,
  rerankTexts,
  type EmbedderConfig,
} from '@/lib/embed';

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

/**
 * A prior conversation turn used to rewrite follow-up questions. Structurally
 * compatible with the route's `ChatMessage` (extra fields are ignored), but
 * declared locally so this module stays independent of the route handler.
 */
export interface HistoryTurn {
  role: 'user' | 'assistant';
  content: string;
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

// --- Bilingual (ID <-> EN) query expansion ----------------------------------
// The knowledge base is written in English, but the assistant serves Indonesian
// visitors too. Dense embeddings already bridge the two languages (bge-m3 is
// multilingual); this small map exists purely to give the BM25 branch the
// English (or Indonesian) counterpart of a query token so exact-term matching
// works across languages as well. It is deliberately small — the top terms a
// visitor actually uses for a portfolio — and one-directional per entry, with
// reverse lookups built automatically so a pair works both ways.
const ID_EN_PAIRS: [string, string][] = [
  ['proyek', 'project'],
  ['proyek', 'projects'],
  ['keahlian', 'skill'],
  ['keahlian', 'skills'],
  ['kemampuan', 'skill'],
  ['pengalaman', 'experience'],
  ['pendidikan', 'education'],
  ['kuliah', 'college'],
  ['kontak', 'contact'],
  ['hubungi', 'contact'],
  ['email', 'email'],
  ['gaji', 'salary'],
  ['harga', 'price'],
  ['biaya', 'price'],
  ['tarif', 'rate'],
  ['bayaran', 'payment'],
  ['kerja', 'work'],
  ['pekerjaan', 'job'],
  ['lowongan', 'job'],
  ['rekrut', 'hire'],
  ['rekrutmen', 'recruitment'],
  ['magang', 'internship'],
  ['freelance', 'freelance'],
  ['situs', 'website'],
  ['web', 'web'],
  ['aplikasi', 'app'],
  ['basis', 'database'],
  ['data', 'data'],
  ['desain', 'design'],
  ['pengembangan', 'development'],
  ['pengembang', 'developer'],
  ['pemrograman', 'programming'],
  ['bahasa', 'language'],
  ['teknologi', 'technology'],
  ['kerangka', 'framework'],
  ['alat', 'tools'],
  ['layanan', 'service'],
  ['profil', 'profile'],
  ['tentang', 'about'],
  ['lulusan', 'graduate'],
  ['sarjana', 'bachelor'],
  ['ipk', 'gpa'],
  ['nilai', 'grade'],
  ['lokasi', 'location'],
  ['alamat', 'address'],
  ['domisili', 'domicile'],
  ['tersedia', 'available'],
  ['ketersediaan', 'availability'],
  ['waktu', 'time'],
  ['durasi', 'duration'],
  ['lama', 'duration'],
  ['harga', 'pricing'],
  ['proyek', 'portfolio'],
  ['portofolio', 'portfolio'],
  ['sertifikat', 'certificate'],
  ['sertifikasi', 'certification'],
];

// token -> set of cross-language synonyms.
const EXPANSIONS = new Map<string, string[]>();
function addExpansion(from: string, to: string) {
  if (!from || !to || from === to) return;
  const list = EXPANSIONS.get(from) ?? [];
  if (!list.includes(to)) list.push(to);
  EXPANSIONS.set(from, list);
}
for (const [id, en] of ID_EN_PAIRS) {
  addExpansion(id, en);
  addExpansion(en, id);
}
// A couple of English plurals that tokenize differently, mapped explicitly.
addExpansion('projects', 'project');
addExpansion('project', 'projects');
addExpansion('skills', 'skill');
addExpansion('skill', 'skills');

/**
 * Expand query tokens with their cross-language counterparts. Only the BM25
 * branch uses this — the dense vector is left to the multilingual model, and
 * the returned `score` (a cosine) must stay tied to the real question.
 */
function expandTokens(tokens: string[]): string[] {
  const out: string[] = [];
  for (const t of tokens) {
    out.push(t);
    const extra = EXPANSIONS.get(t);
    if (extra) out.push(...extra);
  }
  return out;
}

// --- History-aware query rewriting ------------------------------------------
// A follow-up such as "kalau itu berapa lama?" is meaningless in isolation: the
// subject lives in the previous turn. We do not ask the LLM to rewrite (that
// would add latency and a failure mode to every request); instead we prepend
// the immediately preceding user question when the new one reads as a
// continuation, then embed the combination so the dense branch sees the topic.
//
// The test is deliberately narrow: only a real anaphor/demonstrative ("it",
// "that", "itu") or a query with no content words at all triggers a rewrite, so
// a standalone question that merely follows another one (e.g. "what is his
// GPA?" after a project question) is never polluted by stale context. Singular
// pronouns ("he", "she") are excluded on purpose: in this single-person corpus
// they always mean Kyan, never a pointer to the previous turn.
const ANAPHORA = new Set([
  'it', 'its', 'that', 'this', 'those', 'these', 'there',
  'itu', 'tersebut', 'dia', 'nya', 'hal', 'begitu', 'gitu', 'sana', 'situ',
  'tadi', 'sebelumnya',
]);

// Indonesian attaches the anaphoric enclitic "-nya" to the END of a word
// ("stacknya", "harganya", "pengerjaannya"), so a whitespace tokeniser never
// yields a standalone "nya" to match against the set above. Words that merely
// *end* in those four letters are not anaphors — the "-nya" modals (sebaiknya,
// seharusnya, ...) and a few common words (hanya, punya, tanya) — so they are
// excluded, and a stem is required (length >= 6) to avoid short false friends.
const NYA_FALSE_FRIENDS = new Set([
  'hanya', 'punya', 'tanya',
  'sebaiknya', 'seharusnya', 'semestinya', 'sesungguhnya', 'setidaknya',
  'secepatnya', 'selayaknya', 'sepenuhnya', 'sebenarnya', 'sebaliknya',
  'sebanyaknya', 'sebisanya', 'sedapatnya',
]);

function hasNyaClitic(word: string): boolean {
  return (
    word.length >= 6 && word.endsWith('nya') && !NYA_FALSE_FRIENDS.has(word)
  );
}

function rawWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Build the string actually embedded for retrieval. When `history` has a prior
 * user turn and `query` reads as a follow-up, the previous question is prepended
 * for context; otherwise the query is used verbatim.
 */
export function rewriteQuery(query: string, history?: HistoryTurn[]): string {
  const q = query.trim();
  if (!q || !history || !history.length) return q;

  // Most recent prior user turn (skip a trailing assistant reply).
  let prevUser = '';
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === 'user') {
      const c = history[i].content.trim();
      if (c && c !== q) {
        prevUser = c;
        break;
      }
    }
  }
  if (!prevUser) return q;

  const words = rawWords(q);
  const content = tokenize(q); // stopword-stripped content words

  const hasAnaphor =
    words.some((w) => ANAPHORA.has(w)) || words.some(hasNyaClitic);
  // A query with no content words ("berapa lama?", "and the price?") is
  // subjectless by construction and only makes sense against the prior turn.
  const looksLikeFollowUp = hasAnaphor || content.length === 0;

  if (!looksLikeFollowUp) return q;
  return `${prevUser} ${q}`;
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

// --- MMR (maximal marginal relevance) ---------------------------------------
// RRF alone can return several near-identical chunks (the same fact chunked
// twice), wasting the model's context budget. MMR picks the next item that best
// balances relevance against dissimilarity from what is already chosen, so the
// top-K spans more of the knowledge base while staying on topic.
const MMR_LAMBDA = 0.7; // 1.0 = pure relevance, 0.0 = pure diversity
const CANDIDATE_POOL = 12; // rerank + MMR operate on this many candidates

/**
 * Reorder `candidates` (index descending relevance) into an MMR-diverse order.
 * Relevance is min-max normalised into [0,1] so it is comparable with a cosine
 * similarity; the signal is either the rerank scores or the fused RRF scores,
 * depending on whether reranking ran.
 */
function mmrSelect(
  candidates: number[],
  relevance: Map<number, number>,
  limit: number,
): number[] {
  if (candidates.length <= 1 || limit <= 1) return candidates.slice(0, limit);

  // Min-max normalise relevance into [0,1]. Cross-encoder scores are not
  // guaranteed to lie in [0,1] (they can be raw logits), so a plain
  // divide-by-max would mis-scale them; a zero range falls back to rank order.
  let minRel = Infinity;
  let maxRel = -Infinity;
  for (const i of candidates) {
    const v = relevance.get(i) ?? 0;
    if (v < minRel) minRel = v;
    if (v > maxRel) maxRel = v;
  }
  const range = maxRel - minRel;
  const rankRel = new Map<number, number>();
  candidates.forEach((i, k) =>
    rankRel.set(i, 1 - k / Math.max(1, candidates.length - 1)),
  );
  const rel = (i: number) => {
    if (range > 0) return ((relevance.get(i) ?? 0) - minRel) / range;
    return rankRel.get(i) ?? 0; // all equal: fall back to input order
  };

  const pool = candidates.slice();
  const selected: number[] = [];

  // First pick is the most relevant — MMR only changes the tail.
  selected.push(pool.shift() as number);

  while (pool.length && selected.length < limit) {
    let bestPos = 0;
    let bestScore = -Infinity;
    for (let p = 0; p < pool.length; p++) {
      const i = pool[p];
      let maxSim = 0;
      for (const j of selected) {
        const sim = cosine(INDEX.records[i].vector, INDEX.records[j].vector);
        if (sim > maxSim) maxSim = sim;
      }
      const mmr = MMR_LAMBDA * rel(i) - (1 - MMR_LAMBDA) * maxSim;
      if (mmr > bestScore) {
        bestScore = mmr;
        bestPos = p;
      }
    }
    selected.push(pool.splice(bestPos, 1)[0]);
  }
  return selected;
}

// --- Cross-encoder rerank (optional) ----------------------------------------

/**
 * Reorder `pool` (index list) by cross-encoder score, and report the relevance
 * signal MMR should use. On any error or when no model is configured, returns
 * the pool in fused order with `fallbackRelevance`, so a rerank outage degrades
 * to the fused ranking instead of failing the request.
 */
async function rerankPool(
  query: string,
  pool: number[],
  fallbackRelevance: Map<number, number>,
): Promise<{ order: number[]; relevance: Map<number, number> }> {
  const model = pool.length > 1 ? rerankModel() : '';
  if (!model) return { order: pool, relevance: fallbackRelevance };
  try {
    const scores = await rerankTexts(
      query,
      pool.map((i) => INDEX.records[i].text),
      model,
    );
    const relevance = new Map<number, number>();
    pool.forEach((i, k) => relevance.set(i, scores[k] ?? 0));
    const order = pool
      .map((i, k) => ({ i, s: scores[k] ?? 0 }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.i);
    return { order, relevance };
  } catch (err) {
    console.error('[rag] rerank failed, using fused order:', err);
    return { order: pool, relevance: fallbackRelevance };
  }
}

/**
 * Return the most relevant knowledge-base chunks for a query.
 *
 * Hybrid retrieval: rank by cosine and by BM25, then fuse with RRF. The
 * returned `score` is the cosine similarity (used for the out-of-scope floor);
 * RRF only decides the ordering. An optional cross-encoder rerank and MMR
 * diversity pass refine the final selection.
 *
 * @param query   The visitor's latest question.
 * @param topK    Maximum chunks to return.
 * @param history Prior conversation turns, used to rewrite follow-up questions.
 */
export async function retrieve(
  query: string,
  topK = 4,
  history?: HistoryTurn[],
): Promise<Chunk[]> {
  const q = query.trim();
  if (!q) return [];

  // Resolve follow-ups against the previous turn before embedding, so a
  // pronoun-only question still carries its subject.
  const rewritten = rewriteQuery(q, history);

  const qv = await embedQuery(rewritten, EMBEDDER);
  const cosineScores = INDEX.records.map((r) => cosine(qv, r.vector));
  // BM25 gets the query *and* its cross-language synonyms.
  const lexicalScores = bm25Scores(expandTokens(tokenize(rewritten)));

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

  // Keep only candidates that clear the dense relevance floor, then narrow to a
  // pool the reranker and MMR work on. The floor uses the dense score so
  // irrelevant questions (no keyword match AND weak vector match) are filtered.
  const fusedScores = new Map(rrf);
  const eligible = fused.filter((i) => cosineScores[i] >= MIN_SCORE);
  const pool = eligible.slice(0, CANDIDATE_POOL);

  // 4. Optional cross-encoder rerank (no-op when unconfigured/unavailable).
  //    The rerank scores become MMR's relevance signal so the two stages agree;
  //    when reranking is skipped, MMR falls back to the fused RRF scores.
  const { order: reranked, relevance } = await rerankPool(
    rewritten,
    pool,
    fusedScores,
  );

  // 3. MMR diversity over the reranked pool.
  const ordered = mmrSelect(reranked, relevance, topK);

  const out: Chunk[] = [];
  for (const i of ordered) {
    if (out.length >= topK) break;
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
