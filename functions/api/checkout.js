import {
  json,
  ghGetJson,
  ghPutFile,
  utf8ToBase64,
  bytesToBase64,
  stringifyContent,
  sendEmail,
  uniqueUploadName,
  isValidEmail,
  nonEmptyString,
} from '../_lib'

const SLIP_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])

function parseItemsJson(raw) {
  let data
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (!Array.isArray(data) || data.length === 0) return null
  const out = []
  for (const row of data) {
    if (!row || typeof row !== 'object') return null
    if (typeof row.id !== 'string' || typeof row.slug !== 'string') return null
    if (typeof row.quantity !== 'number' || !Number.isInteger(row.quantity) || row.quantity < 1) {
      return null
    }
    out.push({ id: row.id.trim(), slug: row.slug.trim(), quantity: row.quantity })
  }
  return out
}

/**
 * POST /api/checkout (public, multipart form) — สั่งซื้อ + แนบสลิป:
 * เขียน orders/YYYY/<id>.json + commit รูปสลิป + อีเมลแจ้งทาง Resend (spec §5)
 */
export async function onRequestPost({ request, env }) {
  let form
  try {
    form = await request.formData()
  } catch {
    return json(400, { success: false, error: 'Invalid form data.' })
  }

  const customerName = form.get('customerName')
  const email = form.get('email')
  const itemsRaw = form.get('items')
  const slip = form.get('slip')

  if (!nonEmptyString(customerName)) {
    return json(400, { success: false, error: 'Customer name is required.' })
  }
  if (!nonEmptyString(email) || !isValidEmail(email)) {
    return json(400, { success: false, error: 'A valid email is required.' })
  }
  if (!(slip instanceof File) || slip.size < 1) {
    return json(400, { success: false, error: 'A payment slip file is required.' })
  }
  if (typeof itemsRaw !== 'string' || itemsRaw.trim() === '') {
    return json(400, { success: false, error: 'Order items (items JSON) are required.' })
  }
  const items = parseItemsJson(itemsRaw)
  if (!items) {
    return json(400, {
      success: false,
      error: 'Items must be a non-empty JSON array of { id, slug, quantity }.',
    })
  }
  const mimetype = slip.type || 'application/octet-stream'
  if (!SLIP_MIME.has(mimetype)) {
    return json(400, {
      success: false,
      error: 'Slip file type is not allowed. Use JPEG, PNG, WebP, or PDF.',
    })
  }

  const phone = typeof form.get('phone') === 'string' ? form.get('phone').trim() : ''
  const address = typeof form.get('address') === 'string' ? form.get('address').trim() : ''
  const customerNote =
    typeof form.get('customerNote') === 'string' ? form.get('customerNote').trim() : ''

  // ตรวจสินค้า/ราคากับข้อมูลจริงในไฟล์ (กันแก้ราคาฝั่ง browser)
  const productsFile = await ghGetJson(env, 'content/collections/products.json')
  const products = productsFile?.json ?? []
  const lineItems = []
  for (const line of items) {
    const product = products.find((p) => p.id === line.id || p.slug === line.slug)
    if (!product) {
      return json(400, { success: false, error: 'One or more products could not be found.' })
    }
    if (line.id && product.id !== line.id && product.slug !== line.slug) {
      return json(400, {
        success: false,
        error: 'Product data for one or more lines is inconsistent.',
      })
    }
    const purchasable =
      product.mode === 'buy' && typeof product.price === 'number' && product.price > 0
    if (!purchasable) {
      return json(400, {
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
  const subtotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0)
  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return json(400, { success: false, error: 'Order total could not be calculated.' })
  }

  try {
    const orderId = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    const year = createdAt.slice(0, 4)

    // 1) สลิป → public/uploads/payment-slips/
    const slipName = uniqueUploadName(slip.name || 'payment-slip', 'jpg')
    const slipBytes = new Uint8Array(await slip.arrayBuffer())
    await ghPutFile(
      env,
      `public/uploads/payment-slips/${slipName}`,
      bytesToBase64(slipBytes),
      // [skip ci]: ไฟล์ออเดอร์/สลิปไม่กระทบหน้าเว็บ ไม่ต้อง rebuild
      `ออเดอร์ใหม่: สลิปโอนเงินจาก ${customerName.trim()} [skip ci]`,
    )

    // 2) ออเดอร์ → orders/YYYY/<id>.json
    const order = {
      id: orderId,
      kind: 'order',
      createdAt,
      customerName: customerName.trim(),
      email: email.trim(),
      phone: phone || undefined,
      address: address || undefined,
      customerNote: customerNote || undefined,
      status: 'awaiting_verification',
      paymentMethod: 'bank_transfer',
      currency: 'THB',
      subtotal,
      slipUrl: `/uploads/payment-slips/${slipName}`,
      lineItems,
    }
    await ghPutFile(
      env,
      `orders/${year}/${orderId}.json`,
      utf8ToBase64(stringifyContent(order)),
      `ออเดอร์ใหม่จาก ${customerName.trim()} ยอด ${subtotal.toLocaleString('th-TH')} บาท [skip ci]`,
    )

    // 3) อีเมลแจ้งร้าน + ยืนยันลูกค้า
    const settings = await ghGetJson(env, 'content/globals/payment-settings.json').catch(() => null)
    const notifyTo = settings?.json?.orderNotificationEmail
    const itemsHtml = lineItems
      .map(
        (li) => `<li>${li.title} × ${li.quantity} = ฿${li.lineTotal.toLocaleString('th-TH')}</li>`,
      )
      .join('')
    await sendEmail(env, {
      to: notifyTo,
      subject: `🧾 ออเดอร์ใหม่จาก ${customerName.trim()} — ฿${subtotal.toLocaleString('th-TH')}`,
      html:
        `<h2>มีออเดอร์ใหม่</h2><p><b>${customerName.trim()}</b> (${email.trim()}${phone ? ` · ${phone}` : ''})</p>` +
        `<ul>${itemsHtml}</ul><p>ยอดรวม <b>฿${subtotal.toLocaleString('th-TH')}</b></p>` +
        `<p>ดูรายละเอียดและสลิปได้ที่เมนู “ประวัติการสั่งซื้อ” ในระบบจัดการเว็บไซต์</p>`,
    })
    await sendEmail(env, {
      to: email.trim(),
      subject: 'SK Sport — ได้รับคำสั่งซื้อของคุณแล้ว',
      html:
        `<p>เรียนคุณ ${customerName.trim()}</p><p>เราได้รับคำสั่งซื้อและสลิปของคุณแล้ว ` +
        `ทีมงานจะตรวจสอบการชำระเงินและติดต่อกลับโดยเร็วที่สุด</p>` +
        `<ul>${itemsHtml}</ul><p>ยอดรวม <b>฿${subtotal.toLocaleString('th-TH')}</b></p>` +
        `<p>ขอบคุณที่ใช้บริการ SK Sport Trading</p>`,
    })

    return json(200, { success: true, orderId })
  } catch (err) {
    console.error('[checkout]', err instanceof Error ? err.message : err)
    return json(500, {
      success: false,
      error: 'Checkout could not be completed. Please try again later.',
    })
  }
}
