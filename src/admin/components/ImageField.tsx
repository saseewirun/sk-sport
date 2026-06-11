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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl(value)}
            alt={value.alt ?? value.filename}
            className="h-24 w-36 rounded-md border border-base-200 bg-base-200 object-cover"
          />
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
