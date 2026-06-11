import { json, requireAuth, UPLOAD_FOLDERS, SAFE_FILENAME, ghPutFile } from '../../_lib'

/** POST /api/admin/upload {folder, filename, base64, message} → commit รูป + คืน path */
export async function onRequestPost({ request, env }) {
  const denied = await requireAuth(env, request)
  if (denied) return denied

  let body
  try {
    body = await request.json()
  } catch {
    return json(400, { error: 'invalid body' })
  }
  const { folder, filename, base64, message } = body ?? {}
  if (!UPLOAD_FOLDERS.has(folder)) return json(400, { error: 'หมวดรูปไม่ถูกต้อง' })
  if (typeof filename !== 'string' || !SAFE_FILENAME.test(filename)) {
    return json(400, { error: 'ชื่อไฟล์ไม่ถูกต้อง' })
  }
  if (typeof base64 !== 'string' || !base64) return json(400, { error: 'ไม่มีข้อมูลไฟล์' })

  const path = `public/uploads/${folder}/${filename}`
  await ghPutFile(
    env,
    path,
    base64,
    typeof message === 'string' && message.trim() ? message : `อัปโหลดรูป ${folder}/${filename}`,
  )
  return json(200, { path: `/uploads/${folder}/${filename}` })
}
