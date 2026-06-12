'use client'

import React, { useRef, useState } from 'react'
import { AdminApiError } from '../api'
import { uploadMediaFile, previewUrl, type MediaDoc } from '../media'

/**
 * รายการรูปภาพ: เพิ่ม / ลบ / สลับลำดับ — ใช้กับแบนเนอร์สไลด์ โลโก้พาร์ทเนอร์
 * และแกลเลอรี การอัปโหลดเกิดทันทีที่เลือกไฟล์ ส่วนลำดับ/การลบมีผลเมื่อกด
 * "บันทึก" ของการ์ด
 */
export function ImageListEditor({
  items,
  onChange,
  folder,
  uploadCommitMessage,
}: {
  items: MediaDoc[]
  onChange: (items: MediaDoc[]) => void
  /** โฟลเดอร์ใน public/uploads ที่รูปหมวดนี้อยู่ เช่น hero-media */
  folder: string
  /** ข้อความ commit ภาษาไทยตอนอัปโหลดรูปใหม่ */
  uploadCommitMessage: string
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function move(index: number, dir: -1 | 1) {
    const next = [...items]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  function setFocal(index: number, e: React.MouseEvent<HTMLImageElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const focalX = Math.round(
      Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
    )
    const focalY = Math.round(
      Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
    )
    onChange(items.map((it, i) => (i === index ? { ...it, focalX, focalY } : it)))
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setError('')
    setUploading(true)
    try {
      const added: MediaDoc[] = []
      for (const file of Array.from(files)) {
        added.push(await uploadMediaFile(folder, file, uploadCommitMessage))
      }
      onChange([...items, ...added])
    } catch (err) {
      setError(
        err instanceof AdminApiError || err instanceof Error
          ? err.message
          : 'อัปโหลดรูปไม่สำเร็จ — กรุณาลองใหม่',
      )
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && (
        <p className="rounded-lg bg-base-200 px-4 py-3 text-sm text-base-content/60">
          ยังไม่มีรูปในส่วนนี้ — กด &ldquo;เพิ่มรูป&rdquo; เพื่อเลือกรูปจากเครื่อง
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-base-200 bg-base-100 p-2"
          >
            <div className="relative h-16 w-24 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl(item)}
                alt={item.alt ?? item.filename}
                onClick={(e) => setFocal(index, e)}
                title="คลิกบนรูปเพื่อเลือกจุดที่อยากให้โชว์"
                className="h-16 w-24 cursor-crosshair rounded-md bg-base-200 object-cover"
                style={{ objectPosition: `${item.focalX ?? 50}% ${item.focalY ?? 50}%` }}
              />
              <span
                className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary-content bg-primary shadow"
                style={{ left: `${item.focalX ?? 50}%`, top: `${item.focalY ?? 50}%` }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{item.alt || item.name || item.filename}</p>
              <p className="text-xs text-base-content/45">ลำดับที่ {index + 1}</p>
              <p className="text-xs text-base-content/40">
                คลิกบนรูปเพื่อเลือกจุดที่อยากให้โชว์ (กันภาพโดนตัดหัว)
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
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
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={uploading}
          onClick={() => fileInput.current?.click()}
        >
          {uploading && <span className="loading loading-spinner loading-xs" />}
          {uploading ? 'กำลังอัปโหลด…' : '+ เพิ่มรูป'}
        </button>
        <span className="text-xs text-base-content/50">
          รูปจะถูกย่อขนาดให้อัตโนมัติ เลือกได้หลายรูปพร้อมกัน
        </span>
      </div>
      {error && <p className="text-sm text-error">❌ {error}</p>}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
