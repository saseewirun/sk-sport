'use client'

import React, { useState } from 'react'
import { AdminShell } from '@/admin/components/AdminShell'
import { SectionCard } from '@/admin/components/SectionCard'
import { TextField, TextAreaField, NumberField, SelectField } from '@/admin/components/fields'
import { ImageListEditor } from '@/admin/components/ImageListEditor'
import { ImageField } from '@/admin/components/ImageField'
import { ItemList } from '@/admin/components/ItemList'
import { useContentFile, LoadingOrError } from '@/admin/useContentFile'
import { previewUrl, type MediaDoc } from '@/admin/media'

const SERVICES_HERO = 'content/globals/services-hero.json'
const SERVICES = 'content/collections/services.json'

type ServicesHero = {
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroMedia?: MediaDoc[] | null
} & Record<string, unknown>

type ServiceSection = {
  id?: string
  sectionTitle?: string | null
  description?: string | null
  variant: 'column' | 'row'
  image?: MediaDoc | null
  images?: { id?: string; image: MediaDoc }[] | null
  alignment?: 'left' | 'right' | null
}

type Service = {
  id: string
  title: string
  subtitle?: string | null
  hero?: MediaDoc | null
  slug: string
  sections?: ServiceSection[] | null
} & Record<string, unknown>

type SaveFn<T> = (message: string, apply: (latest: T) => T) => Promise<void>

export default function AdminServicesPage() {
  const hero = useContentFile<ServicesHero>(SERVICES_HERO)
  const services = useContentFile<Service[]>(SERVICES)

  return (
    <AdminShell active="services">
      <LoadingOrError error={hero.error || services.error} loading={!hero.data || !services.data} />
      {hero.data && services.data && (
        <>
          <HeroCard data={hero.data} save={hero.saveFields} />
          <ServiceListCard initial={services.data} save={services.saveFields} />
          <FontSizesCard data={hero.data} save={hero.saveFields} />
        </>
      )}
    </AdminShell>
  )
}

function HeroCard({ data, save }: { data: ServicesHero; save: SaveFn<ServicesHero> }) {
  const [title, setTitle] = useState(data.heroTitle ?? '')
  const [subtitle, setSubtitle] = useState(data.heroSubtitle ?? '')
  const [media, setMedia] = useState<MediaDoc[]>(data.heroMedia ?? [])
  return (
    <SectionCard
      order={1}
      title="แบนเนอร์หน้ารวมบริการ"
      description="แบนเนอร์บนสุดของหน้า บริการ"
      onSave={() =>
        save('แก้ไขบริการ: แบนเนอร์', (latest) => ({
          ...latest,
          heroTitle: title || null,
          heroSubtitle: subtitle || null,
          heroMedia: media,
        }))
      }
    >
      <TextField label="หัวข้อบนแบนเนอร์" value={title} onChange={setTitle} />
      <TextField label="คำอธิบายใต้หัวข้อ" value={subtitle} onChange={setSubtitle} />
      <ImageListEditor
        items={media}
        onChange={setMedia}
        folder="hero-media"
        uploadCommitMessage="แก้ไขบริการ: อัปโหลดรูปแบนเนอร์"
      />
    </SectionCard>
  )
}

