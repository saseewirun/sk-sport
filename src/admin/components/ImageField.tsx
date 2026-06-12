'use client'

import React, { useRef, useState } from 'react'
import { AdminApiError } from '../api'
import { uploadMediaFile, previewUrl, type MediaDoc } from '../media'

/**
 * รูปเดี่ยว: แสดงตัวอย่างรูปปัจจุบันเสมอ + ปุ่ม "เปลี่ยนรูป" — ไม่มี media
 * library แยก (กติกา spec ข้อ 3 ตัดปัญหากระโดดหน้า)
 */
export function ImageField({
  label,
  description,
  value,
  onChange,
  folder,
  uploadCommitMessage,
}: {
  label: string
  description?: string
  value: MediaDoc | null
  onChange: (media: MediaDoc) => void
  folder: string
  uploadCommitMessage: string
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function setFocal(e: React.MouseEvent<HTMLImageElement>) {
    if (!value) return
    const rect = e.currentTarget.getBoundingClientRect()
    const focalX = Math.round(
      Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
    )
    const focalY = Math.round(
      Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
    )
    onChange({ ...value, focalX, focalY })
  }

  async function handleFile(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      onChange(await uploadMediaFile(folder, file, uploadCommitMessage))
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
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      {description && <span className="text-xs text-base-content/55">{description}</span>}
      <div className="mt-1 flex items-center gap-4">
        {value ? (
          <div className="relative h-24 w-36">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl(value)}
              alt={value.alt ?? value.filename}
              onClick={setFocal}
              title="คลิกบนรูปเพื่อเลือกจุดที่อยากให้โชว์"
              className="h-24 w-36 cursor-crosshair rounded-md border border-base-200 bg-base-200 object-cover"
              style={{ objectPosition: `${value.focalX ?? 50}% ${value.focalY ?? 50}%` }}
            />
            <span
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary-content bg-primary shadow"
              style={{ left: `${value.focalX ?? 50}%`, top: `${value.focalY ?? 50}%` }}
            />
          </div>
        ) : (
          <div className="flex h-24 w-36 items-center justify-center rounded-md border border-dashed border-base-300 text-xs text-base-content/40">
            ยังไม่มีรูป
          </div>
        )}
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={uploading}
          onClick={() => fileInput.current?.click()}
        >
          {uploading && <span className="loading loading-spinner loading-xs" />}
          {uploading ? 'กำลังอัปโหลด…' : value ? 'เปลี่ยนรูป' : 'เลือกรูป'}
        </button>
      </div>
      {value && (
        <span className="text-xs text-base-content/40">
          คลิกบนรูปเพื่อเลือกจุดที่อยากให้โชว์ (กันภาพโดนตัดหัว)
        </span>
      )}
      {error && <p className="text-sm text-error">❌ {error}</p>}
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />
    </div>
  )
}
