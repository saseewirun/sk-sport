/**
 * สร้าง "ที่อยู่ลิงก์" อัตโนมัติจากชื่อ — ลูกค้าไม่ต้องกรอกเอง (กติกา spec ข้อ 2)
 */

/** สินค้า: a-z0-9 เท่านั้นตาม spec (ชื่อไทยล้วนจะได้รหัสสุ่มแทน) */
export function productSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || `product-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * ผลงาน/ทีมงาน: คงภาษาไทยไว้ได้ แต่ตัดอักขระที่พังชื่อไฟล์/ลิงก์
 * (ห้ามมี | / \ ฯลฯ — ตามบั๊ก build ที่เคยเจอ)
 */
export function thaiSafeSlug(title: string): string {
  const slug = title
    .trim()
    .replace(/[<>:"/\\|?*#%&{}[\]]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || `item-${Math.random().toString(36).slice(2, 8)}`
}

/** กันชนกับของเดิม: ถ้าซ้ำ เติม -2, -3, … */
export function uniqueSlug(base: string, taken: (string | null | undefined)[]): string {
  const set = new Set(taken.filter(Boolean))
  if (!set.has(base)) return base
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`
    if (!set.has(candidate)) return candidate
  }
}
