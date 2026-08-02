/**
 * Writes the seeded signal set to server/signals.json, so the x402 reference
 * server serves exactly the data the app shows instead of a second copy that
 * drifts out of date.
 *
 *   npm run export:signals
 *
 * Replace this step with a query against the real demand pipeline when there is
 * one; nothing else in server/x402-signals.mjs has to change.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { SIGNALS } from '../lib/data/signals';

const dir = join(process.cwd(), 'server');
const file = join(dir, 'signals.json');

mkdirSync(dir, { recursive: true });
writeFileSync(
  file,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), signals: SIGNALS }, null, 2)}\n`,
);

process.stdout.write(`Wrote ${SIGNALS.length} signals to ${file}\n`);
