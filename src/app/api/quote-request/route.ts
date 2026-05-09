import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@payload-config'
import type { Product } from '@/payload-types'

export const runtime = 'nodejs'

type ItemInput = { id: string; slug: string; quantity: number }

type ErrorBody = { success: false; error: string }
type SuccessBody = { success: true; quoteRequestId: string }

function jsonError(message: string, status: number): NextResponse<ErrorBody> {
  return NextResponse.json({ success: false, error: message }, { status })
}

function json500(): NextResponse<ErrorBody> {
  return jsonError('Something went wrong. Please try again later.', 500)
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim() !== ''
}

function isValidEmail(v: string): boolean {
  const s = v.trim()
  if (s.length < 3 || s.length > 320) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function isQuoteModeProduct(p: Product): boolean {
  return p.mode === 'quote'
}

async function findProductByIdOrSlug(
  payload: Awaited<ReturnType<typeof getPayload>>,
  id: string,
  slug: string,
): Promise<Product | 'mismatch' | null> {
  if (id.length > 0) {
    try {
      const doc = (await payload.findByID({
        collection: 'products',
        id,
        overrideAccess: true,
      })) as Product | null
      if (doc) {
        if (slug && doc.slug !== slug) return 'mismatch'
        return doc
      }
    } catch {
      // try slug
    }
  }
  if (!slug) return null
  const res = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })
  return (res.docs[0] as Product | undefined) ?? null
}

function parseItems(body: unknown): ItemInput[] | null {
  if (!body || typeof body !== 'object') return null
  const o = body as Record<string, unknown>
  const items = o.items
  if (!Array.isArray(items) || items.length === 0) return null
  const out: ItemInput[] = []
  for (const row of items) {
    if (!row || typeof row !== 'object') return null
    const r = row as Record<string, unknown>
    const id = typeof r.id === 'string' ? r.id : ''
    if (typeof r.slug !== 'string' || r.slug.trim() === '') return null
    const q = r.quantity
    if (typeof q !== 'number' || !Number.isInteger(q) || q < 1) return null
    out.push({ id, slug: r.slug.trim(), quantity: q })
  }
  return out
}

export async function POST(request: Request): Promise<NextResponse<SuccessBody | ErrorBody>> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError('Request body must be valid JSON.', 400)
  }

  if (!body || typeof body !== 'object') {
    return jsonError('Invalid request body.', 400)
  }
  const b = body as Record<string, unknown>
  const customerName = b.customerName
  const email = b.email
  if (!isNonEmptyString(customerName)) {
    return jsonError('Customer name is required.', 400)
  }
  if (!isNonEmptyString(email) || !isValidEmail(email)) {
    return jsonError('A valid email is required.', 400)
  }

  const items = parseItems(body)
  if (items === null) {
    return jsonError('Items must be a non-empty array of { id, slug, quantity }.', 400)
  }

  const phone = typeof b.phone === 'string' ? b.phone.trim() : undefined
  const companyName = typeof b.companyName === 'string' ? b.companyName.trim() : undefined
  const message = typeof b.message === 'string' ? b.message.trim() : undefined

  const payload = await getPayload({ config })
  const lineItems: {
    productId: string
    slug: string
    title: string
    category?: string
    quantity: number
  }[] = []

  for (const line of items) {
    const product = await findProductByIdOrSlug(payload, line.id, line.slug)
    if (product === 'mismatch') {
      return jsonError('Product data for one or more items is inconsistent.', 400)
    }
    if (!product) {
      return jsonError('One or more products could not be found.', 400)
    }
    if (!isQuoteModeProduct(product)) {
      return jsonError('One or more products are not available for quote request.', 400)
    }
    const category =
      product.category && typeof product.category === 'string' && product.category.trim() !== ''
        ? product.category.trim()
        : undefined
    lineItems.push({
      productId: String(product.id),
      slug: product.slug,
      title: product.title,
      category,
      quantity: line.quantity,
    })
  }

  try {
    const created = await payload.create({
      collection: 'quote-requests',
      data: {
        status: 'new',
        customerName: customerName.trim(),
        email: email.trim(),
        phone: phone || undefined,
        companyName: companyName || undefined,
        message: message || undefined,
        lineItems,
      },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, quoteRequestId: String(created.id) })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[quote-request]', message)
    return json500()
  }
}
