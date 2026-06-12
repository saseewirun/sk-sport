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
  servicesTitleFontSize?: number | null
  productsTitleFontSize?: number | null
  accomplishmentTitleFontSize?: number | null
  aboutButtonFontSize?: number | null
  contactSectionTitleFontSize?: number | null
} & Record<string, unknown>

type HomeMessages = {
  Hero: {
    title_part1: string
    title_part2: string
    title_part3: string
    description: string
    contact_us: string
  }
  Services: { title: string; tagline: string }
  Product: { title: string } & Record<string, unknown>
  AboutCompany: { title: string; detail: string; button: string }
  Accomplishment: { title: string; button: string }
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
          <HeroTextCard
            initial={messages.data.Hero}
            save={messages.saveFields}
            globalData={global.data}
            saveGlobal={global.saveFields}
          />
          <PartnersCard initial={global.data.partners ?? []} save={global.saveFields} />

          <ServicesCard
            initial={messages.data.Services}
            save={messages.saveFields}
            globalData={global.data}
            saveGlobal={global.saveFields}
          />

          <ProductTitleCard
            initial={messages.data.Product.title}
            save={messages.saveFields}
            globalData={global.data}
            saveGlobal={global.saveFields}
          />
          <AccomplishmentCard
            initial={messages.data.Accomplishment}
            save={messages.saveFields}
            globalData={global.data}
            saveGlobal={global.saveFields}
          />
          <AboutCompanyCard
            initial={messages.data.AboutCompany}
            save={messages.saveFields}
            globalData={global.data}
            saveGlobal={global.saveFields}
          />
          <ContactSectionCard
            initial={messages.data.ContactSection}
            save={messages.saveFields}
            globalData={global.data}
            saveGlobal={global.saveFields}
          />
          <GalleryCard
            initial={global.data.galleryMedia ?? []}
            globalData={global.data}
            save={global.saveFields}
          />
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
  globalData,
  saveGlobal,
}: {
  initial: HomeMessages['Hero']
  save: SaveFn<HomeMessages>
  globalData: HomeGlobal
  saveGlobal: SaveFn<HomeGlobal>
}) {
  const [hero, setHero] = useState(initial)
  const set = (k: keyof HomeMessages['Hero']) => (v: string) => setHero({ ...hero, [k]: v })
  const [heroTitleFontSize, setHeroTitleFontSize] = useState(
    (globalData.heroTitleFontSize as number | null) ?? 56,
  )
  const [heroSubtitleFontSize, setHeroSubtitleFontSize] = useState(
    (globalData.heroSubtitleFontSize as number | null) ?? 20,
  )
  return (
    <SectionCard
      order={2}
      title="ข้อความบนแบนเนอร์"
      description="หัวข้อใหญ่ 3 ท่อน คำอธิบาย และข้อความบนปุ่ม ที่ทับอยู่บนรูปแบนเนอร์"
      onSave={async () => {
        await save('แก้ไขหน้าแรก: ข้อความบนแบนเนอร์', (latest) => ({
          ...latest,
          Hero: { ...latest.Hero, ...hero },
        }))
        await saveGlobal('แก้ไขหน้าแรก: ขนาดตัวอักษรแบนเนอร์', (latest) => ({
          ...latest,
          heroTitleFontSize,
          heroSubtitleFontSize,
        }))
      }}
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
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="ขนาดหัวข้อบนแบนเนอร์ (px)"
            description="หัวข้อหลักบนแบนเนอร์ (หลายบรรทัด) ไม่รวมปุ่ม"
            value={heroTitleFontSize}
            min={32}
            max={96}
            onChange={setHeroTitleFontSize}
          />
          <NumberField
            label="ขนาดคำอธิบายบนแบนเนอร์ (px)"
            description="คำอธิบายใต้หัวข้อ บนแบนเนอร์"
            value={heroSubtitleFontSize}
            min={14}
            max={32}
            onChange={setHeroSubtitleFontSize}
          />
        </div>
      </div>
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

function ServicesCard({
  initial,
  save,
  globalData,
  saveGlobal,
}: {
  initial: HomeMessages['Services']
  save: SaveFn<HomeMessages>
  globalData: HomeGlobal
  saveGlobal: SaveFn<HomeGlobal>
}) {
  const [services, setServices] = useState(initial)
  const [servicesTitleFontSize, setServicesTitleFontSize] = useState(
    (globalData.servicesTitleFontSize as number | null) ?? 32,
  )
  return (
    <SectionCard
      order={4}
      title="ส่วนบริการ (การ์ด 5 ใบ)"
      description="การ์ดบริการทั้ง 5 ใบกลางหน้าแรก ดึงข้อมูลจากหน้า “บริการ” โดยตรง"
      onSave={async () => {
        await save('แก้ไขหน้าแรก: หัวข้อส่วนบริการ', (latest) => ({
          ...latest,
          Services: { ...latest.Services, ...services },
        }))
        await saveGlobal('แก้ไขหน้าแรก: ขนาดหัวข้อส่วนบริการ', (latest) => ({
          ...latest,
          servicesTitleFontSize,
        }))
      }}
    >
      <TextField
        label="หัวข้อ section"
        description="หัวข้อใหญ่เหนือการ์ดบริการ เช่น “Our Services”"
        value={services.title}
        onChange={(v) => setServices({ ...services, title: v })}
      />
      <TextField
        label="คำโปรย (tagline)"
        description="ข้อความบรรทัดเล็กใต้หัวข้อส่วนบริการ"
        value={services.tagline}
        onChange={(v) => setServices({ ...services, tagline: v })}
      />
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <NumberField
          label="ขนาดหัวข้อส่วนบริการ (px)"
          description="หัวข้อใหญ่ของส่วนบริการ"
          value={servicesTitleFontSize}
          min={20}
          max={56}
          onChange={setServicesTitleFontSize}
        />
      </div>
      <Link href="/admin/services" className="btn btn-outline btn-sm w-fit">
        ไปแก้ที่หน้า บริการ →
      </Link>
    </SectionCard>
  )
}

function ProductTitleCard({
  initial,
  save,
  globalData,
  saveGlobal,
}: {
  initial: string
  save: SaveFn<HomeMessages>
  globalData: HomeGlobal
  saveGlobal: SaveFn<HomeGlobal>
}) {
  const [title, setTitle] = useState(initial)
  const [productsTitleFontSize, setProductsTitleFontSize] = useState(
    (globalData.productsTitleFontSize as number | null) ?? 32,
  )
  return (
    <SectionCard
      order={5}
      title="สินค้าของเรา"
      description="หัวข้อของส่วนแสดงหมวดสินค้ากลางหน้าแรก (ตัวสินค้าแก้ที่หน้า “สินค้า”)"
      onSave={async () => {
        await save('แก้ไขหน้าแรก: หัวข้อส่วนสินค้า', (latest) => ({
          ...latest,
          Product: { ...latest.Product, title },
        }))
        await saveGlobal('แก้ไขหน้าแรก: ขนาดหัวข้อส่วนสินค้า', (latest) => ({
          ...latest,
          productsTitleFontSize,
        }))
      }}
    >
      <TextField
        label="หัวข้อ section"
        description="ข้อความหัวเรื่องเหนือหมวดสินค้า เช่น “สินค้าของเรา”"
        value={title}
        onChange={setTitle}
      />
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <NumberField
          label="ขนาดหัวข้อส่วนสินค้า (px)"
          description="หัวข้อใหญ่ของส่วนสินค้า"
          value={productsTitleFontSize}
          min={20}
          max={56}
          onChange={setProductsTitleFontSize}
        />
      </div>
      <Link href="/admin/products" className="btn btn-outline btn-sm w-fit">
        ไปแก้รายการสินค้าที่หน้า สินค้า →
      </Link>
    </SectionCard>
  )
}

function AccomplishmentCard({
  initial,
  save,
  globalData,
  saveGlobal,
}: {
  initial: HomeMessages['Accomplishment']
  save: SaveFn<HomeMessages>
  globalData: HomeGlobal
  saveGlobal: SaveFn<HomeGlobal>
}) {
  const [accomplishment, setAccomplishment] = useState(initial)
  const [accomplishmentTitleFontSize, setAccomplishmentTitleFontSize] = useState(
    (globalData.accomplishmentTitleFontSize as number | null) ?? 32,
  )
  return (
    <SectionCard
      order={6}
      title="ผลงาน (Accomplishment)"
      description="ส่วนแสดงบทความผลงานเด่นบนหน้าแรก (ตัวบทความแก้ที่หน้า “ผลงาน”)"
      onSave={async () => {
        await save('แก้ไขหน้าแรก: ส่วนผลงาน', (latest) => ({
          ...latest,
          Accomplishment: { ...latest.Accomplishment, ...accomplishment },
        }))
        await saveGlobal('แก้ไขหน้าแรก: ขนาดหัวข้อส่วนผลงาน', (latest) => ({
          ...latest,
          accomplishmentTitleFontSize,
        }))
      }}
    >
      <TextField
        label="หัวข้อ section"
        description="หัวข้อใหญ่ของส่วนผลงาน เช่น “Our Company’s Accomplishments”"
        value={accomplishment.title}
        onChange={(v) => setAccomplishment({ ...accomplishment, title: v })}
      />
      <TextField
        label="ข้อความปุ่ม “ดูทั้งหมด”"
        description="ปุ่มท้ายส่วนผลงาน กดแล้วไปหน้า ผลงาน"
        value={accomplishment.button}
        onChange={(v) => setAccomplishment({ ...accomplishment, button: v })}
      />
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <NumberField
          label="ขนาดหัวข้อส่วนผลงาน (px)"
          description="หัวข้อใหญ่ของส่วนผลงาน"
          value={accomplishmentTitleFontSize}
          min={20}
          max={56}
          onChange={setAccomplishmentTitleFontSize}
        />
      </div>
      <Link href="/admin/portfolio" className="btn btn-outline btn-sm w-fit">
        ไปแก้บทความผลงานที่หน้า ผลงาน →
      </Link>
    </SectionCard>
  )
}

function AboutCompanyCard({
  initial,
  save,
  globalData,
  saveGlobal,
}: {
  initial: HomeMessages['AboutCompany']
  save: SaveFn<HomeMessages>
  globalData: HomeGlobal
  saveGlobal: SaveFn<HomeGlobal>
}) {
  const [about, setAbout] = useState(initial)
  const [highlightTitleFontSize, setHighlightTitleFontSize] = useState(
    (globalData.highlightTitleFontSize as number | null) ?? 28,
  )
  const [highlightBodyFontSize, setHighlightBodyFontSize] = useState(
    (globalData.highlightBodyFontSize as number | null) ?? 16,
  )
  const [aboutButtonFontSize, setAboutButtonFontSize] = useState(
    (globalData.aboutButtonFontSize as number | null) ?? 16,
  )
  return (
    <SectionCard
      order={7}
      title="เกี่ยวกับบริษัท"
      description="กล่องแนะนำบริษัทช่วงล่างของหน้าแรก (มีปุ่มไปหน้า เกี่ยวกับเรา)"
      onSave={async () => {
        await save('แก้ไขหน้าแรก: ส่วนเกี่ยวกับบริษัท', (latest) => ({
          ...latest,
          AboutCompany: { ...latest.AboutCompany, ...about },
        }))
        await saveGlobal('แก้ไขหน้าแรก: ขนาดตัวอักษรส่วนเกี่ยวกับบริษัท', (latest) => ({
          ...latest,
          highlightTitleFontSize,
          highlightBodyFontSize,
          aboutButtonFontSize,
        }))
      }}
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
      <TextField
        label="ข้อความบนปุ่ม"
        description="ปุ่มในกล่องนี้ กดแล้วไปหน้า เกี่ยวกับเรา (เช่น “About Us”)"
        value={about.button}
        onChange={(v) => setAbout({ ...about, button: v })}
      />
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="ขนาดหัวข้อเนื้อหาเน้น (px)"
            description="หัวย่อยบล็อกเนื้อหา / รายละเอียด (เช่น เกี่ยวกับบริษัท)"
            value={highlightTitleFontSize}
            min={20}
            max={48}
            onChange={setHighlightTitleFontSize}
          />
          <NumberField
            label="ขนาดเนื้อหาเน้น (px)"
            description="เนื้อหายาวในบล็อกเน้น ไม่รวมป้ายเล็ก"
            value={highlightBodyFontSize}
            min={14}
            max={24}
            onChange={setHighlightBodyFontSize}
          />
          <NumberField
            label="ขนาดข้อความบนปุ่ม (px)"
            description="ขนาดตัวอักษรบนปุ่มในกล่องนี้"
            value={aboutButtonFontSize}
            min={12}
            max={24}
            onChange={setAboutButtonFontSize}
          />
        </div>
      </div>
    </SectionCard>
  )
}

function ContactSectionCard({
  initial,
  save,
  globalData,
  saveGlobal,
}: {
  initial: HomeMessages['ContactSection']
  save: SaveFn<HomeMessages>
  globalData: HomeGlobal
  saveGlobal: SaveFn<HomeGlobal>
}) {
  const [contact, setContact] = useState(initial)
  const [contactSectionTitleFontSize, setContactSectionTitleFontSize] = useState(
    (globalData.contactSectionTitleFontSize as number | null) ?? 32,
  )
  return (
    <SectionCard
      order={8}
      title="ส่วนติดต่อ + แผนที่"
      description="แถบชวนติดต่อพร้อมแผนที่ ท้ายหน้าแรก — ตัวแผนที่และข้อมูลติดต่อแก้ที่หน้า “ติดต่อเรา”"
      onSave={async () => {
        await save('แก้ไขหน้าแรก: ข้อความส่วนติดต่อ', (latest) => ({
          ...latest,
          ContactSection: { ...latest.ContactSection, ...contact },
        }))
        await saveGlobal('แก้ไขหน้าแรก: ขนาดหัวข้อส่วนติดต่อ', (latest) => ({
          ...latest,
          contactSectionTitleFontSize,
        }))
      }}
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
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <NumberField
          label="ขนาดหัวข้อส่วนติดต่อ (px)"
          description="หัวข้อใหญ่ของส่วนติดต่อ + แผนที่"
          value={contactSectionTitleFontSize}
          min={20}
          max={56}
          onChange={setContactSectionTitleFontSize}
        />
      </div>
    </SectionCard>
  )
}

const HOME_SHARED_FONTS = [
  {
    key: 'sectionTitleFontSize',
    label: 'ขนาดหัวข้อแต่ละส่วน (px)',
    description: 'หัวรายส่วนเช่น บริการ สินค้า ผลงาน แกลเลอรี ฯลฯ',
    fallback: 32,
    min: 20,
    max: 56,
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

function GalleryCard({
  initial,
  globalData,
  save,
}: {
  initial: MediaDoc[]
  globalData: HomeGlobal
  save: SaveFn<HomeGlobal>
}) {
  const [items, setItems] = useState(initial)
  const [sizes, setSizes] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      HOME_SHARED_FONTS.map((f) => [f.key, (globalData[f.key] as number | null) ?? f.fallback]),
    ),
  )
  return (
    <SectionCard
      order={9}
      title="แกลเลอรีรูปภาพ"
      description="ตารางรูปภาพผลงาน/บรรยากาศ ล่างสุดของหน้าแรก"
      onSave={() =>
        save('แก้ไขหน้าแรก: แกลเลอรีรูปภาพ', (latest) => ({
          ...latest,
          galleryMedia: items,
          ...sizes,
        }))
      }
    >
      <ImageListEditor
        items={items}
        onChange={setItems}
        folder="gallery-media"
        uploadCommitMessage="แก้ไขหน้าแรก: อัปโหลดรูปแกลเลอรีใหม่"
      />
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">
          🔠 ขนาดตัวอักษร (ใช้ร่วมหัวข้อ section + การ์ดทั้งหน้า)
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {HOME_SHARED_FONTS.map((f) => (
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
      </div>
    </SectionCard>
  )
}
