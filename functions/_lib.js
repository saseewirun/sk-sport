/**
 * functions/_lib.js — shared helpers for all Cloudflare Pages Functions.
 *
 * The functions are the only place the GitHub token lives: the admin SPA only
 * ever talks to /api/* with a password-derived session cookie, and every save
 * becomes a git commit on GITHUB_BRANCH (Thai commit messages = audit log).
 *
 * Required env (Cloudflare Pages → Settings → Environment variables):
 *   ADMIN_PASSWORD        password for /admin login
 *   GITHUB_TOKEN          fine-grained PAT, contents:write on this repo only
 *   GITHUB_REPO           e.g. saseewirun/sk-sport
 *   GITHUB_BRANCH         e.g. main
 * Optional:
 *   ADMIN_SESSION_SECRET  HMAC key for session cookies (falls back to ADMIN_PASSWORD)
 *   RESEND_API_KEY, EMAIL_FROM, EMAIL_FROM_NAME   order/contact notification emails
 */

// ---------------------------------------------------------------- responses --

export function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  })
}

// ----------------------------------------------------------------- security --

/** Editable files: content JSON + Thai UI messages. Nothing else is writable. */
export const FILE_PATTERN =
  /^(content\/(globals|collections)\/[\w-]+\.json|src\/messages\/th\/[\w-]+\.json)$/

export const UPLOAD_FOLDERS = new Set([
  'hero-media',
  'gallery-media',
  'service-media',
  'partner-media',
  'payment-slips',
])

export const SAFE_FILENAME = /^[\w][\w.-]*\.(webp|jpg|jpeg|png|gif|svg|pdf)$/i

const SESSION_HOURS = 24

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function sessionSecret(env) {
  return env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || ''
}

export async function sessionCookie(env) {
  const expires = Date.now() + SESSION_HOURS * 3600 * 1000
  const sig = await hmacHex(sessionSecret(env), String(expires))
  const token = encodeURIComponent(`${expires}.${sig}`)
  return `sk_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_HOURS * 3600}`
}

export async function isAuthorized(env, request) {
  const header = request.headers.get('Cookie') || ''
  let token = null
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === 'sk_admin') token = decodeURIComponent(rest.join('='))
  }
  if (!token) return false
  const [expires, sig] = token.split('.')
  if (!expires || !sig) return false
  if (Number(expires) < Date.now()) return false
  return (await hmacHex(sessionSecret(env), expires)) === sig
}

/** 401 response unless the request carries a valid session cookie. */
export async function requireAuth(env, request) {
  if (await isAuthorized(env, request)) return null
  return json(401, { error: 'unauthorized' })
}

// -------------------------------------------------------------------- bytes --

/** UTF-8 string → base64 (btoa alone breaks on Thai text). */
export function utf8ToBase64(text) {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(bin)
}

export function base64ToUtf8(b64) {
  const bin = atob(b64.replace(/\n/g, ''))
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function bytesToBase64(bytes) {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(bin)
}

/** Pretty JSON matching prettier so the repo stays clean across commits. */
export function stringifyContent(jsonValue) {
  return JSON.stringify(jsonValue, null, 2) + '\n'
}

// ------------------------------------------------------------------- github --

function ghHeaders(env) {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'sk-sport-admin',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function ghUrl(env, path) {
  return `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`
}

function branch(env) {
  return env.GITHUB_BRANCH || 'main'
}

/** Read a file. Returns { text, sha } or null when the file does not exist. */
export async function ghGetFile(env, path) {
  const res = await fetch(`${ghUrl(env, path)}?ref=${encodeURIComponent(branch(env))}`, {
    headers: ghHeaders(env),
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub read ${path}: HTTP ${res.status}`)
  const body = await res.json()
  return { text: base64ToUtf8(body.content || ''), sha: body.sha }
}

export async function ghGetJson(env, path) {
  const file = await ghGetFile(env, path)
  return file ? { json: JSON.parse(file.text), sha: file.sha } : null
}

/** List a directory. Returns [{name, path, type}] or [] when missing. */
export async function ghListDir(env, path) {
  const res = await fetch(`${ghUrl(env, path)}?ref=${encodeURIComponent(branch(env))}`, {
    headers: ghHeaders(env),
  })
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`GitHub list ${path}: HTTP ${res.status}`)
  const body = await res.json()
  return Array.isArray(body) ? body : []
}

/**
 * Create or update one file (base64 content). Retries once on a sha conflict
 * (e.g. two saves racing) by re-reading the latest sha.
 */
export async function ghPutFile(env, path, base64Content, message, knownSha) {
  let sha = knownSha
  for (let attempt = 0; attempt < 2; attempt++) {
    if (sha === undefined) {
      const existing = await ghGetFile(env, path)
      sha = existing ? existing.sha : null
    }
    const res = await fetch(ghUrl(env, path), {
      method: 'PUT',
      headers: ghHeaders(env),
      body: JSON.stringify({
        message,
        content: base64Content,
        branch: branch(env),
        ...(sha ? { sha } : {}),
      }),
    })
    if (res.ok) return
    if (res.status === 409 && attempt === 0) {
      sha = undefined // stale sha — re-read and retry once
      continue
    }
    throw new Error(`GitHub write ${path}: HTTP ${res.status}`)
  }
}

// ------------------------------------------------------------------- orders --

function localizeSlipUrl(slip) {
  if (!slip || typeof slip !== 'object') return undefined
  if (slip.filename) return `/uploads/payment-slips/${slip.filename}`
  return slip.url
}

/** Merge legacy Payload orders/quotes with new order files under orders/. */
export async function collectOrders(env) {
  const rows = []

  const legacy = await ghGetJson(env, 'content/collections/orders.json').catch(() => null)
  for (const o of legacy?.json ?? []) {
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

  const quotes = await ghGetJson(env, 'content/collections/quote-requests.json').catch(() => null)
  for (const q of quotes?.json ?? []) {
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

  for (const year of await ghListDir(env, 'orders')) {
    if (year.type !== 'dir') continue
    for (const f of await ghListDir(env, `orders/${year.name}`)) {
      if (f.type !== 'file' || !f.name.endsWith('.json')) continue
      try {
        const file = await ghGetFile(env, `orders/${year.name}/${f.name}`)
        if (file) rows.push(JSON.parse(file.text))
      } catch {
        // skip malformed order file
      }
    }
  }

  rows.sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0))
  return rows
}

// -------------------------------------------------------------------- email --

/** Send via Resend; silently no-ops when the key is not configured. */
export async function sendEmail(env, { to, subject, html }) {
  if (!env.RESEND_API_KEY || !to) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM_NAME ? `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>` : env.EMAIL_FROM,
        to: [to],
        subject,
        html,
      }),
    })
  } catch {
    // email failure must never fail the order itself
  }
}

// ------------------------------------------------------------------ uploads --

/** Sanitized + unique filename for customer uploads (e.g. payment slips). */
export function uniqueUploadName(originalName, fallbackExt) {
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

export function isValidEmail(v) {
  return typeof v === 'string' && v.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

export function nonEmptyString(v) {
  return typeof v === 'string' && v.trim() !== ''
}
