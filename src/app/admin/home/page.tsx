'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AdminShell } from '@/admin/components/AdminShell'
import { SectionCard } from '@/admin/components/SectionCard'
import { TextField, TextAreaField, NumberField } from '@/admin/components/fields'
import { ImageListEditor } from '@/admin/components/ImageListEditor'
import { useContentFile, LoadingOrError } from '@/admin/useContentFile'
import type { MediaDoc } from '@/admin/media'

const HOME_GLOBAL = 'content/globals/home.json'
const HOME_MESSAGES = 'src/messages/th/Home.json'

type HomeGlobal = {
  heroMedia?: MediaDoc[] | null
  galleryMedia?: MediaDoc[] | null
  partners?: MediaDoc[] | null
  heroTitleFontSize?: number | null
  heroSubtitleFontSize?: number | null
  sectionTitleFontSize?: number | null
  highlightTitleFontSize?: number | null
  highlightBodyFontSize?: number | null
  cardTitleFontSize?: number | null
  cardBodyFontSize?: number | null
} & Record<string, unknown>

type HomeMessages = {
  Hero: {
    title_part1: string
    title_part2: string
    title_part3: string
    description: string
    contact_us: string
  }
  Product: { title: string } & Record<string, unknown>
  AboutCompany: { title: string; detail: string }
  Accomplishment: { button: string }
  ContactSection: { title1: string; title2: string }
} & Record<string, unknown>

type SaveFn<T> = (message: string, apply: (latest: T) => T) => Promise<void>

/** หน้าแรก — ต้นแบบของทุกหน้า admin: การ์ดเรียงบน→ล่างตรงตามเว็บจริง (spec §3) */
export default function AdminHomePage() {
  const global = useContentFile<HomeGlobal>(HOME_GLOBAL)
  const messages = useContentFile<HomeMessages>(HOME_MESSAGES)

  const loading = !global.data || !messages.data
  const error = global.error || messages.error

  return (
    <AdminShell active="home">
      <LoadingOrError error={error} loading={loading} />
      {global.data && messages.data && (
        <>
          <HeroImagesCard initial={global.data.heroMedia ?? []} save={global.saveFields} />
          <HeroTextCard initial={messages.data.Hero} save={messages.saveFields} />
          <PartnersCard initial={global.data.partners ?? []} save={global.saveFields} />

          <SectionCard
            order={4}
            title="ส่วนบริการ (การ์ด 5 ใบ)"
            description="การ์ดบริการทั้ง 5 ใบกลางหน้าแรก ดึงข้อมูลจากหน้า “บริการ” โดยตรง"
          >
            <Link href="/admin/services" className="btn btn-outline btn-sm w-fit">
              ไปแก้ที่หน้า บริการ →
            </Link>
          </SectionCard>

          <ProductTitleCard initial={messages.data.Product.title} save={messages.saveFields} />
          <AccomplishmentCard
            initial={messages.data.Accomplishment.button}
            save={messages.saveFields}
          />
          <AboutCompanyCard initial={messages.data.AboutCompany} save={messages.saveFields} />
          <ContactSectionCard initial={messages.data.ContactSection} save={messages.saveFields} />
          <GalleryCard initial={global.data.galleryMedia ?? []} save={global.saveFields} />
          <FontSizesCard data={global.data} save={global.saveFields} />
        </>
      )}
    </AdminShell>
  )
}

function HeroImagesCard({ initial, save }: { initial: MediaDoc[]; save: SaveFn<HomeGlobal> }) {
  const [items, setItems] = useState(initial)
  return (
    <SectionCard
      order={1}
      title="รูปแบนเนอร์ใหญ่ (Hero)"
      description="รูปสไลด์ขนาดใหญ่บนสุดของหน้าแรก หมุนเวียนตามลำดับในรายการนี้"
      onSave={() =>
        save('แก้ไขหน้าแรก: เปลี่ยนรูปแบนเนอร์', (latest) => ({ ...latest, heroMedia: items }))
      }
    >
      <ImageListEditor
        items={items}
        onChange={setItems}
        folder="hero-media"
        uploadCommitMessage="แก้ไขหน้าแรก: อัปโหลดรูปแบนเนอร์ใหม่"
      />
    </SectionCard>
  )
}

