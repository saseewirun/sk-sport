/**
 * scripts/admin-dev-server.mjs — local backend for the admin UI during dev.
 *
 * Serves the same /api contract as the Cloudflare Pages Functions, but reads
 * and writes the LOCAL working tree (content/*.json, public/uploads/*,
 * src/messages/th/*.json, orders/*) instead of committing to GitHub. `next dev`
 * proxies /api/* here (see next.config.mjs rewrites), so the admin UI is
 * testable end-to-end against the real exported customer data — and every
 * change it makes is visible in `git diff` before anything is committed.
 *
 * Usage:  node scripts/admin-dev-server.mjs   (or: npm run admin:dev)
 * Login password in dev: env ADMIN_PASSWORD, default "sksport-dev"
 */

import { createServer } from 'http'
import { createHmac, timingSafeEqual } from 'crypto'
import { readFile, writeFile, mkdir, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const PORT = 8788
const ROOT = process.cwd()
const PASSWORD = process.env.ADMIN_PASSWORD || 'sksport-dev'
const SECRET = process.env.ADMIN_SESSION_SECRET || 'dev-only-secret'
const SESSION_HOURS = 24

// ---------------------------------------------------------------- security --

/** Editable files: content JSON, Thai UI messages. Nothing else. */
const FILE_PATTERN =
  /^(content\/(globals|collections)\/[\w-]+\.json|src\/messages\/th\/[\w-]+\.json)$/

/** Upload folders = the media prefixes used across the site. */
const UPLOAD_FOLDERS = new Set([
  'hero-media',
  'gallery-media',
  'service-media',
  'partner-media',
  'payment-slips',
])

const SAFE_FILENAME = /^[\w][\w.-]*\.(webp|jpg|jpeg|png|gif|svg|pdf)$/i

function sessionToken() {
  const expires = Date.now() + SESSION_HOURS * 3600 * 1000
  const sig = createHmac('sha256', SECRET).update(String(expires)).digest('hex')
  return `${expires}.${sig}`
}

function validSession(token) {
  if (typeof token !== 'string') return false
  const [expires, sig] = token.split('.')
  if (!expires || !sig) return false
  if (Number(expires) < Date.now()) return false
  const expected = createHmac('sha256', SECRET).update(expires).digest('hex')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

function getCookie(req, name) {
  const header = req.headers.cookie || ''
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

// ------------------------------------------------------------------ helpers --

function send(res, status, body, headers = {}) {
  const data = JSON.stringify(body)
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers })
  res.end(data)
}

async function readBody(req, limitBytes = 25 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > limitBytes) {
        reject(new Error('payload too large'))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function readJsonBody(req) {
  const buf = await readBody(req)
  return JSON.parse(buf.toString('utf8'))
}

/** Pretty JSON identical to prettier's style so the repo stays clean. */
function stringifyContent(json) {
  return JSON.stringify(json, null, 2) + '\n'
}

// ------------------------------------------------------------------- orders --

/** Same media-URL localization the site's contentStore applies. */
function localizeSlipUrl(slip) {
  if (!slip || typeof slip !== 'object') return undefined
  if (slip.filename) return `/uploads/payment-slips/${slip.filename}`
  return slip.url
}

async function collectOrders() {
  const rows = []

  // Legacy orders exported from Payload
  try {
    const legacy = JSON.parse(
      await readFile(path.join(ROOT, 'content/collections/orders.json'), 'utf8'),
    )
    for (const o of legacy) {
      rows.push({
        id: String(o.id),
        kind: 'order',
        createdAt: o.createdAt,
        customerName: o.customerName ?? '',
        email: o.email ?? undefined,
        phone: o.phone ?? undefined,
        status: o.status ?? 'awaiting_verification',
        subtotal: o.subtotal ?? undefined,
        slipUrl: localizeSlipUrl(o.slip),
        address: o.address ?? undefined,
        customerNote: o.customerNote ?? undefined,
        lineItems: (o.lineItems ?? []).map((li) => ({
          title: li.title,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          lineTotal: li.lineTotal,
        })),
      })
    }
  } catch {
    // no legacy orders file
  }

  // Legacy quote requests exported from Payload
  try {
    const quotes = JSON.parse(
      await readFile(path.join(ROOT, 'content/collections/quote-requests.json'), 'utf8'),
    )
    for (const q of quotes) {
      rows.push({
        id: String(q.id),
        kind: 'quote',
        createdAt: q.createdAt,
        customerName: q.customerName ?? '',
        email: q.email ?? undefined,
        phone: q.phone ?? undefined,
        status: q.status ?? 'new',
        companyName: q.companyName ?? undefined,
        message: q.message ?? undefined,
        lineItems: (q.lineItems ?? []).map((li) => ({ title: li.title, quantity: li.quantity })),
      })
    }
  } catch {
    // no legacy quotes file
  }

  // New orders/quotes written by the public checkout/quote endpoints
  const ordersDir = path.join(ROOT, 'orders')
  if (existsSync(ordersDir)) {
    for (const year of await readdir(ordersDir)) {
      const yearDir = path.join(ordersDir, year)
      let files = []
      try {
        files = await readdir(yearDir)
      } catch {
        continue
      }
      for (const f of files) {
        if (!f.endsWith('.json')) continue
        try {
          rows.push(JSON.parse(await readFile(path.join(yearDir, f), 'utf8')))
        } catch {
          // skip malformed file
        }
      }
    }
  }

  rows.sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0))
  return rows
}