function ServiceListCard({ initial, save }: { initial: Service[]; save: SaveFn<Service[]> }) {
  const [services, setServices] = useState(initial)
  const [openId, setOpenId] = useState<string | null>(null)

  function update(id: string, next: Partial<Service>) {
    setServices((list) => list.map((s) => (s.id === id ? { ...s, ...next } : s)))
  }

  return (
    <SectionCard
      order={2}
      title="รายการบริการ"
      description="บริการทั้งหมดที่แสดงบนหน้า บริการ และการ์ดบริการบนหน้าแรก — กดชื่อเพื่อแก้ไขรายตัว"
      onSave={() => save('แก้ไขบริการ: รายละเอียดบริการ', () => services)}
    >
      <ul className="flex flex-col gap-2">
        {services.map((s) => (
          <li key={s.id} className="rounded-lg border border-base-200">
            <button
              type="button"
              className="flex w-full items-center gap-3 p-2 text-left"
              onClick={() => setOpenId(openId === s.id ? null : s.id)}
            >
              {s.hero ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl(s.hero)}
                  alt={s.title}
                  className="h-12 w-20 shrink-0 rounded-md bg-base-200 object-cover"
                />
              ) : (
                <span className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md bg-base-200 text-xs text-base-content/40">
                  ไม่มีรูป
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{s.title}</span>
                <span className="block truncate text-xs text-base-content/50">{s.subtitle}</span>
              </span>
              <span className="btn btn-ghost btn-xs">{openId === s.id ? 'ปิด' : 'แก้ไข'}</span>
            </button>

            {openId === s.id && (
              <div className="flex flex-col gap-4 border-t border-base-200 p-3">
                <TextField
                  label="ชื่อบริการ"
                  value={s.title}
                  onChange={(v) => update(s.id, { title: v })}
                />
                <TextField
                  label="ชื่อรอง"
                  description="คำอธิบายสั้นใต้ชื่อ บนการ์ดและหน้ารายละเอียด"
                  value={s.subtitle ?? ''}
                  onChange={(v) => update(s.id, { subtitle: v })}
                />
                <ImageField
                  label="รูปแบนเนอร์ของบริการนี้"
                  description="รูปใหญ่บนหน้ารายละเอียดของบริการนี้ และบนการ์ด"
                  value={s.hero ?? null}
                  folder="service-media"
                  uploadCommitMessage={`แก้ไขบริการ: รูปแบนเนอร์ ${s.title}`}
                  onChange={(media) => update(s.id, { hero: media })}
                />
                <div>
                  <p className="text-sm font-medium">เนื้อหาของบริการ (เรียงบน→ล่าง)</p>
                  <p className="mb-2 text-xs text-base-content/55">
                    แต่ละหัวข้อ = 1 ช่วงบนหน้ารายละเอียด เลือกได้ว่าเป็นแบบแถว (รูป+ข้อความ)
                    หรือแบบตาราง (หลายรูป)
                  </p>
                  <ItemList
                    items={s.sections ?? []}
                    onChange={(sections) => update(s.id, { sections })}
                    addLabel="เพิ่มหัวข้อเนื้อหา"
                    makeNew={() => ({ sectionTitle: '', description: '', variant: 'row' as const })}
                    itemTitle={(sec, i) => sec.sectionTitle || `หัวข้อที่ ${i + 1}`}
                    renderItem={(sec, updateSec) => (
                      <>
                        <TextField
                          label="หัวข้อ"
                          value={sec.sectionTitle ?? ''}
                          onChange={(v) => updateSec({ ...sec, sectionTitle: v })}
                        />
                        <TextAreaField
                          label="คำอธิบาย"
                          value={sec.description ?? ''}
                          onChange={(v) => updateSec({ ...sec, description: v })}
                          rows={4}
                        />
                        <SelectField
                          label="รูปแบบการแสดงผล"
                          description="แบบแถว = รูปเดียวคู่ข้อความ • แบบตาราง = หลายรูปเรียงกัน"
                          value={sec.variant}
                          onChange={(v) => updateSec({ ...sec, variant: v as 'row' | 'column' })}
                          options={[
                            { value: 'row', label: 'แบบแถว (รูปภาพ + ข้อความ)' },
                            { value: 'column', label: 'แบบตาราง (กริดรูปภาพหลายรูป)' },
                          ]}
                        />
                        {sec.variant === 'row' ? (
                          <>
                            <ImageField
                              label="รูปภาพ"
                              value={sec.image ?? null}
                              folder="service-media"
                              uploadCommitMessage={`แก้ไขบริการ: รูปเนื้อหา ${s.title}`}
                              onChange={(media) => updateSec({ ...sec, image: media })}
                            />
                            <SelectField
                              label="ตำแหน่งรูปภาพ"
                              value={sec.alignment ?? 'left'}
                              onChange={(v) =>
                                updateSec({ ...sec, alignment: v as 'left' | 'right' })
                              }
                              options={[
                                { value: 'left', label: 'รูปอยู่ซ้าย ข้อความอยู่ขวา' },
                                { value: 'right', label: 'รูปอยู่ขวา ข้อความอยู่ซ้าย' },
                              ]}
                            />
                          </>
                        ) : (
                          <ImageListEditor
                            items={(sec.images ?? []).map((r) => r.image)}
                            folder="service-media"
                            uploadCommitMessage={`แก้ไขบริการ: รูปเนื้อหา ${s.title}`}
                            onChange={(list) =>
                              updateSec({ ...sec, images: list.map((image) => ({ image })) })
                            }
                          />
                        )}
                      </>
                    )}
                  />
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

const SERVICE_FONTS = [
  { key: 'heroTitleFontSize', label: 'ขนาดหัวข้อบนแบนเนอร์ (px)', fallback: 56 },
  { key: 'heroSubtitleFontSize', label: 'ขนาดคำอธิบายบนแบนเนอร์ (px)', fallback: 20 },
  { key: 'serviceCardTitleFontSize', label: 'ขนาดชื่อบนการ์ดบริการ (px)', fallback: 20 },
  { key: 'serviceCardBodyFontSize', label: 'ขนาดคำอธิบายบนการ์ดบริการ (px)', fallback: 14 },
  { key: 'detailHeroTitleFontSize', label: 'ขนาดชื่อบริการในหน้ารายละเอียด (px)', fallback: 40 },
  {
    key: 'detailContentTitleFontSize',
    label: 'ขนาดหัวข้อเนื้อหาในหน้ารายละเอียด (px)',
    fallback: 28,
  },
  { key: 'detailContentBodyFontSize', label: 'ขนาดเนื้อหาในหน้ารายละเอียด (px)', fallback: 16 },
  { key: 'relatedHeadingFontSize', label: 'ขนาดหัวข้อ “บริการอื่นๆ” (px)', fallback: 24 },
  { key: 'relatedItemTitleFontSize', label: 'ขนาดชื่อบริการอื่นๆ ด้านล่าง (px)', fallback: 18 },
] as const

function FontSizesCard({ data, save }: { data: ServicesHero; save: SaveFn<ServicesHero> }) {
  const [sizes, setSizes] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      SERVICE_FONTS.map((f) => [f.key, (data[f.key] as number | null) ?? f.fallback]),
    ),
  )
  return (
    <SectionCard
      order={3}
      title="🔠 ขนาดตัวอักษรของหน้านี้"
      description="ปรับขนาดตัวหนังสือของหน้า บริการ และหน้ารายละเอียดบริการ (พิกเซล)"
      collapsible
      onSave={() => save('แก้ไขบริการ: ขนาดตัวอักษร', (latest) => ({ ...latest, ...sizes }))}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SERVICE_FONTS.map((f) => (
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
