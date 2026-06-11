import {
  json,
  requireAuth,
  FILE_PATTERN,
  ghGetJson,
  ghPutFile,
  utf8ToBase64,
  stringifyContent,
} from '../../_lib'

/** GET /api/admin/content?file=<path> → อ่านไฟล์เวอร์ชันล่าสุดจาก GitHub */
export async function onRequestGet({ request, env }) {
  const denied = await requireAuth(env, request)
  if (denied) return denied

  const file = new URL(request.url).searchParams.get('file') || ''
  if (!FILE_PATTERN.test(file)) return json(400, { error: 'ไฟล์นี้แก้ไขผ่านระบบไม่ได้' })

  const result = await ghGetJson(env, file)
  if (!result) return json(404, { error: 'ไม่พบไฟล์เนื้อหา' })
  return json(200, { json: result.json })
}

/** PUT /api/admin/content {file, json, message} → commit 1 ไฟล์ (spec §5) */
export async function onRequestPut({ request, env }) {
  const denied = await requireAuth(env, request)
  if (denied) return denied

  let body
  try {
    body = await request.json()
  } catch {
    return json(400, { error: 'invalid body' })
  }
  const { file, json: content, message } = body ?? {}
  if (!FILE_PATTERN.test(file ?? '')) return json(400, { error: 'ไฟล์นี้แก้ไขผ่านระบบไม่ได้' })
  if (content === undefined || typeof message !== 'string' || !message.trim()) {
    return json(400, { error: 'ข้อมูลไม่ครบ (json/message)' })
  }

  await ghPutFile(env, file, utf8ToBase64(stringifyContent(content)), message.trim())
  return json(200, { ok: true })
}
