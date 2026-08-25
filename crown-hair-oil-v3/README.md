# Crown Hair Oil V3

Unified mobile-first ecommerce redesign for Crown Hair Oil.

## What changed
- One customer experience instead of Store / Landing / App choices.
- Premium botanical design system.
- Responsive Header, Hero, benefits, ingredients, product spotlight, real-results gallery, usage ritual, reviews placeholder, FAQ and footer.
- Product quantity controls, cart drawer, mobile sticky purchase CTA and checkout UI.
- Arabic-first RTL experience.
- Existing Crown product and before/after assets are reused from the repository root.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Production boundary
The checkout in this branch is intentionally UI-only. Do not accept real payments or store real orders until a server-side commerce layer is connected.

Required before production launch:
1. Server-side database for products, inventory, customers and orders.
2. Real authentication and role-based admin authorization.
3. Payment gateway supporting Mada / Apple Pay / Visa / Mastercard.
4. Shipping integration and calculated delivery fees.
5. VAT/tax calculation verified against business requirements.
6. Real privacy, terms, shipping and return policies.
7. Verified reviews/results only; no fabricated testimonials or unsupported cosmetic claims.
8. Analytics, error monitoring and transactional notifications.

## Planned admin information architecture
- Overview
- Orders
- Products
- Inventory
- Customers
- Reviews
- Discounts
- Content
- Shipping
- Settings

The legacy projects remain untouched on this branch while V3 is reviewed.
