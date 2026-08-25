# Admin Dashboard Architecture

The old browser-only admin must not be used in production.

## Routes
- `/admin/login`
- `/admin` Overview
- `/admin/orders`
- `/admin/products`
- `/admin/inventory`
- `/admin/customers`
- `/admin/reviews`
- `/admin/discounts`
- `/admin/content`
- `/admin/shipping`
- `/admin/settings`

## Overview
Cards: today's orders, revenue, pending orders, delivered orders, low stock.
Recent-orders table and sales trend.

## Orders
Columns: Order ID, customer, amount, payment, city, fulfillment status, created date.
Order detail: customer, address, items, totals, payment status, shipping status and status timeline.
Statuses: Pending, Processing, Shipped, Delivered, Cancelled, Refunded.

## Products
Editable fields: Arabic/English name, slug, description, price, sale price, VAT behavior, SKU, stock, size, images, ingredients, benefits, usage, SEO and Active/Draft state.

## Content
Editable storefront content: announcement bar, hero copy/image, benefits, ingredients, usage, FAQ, social links and contact channels.

## Security requirements
- Authentication and authorization run on the server.
- Never embed admin passwords, private API keys or payment secrets in browser JavaScript.
- Use secure session cookies or a vetted auth provider.
- Enforce role permissions server-side on every admin mutation.
- Add audit logs for product/order/settings changes.
- Validate and sanitize all input server-side.
- Apply rate limiting to authentication and sensitive endpoints.

## Suggested data model
`products`, `product_images`, `inventory`, `orders`, `order_items`, `customers`, `addresses`, `payments`, `shipments`, `reviews`, `discounts`, `content_blocks`, `admin_users`, `audit_logs`.

## API boundary
The React storefront should consume a versioned API such as `/api/v1/...`. Payment confirmation must be based on verified gateway webhooks, never only on a browser success screen.
