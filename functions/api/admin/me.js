import { json, requireAuth } from '../../_lib'

/** GET /api/admin/me → 200 เมื่อ session ยังใช้ได้ */
export async function onRequestGet({ request, env }) {
  const denied = await requireAuth(env, request)
  if (denied) return denied
  return json(200, { ok: true })
}
