import { json, sessionCookie } from '../../_lib'

/** POST /api/admin/login {password} → session cookie อายุ 24 ชม. (spec §5) */
export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) {
    return json(500, { error: 'ระบบยังไม่ได้ตั้งรหัสผ่าน (ADMIN_PASSWORD) — แจ้งผู้ดูแลระบบ' })
  }
  let body
  try {
    body = await request.json()
  } catch {
    return json(400, { error: 'invalid body' })
  }
  if (typeof body?.password !== 'string' || body.password !== env.ADMIN_PASSWORD) {
    return json(401, { error: 'รหัสผ่านไม่ถูกต้อง' })
  }
  return json(200, { ok: true }, { 'Set-Cookie': await sessionCookie(env) })
}
