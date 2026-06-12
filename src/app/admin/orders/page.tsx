'use client'

import React, { useEffect, useState } from 'react'
import { AdminShell } from '@/admin/components/AdminShell'
import { getOrders, type AdminOrderRow } from '@/admin/api'

const STATUS_TH: Record<string, string> = {
  awaiting_verification: 'รอตรวจสอบสลิป',
  paid: 'ชำระแล้ว',
  shipped: 'จัดส่งแล้ว',
  completed: 'สำเร็จ',
  cancelled: 'ยกเลิก',
  new: 'ใหม่',
  contacted: 'ติดต่อแล้ว',
  closed: 'ปิดงาน',
}

function statusTh(status: string): string {
  return STATUS_TH[status] ?? status
}

function dateTh(iso: string): string {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return '-'
  return new Date(t).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function baht(n: number | undefined): string {
  if (typeof n !== 'number') return '-'
  return `฿${n.toLocaleString('th-TH')}`
}

/** ประวัติการสั่งซื้อ + คำขอใบเสนอราคา — อ่านอย่างเดียว (spec §3) */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRow[] | null>(null)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'โหลดรายการไม่สำเร็จ — กรุณารีเฟรช'),
      )
  }, [])

  return (
    <AdminShell active="orders">
      {error && <div className="alert alert-error text-sm">❌ {error}</div>}
      {!orders && !error && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg" aria-label="กำลังโหลด" />
        </div>
      )}

      {orders && (
        <section className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body p-5">
            <h2 className="text-base font-semibold">รายการสั่งซื้อและคำขอใบเสนอราคา</h2>
            <p className="text-sm text-base-content/60">
              รวมทุกออเดอร์จากหน้า ชำระเงิน และคำขอใบเสนอราคาจากตะกร้าใบเสนอราคา — ดูอย่างเดียว
              กดแถวเพื่อดูรายละเอียดและรูปสลิป
            </p>

            {orders.length === 0 ? (
              <p className="py-8 text-center text-sm text-base-content/50">ยังไม่มีรายการ</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>วันที่</th>
                      <th>ชื่อลูกค้า</th>
                      <th>เบอร์</th>
                      <th>ประเภท</th>
                      <th>สถานะ</th>
                      <th className="text-right">ยอด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <React.Fragment key={`${o.kind}-${o.id}`}>
                        <tr
                          className="cursor-pointer hover:bg-base-200"
                          onClick={() =>
                            setOpenId(openId === `${o.kind}-${o.id}` ? null : `${o.kind}-${o.id}`)
                          }
                        >
                          <td className="whitespace-nowrap">{dateTh(o.createdAt)}</td>
                          <td>{o.customerName}</td>
                          <td className="whitespace-nowrap">{o.phone ?? '-'}</td>
                          <td>
                            {o.kind === 'order' ? (
                              <span className="badge badge-primary badge-sm">สั่งซื้อ</span>
                            ) : (
                              <span className="badge badge-ghost badge-sm">ใบเสนอราคา</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap">{statusTh(o.status)}</td>
                          <td className="text-right whitespace-nowrap">{baht(o.subtotal)}</td>
                        </tr>
                        {openId === `${o.kind}-${o.id}` && (
                          <tr>
                            <td colSpan={6} className="bg-base-200/50">
                              <div className="flex flex-col gap-3 p-2 text-sm">
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  {o.email && (
                                    <p>
                                      <span className="text-base-content/50">อีเมล:</span> {o.email}
                                    </p>
                                  )}
                                  {o.companyName && (
                                    <p>
                                      <span className="text-base-content/50">บริษัท:</span>{' '}
                                      {o.companyName}
                                    </p>
                                  )}
                                  {o.address && (
                                    <p>
                                      <span className="text-base-content/50">ที่อยู่จัดส่ง:</span>{' '}
                                      {o.address}
                                    </p>
                                  )}
                                  {(o.customerNote || o.message) && (
                                    <p>
                                      <span className="text-base-content/50">ข้อความ:</span>{' '}
                                      {o.customerNote || o.message}
                                    </p>
                                  )}
                                </div>

                                <table className="table table-xs">
                                  <thead>
                                    <tr>
                                      <th>สินค้า</th>
                                      <th className="text-right">จำนวน</th>
                                      <th className="text-right">ราคา/ชิ้น</th>
                                      <th className="text-right">รวม</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {o.lineItems.map((li, i) => (
                                      <tr key={i}>
                                        <td>{li.title}</td>
                                        <td className="text-right">{li.quantity}</td>
                                        <td className="text-right">{baht(li.unitPrice)}</td>
                                        <td className="text-right">{baht(li.lineTotal)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>

                                {o.slipUrl && (
                                  <div>
                                    <p className="mb-1 text-base-content/50">รูปสลิปโอนเงิน:</p>
                                    <a href={o.slipUrl} target="_blank" rel="noopener noreferrer">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={o.slipUrl}
                                        alt={`สลิปของ ${o.customerName}`}
                                        className="max-h-72 rounded-lg border border-base-300"
                                      />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </AdminShell>
  )
}
