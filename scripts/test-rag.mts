/**
 * Probe of the hybrid RAG retriever.
 *
 * Run with:  npx tsx scripts/test-rag.mts
 *
 * Imports the real retriever (lib/rag.ts) so this exercises exactly what the
 * API route uses — no duplicated logic.
 *
 * Scope handling is TWO-LAYER, and this test only covers layer 1:
 *   Layer 1 (here): the retrieval floor (INDEX.minScore) skips the LLM for
 *     queries that are obviously unrelated to the knowledge base. It is
 *     deliberately permissive — a wrong "no" (dropping a real question) is a
 *     worse failure than a wrong "yes".
 *   Layer 2 (not here): the system prompt instructs the model to decline
 *     anything off-topic, so borderline queries that clear the floor are still
 *     handled gracefully. Verified end-to-end against /api/chat, not here.
 *
 * Therefore a borderline query retrieving a chunk is NOT a failure. Only
 * clearly-unrelated queries must be filtered by layer 1.
 */
import './load-env.mts';
import { retrieve, sourcesOf, embedderInfo } from '../lib/rag';

// In-scope: must retrieve at least one chunk.
const IN_SCOPE = [
  'what projects has he built?',
  'something to track my daily spending',
  'is he available for freelance work?',
  'what backend does he use?',
  'how do I contact him?',
  'apa saja keahliannya?',
  'what is his GPA?',
  'how much does he charge?',
  'does he know Laravel?',
  'tell me about UangKu',
];

// Clearly out-of-scope: no plausible link to the corpus, must retrieve nothing.
const OUT_OF_SCOPE = [
  'what is the capital of France?',
  'write me a poem about cats',
  'explain quantum entanglement',
  'how do I bake sourdough bread?',
  'who won the world cup in 2022?',
];

// Borderline: may or may not clear the floor; reported, never failed. These are
// exactly the cases layer 2 (the prompt) is responsible for.
const BORDERLINE = [
  'can you write my essay for me?',
  'what movie should I watch tonight?',
  'tell me a joke',
];

let pass = 0;
let fail = 0;

async function check(q: string, expect: 'hits' | 'none') {
  const chunks = await retrieve(q, 4);
  const sources = sourcesOf(chunks);
  const top = chunks[0];
  const ok = expect === 'hits' ? chunks.length > 0 : chunks.length === 0;
  ok ? pass++ : fail++;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  [expect ${expect}]  ${q}\n` +
      `        sources=[${sources.join(', ')}]  top=${top ? top.score.toFixed(3) : '-'}` +
      (top ? `\n        top text: ${top.text.slice(0, 88).replace(/\n/g, ' ')}…` : ''),
  );
}

console.log(`embedder: ${embedderInfo()}\n`);
console.log('--- layer 1: must retrieve (in-scope) ---');
for (const q of IN_SCOPE) await check(q, 'hits');

console.log('\n--- layer 1: must be filtered (clearly out-of-scope) ---');
for (const q of OUT_OF_SCOPE) await check(q, 'none');

console.log('\n--- layer 2 territory (borderline, informational only) ---');
for (const q of BORDERLINE) {
  const chunks = await retrieve(q, 4);
  const top = chunks[0];
  console.log(
    `INFO  ${chunks.length ? 'retrieved' : 'filtered '}  top=${top ? top.score.toFixed(3) : '-'}  ${q}`,
  );
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
