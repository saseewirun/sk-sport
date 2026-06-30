import { json, requireAuth, ghGetRawBytes } from '../../_lib'

const CONTENT_TYPE = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf',
}

/**
 * GET /api/admin/slip?file=<ชื่อไฟล์> — เสิร์ฟรูปสลิปโอนเงิน (เฉพาะแอดมินที่ล็อกอิน)
 * อ่านไฟล์จาก public/uploads/payment-slips/ ใน repo โดยตรง จึงเห็นรูปได้ทันที
 * โดยไม่ต้อง deploy ใหม่ และไม่เปิดให้คนนอกเข้าถึงสลิปของลูกค้า (spec §5)
 */
export async function onRequestGet({ request, env }) {
  const denied = await requireAuth(env, request)
  if (denied) return denied

  const raw = new URL(request.url).searchParams.get('file') || ''
  // รับเฉพาะชื่อไฟล์ ตัด path ออกทั้งหมด กัน path traversal (../)
  const name = raw.split('/').pop().split('\\').pop()
  if (!name || name.includes('..')) {
    return json(400, { error: 'ชื่อไฟล์ไม่ถูกต้อง' })
  }

  const ext = name.slice(name.lastIndexOf('.') + 1).toLowerCase()
  const bytes = await ghGetRawBytes(env, `public/uploads/payment-slips/${name}`)
  if (!bytes) {
    return json(404, { error: 'ไม่พบไฟล์สลิป' })
  }

  return new Response(bytes, {
    headers: {
      'Content-Type': CONTENT_TYPE[ext] || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${name}"`,
      'Cache-Control': 'private, max-age=300',
    },
  })
}
