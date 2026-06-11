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

/**
 * POST /api/contact (public, JSON {name, email, phoneNumber, detail}) —
 * ฟอร์มติดต่อบนหน้า ติดต่อเรา: เก็บไฟล์ไว้ใน contact-submissions/ + อีเมลแจ้งร้าน
 */
export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return json(400, { success: false, error: 'Request body must be valid JSON.' })
  }

  const name = body?.name
  const email = body?.email
  const detail = body?.detail
  if (!nonEmptyString(name) || !nonEmptyString(detail) || !isValidEmail(email ?? '')) {
    return json(400, { success: false, error: 'name, email and detail are required.' })
  }
  const phoneNumber = typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : ''

  try {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    const submission = {
      id,
      createdAt,
      name: name.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber || undefined,
      detail: detail.trim(),
    }
    await ghPutFile(
      env,
      `contact-submissions/${createdAt.slice(0, 4)}/${id}.json`,
      utf8ToBase64(stringifyContent(submission)),
      // [skip ci]: ไฟล์ข้อความติดต่อไม่กระทบหน้าเว็บ ไม่ต้อง rebuild
      `ข้อความติดต่อใหม่จาก ${name.trim()} [skip ci]`,
    )

    const settings = await ghGetJson(env, 'content/globals/payment-settings.json').catch(() => null)
    await sendEmail(env, {
      to: settings?.json?.orderNotificationEmail,
      subject: `✉️ ข้อความติดต่อใหม่จาก ${name.trim()}`,
      html:
        `<h2>ข้อความจากฟอร์มติดต่อเรา</h2>` +
        `<p><b>${name.trim()}</b> (${email.trim()}${phoneNumber ? ` · ${phoneNumber}` : ''})</p>` +
        `<p>${detail.trim().replace(/\n/g, '<br/>')}</p>`,
    })
    await sendEmail(env, {
      to: email.trim(),
      subject: 'SK Sport — ได้รับข้อความของคุณแล้ว',
      html:
        `<p>เรียนคุณ ${name.trim()}</p>` +
        `<p>เราได้รับข้อความของคุณแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุด ขอบคุณครับ</p>`,
    })

    return json(200, { success: true })
  } catch (err) {
    console.error('[contact]', err instanceof Error ? err.message : err)
    return json(500, { success: false, error: 'Something went wrong. Please try again later.' })
  }
}