function HeroTextCard({
  initial,
  save,
}: {
  initial: HomeMessages['Hero']
  save: SaveFn<HomeMessages>
}) {
  const [hero, setHero] = useState(initial)
  const set = (k: keyof HomeMessages['Hero']) => (v: string) => setHero({ ...hero, [k]: v })
  return (
    <SectionCard
      order={2}
      title="ข้อความบนแบนเนอร์"
      description="หัวข้อใหญ่ 3 ท่อน คำอธิบาย และข้อความบนปุ่ม ที่ทับอยู่บนรูปแบนเนอร์"
      onSave={() =>
        save('แก้ไขหน้าแรก: ข้อความบนแบนเนอร์', (latest) => ({
          ...latest,
          Hero: { ...latest.Hero, ...hero },
        }))
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField
          label="หัวข้อท่อนที่ 1"
          description="เช่น “ก้าว”"
          value={hero.title_part1}
          onChange={set('title_part1')}
        />
        <TextField
          label="หัวข้อท่อนที่ 2"
          description="เช่น “ข้าม”"
          value={hero.title_part2}
          onChange={set('title_part2')}
        />
        <TextField
          label="หัวข้อท่อนที่ 3"
          description="เช่น “ขีดจำกัด”"
          value={hero.title_part3}
          onChange={set('title_part3')}
        />
      </div>
      <TextAreaField
        label="คำอธิบายใต้หัวข้อ"
        description="ข้อความบรรทัดเล็กใต้หัวข้อใหญ่บนแบนเนอร์"
        value={hero.description}
        onChange={set('description')}
        rows={2}
      />
      <TextField
        label="ข้อความบนปุ่ม"
        description="ปุ่มสีหลักบนแบนเนอร์ (กดแล้วไปหน้า ติดต่อเรา)"
        value={hero.contact_us}
        onChange={set('contact_us')}
      />
    </SectionCard>
  )
}

function PartnersCard({ initial, save }: { initial: MediaDoc[]; save: SaveFn<HomeGlobal> }) {
  const [items, setItems] = useState(initial)
  return (
    <SectionCard
      order={3}
      title="โลโก้พาร์ทเนอร์"
      description="แถบโลโก้บริษัทพาร์ทเนอร์ที่เลื่อนผ่านใต้แบนเนอร์ — แสดงตามลำดับในรายการนี้"
      onSave={() =>
        save('แก้ไขหน้าแรก: โลโก้พาร์ทเนอร์', (latest) => ({ ...latest, partners: items }))
      }
    >
      <ImageListEditor
        items={items}
        onChange={setItems}
        folder="partner-media"
        uploadCommitMessage="แก้ไขหน้าแรก: อัปโหลดโลโก้พาร์ทเนอร์ใหม่"
      />
    </SectionCard>
  )
}

function ProductTitleCard({ initial, save }: { initial: string; save: SaveFn<HomeMessages> }) {
  const [title, setTitle] = useState(initial)
  return (
    <SectionCard
      order={5}
      title="สินค้าของเรา"
      description="หัวข้อของส่วนแสดงหมวดสินค้ากลางหน้าแรก (ตัวสินค้าแก้ที่หน้า “สินค้า”)"
      onSave={() =>
        save('แก้ไขหน้าแรก: หัวข้อส่วนสินค้า', (latest) => ({
          ...latest,
          Product: { ...latest.Product, title },
        }))
      }
    >
      <TextField
        label="หัวข้อ section"
        description="ข้อความหัวเรื่องเหนือหมวดสินค้า เช่น “สินค้าของเรา”"
        value={title}
        onChange={setTitle}
      />
    </SectionCard>
  )
}

function AccomplishmentCard({ initial, save }: { initial: string; save: SaveFn<HomeMessages> }) {
  const [button, setButton] = useState(initial)
  return (
    <SectionCard
      order={6}
      title="ผลงาน (Accomplishment)"
      description="ส่วนแสดงบทความผลงานเด่นบนหน้าแรก (ตัวบทความแก้ที่หน้า “ผลงาน”)"
      onSave={() =>
        save('แก้ไขหน้าแรก: ปุ่มส่วนผลงาน', (latest) => ({
          ...latest,
          Accomplishment: { ...latest.Accomplishment, button },
        }))
      }
    >
      <TextField
        label="ข้อความปุ่ม “ดูทั้งหมด”"
        description="ปุ่มท้ายส่วนผลงาน กดแล้วไปหน้า ผลงาน"
        value={button}
        onChange={setButton}
      />
    </SectionCard>
  )
}

function AboutCompanyCard({
  initial,
  save,
}: {
  initial: HomeMessages['AboutCompany']
  save: SaveFn<HomeMessages>
}) {
  const [about, setAbout] = useState(initial)
  return (
    <SectionCard
      order={7}
      title="เกี่ยวกับบริษัท"
      description="กล่องแนะนำบริษัทช่วงล่างของหน้าแรก (มีปุ่มไปหน้า เกี่ยวกับเรา)"
      onSave={() =>
        save('แก้ไขหน้าแรก: ส่วนเกี่ยวกับบริษัท', (latest) => ({
          ...latest,
          AboutCompany: { ...latest.AboutCompany, ...about },
        }))
      }
    >
      <TextField
        label="ชื่อบริษัท"
        description="ชื่อเต็มที่แสดงเป็นหัวข้อของกล่องนี้"
        value={about.title}
        onChange={(v) => setAbout({ ...about, title: v })}
      />
      <TextAreaField
        label="รายละเอียดบริษัท"
        description="ย่อหน้าแนะนำบริษัทใต้ชื่อ"
        value={about.detail}
        onChange={(v) => setAbout({ ...about, detail: v })}
        rows={5}
      />
    </SectionCard>
  )
}

function ContactSectionCard({
  initial,
  save,
}: {
  initial: HomeMessages['ContactSection']
  save: SaveFn<HomeMessages>
}) {
  const [contact, setContact] = useState(initial)
  return (
    <SectionCard
      order={8}
      title="ส่วนติดต่อ + แผนที่"
      description="แถบชวนติดต่อพร้อมแผนที่ ท้ายหน้าแรก — ตัวแผนที่และข้อมูลติดต่อแก้ที่หน้า “ติดต่อเรา”"
      onSave={() =>
        save('แก้ไขหน้าแรก: ข้อความส่วนติดต่อ', (latest) => ({
          ...latest,
          ContactSection: { ...latest.ContactSection, ...contact },
        }))
      }
    >
      <TextField
        label="ข้อความบรรทัดที่ 1"
        value={contact.title1}
        onChange={(v) => setContact({ ...contact, title1: v })}
      />
      <TextField
        label="ข้อความบรรทัดที่ 2"
        value={contact.title2}
        onChange={(v) => setContact({ ...contact, title2: v })}
      />
    </SectionCard>
  )
}

function GalleryCard({ initial, save }: { initial: MediaDoc[]; save: SaveFn<HomeGlobal> }) {
  const [items, setItems] = useState(initial)
  return (
    <SectionCard
      order={9}
      title="แกลเลอรีรูปภาพ"
      description="ตารางรูปภาพผลงาน/บรรยากาศ ล่างสุดของหน้าแรก"
      onSave={() =>
        save('แก้ไขหน้าแรก: แกลเลอรีรูปภาพ', (latest) => ({ ...latest, galleryMedia: items }))
      }
    >
      <ImageListEditor
        items={items}
        onChange={setItems}
        folder="gallery-media"
        uploadCommitMessage="แก้ไขหน้าแรก: อัปโหลดรูปแกลเลอรีใหม่"
      />
    </SectionCard>
  )
}

/** ขนาดตัวอักษรของหน้าแรก — label/คำอธิบาย/ช่วงค่า ตรงกับของเดิมใน Payload */
const FONT_FIELDS = [
  {
    key: 'heroTitleFontSize',
    label: 'ขนาดหัวข้อบนแบนเนอร์ (px)',
    description: 'หัวข้อหลักบนแบนเนอร์ (หลายบรรทัด) ไม่รวมปุ่ม',
    fallback: 56,
    min: 32,
    max: 96,
  },
  {
    key: 'heroSubtitleFontSize',
    label: 'ขนาดคำอธิบายบนแบนเนอร์ (px)',
    description: 'คำอธิบายใต้หัวข้อ บนแบนเนอร์',
    fallback: 20,
    min: 14,
    max: 32,
  },
  {
    key: 'sectionTitleFontSize',
    label: 'ขนาดหัวข้อแต่ละส่วน (px)',
    description: 'หัวรายส่วนเช่น บริการ สินค้า ผลงาน แกลเลอรี ฯลฯ',
    fallback: 32,
    min: 20,
    max: 56,
  },
  {
    key: 'highlightTitleFontSize',
    label: 'ขนาดหัวข้อเนื้อหาเน้น (px)',
    description: 'หัวย่อยบล็อกเนื้อหา / รายละเอียด (เช่น เกี่ยวกับบริษัท)',
    fallback: 28,
    min: 20,
    max: 48,
  },
  {
    key: 'highlightBodyFontSize',
    label: 'ขนาดเนื้อหาเน้น (px)',
    description: 'เนื้อหายาวในบล็อกเน้น ไม่รวมป้ายเล็ก',
    fallback: 16,
    min: 14,
    max: 24,
  },
  {
    key: 'cardTitleFontSize',
    label: 'ขนาดหัวข้อบนการ์ด (px)',
    description: 'ชื่อบนการ์ดบริการ / สินค้า / ผลงาน ฯลฯ',
    fallback: 20,
    min: 16,
    max: 36,
  },
  {
    key: 'cardBodyFontSize',
    label: 'ขนาดเนื้อหาในการ์ด (px)',
    description: 'คำอธิบายย่อใต้หัวข้อบนการ์ดใหญ่',
    fallback: 14,
    min: 12,
    max: 22,
  },
] as const

function FontSizesCard({ data, save }: { data: HomeGlobal; save: SaveFn<HomeGlobal> }) {
  const [sizes, setSizes] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      FONT_FIELDS.map((f) => [f.key, (data[f.key] as number | null) ?? f.fallback]),
    ),
  )
  return (
    <SectionCard
      order={10}
      title="🔠 ขนาดตัวอักษรของหน้าแรก"
      description="ปรับขนาดตัวหนังสือส่วนต่างๆ ของหน้าแรก (หน่วยเป็นพิกเซล ใหญ่ขึ้น = ตัวโตขึ้น)"
      collapsible
      onSave={() => save('แก้ไขหน้าแรก: ขนาดตัวอักษร', (latest) => ({ ...latest, ...sizes }))}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FONT_FIELDS.map((f) => (
          <NumberField
            key={f.key}
            label={f.label}
            description={f.description}
            value={sizes[f.key]}
            min={f.min}
            max={f.max}
            onChange={(v) => setSizes({ ...sizes, [f.key]: v })}
          />
        ))}
      </div>
    </SectionCard>
  )
}
