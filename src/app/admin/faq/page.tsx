'use client'

import React, { useState } from 'react'
import { AdminShell } from '@/admin/components/AdminShell'
import { SectionCard } from '@/admin/components/SectionCard'
import { TextField, TextAreaField, NumberField } from '@/admin/components/fields'
import { ItemList } from '@/admin/components/ItemList'
import { useContentFile, LoadingOrError } from '@/admin/useContentFile'

const FAQ = 'content/globals/faq.json'

type FaqItem = { id?: string; question: string; answer: string }

type FaqGlobal = {
  heroTitle?: string | null
  heroSubtitle?: string | null
  faqItems?: FaqItem[] | null
  bottomCtaBody?: string | null
} & Record<string, unknown>

type SaveFn<T> = (message: string, apply: (latest: T) => T) => Promise<void>

export default function AdminFaqPage() {
  const faq = useContentFile<FaqGlobal>(FAQ)

  return (
    <AdminShell active="faq">
      <LoadingOrError error={faq.error} loading={!faq.data} />
      {faq.data && (
        <>
          <HeaderCard data={faq.data} save={faq.saveFields} />
          <ItemsCard data={faq.data} save={faq.saveFields} />
          <CtaCard data={faq.data} save={faq.saveFields} />
          <FontSizesCard data={faq.data} save={faq.saveFields} />
        </>
      )}
    </AdminShell>
  )
}

function HeaderCard({ data, save }: { data: FaqGlobal; save: SaveFn<FaqGlobal> }) {
  const [title, setTitle] = useState(data.heroTitle ?? '')
  const [subtitle, setSubtitle] = useState(data.heroSubtitle ?? '')
  return (
    <SectionCard
      order={1}
      title="ข้อความหัวหน้า"
      description="หัวข้อใหญ่บนสุดของหน้า คำถามที่พบบ่อย"
      onSave={() =>
        save('แก้ไข FAQ: ข้อความหัวหน้า', (latest) => ({
          ...latest,
          heroTitle: title || null,
          heroSubtitle: subtitle || null,
        }))
      }
    >
      <TextField label="หัวข้อ" description="เช่น “FAQ”" value={title} onChange={setTitle} />
      <TextField
        label="คำอธิบายใต้หัวข้อ"
        description="เช่น “คำถามที่พบบ่อย”"
        value={subtitle}
        onChange={setSubtitle}
      />
    </SectionCard>
  )
}

function ItemsCard({ data, save }: { data: FaqGlobal; save: SaveFn<FaqGlobal> }) {
  const [items, setItems] = useState<FaqItem[]>(data.faqItems ?? [])
  return (
    <SectionCard
      order={2}
      title="รายการคำถาม-คำตอบ"
      description="คำถามแสดงเรียงตามลำดับในรายการนี้ ทั้งบนหน้า FAQ และตัวช่วยตอบคำถามมุมเว็บ"
      onSave={() => save('แก้ไข FAQ: คำถาม-คำตอบ', (latest) => ({ ...latest, faqItems: items }))}
    >
      <ItemList
        items={items}
        onChange={setItems}
        addLabel="เพิ่มคำถาม"
        makeNew={() => ({ question: '', answer: '' })}
        itemTitle={(it, i) => it.question || `คำถามที่ ${i + 1}`}
        renderItem={(it, update) => (
          <>
            <TextField
              label="คำถาม"
              value={it.question}
              onChange={(v) => update({ ...it, question: v })}
            />
            <TextAreaField
              label="คำตอบ"
              value={it.answer}
              onChange={(v) => update({ ...it, answer: v })}
              rows={3}
            />
          </>
        )}
      />
    </SectionCard>
  )
}

function CtaCard({ data, save }: { data: FaqGlobal; save: SaveFn<FaqGlobal> }) {
  const [body, setBody] = useState(data.bottomCtaBody ?? '')
  return (
    <SectionCard
      order={3}
      title="กล่องชวนติดต่อท้ายหน้า"
      description="กล่องล่างสุดของหน้า FAQ ที่ชวนให้ติดต่อเมื่อไม่พบคำตอบ"
      onSave={() =>
        save('แก้ไข FAQ: กล่องชวนติดต่อ', (latest) => ({ ...latest, bottomCtaBody: body || null }))
      }
    >
      <TextAreaField
        label="ข้อความในกล่อง"
        description="เว้นว่าง = ใช้ข้อความมาตรฐานของเว็บ"
        value={body}
        onChange={setBody}
        rows={2}
      />
    </SectionCard>
  )
}

const FAQ_FONTS = [
  { key: 'heroTitleFontSize', label: 'ขนาดหัวข้อหน้า (px)', fallback: 56 },
  { key: 'heroSubtitleFontSize', label: 'ขนาดคำอธิบายหัวหน้า (px)', fallback: 20 },
  { key: 'questionFontSize', label: 'ขนาดตัวคำถาม (px)', fallback: 18 },
  { key: 'answerFontSize', label: 'ขนาดตัวคำตอบ (px)', fallback: 16 },
  { key: 'bottomCtaTitleFontSize', label: 'ขนาดหัวข้อกล่องชวนติดต่อ (px)', fallback: 28 },
  { key: 'bottomCtaBodyFontSize', label: 'ขนาดข้อความกล่องชวนติดต่อ (px)', fallback: 16 },
] as const

function FontSizesCard({ data, save }: { data: FaqGlobal; save: SaveFn<FaqGlobal> }) {
  const [sizes, setSizes] = useState<Record<string, number>>(() =>
    Object.fromEntries(FAQ_FONTS.map((f) => [f.key, (data[f.key] as number | null) ?? f.fallback])),
  )
  return (
    <SectionCard
      order={4}
      title="🔠 ขนาดตัวอักษรของหน้านี้"
      description="ปรับขนาดตัวหนังสือของหน้า คำถามที่พบบ่อย (พิกเซล)"
      collapsible
      onSave={() => save('แก้ไข FAQ: ขนาดตัวอักษร', (latest) => ({ ...latest, ...sizes }))}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FAQ_FONTS.map((f) => (
          <NumberField
            key={f.key}
            label={f.label}
            value={sizes[f.key]}
            onChange={(v) => setSizes({ ...sizes, [f.key]: v })}
          />
        ))}
      </div>
    </SectionCard>
  )
}
