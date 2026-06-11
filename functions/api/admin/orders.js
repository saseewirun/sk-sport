import { json, requireAuth, collectOrders } from '../../_lib'

/** GET /api/admin/orders → รวมออเดอร์เก่า (Payload export) + ใหม่ (orders/) + quote */
export async function onRequestGet({ request, env }) {
  const denied = await requireAuth(env, request)
  if (denied) return denied
  return json(200, { orders: await collectOrders(env) })
}
