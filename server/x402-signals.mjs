#!/usr/bin/env node
/**
 * TrendSpark x402 resource server — the machine lane, actually served.
 *
 *   node server/x402-signals.mjs
 *
 * Zero dependencies (Node 20+): node:http plus fetch. That is deliberate — the
 * x402 SDKs are moving fast and a hand-written server makes the wire format
 * inspectable, which is the whole point of publishing this rather than a mock.
 *
 * Protocol: x402 v2 (https://docs.x402.org).
 *   1. Unpaid request           → 402 + `PAYMENT-REQUIRED` header (base64 JSON)
 *                                 and the same requirements in the body.
 *   2. Client retries with      → `PAYMENT-SIGNATURE` header (base64 payload).
 *   3. Server verifies/settles  → POST {x402Version, paymentPayload,
 *                                 paymentRequirements} to a facilitator's
 *                                 /verify and /settle.
 *   4. Success                  → 200 + `PAYMENT-RESPONSE` header (base64 JSON).
 *
 * Demo mode (no X402_PAY_TO set) answers real 402s and refuses payment, so the
 * exchange can be inspected before a wallet exists.
 *
 * KNOWN LIMITS — read before pointing this at mainnet:
 *   • No replay cache. A settled payload is not remembered, so a client could
 *     retry the same authorisation against another route. Add a store keyed on
 *     the payload nonce before taking real money.
 *   • No rate limiting and no request log, so there is nothing to reconcile
 *     against for bookkeeping. Both are required, not optional.
 *   • One on-chain settlement per request costs more than a $0.002 request. Move
 *     to the `upto` or `batch-settlement` scheme before the price is the point.
 */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT ?? 4020);
const PAY_TO = process.env.X402_PAY_TO ?? '';
const NETWORK = process.env.X402_NETWORK ?? 'eip155:84532';
const FACILITATOR = (process.env.X402_FACILITATOR ?? 'https://x402.org/facilitator').replace(
  /\/$/,
  '',
);
const FACILITATOR_TOKEN = process.env.X402_FACILITATOR_TOKEN ?? '';
const BASE_URL = (process.env.X402_BASE_URL ?? `http://localhost:${PORT}`).replace(/\/$/, '');

/** USDC, six decimals, per CAIP-2 network. */
const USDC = {
  'eip155:8453': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base mainnet
  'eip155:84532': '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
};

const ASSET = process.env.X402_ASSET ?? USDC[NETWORK] ?? '';
const DEMO = PAY_TO.length === 0 || ASSET.length === 0;

/**
 * Prices in the asset's smallest unit. USDC has six decimals, so 2000 = $0.002.
 * These mirror the ladder shown on app/agent.tsx; keep the two in step.
 */
const ROUTES = [
  {
    id: 'list',
    match: (path) => path === '/v1/signals',
    amount: '2000',
    description: 'Ranked demand signals for one market, metadata only',
    handler: (url) => listSignals(url),
  },
  {
    id: 'detail',
    match: (path) => /^\/v1\/signals\/[^/]+$/.test(path),
    amount: '10000',
    description: 'One signal with its full interest series and sources',
    handler: (url) => oneSignal(url, false),
  },
  {
    id: 'playbook',
    match: (path) => /^\/v1\/signals\/[^/]+\/playbook$/.test(path),
    amount: '50000',
    description: 'Generated playbook for one signal',
    handler: (url) => oneSignal(url, true),
  },
];

// ── data ─────────────────────────────────────────────────────────────────────

