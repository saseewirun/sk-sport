'use client'

import React from 'react'

/**
 * ช่องกรอกพื้นฐานของ admin ทุกหน้า — ทุกช่องมี label ไทย + บรรทัดคำอธิบาย
 * สีเทาว่าข้อความนี้ "แสดงตรงไหนบนเว็บ" (กติกา spec ข้อ 1)
 */

function FieldWrap({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <label className="form-control flex w-full flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      {description && <span className="text-xs text-base-content/55">{description}</span>}
      {children}
    </label>
  )
}

export function TextField({
  label,
  description,
  value,
  onChange,
  placeholder,
}: {
  label: string
  description?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <FieldWrap label={label} description={description}>
      <input
        type="text"
        className="input input-bordered w-full"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldWrap>
  )
}

export function TextAreaField({
  label,
  description,
  value,
  onChange,
  rows = 4,
}: {
  label: string
  description?: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <FieldWrap label={label} description={description}>
      <textarea
        className="textarea textarea-bordered w-full leading-relaxed"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldWrap>
  )
}

export function NumberField({
  label,
  description,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  description?: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <FieldWrap label={label} description={description}>
      <input
        type="number"
        className="input input-bordered w-40"
        value={Number.isFinite(value) ? value : ''}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (Number.isFinite(n)) onChange(n)
        }}
      />
    </FieldWrap>
  )
}

export function ToggleField({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description?: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        className="toggle toggle-primary mt-1"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div>
        <span className="text-sm font-medium">{label}</span>
        {description && <p className="text-xs text-base-content/55">{description}</p>}
      </div>
    </div>
  )
}

export function SelectField({
  label,
  description,
  value,
  onChange,
  options,
}: {
  label: string
  description?: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <FieldWrap label={label} description={description}>
      <select
        className="select select-bordered w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  )
}
