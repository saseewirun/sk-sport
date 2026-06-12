'use client'

import React, { useState } from 'react'
import { AdminApiError, isUnauthorized } from '../api'

type SaveState =
  | { phase: 'idle' }
  | { phase: 'saving' }
  | { phase: 'saved' }
  | { phase: 'error'; message: string }

/**
 * การ์ด section — หน่วยหลักของทุกหน้า admin (spec §2):
 * ชื่อ section ภาษาไทย + คำอธิบาย "ส่วนนี้แสดงตรงไหนบนเว็บ" + ช่องแก้ไข +
 * ปุ่มบันทึกของการ์ดนั้นเอง พร้อม feedback ครบทุกสถานะ (กติกา ข้อ 4)
 */
export function SectionCard({
  order,
  title,
  description,
  onSave,
  collapsible = false,
  children,
}: {
  /** ลำดับของ section บนหน้าเว็บจริง (บน→ล่าง) */
  order: number
  title: string
  /** ส่วนนี้แสดงตรงไหนบนเว็บ — ภาษาคน ไม่ใช่ศัพท์เทคนิค */
  description: string
  /** ไม่ส่ง = การ์ดแสดงอย่างเดียว (ไม่มีปุ่มบันทึก) */
  onSave?: () => Promise<void>
  /** true = พับเก็บโดยปริยาย (เช่นการ์ดขนาดตัวอักษร) */
  collapsible?: boolean
  children: React.ReactNode
}) {
  const [state, setState] = useState<SaveState>({ phase: 'idle' })
  const [open, setOpen] = useState(!collapsible)

  async function handleSave() {
    if (!onSave) return
    setState({ phase: 'saving' })
    try {
      await onSave()
      setState({ phase: 'saved' })
    } catch (err) {
      if (isUnauthorized(err)) {
        window.location.href = '/admin'
        return
      }
      const message =
        err instanceof AdminApiError
          ? err.message
          : 'บันทึกไม่สำเร็จ — กรุณาลองใหม่อีกครั้ง ถ้ายังไม่ได้ให้ปิด-เปิดหน้านี้ใหม่'
      setState({ phase: 'error', message })
    }
  }

  return (
    <section className="card mb-5 border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body gap-4 p-5">
        <button
          type="button"
          className="flex w-full items-start justify-between gap-3 text-left"
          onClick={() => collapsible && setOpen((o) => !o)}
          aria-expanded={open}
        >
          <div>
            <h2 className="text-base font-semibold">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {order}
              </span>
              {title}
            </h2>
            <p className="mt-1 text-sm text-base-content/60">{description}</p>
          </div>
          {collapsible && (
            <span className="text-base-content/40" aria-hidden>
              {open ? '▾' : '▸'}
            </span>
          )}
        </button>

        {open && (
          <>
            <div className="flex flex-col gap-4">{children}</div>

            {onSave && (
              <div className="flex flex-wrap items-center gap-3 border-t border-base-200 pt-4">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                  disabled={state.phase === 'saving'}
                >
                  {state.phase === 'saving' && (
                    <span className="loading loading-spinner loading-xs" />
                  )}
                  {state.phase === 'saving' ? 'กำลังบันทึก…' : 'บันทึก'}
                </button>
                {state.phase === 'saved' && (
                  <span className="text-sm text-success">
                    ✅ บันทึกแล้ว — เว็บไซต์จริงจะอัปเดตภายใน 2-3 นาที
                  </span>
                )}
                {state.phase === 'error' && (
                  <span className="text-sm text-error">❌ {state.message}</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
