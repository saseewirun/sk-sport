'use client'

import React from 'react'

/**
 * รายการแบบจัดลำดับได้ (เลื่อนขึ้น/ลง/ลบ/เพิ่ม) สำหรับข้อมูลทุกชนิดที่ไม่ใช่รูป
 * เช่น คำถาม-คำตอบ FAQ, กล่องสถิติ, ลิงก์วิดีโอ — รูปใช้ ImageListEditor
 */
export function ItemList<T>({
  items,
  onChange,
  renderItem,
  addLabel,
  makeNew,
  itemTitle,
}: {
  items: T[]
  onChange: (items: T[]) => void
  /** ช่องแก้ไขของแต่ละรายการ */
  renderItem: (item: T, update: (next: T) => void, index: number) => React.ReactNode
  addLabel: string
  makeNew: () => T
  /** ข้อความหัวแถวของรายการ (โชว์เลขลำดับถ้าไม่ส่ง) */
  itemTitle?: (item: T, index: number) => string
}) {
  function move(index: number, dir: -1 | 1) {
    const next = [...items]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-lg border border-base-200 bg-base-100 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-base-content/70">
              {itemTitle ? itemTitle(item, index) : `รายการที่ ${index + 1}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                aria-label="เลื่อนขึ้น"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                aria-label="เลื่อนลง"
                disabled={index === items.length - 1}
                onClick={() => move(index, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs text-error"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                ลบ
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {renderItem(
              item,
              (next) => onChange(items.map((it, i) => (i === index ? next : it))),
              index,
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-outline btn-sm w-fit"
        onClick={() => onChange([...items, makeNew()])}
      >
        + {addLabel}
      </button>
    </div>
  )
}