/** Two entries so the server runs before `npm run export:signals` has been used. */
const SAMPLE = [
  {
    id: 'sig-sample-a',
    keyword: 'sample signal a',
    niche: 'ai-tools',
    momentum: 210,
    volume: 4400,
    competition: 'low',
    region: 'Global',
    detectedAt: new Date().toISOString(),
    peakInDays: 12,
    series: [10, 12, 15, 19, 26, 34, 41, 52, 63, 71, 80, 88, 95, 100],
    why: 'Placeholder. Run `npm run export:signals` to serve the real seeded set.',
    sources: [],
    play: null,
  },
  {
    id: 'sig-sample-b',
    keyword: 'sample signal b',
    niche: 'home',
    momentum: 140,
    volume: 9100,
    competition: 'medium',
    region: 'Global',
    detectedAt: new Date().toISOString(),
    peakInDays: 20,
    series: [40, 42, 44, 49, 55, 58, 61, 66, 72, 77, 83, 89, 94, 100],
    why: 'Placeholder. Run `npm run export:signals` to serve the real seeded set.',
    sources: [],
    play: null,
  },
];

function loadSignals() {
  const file = process.env.SIGNALS_FILE ?? join(HERE, 'signals.json');
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    const signals = Array.isArray(parsed) ? parsed : parsed.signals;
    if (Array.isArray(signals) && signals.length > 0) return { signals, sample: false };
  } catch {
    // Falls through to the sample below.
  }
  return { signals: SAMPLE, sample: true };
}

const DATA = loadSignals();

function summarise(signal) {
  return {
    id: signal.id,
    keyword: signal.keyword,
    niche: signal.niche,
    momentum: signal.momentum,
    volume: signal.volume,
    competition: signal.competition,
    region: signal.region,
    detectedAt: signal.detectedAt,
    peakInDays: signal.peakInDays,
  };
}

function listSignals(url) {
  const niche = url.searchParams.get('niche');
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 25) || 25, 100);
  const rows = DATA.signals
    .filter((signal) => !niche || signal.niche === niche)
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, limit);

  return {
    market: url.searchParams.get('city') ?? 'global',
    sample: DATA.sample,
    count: rows.length,
    signals: rows.map(summarise),
  };
}

function oneSignal(url, playbookOnly) {
  const parts = url.pathname.split('/').filter(Boolean);
  const id = parts[2];
  const signal = DATA.signals.find((item) => item.id === id);
  if (!signal) return null;
  if (playbookOnly) return { id: signal.id, keyword: signal.keyword, play: signal.play };
  const { play: _play, ...rest } = signal;
  return { ...rest, sample: DATA.sample };
}

// ── protocol ─────────────────────────────────────────────────────────────────

const b64 = (value) => Buffer.from(JSON.stringify(value), 'utf8').toString('base64');

/** The path template a route is advertised under, for discovery. */
function templatePath(route) {
  if (route.id === 'list') return '/v1/signals';
  if (route.id === 'detail') return '/v1/signals/{id}';
  return '/v1/signals/{id}/playbook';
}

/**
 * One entry of `accepts`. Kept to exactly the fields the facilitator's /verify
 * and /settle expect, because the same object is sent there verbatim — the
 * human-readable resource description travels separately.
 */
function accepted(route) {
  return {
    scheme: 'exact',
    network: NETWORK,
    amount: route.amount,
    asset: ASSET,
    payTo: PAY_TO,
    maxTimeoutSeconds: 60,
    extra: { name: 'USDC', version: '2' },
  };
}

function resourceDoc(route, path) {
  return {
    url: `${BASE_URL}${path}`,
    description: route.description,
    mimeType: 'application/json',
  };
}

function send(res, status, body, extraHeaders = {}) {
  const payload = `${JSON.stringify(body, null, 2)}\n`;
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-expose-headers': 'PAYMENT-REQUIRED, PAYMENT-RESPONSE',
    ...extraHeaders,
  });
  res.end(payload);
}

function paymentRequired(res, route, url, error) {
  const body = {
    x402Version: 2,
    error,
    resource: resourceDoc(route, url.pathname),
    accepts: [accepted(route)],
  };
  send(res, 402, body, { 'PAYMENT-REQUIRED': b64(body) });
}

