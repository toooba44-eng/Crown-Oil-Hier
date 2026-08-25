# Crown Hair Oil Backend Scaffold

This service is the server-side boundary for Crown Hair Oil V3. GitHub Pages hosts only the storefront; the API must be deployed to a server/platform that supports Node.js and PostgreSQL.

## Local setup
1. Copy `.env.example` to `.env`.
2. Provision PostgreSQL and run `schema.sql`.
3. Run `npm install`.
4. Run `npm run dev`.

## Current endpoints
- `GET /api/v1/health`
- `GET /api/v1/products`
- `GET /api/v1/products/:slug`
- `POST /api/v1/checkout` — validates product/stock/price server-side, then intentionally returns `501` until a real payment gateway is configured.
- Admin endpoints intentionally return `501` until real authentication and authorization are implemented.

## Production rules
- Never trust price, VAT, shipping, stock or payment status received from the browser.
- Create payment sessions server-side only.
- Treat verified payment webhooks as the source of truth for paid status.
- Enforce idempotency for checkout and webhooks.
- Store payment secrets only in server environment variables.
- Implement secure admin sessions and role authorization before enabling admin mutations.
- Log sensitive admin changes in `audit_logs`.
- Do not store full card data.

## Still requires business/provider configuration
- Legal entity details.
- VAT calculation rules and tax registration data.
- Payment provider credentials (Mada/Apple Pay/cards).
- Shipping provider, service levels and fees.
- Customer-service channels.
- Final return/refund policy.
