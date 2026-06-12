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
  heroTitleFontSize?: number | null
  heroSubtitleFontSize?: number | null
  questionFontSize?: number | null
  answerFontSize?: number | null
  bottomCtaTitleFontSize?: number | null
  bottomCtaBodyFontSize?: number | null
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
        </>
      )}
    </AdminShell>
  )
}

function HeaderCard({ data, save }: { data: FaqGlobal; save: SaveFn<FaqGlobal> }) {
  const [title, setTitle] = useState(data.heroTitle ?? '')
  const [subtitle, setSubtitle] = useState(data.heroSubtitle ?? '')
  const [heroTitleFontSize, setHeroTitleFontSize] = useState(data.heroTitleFontSize ?? 56)
  const [heroSubtitleFontSize, setHeroSubtitleFontSize] = useState(data.heroSubtitleFontSize ?? 20)
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
          heroTitleFontSize,
          heroSubtitleFontSize,
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
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="ขนาดหัวข้อหน้า (px)"
            value={heroTitleFontSize}
            onChange={setHeroTitleFontSize}
          />
          <NumberField
            label="ขนาดคำอธิบายหัวหน้า (px)"
            value={heroSubtitleFontSize}
            onChange={setHeroSubtitleFontSize}
          />
        </div>
      </div>
    </SectionCard>
  )
}

function ItemsCard({ data, save }: { data: FaqGlobal; save: SaveFn<FaqGlobal> }) {
  const [items, setItems] = useState<FaqItem[]>(data.faqItems ?? [])
  const [questionFontSize, setQuestionFontSize] = useState(data.questionFontSize ?? 18)
  const [answerFontSize, setAnswerFontSize] = useState(data.answerFontSize ?? 16)
  return (
    <SectionCard
      order={2}
      title="รายการคำถาม-คำตอบ"
      description="คำถามแสดงเรียงตามลำดับในรายการนี้ ทั้งบนหน้า FAQ และตัวช่วยตอบคำถามมุมเว็บ"
      onSave={() =>
        save('แก้ไข FAQ: คำถาม-คำตอบ', (latest) => ({
          ...latest,
          faqItems: items,
          questionFontSize,
          answerFontSize,
        }))
      }
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
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="ขนาดตัวคำถาม (px)"
            value={questionFontSize}
            onChange={setQuestionFontSize}
          />
          <NumberField
            label="ขนาดตัวคำตอบ (px)"
            value={answerFontSize}
            onChange={setAnswerFontSize}
          />
        </div>
      </div>
    </SectionCard>
  )
}

function CtaCard({ data, save }: { data: FaqGlobal; save: SaveFn<FaqGlobal> }) {
  const [body, setBody] = useState(data.bottomCtaBody ?? '')
  const [bottomCtaTitleFontSize, setBottomCtaTitleFontSize] = useState(
    data.bottomCtaTitleFontSize ?? 28,
  )
  const [bottomCtaBodyFontSize, setBottomCtaBodyFontSize] = useState(
    data.bottomCtaBodyFontSize ?? 16,
  )
  return (
    <SectionCard
      order={3}
      title="กล่องชวนติดต่อท้ายหน้า"
      description="กล่องล่างสุดของหน้า FAQ ที่ชวนให้ติดต่อเมื่อไม่พบคำตอบ"
      onSave={() =>
        save('แก้ไข FAQ: กล่องชวนติดต่อ', (latest) => ({
          ...latest,
          bottomCtaBody: body || null,
          bottomCtaTitleFontSize,
          bottomCtaBodyFontSize,
        }))
      }
    >
      <TextAreaField
        label="ข้อความในกล่อง"
        description="เว้นว่าง = ใช้ข้อความมาตรฐานของเว็บ"
        value={body}
        onChange={setBody}
        rows={2}
      />
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="ขนาดหัวข้อกล่องชวนติดต่อ (px)"
            value={bottomCtaTitleFontSize}
            onChange={setBottomCtaTitleFontSize}
          />
          <NumberField
            label="ขนาดข้อความกล่องชวนติดต่อ (px)"
            value={bottomCtaBodyFontSize}
            onChange={setBottomCtaBodyFontSize}
          />
        </div>
      </div>
    </SectionCard>
  )
}
