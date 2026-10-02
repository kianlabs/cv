import './load-env.mts';
import { embedTexts, type EmbedderConfig } from '../lib/embed';

const q = 'what projects has he built?';

async function bench(label: string, cfg: EmbedderConfig, runs = 5) {
  // warm-up (model load for local, TLS handshake for gemini)
  await embedTexts([q], 'RETRIEVAL_QUERY', cfg);
  const times: number[] = [];
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    await embedTexts([q], 'RETRIEVAL_QUERY', cfg);
    times.push(performance.now() - t0);
  }
  times.sort((a, b) => a - b);
  const avg = times.reduce((s, x) => s + x, 0) / times.length;
  console.log(
    `${label.padEnd(22)} avg ${avg.toFixed(0).padStart(5)} ms   min ${times[0].toFixed(0).padStart(5)} ms   max ${times[times.length - 1].toFixed(0).padStart(5)} ms`,
  );
}

const gem: EmbedderConfig = { provider: 'gemini', model: 'gemini-embedding-001', dims: 768 };
const loc: EmbedderConfig = { provider: 'local', model: 'Xenova/all-MiniLM-L6-v2', dims: 384 };

// cold start: first call including model download/load
{
  const t0 = performance.now();
  await embedTexts([q], 'RETRIEVAL_QUERY', loc);
  console.log(`local cold start (incl. model load): ${(performance.now() - t0).toFixed(0)} ms\n`);
}

console.log('--- single query embedding latency ---');
await bench('gemini-embedding-001', gem);
await bench('local MiniLM-L6-v2', loc);
