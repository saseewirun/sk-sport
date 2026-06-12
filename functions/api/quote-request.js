import {
  json,
  ghGetJson,
  ghPutFile,
  utf8ToBase64,
  stringifyContent,
  sendEmail,
  isValidEmail,
  nonEmptyString,
} from '../_lib'

function parseItems(body) {
  const items = body?.items
  if (!Array.isArray(items) || items.length === 0) return null
  const out = []
  for (const row of items) {
    if (!row || typeof row !== 'object') return null
    if (typeof row.slug !== 'string' || row.slug.trim() === '') return null
    if (typeof row.quantity !== 'number' || !Number.isInteger(row.quantity) || row.quantity < 1) {
      return null
    }
    out.push({
      id: typeof row.id === 'string' ? row.id : '',
      slug: row.slug.trim(),
      quantity: row.quantity,
    })
  }
  return out
}

/**
 * POST /api/quote-request (public, JSON) — คำขอใบเสนอราคา:
 * เขียน orders/YYYY/<id>.json (kind: quote) + อีเมลแจ้งทาง Resend (spec §5)
 */
export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return json(400, { success: false, error: 'Request body must be valid JSON.' })
  }

  const customerName = body?.customerName
  const email = body?.email
  if (!nonEmptyString(customerName)) {
    return json(400, { success: false, error: 'Customer name is required.' })
  }
  if (!nonEmptyString(email) || !isValidEmail(email)) {
    return json(400, { success: false, error: 'A valid email is required.' })
  }
  const items = parseItems(body)
  if (!items) {
    return json(400, {
      success: false,
      error: 'Items must be a non-empty array of { id, slug, quantity }.',
    })
  }

  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const companyName = typeof body.companyName === 'string' ? body.companyName.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  const productsFile = await ghGetJson(env, 'content/collections/products.json')
  const products = productsFile?.json ?? []
  const lineItems = []
  for (const line of items) {
    const product = products.find((p) => p.id === line.id || p.slug === line.slug)
    if (!product) {
      return json(400, { success: false, error: 'One or more products could not be found.' })
    }
    if (product.mode !== 'quote') {
      return json(400, {
        success: false,
        error: 'One or more products are not available for quote request.',
      })
    }
    lineItems.push({
      productId: String(product.id),
      slug: product.slug,
      title: product.title,
      category: nonEmptyString(product.category) ? product.category.trim() : undefined,
      quantity: line.quantity,
    })
  }

  try {
    const quoteId = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    const quote = {
      id: quoteId,
      kind: 'quote',
      createdAt,
      customerName: customerName.trim(),
      email: email.trim(),
      phone: phone || undefined,
      companyName: companyName || undefined,
      message: message || undefined,
      status: 'new',
      lineItems,
    }
    await ghPutFile(
      env,
      `orders/${createdAt.slice(0, 4)}/${quoteId}.json`,
      utf8ToBase64(stringifyContent(quote)),
      // [skip ci]: ไฟล์คำขอไม่กระทบหน้าเว็บ ไม่ต้อง rebuild
      `คำขอใบเสนอราคาใหม่จาก ${customerName.trim()} [skip ci]`,
    )

    const settings = await ghGetJson(env, 'content/globals/payment-settings.json').catch(() => null)
    const itemsHtml = lineItems.map((li) => `<li>${li.title} × ${li.quantity}</li>`).join('')
    await sendEmail(env, {
      to: settings?.json?.orderNotificationEmail,
      subject: `📋 คำขอใบเสนอราคาจาก ${customerName.trim()}`,
      html:
        `<h2>คำขอใบเสนอราคาใหม่</h2><p><b>${customerName.trim()}</b> (${email.trim()}${phone ? ` · ${phone}` : ''})` +
        `${companyName ? `<br/>บริษัท: ${companyName}` : ''}</p><ul>${itemsHtml}</ul>` +
        `${message ? `<p>ข้อความ: ${message}</p>` : ''}` +
        `<p>ดูรายละเอียดได้ที่เมนู “ประวัติการสั่งซื้อ” ในระบบจัดการเว็บไซต์</p>`,
    })
    await sendEmail(env, {
      to: email.trim(),
      subject: 'SK Sport — ได้รับคำขอใบเสนอราคาของคุณแล้ว',
      html:
        `<p>เรียนคุณ ${customerName.trim()}</p><p>เราได้รับคำขอใบเสนอราคาของคุณแล้ว ` +
        `ทีมงานจะติดต่อกลับพร้อมใบเสนอราคาโดยเร็วที่สุด</p><ul>${itemsHtml}</ul>` +
        `<p>ขอบคุณที่สนใจสินค้าของ SK Sport Trading</p>`,
    })

    return json(200, { success: true, quoteRequestId: quoteId })
  } catch (err) {
    console.error('[quote-request]', err instanceof Error ? err.message : err)
    return json(500, { success: false, error: 'Something went wrong. Please try again later.' })
  }
}
