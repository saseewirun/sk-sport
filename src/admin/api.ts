/**
 * Client for the admin API.
 *
 * The same contract is served by two backends:
 *   - production: Cloudflare Pages Functions (functions/api/…) committing to
 *     GitHub — the site rebuilds and goes live in ~2-3 minutes
 *   - development: scripts/admin-dev-server.mjs writing to the local working
 *     tree (proxied via next.config rewrites, port 8788)
 */

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
  }
}

export function isUnauthorized(err: unknown): boolean {
  return err instanceof AdminApiError && err.status === 401
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, init)
  } catch {
    throw new AdminApiError('เชื่อมต่อระบบไม่ได้ — กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง', 0)
  }
  if (!res.ok) {
    let detail = ''
    try {
      const body = (await res.json()) as { error?: string }
      detail = body.error ?? ''
    } catch {
      // non-JSON error body
    }
    if (res.status === 401) {
      throw new AdminApiError('กรุณาเข้าสู่ระบบใหม่อีกครั้ง', 401)
    }
    throw new AdminApiError(
      detail || `เกิดข้อผิดพลาด (รหัส ${res.status}) — กรุณาลองใหม่`,
      res.status,
    )
  }
  return (await res.json()) as T
}

/** เข้าสู่ระบบด้วยรหัสผ่าน — สำเร็จแล้ว browser จะได้ session cookie (อายุ 24 ชม.) */
export async function apiLogin(password: string): Promise<void> {
  await request<{ ok: true }>('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
}

/** เช็คว่า session ยังใช้ได้อยู่ไหม */
export async function apiLoggedIn(): Promise<boolean> {
  try {
    await request<{ ok: true }>('/api/admin/me')
    return true
  } catch {
    return false
  }
}

/** อ่านไฟล์เนื้อหาเวอร์ชันล่าสุด */
export async function getContentFile<T>(file: string): Promise<T> {
  const qs = new URLSearchParams({ file })
  const res = await request<{ json: T }>(`/api/admin/content?${qs}`)
  return res.json
}

/** บันทึกไฟล์เนื้อหา 1 ไฟล์ (message = ข้อความ commit ภาษาไทย ใช้เป็น audit log) */
export async function putContentFile(file: string, json: unknown, message: string): Promise<void> {
  await request<{ ok: true }>('/api/admin/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file, json, message }),
  })
}

/** อัปโหลดรูป 1 ไฟล์เข้า public/uploads/<folder>/ แล้วคืน path สำหรับใช้บนเว็บ */
export async function uploadImage(
  folder: string,
  filename: string,
  base64: string,
  message: string,
): Promise<{ path: string }> {
  return request<{ path: string }>('/api/admin/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder, filename, base64, message }),
  })
}

/** รายการสั่งซื้อ + คำขอใบเสนอราคา (เก่าจาก Payload + ใหม่จากฟอร์มเว็บ) */
export type AdminOrderRow = {
  id: string
  kind: 'order' | 'quote'
  createdAt: string
  customerName: string
  email?: string
  phone?: string
  status: string
  /** ยอดรวม (เฉพาะ kind=order) */
  subtotal?: number
  /** path รูปสลิป (เฉพาะ kind=order) */
  slipUrl?: string
  companyName?: string
  message?: string
  address?: string
  customerNote?: string
  lineItems: { title: string; quantity: number; unitPrice?: number; lineTotal?: number }[]
}

export async function getOrders(): Promise<AdminOrderRow[]> {
  const res = await request<{ orders: AdminOrderRow[] }>('/api/admin/orders')
  return res.orders
}
