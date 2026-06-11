import { sanitizeFilename } from '@/utils/sanitizeFilename'
import { uploadImage } from './api'

/**
 * Media documents embedded in content files keep the exact shape the Payload
 * export produced (depth-1 populated), so the frontend components keep working
 * without changes. New uploads from the admin create the same shape with a
 * local /uploads URL.
 */
export type MediaDoc = {
  id: string
  alt?: string | null
  name?: string | null
  prefix: string
  url: string
  thumbnailURL?: string | null
  filename: string
  mimeType: string
  filesize?: number | null
  width?: number | null
  height?: number | null
  focalX?: number | null
  focalY?: number | null
  createdAt: string
  updatedAt: string
}

const MAX_DIMENSION = 2000
const WEBP_QUALITY = 0.85

/**
 * ย่อรูปฝั่ง browser แล้วแปลงเป็น WebP — ไฟล์เล็กลงมาก เว็บโหลดเร็วขึ้น
 * (SVG และ GIF ส่งตามต้นฉบับ เพราะการแปลงทำให้ภาพเสีย)
 */
async function processImage(
  file: File,
): Promise<{ blob: Blob; ext: string; mimeType: string; width: number; height: number }> {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    const ext = file.type === 'image/svg+xml' ? 'svg' : 'gif'
    return { blob: file, ext, mimeType: file.type, width: 0, height: 0 }
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx)
    throw new Error('เบราว์เซอร์นี้ไม่รองรับการย่อรูป — กรุณาใช้ Chrome/Safari เวอร์ชันล่าสุด')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY),
  )
  if (!blob) throw new Error('แปลงรูปไม่สำเร็จ — กรุณาลองรูปอื่น')
  return { blob, ext: 'webp', mimeType: 'image/webp', width, height }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      resolve(dataUrl.slice(dataUrl.indexOf(',') + 1))
    }
    reader.onerror = () => reject(new Error('อ่านไฟล์รูปไม่สำเร็จ'))
    reader.readAsDataURL(blob)
  })
}

/** ชื่อไฟล์ปลอดภัยเสมอ (a-z0-9) + ต่อท้ายด้วยรหัสกันชื่อซ้ำ — แก้ปัญหาชื่อไฟล์ภาษาไทยเดิม */
function safeUploadFilename(originalName: string, ext: string): string {
  const base = sanitizeFilename(originalName.replace(/\.[^.]*$/, '')) || 'image'
  const unique = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  return `${base.toLowerCase().slice(0, 60)}-${unique}.${ext}`
}

/**
 * อัปโหลดรูปจาก <input type="file"> : ย่อ/แปลง WebP → commit เข้า
 * public/uploads/<folder>/ → คืน MediaDoc พร้อมใช้ฝังในไฟล์เนื้อหา
 */
export async function uploadMediaFile(
  folder: string,
  file: File,
  commitMessage: string,
  alt?: string,
): Promise<MediaDoc> {
  const processed = await processImage(file)
  const filename = safeUploadFilename(file.name, processed.ext)
  const base64 = await blobToBase64(processed.blob)
  const { path } = await uploadImage(folder, filename, base64, commitMessage)
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    alt: alt ?? file.name.replace(/\.[^.]*$/, ''),
    prefix: folder,
    url: path,
    thumbnailURL: null,
    filename,
    mimeType: processed.mimeType,
    filesize: processed.blob.size,
    width: processed.width || null,
    height: processed.height || null,
    focalX: null,
    focalY: null,
    createdAt: now,
    updatedAt: now,
  }
}

/** url ที่แสดงตัวอย่างรูปได้ ทั้งของเก่า (Payload/Supabase) และของใหม่ (/uploads) */
export function previewUrl(
  media: { url?: string | null; prefix?: string; filename?: string } | null | undefined,
): string {
  if (!media) return ''
  const url = media.url ?? ''
  if (url.startsWith('/uploads/')) return url
  if (media.prefix && media.filename) return `/uploads/${media.prefix}/${media.filename}`
  return url
}
