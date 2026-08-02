# x402 machine lane

`x402-signals.mjs` is a zero-dependency Node 20+ resource server that answers a real
`402 Payment Required` for the same signals the app shows, and serves them once a
payment verifies. It is the thing `app/agent.tsx` specifies — not a mock: the wire
format is x402 v2 and verification/settlement go to a real facilitator.

```sh
npm run export:signals   # writes server/signals.json from lib/data/signals.ts
npm run x402             # starts on http://localhost:4020

curl -i http://localhost:4020/v1/signals          # → 402 + PAYMENT-REQUIRED header
curl -s http://localhost:4020/.well-known/x402    # → priced resources, unpaid
curl -s http://localhost:4020/healthz
```

With `X402_PAY_TO` unset it runs in **demo mode**: real 402 responses, payment
refused, so the exchange can be inspected before a wallet exists.

## Taking a payment

```sh
X402_PAY_TO=0xYourBaseAddress \
X402_NETWORK=eip155:84532 \
X402_FACILITATOR=https://x402.org/facilitator \
X402_BASE_URL=https://api.your-domain.tld \
node server/x402-signals.mjs
```

`eip155:84532` is Base Sepolia; mainnet is `eip155:8453`. USDC addresses for both
are built in. The public `x402.org` facilitator is for development and testnets —
use a production facilitator, run your own, or self-facilitate for mainnet.

Deploy anywhere that runs Node and gives you a URL: Fly.io, Railway, Render,
Hetzner. It is one file with no build step.

## Prices

| Resource                        | Price  | Smallest unit |
| ------------------------------- | ------ | ------------- |
| `GET /v1/signals`               | $0.002 | `2000`        |
| `GET /v1/signals/{id}`          | $0.01  | `10000`       |
| `GET /v1/signals/{id}/playbook` | $0.05  | `50000`       |

USDC has six decimals, so `2000` is $0.002. Keep these in step with the ladder on
`app/agent.tsx`.

## Before this takes real money

- **No replay cache.** A settled payload is not remembered, so the same
  authorisation could be retried against another route. Store the payload nonce.
- **No rate limiting, no request log.** The log is not optional in Germany: crypto
  received for a service is business revenue valued in EUR on the day it arrives,
  per request, and it has to be reconstructable.
- **Per-request settlement does not pay for itself.** One on-chain settlement costs
  more than a $0.002 request. Move to the `upto` scheme (bill actual usage under an
  authorised ceiling) or `batch-settlement` (accumulate against a channel).
- **VAT is the hard part, not income tax.** An anonymous agent gives you no
  customer location and no VAT ID, and B2C digital services are taxed where the
  customer is. Decide whether this lane is B2B-only with VAT IDs on file, or sold
  through an operator who is merchant of record, before the endpoint goes live.