// ------------------------------------------------------------------- server --

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const route = `${req.method} ${url.pathname}`

  try {
    if (route === 'POST /api/admin/login') {
      const body = await readJsonBody(req).catch(() => ({}))
      if (typeof body.password !== 'string' || body.password !== PASSWORD) {
        return send(res, 401, { error: 'รหัสผ่านไม่ถูกต้อง' })
      }
      const cookie = `sk_admin=${encodeURIComponent(sessionToken())}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_HOURS * 3600}`
      return send(res, 200, { ok: true }, { 'Set-Cookie': cookie })
    }

    // Everything below under /api/admin requires a valid session
    if (url.pathname.startsWith('/api/admin/')) {
      if (!validSession(getCookie(req, 'sk_admin'))) {
        return send(res, 401, { error: 'unauthorized' })
      }
    }

    if (route === 'GET /api/admin/me') {
      return send(res, 200, { ok: true })
    }

    if (route === 'GET /api/admin/content') {
      const file = url.searchParams.get('file') || ''
      if (!FILE_PATTERN.test(file)) return send(res, 400, { error: 'ไฟล์นี้แก้ไขผ่านระบบไม่ได้' })
      const abs = path.join(ROOT, file)
      if (!existsSync(abs)) return send(res, 404, { error: 'ไม่พบไฟล์เนื้อหา' })
      return send(res, 200, { json: JSON.parse(await readFile(abs, 'utf8')) })
    }

    if (route === 'PUT /api/admin/content') {
      const body = await readJsonBody(req)
      const { file, json, message } = body
      if (!FILE_PATTERN.test(file ?? '')) {
        return send(res, 400, { error: 'ไฟล์นี้แก้ไขผ่านระบบไม่ได้' })
      }
      if (json === undefined || typeof message !== 'string' || !message.trim()) {
        return send(res, 400, { error: 'ข้อมูลไม่ครบ (json/message)' })
      }
      const abs = path.join(ROOT, file)
      await mkdir(path.dirname(abs), { recursive: true })
      await writeFile(abs, stringifyContent(json), 'utf8')
      console.log(`[save] ${file} — ${message}`)
      return send(res, 200, { ok: true })
    }

    if (route === 'POST /api/admin/upload') {
      const body = await readJsonBody(req)
      const { folder, filename, base64, message } = body
      if (!UPLOAD_FOLDERS.has(folder)) return send(res, 400, { error: 'หมวดรูปไม่ถูกต้อง' })
      if (typeof filename !== 'string' || !SAFE_FILENAME.test(filename)) {
        return send(res, 400, { error: 'ชื่อไฟล์ไม่ถูกต้อง' })
      }
      if (typeof base64 !== 'string' || !base64) return send(res, 400, { error: 'ไม่มีข้อมูลไฟล์' })
      const dir = path.join(ROOT, 'public', 'uploads', folder)
      await mkdir(dir, { recursive: true })
      await writeFile(path.join(dir, filename), Buffer.from(base64, 'base64'))
      console.log(`[upload] ${folder}/${filename} — ${message ?? ''}`)
      return send(res, 200, { path: `/uploads/${folder}/${filename}` })
    }

    if (route === 'GET /api/admin/orders') {
      return send(res, 200, { orders: await collectOrders() })
    }

    return send(res, 404, { error: `no route: ${route}` })
  } catch (err) {
    console.error(`[error] ${route}:`, err)
    return send(res, 500, { error: 'server error' })
  }
})

server.listen(PORT, () => {
  console.log(`admin dev server → http://localhost:${PORT}`)
  console.log(
    `   password: ${PASSWORD === 'sksport-dev' ? 'sksport-dev (default)' : '(from ADMIN_PASSWORD)'}`,
  )
  console.log('   writes go to the local working tree — review with: git diff')
})
