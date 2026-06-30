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

/** รูปสลิปเสิร์ฟผ่าน API ที่ต้องล็อกอิน (mirror ของ functions/api/admin/slip.js) */
function slipApiUrl(filename) {
  return `/api/admin/slip?file=${encodeURIComponent(filename)}`
}
function toSlipApiUrl(url) {
  if (typeof url === 'string' && url.startsWith('/uploads/payment-slips/')) {
    return slipApiUrl(url.split('/').pop())
  }
  return url
}
function localizeSlipUrl(slip) {
  if (!slip || typeof slip !== 'object') return undefined
  if (slip.filename) return slipApiUrl(slip.filename)
  return toSlipApiUrl(slip.url)
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
          const row = JSON.parse(await readFile(path.join(yearDir, f), 'utf8'))
          row.slipUrl = toSlipApiUrl(row.slipUrl)
          rows.push(row)
        } catch {
          // skip malformed file
        }
      }
    }
  }

  rows.sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0))
  return rows
}

// ----------------------------------------------------------- public endpoints --

function uniqueUploadName(originalName, fallbackExt) {
  const lastDot = originalName.lastIndexOf('.')
  const ext = (lastDot !== -1 ? originalName.slice(lastDot + 1) : fallbackExt).toLowerCase()
  const base = (lastDot !== -1 ? originalName.slice(0, lastDot) : originalName)
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 60)
  const unique = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  return `${base || 'file'}-${unique}.${ext}`
}

async function writeOrderFile(order) {
  const dir = path.join(ROOT, 'orders', order.createdAt.slice(0, 4))
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, `${order.id}.json`), stringifyContent(order), 'utf8')
}

async function loadProducts() {
  return JSON.parse(await readFile(path.join(ROOT, 'content/collections/products.json'), 'utf8'))
}

/** mirror of functions/api/checkout.js against the local working tree */
async function handleCheckout(req, res) {
  const buf = await readBody(req)
  // Node 18+ undici parses multipart for us via the fetch Request API
  const form = await new Request('http://localhost/api/checkout', {
    method: 'POST',
    headers: { 'content-type': req.headers['content-type'] || '' },
    body: buf,
  }).formData()

  const customerName = form.get('customerName')
  const email = form.get('email')
  const itemsRaw = form.get('items')
  const slip = form.get('slip')
  if (typeof customerName !== 'string' || !customerName.trim()) {
    return send(res, 400, { success: false, error: 'Customer name is required.' })
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return send(res, 400, { success: false, error: 'A valid email is required.' })
  }
  if (!slip || typeof slip === 'string' || slip.size < 1) {
    return send(res, 400, { success: false, error: 'A payment slip file is required.' })
  }
  let items
  try {
    items = JSON.parse(itemsRaw)
  } catch {
    items = null
  }
  if (!Array.isArray(items) || items.length === 0) {
    return send(res, 400, { success: false, error: 'Order items (items JSON) are required.' })
  }

  const products = await loadProducts()
  const lineItems = []
  for (const line of items) {
    const product = products.find((p) => p.id === line.id || p.slug === line.slug)
    if (!product || product.mode !== 'buy' || typeof product.price !== 'number') {
      return send(res, 400, {
        success: false,
        error: 'One or more products are not available for purchase.',
      })
    }
    lineItems.push({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      quantity: line.quantity,
      unitPrice: product.price,
      lineTotal: product.price * line.quantity,
    })
  }
  const subtotal = lineItems.reduce((s, li) => s + li.lineTotal, 0)

  const slipName = uniqueUploadName(slip.name || 'payment-slip', 'jpg')
  const slipDir = path.join(ROOT, 'public', 'uploads', 'payment-slips')
  await mkdir(slipDir, { recursive: true })
  await writeFile(path.join(slipDir, slipName), Buffer.from(await slip.arrayBuffer()))

  const order = {
    id: crypto.randomUUID(),
    kind: 'order',
    createdAt: new Date().toISOString(),
    customerName: customerName.trim(),
    email: email.trim(),
    phone: String(form.get('phone') || '').trim() || undefined,
    address: String(form.get('address') || '').trim() || undefined,
    customerNote: String(form.get('customerNote') || '').trim() || undefined,
    status: 'awaiting_verification',
    paymentMethod: 'bank_transfer',
    currency: 'THB',
    subtotal,
    slipUrl: `/uploads/payment-slips/${slipName}`,
    lineItems,
  }
  await writeOrderFile(order)
  console.log(`[checkout] order ${order.id} — ฿${subtotal} (email skipped in dev)`)
  return send(res, 200, { success: true, orderId: order.id })
}

