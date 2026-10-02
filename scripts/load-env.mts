/**
 * Minimal .env loader for standalone scripts run with tsx.
 *
 * Next.js loads .env* automatically, but tsx does not. Build/test scripts
 * import this FIRST so process.env is populated before lib/embed.ts reads it.
 * Real environment variables always win, so an inline
 * `EMBED_PROVIDER=local npx tsx ...` still overrides the file.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

for (const f of ['.env.local', '.env']) {
  const p = join(process.cwd(), f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
