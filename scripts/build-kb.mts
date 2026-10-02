/**
 * Build-time indexer for the RAG knowledge base.
 *
 * Reads every markdown file in content/kb, splits it into heading-aware chunks,
 * embeds each chunk with the SAME provider the app uses at request time
 * (lib/embed.ts) and writes content/index.json.
 *
 * Run with:  npm run build:kb
 *
 * IMPORTANT: the index must be built with the same embedding model the runtime
 * uses, otherwise query vectors and chunk vectors live in different spaces and
 * retrieval silently breaks. lib/rag.ts asserts this at load time.
 *
 * Chunking strategy: split on markdown headings (##, ###) so each chunk covers
 * a single topic. Mixed-topic chunks produce "averaged" embeddings that match
 * everything weakly; single-topic chunks match their subject strongly. The
 * document title (H1) is prefixed to every chunk so keyword matching keeps the
 * top-level topic ("Projects", "Skills", ...).
 */
import './load-env.mts';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { embedTexts, configFromEnv } from '../lib/embed';

const KB_DIR = join(process.cwd(), 'content', 'kb');
const OUT_FILE = join(process.cwd(), 'content', 'index.json');

const MAX_CHARS = 700; // a chunk longer than this gets split further
const OVERLAP = 120; // chars of overlap when a section must be split

/**
 * Split one document into heading-aware chunks.
 */
function chunkDocument(text: string): string[] {
  const clean = text.replace(/\r\n/g, '\n').trim();
  const lines = clean.split('\n');

  // The document's H1 (if any) becomes a title prefix on every chunk.
  const h1 = lines.find((l) => /^#\s+/.test(l));
  const title = h1 ? h1.replace(/^#\s+/, '').trim() : '';

  const sections: { heading: string; body: string[] }[] = [];
  let current = { heading: '', body: [] as string[] };
  for (const line of lines) {
    if (/^#{1,6}\s+/.test(line)) {
      if (current.heading || current.body.length) sections.push(current);
      current = { heading: line.trim(), body: [] };
    } else {
      current.body.push(line);
    }
  }
  if (current.heading || current.body.length) sections.push(current);

  const prefix = (s: string) =>
    title && !s.startsWith(`# ${title}`) ? `${title}\n${s}` : s;

  const chunks: string[] = [];
  for (const sec of sections) {
    const body = sec.body.join('\n').trim();
    if (!body) continue;
    const isH1 = /^#\s+/.test(sec.heading);
    const full = isH1 ? body : sec.heading ? `${sec.heading}\n${body}` : body;

    if (full.length <= MAX_CHARS) {
      chunks.push(prefix(full.trim()));
      continue;
    }
    let rest = body;
    while (rest.length > MAX_CHARS) {
      let cut = rest.lastIndexOf(' ', MAX_CHARS);
      if (cut < MAX_CHARS * 0.5) cut = MAX_CHARS;
      const piece = rest.slice(0, cut).trim();
      chunks.push(prefix(sec.heading && !isH1 ? `${sec.heading}\n${piece}` : piece));
      rest = rest.slice(Math.max(0, cut - OVERLAP)).trim();
    }
    if (rest.trim()) {
      chunks.push(
        prefix(sec.heading && !isH1 ? `${sec.heading}\n${rest.trim()}` : rest.trim()),
      );
    }
  }
  return chunks;
}

async function main() {
  console.log(`[kb] reading ${KB_DIR}`);
  const files = readdirSync(KB_DIR).filter((f) => f.endsWith('.md')).sort();
  if (!files.length) {
    console.error('[kb] no markdown files found in content/kb');
    process.exit(1);
  }

  const cfg = configFromEnv();
  console.log(`[kb] embedding via ${cfg.provider} (${cfg.model}, ${cfg.dims}d)`);

  const records: {
    id: string;
    source: string;
    text: string;
    vector: number[];
  }[] = [];

  for (const file of files) {
    const raw = readFileSync(join(KB_DIR, file), 'utf8');
    const source = basename(file, '.md');
    const chunks = chunkDocument(raw);
    const vectors = await embedTexts(chunks, 'RETRIEVAL_DOCUMENT', cfg);
    for (let i = 0; i < chunks.length; i++) {
      records.push({
        id: `${source}#${i}`,
        source,
        text: chunks[i],
        vector: vectors[i].map((v) => Math.round(v * 1e5) / 1e5),
      });
    }
    console.log(`[kb] ${file}: ${chunks.length} chunks`);
  }

  // --- Derive the out-of-scope floor from the corpus itself -----------------
  // A query is only "on-topic" if it is at least as similar to some chunk as
  // two unrelated chunks are to each other. We measure that background level
  // here (mean + 1 std of pairwise chunk similarity) and store it in the index,
  // so the gate recalibrates automatically when the provider/model changes.
  // This deliberately replaces a hand-tuned constant (the old 0.25 was tuned
  // for MiniLM and became meaningless under Gemini's different score scale).
  const norm = (v: number[]) => Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  const cos = (a: number[], b: number[]) => {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s / (norm(a) * norm(b) || 1);
  };
  const pair: number[] = [];
  for (let i = 0; i < records.length; i++)
    for (let j = i + 1; j < records.length; j++)
      pair.push(cos(records[i].vector, records[j].vector));
  const mean = pair.reduce((s, x) => s + x, 0) / (pair.length || 1);
  const std = Math.sqrt(
    pair.reduce((s, x) => s + (x - mean) ** 2, 0) / (pair.length || 1),
  );
  // Conservative floor: deliberately permissive so legitimate questions are
  // never dropped. The system prompt is the real guardrail for anything that
  // slips through.
  const minScore = Math.round(Math.min(0.6, Math.max(0.35, mean + 1.5 * std)) * 1000) / 1000;
  console.log(
    `[kb] chunk-similarity mean=${mean.toFixed(3)} std=${std.toFixed(3)} -> minScore=${minScore}`,
  );

  const payload = {
    provider: cfg.provider,
    model: cfg.model,
    dims: records[0]?.vector.length ?? 0,
    count: records.length,
    minScore,
    builtAt: new Date().toISOString(),
    records,
  };
  writeFileSync(OUT_FILE, JSON.stringify(payload));
  console.log(
    `[kb] wrote ${records.length} chunks (${payload.dims}-dim) -> ${OUT_FILE}`,
  );
}

main().catch((err) => {
  console.error('[kb] failed:', err);
  process.exit(1);
});