/** mirror of functions/api/quote-request.js */
async function handleQuoteRequest(req, res) {
  const body = await readJsonBody(req).catch(() => null)
  if (!body) return send(res, 400, { success: false, error: 'Request body must be valid JSON.' })
  const { customerName, email, items } = body
  if (typeof customerName !== 'string' || !customerName.trim()) {
    return send(res, 400, { success: false, error: 'Customer name is required.' })
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return send(res, 400, { success: false, error: 'A valid email is required.' })
  }
  if (!Array.isArray(items) || items.length === 0) {
    return send(res, 400, {
      success: false,
      error: 'Items must be a non-empty array of { id, slug, quantity }.',
    })
  }
  const products = await loadProducts()
  const lineItems = []
  for (const line of items) {
    const product = products.find((p) => p.id === line.id || p.slug === line.slug)
    if (!product || product.mode !== 'quote') {
      return send(res, 400, {
        success: false,
        error: 'One or more products are not available for quote request.',
      })
    }
    lineItems.push({
      productId: String(product.id),
      slug: product.slug,
      title: product.title,
      category: product.category || undefined,
      quantity: line.quantity,
    })
  }
  const quote = {
    id: crypto.randomUUID(),
    kind: 'quote',
    createdAt: new Date().toISOString(),
    customerName: customerName.trim(),
    email: email.trim(),
    phone: typeof body.phone === 'string' ? body.phone.trim() || undefined : undefined,
    companyName:
      typeof body.companyName === 'string' ? body.companyName.trim() || undefined : undefined,
    message: typeof body.message === 'string' ? body.message.trim() || undefined : undefined,
    status: 'new',
    lineItems,
  }
  await writeOrderFile(quote)
  console.log(`[quote] ${quote.id} from ${quote.customerName} (email skipped in dev)`)
  return send(res, 200, { success: true, quoteRequestId: quote.id })
}

/** mirror of functions/api/contact.js */
async function handleContact(req, res) {
  const body = await readJsonBody(req).catch(() => null)
  if (!body) return send(res, 400, { success: false, error: 'Request body must be valid JSON.' })
  const { name, email, detail } = body
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof detail !== 'string' ||
    !detail.trim() ||
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return send(res, 400, { success: false, error: 'name, email and detail are required.' })
  }
  const submission = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    name: name.trim(),
    email: email.trim(),
    phoneNumber:
      typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() || undefined : undefined,
    detail: detail.trim(),
  }
  const dir = path.join(ROOT, 'contact-submissions', submission.createdAt.slice(0, 4))
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, `${submission.id}.json`), stringifyContent(submission), 'utf8')
  console.log(`[contact] message from ${submission.name} (email skipped in dev)`)
  return send(res, 200, { success: true })
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

    if (route === 'GET /api/admin/slip') {
      // mirror ของ functions/api/admin/slip.js — เสิร์ฟรูปสลิปจาก public/uploads
      const name = (url.searchParams.get('file') || '').split('/').pop().split('\\').pop()
      if (!name || name.includes('..')) return send(res, 400, { error: 'ชื่อไฟล์ไม่ถูกต้อง' })
      const abs = path.join(ROOT, 'public', 'uploads', 'payment-slips', name)
      if (!existsSync(abs)) return send(res, 404, { error: 'ไม่พบไฟล์สลิป' })
      const ext = name.slice(name.lastIndexOf('.') + 1).toLowerCase()
      const TYPES = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
        pdf: 'application/pdf',
      }
      const buf = await readFile(abs)
      res.writeHead(200, {
        'Content-Type': TYPES[ext] || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${name}"`,
        'Cache-Control': 'private, max-age=300',
      })
      return res.end(buf)
    }

    // public endpoints (no session) — mirror functions/api/*.js
    if (route === 'POST /api/checkout') return await handleCheckout(req, res)
    if (route === 'POST /api/quote-request') return await handleQuoteRequest(req, res)
    if (route === 'POST /api/contact') return await handleContact(req, res)

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
