import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import pg from 'pg'
import { z } from 'zod'
import { paymentProviderStatus } from './providers/payment.js'
import { shippingProviderStatus } from './providers/shipping.js'

const { Pool } = pg
const app = express()
const port = Number(process.env.PORT || 8080)
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false }) : null

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','), credentials: true }))
app.use(express.json({ limit: '64kb' }))
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }))

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(8).max(30),
    email: z.string().email().optional().or(z.literal('')),
  }),
  address: z.object({
    city: z.string().trim().min(2).max(100),
    district: z.string().trim().min(2).max(100),
    street: z.string().trim().min(2).max(180),
  }),
  items: z.array(z.object({ sku: z.string().min(1).max(80), quantity: z.number().int().min(1).max(20) })).min(1).max(20),
  paymentMethod: z.enum(['card','cod']),
})

function requireDatabase(req, res, next) {
  if (!pool) return res.status(503).json({ error: 'database_not_configured' })
  next()
}

app.get('/api/v1/health', async (_req, res) => {
  if (!pool) return res.json({ status: 'ok', database: 'not_configured' })
  try {
    await pool.query('select 1')
    res.json({ status: 'ok', database: 'connected' })
  } catch {
    res.status(503).json({ status: 'degraded', database: 'unavailable' })
  }
})

app.get('/api/v1/integrations/status', (_req, res) => {
  const payment = paymentProviderStatus()
  const shipping = shippingProviderStatus()
  res.json({
    database: Boolean(pool),
    payment: { provider: payment.provider, configured: payment.configured },
    shipping: { provider: shipping.provider, configured: shipping.configured },
    adminAuth: false,
  })
})

app.get('/api/v1/products', requireDatabase, async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`select id, slug, name_ar, name_en, description_ar, description_en, price_sar, size_label, sku, stock_qty, active from products where active = true order by created_at asc`)
    res.json(rows)
  } catch (error) { next(error) }
})

app.get('/api/v1/products/:slug', requireDatabase, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`select id, slug, name_ar, name_en, description_ar, description_en, price_sar, size_label, sku, stock_qty, active from products where slug = $1 and active = true limit 1`, [req.params.slug])
    if (!rows[0]) return res.status(404).json({ error: 'product_not_found' })
    res.json(rows[0])
  } catch (error) { next(error) }
})

app.post('/api/v1/checkout', requireDatabase, async (req, res, next) => {
  const parsed = checkoutSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'invalid_checkout', details: parsed.error.flatten() })

  try {
    const client = await pool.connect()
    try {
      await client.query('begin')
      let subtotal = 0
      const normalizedItems = []
      for (const item of parsed.data.items) {
        const { rows } = await client.query(`select id, sku, name_ar, price_sar, stock_qty from products where sku=$1 and active=true for update`, [item.sku])
        const row = rows[0]
        if (!row) throw Object.assign(new Error('product_not_found'), { status: 400 })
        if (row.stock_qty < item.quantity) throw Object.assign(new Error('insufficient_stock'), { status: 409 })
        const unit = Number(row.price_sar)
        subtotal += unit * item.quantity
        normalizedItems.push({ ...item, productId: row.id, unitPrice: unit, name: row.name_ar })
      }

      const payment = paymentProviderStatus()
      const shipping = shippingProviderStatus()
      await client.query('rollback')

      if (!shipping.configured) {
        return res.status(501).json({
          error: 'shipping_provider_not_configured',
          preview: { subtotal, items: normalizedItems },
        })
      }
      if (parsed.data.paymentMethod === 'card' && !payment.configured) {
        return res.status(501).json({
          error: 'payment_gateway_not_configured',
          preview: { subtotal, items: normalizedItems },
        })
      }

      return res.status(501).json({
        error: 'commerce_provider_adapters_not_implemented',
        preview: { subtotal, items: normalizedItems },
      })
    } finally { client.release() }
  } catch (error) { next(error) }
})

app.get('/api/v1/admin/dashboard', (_req, res) => res.status(501).json({ error: 'admin_auth_not_configured' }))
app.get('/api/v1/admin/orders', (_req, res) => res.status(501).json({ error: 'admin_auth_not_configured' }))

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(error.status || 500).json({ error: error.message || 'internal_server_error' })
})

app.listen(port, () => console.log(`Crown API listening on :${port}`))
