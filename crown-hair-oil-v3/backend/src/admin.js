import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'

const COOKIE_NAME = 'crown_admin_session'
const SESSION_HOURS = Number(process.env.ADMIN_SESSION_HOURS || 8)

const loginSchema = z.object({
  username: z.string().trim().min(3).max(80),
  password: z.string().min(8).max(200),
})
const contentSchema = z.object({ content: z.record(z.string(), z.any()) })

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}
function cookieOptions() {
  const production = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? 'none' : 'lax',
    path: '/api/v1/admin',
    maxAge: SESSION_HOURS * 60 * 60 * 1000,
  }
}

export async function bootstrapAdmin(pool) {
  if (!pool) return
  const username = process.env.ADMIN_BOOTSTRAP_USERNAME?.trim()
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD
  if (!username || !password) return
  if (password.length < 12) throw new Error('ADMIN_BOOTSTRAP_PASSWORD must be at least 12 characters')
  const { rows } = await pool.query('select id from admins where username=$1 limit 1', [username])
  if (rows[0]) return
  const passwordHash = await bcrypt.hash(password, 12)
  await pool.query(
    `insert into admins (username,password_hash,display_name,role) values ($1,$2,$3,'admin')`,
    [username, passwordHash, process.env.ADMIN_BOOTSTRAP_DISPLAY_NAME || 'Store Admin'],
  )
  console.log('Crown admin bootstrap account created; remove ADMIN_BOOTSTRAP_PASSWORD from the environment now.')
}

export function installAdminRoutes(app, pool) {
  const requireDb = (_req, res, next) => pool ? next() : res.status(503).json({ error: 'database_not_configured' })

  async function requireAdmin(req, res, next) {
    try {
      if (!pool) return res.status(503).json({ error: 'database_not_configured' })
      const raw = req.cookies?.[COOKIE_NAME]
      if (!raw) return res.status(401).json({ error: 'not_authenticated' })
      const { rows } = await pool.query(
        `select a.id,a.username,a.display_name,a.role
         from admin_sessions s join admins a on a.id=s.admin_id
         where s.token_hash=$1 and s.expires_at > now() and a.active=true limit 1`,
        [sha256(raw)],
      )
      if (!rows[0]) return res.status(401).json({ error: 'session_expired' })
      req.admin = rows[0]
      next()
    } catch (error) { next(error) }
  }

  app.get('/api/v1/content/site', requireDb, async (_req, res, next) => {
    try {
      const { rows } = await pool.query(`select content->'published' as content, content->>'publishedAt' as published_at from content_blocks where key='site' limit 1`)
      res.json(rows[0] || { content: null, published_at: null })
    } catch (error) { next(error) }
  })

  app.post('/api/v1/admin/auth/login', requireDb, rateLimit({ windowMs: 15*60_000, limit: 8, standardHeaders: 'draft-8', legacyHeaders: false }), async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ error: 'invalid_credentials' })
      const { rows } = await pool.query(`select id,username,password_hash,display_name,role,active from admins where username=$1 limit 1`, [parsed.data.username])
      const admin = rows[0]
      const valid = admin?.active && await bcrypt.compare(parsed.data.password, admin.password_hash)
      if (!valid) return res.status(401).json({ error: 'invalid_credentials' })
      const rawToken = crypto.randomBytes(32).toString('base64url')
      const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000)
      const ipHash = req.ip ? sha256(req.ip) : null
      await pool.query(
        `insert into admin_sessions (admin_id,token_hash,expires_at,ip_hash,user_agent) values ($1,$2,$3,$4,$5)`,
        [admin.id, sha256(rawToken), expiresAt, ipHash, req.get('user-agent')?.slice(0,500) || null],
      )
      await pool.query(`update admins set last_login_at=now() where id=$1`, [admin.id])
      await pool.query(`insert into audit_logs(actor_id,action,resource_type,metadata) values($1,'login','admin',$2)`, [admin.id, JSON.stringify({ username: admin.username })])
      res.cookie(COOKIE_NAME, rawToken, cookieOptions())
      res.json({ admin: { id: admin.id, username: admin.username, displayName: admin.display_name, role: admin.role } })
    } catch (error) { next(error) }
  })

  app.get('/api/v1/admin/auth/me', requireAdmin, (req, res) => {
    res.json({ admin: { id:req.admin.id, username:req.admin.username, displayName:req.admin.display_name, role:req.admin.role } })
  })

  app.post('/api/v1/admin/auth/logout', requireAdmin, async (req, res, next) => {
    try {
      const raw = req.cookies?.[COOKIE_NAME]
      if (raw) await pool.query('delete from admin_sessions where token_hash=$1', [sha256(raw)])
      res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined })
      res.json({ ok: true })
    } catch (error) { next(error) }
  })

  app.get('/api/v1/admin/content', requireAdmin, async (_req, res, next) => {
    try {
      const { rows } = await pool.query(`select content from content_blocks where key='site' limit 1`)
      const block = rows[0]?.content || {}
      res.json({ content: block.draft || block.published || null, published: block.published || null, publishedAt: block.publishedAt || null })
    } catch (error) { next(error) }
  })

  app.put('/api/v1/admin/content/draft', requireAdmin, async (req, res, next) => {
    try {
      const parsed = contentSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ error: 'invalid_content' })
      await pool.query(`update content_blocks set content=jsonb_set(content,'{draft}',$1::jsonb,true), updated_at=now() where key='site'`, [JSON.stringify(parsed.data.content)])
      await pool.query(`insert into audit_logs(actor_id,action,resource_type,resource_id) values($1,'save_draft','content','site')`, [req.admin.id])
      res.json({ ok: true })
    } catch (error) { next(error) }
  })

  app.post('/api/v1/admin/content/publish', requireAdmin, async (req, res, next) => {
    const parsed = contentSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'invalid_content' })
    const client = await pool.connect()
    try {
      await client.query('begin')
      const { rows } = await client.query(`select coalesce(max(version_no),0)+1 as next from content_versions where content_key='site'`)
      const version = Number(rows[0].next)
      await client.query(`insert into content_versions(content_key,version_no,content,status,created_by) values('site',$1,$2::jsonb,'published',$3)`, [version, JSON.stringify(parsed.data.content), req.admin.id])
      await client.query(
        `update content_blocks set content=jsonb_set(jsonb_set(jsonb_set(content,'{draft}',$1::jsonb,true),'{published}',$1::jsonb,true),'{publishedAt}',to_jsonb(now()::text),true), updated_at=now() where key='site'`,
        [JSON.stringify(parsed.data.content)],
      )
      await client.query(`insert into audit_logs(actor_id,action,resource_type,resource_id,metadata) values($1,'publish','content','site',$2)`, [req.admin.id, JSON.stringify({ version })])
      await client.query('commit')
      res.json({ ok: true, version })
    } catch (error) { await client.query('rollback'); next(error) }
    finally { client.release() }
  })

  app.get('/api/v1/admin/content/versions', requireAdmin, async (_req, res, next) => {
    try {
      const { rows } = await pool.query(`select version_no,status,created_at from content_versions where content_key='site' order by version_no desc limit 30`)
      res.json({ versions: rows })
    } catch (error) { next(error) }
  })
}