async function callFacilitator(path, paymentPayload, paymentRequirements) {
  const headers = { 'content-type': 'application/json' };
  if (FACILITATOR_TOKEN) headers.authorization = `Bearer ${FACILITATOR_TOKEN}`;

  const response = await fetch(`${FACILITATOR}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ x402Version: 2, paymentPayload, paymentRequirements }),
  });

  const text = await response.text();
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { raw: text };
  }
  return { ok: response.ok, status: response.status, body: parsed };
}

async function handlePriced(req, res, route, url) {
  if (DEMO) {
    paymentRequired(
      res,
      route,
      url,
      'This deployment is not configured to accept payment: X402_PAY_TO is unset. The requirements above are the real shape, the payment cannot settle.',
    );
    return;
  }

  const header = req.headers['payment-signature'] ?? req.headers['x-payment'];
  if (!header) {
    paymentRequired(res, route, url, 'PAYMENT-SIGNATURE header is required');
    return;
  }

  let paymentPayload = null;
  try {
    paymentPayload = JSON.parse(Buffer.from(String(header), 'base64').toString('utf8'));
  } catch {
    paymentRequired(res, route, url, 'PAYMENT-SIGNATURE header is not base64-encoded JSON');
    return;
  }

  const accepts = accepted(route);

  const verified = await callFacilitator('/verify', paymentPayload, accepts);
  if (!verified.ok || verified.body?.isValid === false) {
    paymentRequired(
      res,
      route,
      url,
      `Payment did not verify: ${verified.body?.invalidReason ?? verified.status}`,
    );
    return;
  }

  const data = route.handler(url);
  if (data === null) {
    // Nothing to sell: do not settle a payment for a resource that is not there.
    send(res, 404, { error: 'No signal with that id' });
    return;
  }

  const settled = await callFacilitator('/settle', paymentPayload, accepts);
  if (!settled.ok || settled.body?.success === false) {
    paymentRequired(
      res,
      route,
      url,
      `Payment did not settle: ${settled.body?.errorReason ?? settled.status}`,
    );
    return;
  }

  send(res, 200, data, { 'PAYMENT-RESPONSE': b64(settled.body) });
}

/**
 * Discovery. An agent has to find the endpoint before it can pay for it, so the
 * priced routes are published unpaid. Directory formats (Bazaar, agentic.market)
 * read from something close to this; check the current schema before listing.
 */
function discovery() {
  return {
    x402Version: 2,
    name: 'TrendSpark demand signals',
    description: 'Ranked rising-demand keywords per market, with playbooks.',
    demo: DEMO,
    resources: ROUTES.map((route) => ({
      resource: resourceDoc(route, templatePath(route)),
      accepts: [accepted(route)],
    })),
  };
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', BASE_URL);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'PAYMENT-SIGNATURE, content-type',
      'access-control-allow-methods': 'GET, OPTIONS',
    });
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    send(res, 405, { error: 'Only GET is served' });
    return;
  }

  if (url.pathname === '/healthz') {
    send(res, 200, {
      ok: true,
      demo: DEMO,
      network: NETWORK,
      facilitator: FACILITATOR,
      signals: DATA.signals.length,
      sampleData: DATA.sample,
    });
    return;
  }

  if (url.pathname === '/.well-known/x402') {
    send(res, 200, discovery());
    return;
  }

  const route = ROUTES.find((item) => item.match(url.pathname));
  if (!route) {
    send(res, 404, { error: 'No such resource', see: `${BASE_URL}/.well-known/x402` });
    return;
  }

  // A rejected fetch to the facilitator must not take the process down with it.
  handlePriced(req, res, route, url).catch((error) => {
    send(res, 502, { error: 'Payment check failed', detail: String(error) });
  });
});

server.listen(PORT, () => {
  process.stdout.write(
    [
      `x402 signals server on ${BASE_URL}`,
      `  network      ${NETWORK}`,
      `  facilitator  ${FACILITATOR}`,
      `  payTo        ${PAY_TO || '(unset — demo mode, payment refused)'}`,
      `  data         ${DATA.signals.length} signals${DATA.sample ? ' (sample — run npm run export:signals)' : ''}`,
      '',
      `  curl -i ${BASE_URL}/v1/signals`,
      '',
    ].join('\n'),
  );
});
