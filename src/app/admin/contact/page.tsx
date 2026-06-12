'use client'

import React, { useState } from 'react'
import { AdminShell } from '@/admin/components/AdminShell'
import { SectionCard } from '@/admin/components/SectionCard'
import { TextField, TextAreaField, NumberField } from '@/admin/components/fields'
import { ImageListEditor } from '@/admin/components/ImageListEditor'
import { useContentFile, LoadingOrError } from '@/admin/useContentFile'
import type { MediaDoc } from '@/admin/media'

const CONTACT_HERO = 'content/globals/contact-hero.json'
const SITE_CONTACT = 'content/globals/site-contact.json'

type ContactHero = {
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroMedia?: MediaDoc[] | null
  heroTitleFontSize?: number | null
  heroSubtitleFontSize?: number | null
  contactSectionTitleFontSize?: number | null
  contactInfoTitleFontSize?: number | null
  contactInfoBodyFontSize?: number | null
  formLabelFontSize?: number | null
  formInputFontSize?: number | null
} & Record<string, unknown>

type SiteContact = {
  phone: string
  email: string
  address: string
  mapEmbedSrc: string
  facebook?: string | null
  youtube?: string | null
  line?: string | null
} & Record<string, unknown>

type SaveFn<T> = (message: string, apply: (latest: T) => T) => Promise<void>

export default function AdminContactPage() {
  const hero = useContentFile<ContactHero>(CONTACT_HERO)
  const site = useContentFile<SiteContact>(SITE_CONTACT)

  return (
    <AdminShell active="contact">
      <LoadingOrError error={hero.error || site.error} loading={!hero.data || !site.data} />
      {hero.data && site.data && (
        <>
          <HeroCard data={hero.data} save={hero.saveFields} />
          <MapCard data={site.data} save={site.saveFields} />
          <ContactInfoCard
            data={site.data}
            save={site.saveFields}
            heroData={hero.data}
            saveHero={hero.saveFields}
          />
        </>
      )}
    </AdminShell>
  )
}

function HeroCard({ data, save }: { data: ContactHero; save: SaveFn<ContactHero> }) {
  const [title, setTitle] = useState(data.heroTitle ?? '')
  const [subtitle, setSubtitle] = useState(data.heroSubtitle ?? '')
  const [media, setMedia] = useState<MediaDoc[]>(data.heroMedia ?? [])
  const [heroTitleFontSize, setHeroTitleFontSize] = useState(data.heroTitleFontSize ?? 56)
  const [heroSubtitleFontSize, setHeroSubtitleFontSize] = useState(data.heroSubtitleFontSize ?? 20)
  return (
    <SectionCard
      order={1}
      title="แบนเนอร์ + ข้อความ"
      description="แบนเนอร์บนสุดของหน้า ติดต่อเรา"
      onSave={() =>
        save('แก้ไขติดต่อเรา: แบนเนอร์', (latest) => ({
          ...latest,
          heroTitle: title || null,
          heroSubtitle: subtitle || null,
          heroMedia: media,
          heroTitleFontSize,
          heroSubtitleFontSize,
        }))
      }
    >
      <TextField
        label="หัวข้อบนแบนเนอร์"
        description="เว้นว่าง = ใช้ข้อความมาตรฐานของเว็บ"
        value={title}
        onChange={setTitle}
      />
      <TextField label="คำอธิบายใต้หัวข้อ" value={subtitle} onChange={setSubtitle} />
      <ImageListEditor
        items={media}
        onChange={setMedia}
        folder="hero-media"
        uploadCommitMessage="แก้ไขติดต่อเรา: อัปโหลดรูปแบนเนอร์"
      />
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="ขนาดหัวข้อบนแบนเนอร์ (px)"
            value={heroTitleFontSize}
            onChange={setHeroTitleFontSize}
          />
          <NumberField
            label="ขนาดคำอธิบายบนแบนเนอร์ (px)"
            value={heroSubtitleFontSize}
            onChange={setHeroSubtitleFontSize}
          />
        </div>
      </div>
    </SectionCard>
  )
}

function MapCard({ data, save }: { data: SiteContact; save: SaveFn<SiteContact> }) {
  const [map, setMap] = useState(data.mapEmbedSrc ?? '')
  return (
    <SectionCard
      order={2}
      title="แผนที่ Google Map"
      description="แผนที่ที่แสดงบนหน้า ติดต่อเรา และส่วนติดต่อท้ายหน้าแรก"
      onSave={() =>
        save('แก้ไขติดต่อเรา: แผนที่ Google Map', (latest) => ({ ...latest, mapEmbedSrc: map }))
      }
    >
      <TextAreaField
        label="ลิงก์แผนที่ (Embed)"
        description={
          'วิธีเอาลิงก์: เปิด Google Maps → ค้นหาที่อยู่บริษัท → กดปุ่ม “แชร์” → เลือกแท็บ ' +
          '“ฝังแผนที่” → กด “คัดลอก HTML” แล้ววางทั้งหมดที่นี่ (ระบบดึงเฉพาะลิงก์ให้เอง)'
        }
        value={map}
        onChange={(v) => {
          // ลูกค้ามักวางทั้งแท็ก <iframe …> — ดึงเฉพาะค่าใน src ให้อัตโนมัติ
          const m = v.match(/src="([^"]+)"/)
          setMap(m ? m[1] : v.trim())
        }}
        rows={4}
      />
      {map && (
        <iframe
          title="ตัวอย่างแผนที่"
          src={map}
          className="h-56 w-full rounded-lg border border-base-200"
          loading="lazy"
        />
      )}
    </SectionCard>
  )
}

function ContactInfoCard({
  data,
  save,
  heroData,
  saveHero,
}: {
  data: SiteContact
  save: SaveFn<SiteContact>
  heroData: ContactHero
  saveHero: SaveFn<ContactHero>
}) {
  const [info, setInfo] = useState({
    phone: data.phone ?? '',
    email: data.email ?? '',
    address: data.address ?? '',
    facebook: data.facebook ?? '',
    youtube: data.youtube ?? '',
    line: data.line ?? '',
  })
  const set = (k: keyof typeof info) => (v: string) => setInfo({ ...info, [k]: v })
  const [contactSectionTitleFontSize, setContactSectionTitleFontSize] = useState(
    heroData.contactSectionTitleFontSize ?? 32,
  )
  const [contactInfoTitleFontSize, setContactInfoTitleFontSize] = useState(
    heroData.contactInfoTitleFontSize ?? 20,
  )
  const [contactInfoBodyFontSize, setContactInfoBodyFontSize] = useState(
    heroData.contactInfoBodyFontSize ?? 16,
  )
  const [formLabelFontSize, setFormLabelFontSize] = useState(heroData.formLabelFontSize ?? 14)
  const [formInputFontSize, setFormInputFontSize] = useState(heroData.formInputFontSize ?? 16)
  return (
    <SectionCard
      order={3}
      title="ข้อมูลติดต่อ"
      description="เบอร์ อีเมล ที่อยู่ และโซเชียล — แสดงบนหน้า ติดต่อเรา และท้ายเว็บทุกหน้า"
      onSave={async () => {
        await save('แก้ไขติดต่อเรา: ข้อมูลติดต่อ', (latest) => ({
          ...latest,
          phone: info.phone,
          email: info.email,
          address: info.address,
          facebook: info.facebook || null,
          youtube: info.youtube || null,
          line: info.line || null,
        }))
        await saveHero('แก้ไขติดต่อเรา: ขนาดตัวอักษรส่วนติดต่อ', (latest) => ({
          ...latest,
          contactSectionTitleFontSize,
          contactInfoTitleFontSize,
          contactInfoBodyFontSize,
          formLabelFontSize,
          formInputFontSize,
        }))
      }}
    >
      <TextField label="เบอร์โทรศัพท์" value={info.phone} onChange={set('phone')} />
      <TextField label="อีเมล" value={info.email} onChange={set('email')} />
      <TextAreaField label="ที่อยู่" value={info.address} onChange={set('address')} rows={2} />
      <TextField
        label="ลิงก์ Facebook"
        description="เว้นว่าง = ซ่อนไอคอน Facebook"
        value={info.facebook}
        onChange={set('facebook')}
      />
      <TextField
        label="ลิงก์ YouTube"
        description="เว้นว่าง = ซ่อนไอคอน YouTube"
        value={info.youtube}
        onChange={set('youtube')}
      />
      <TextField
        label="ลิงก์ LINE"
        description="เว้นว่าง = ซ่อนไอคอน LINE"
        value={info.line}
        onChange={set('line')}
      />
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="ขนาดหัวข้อส่วนติดต่อ (px)"
            value={contactSectionTitleFontSize}
            onChange={setContactSectionTitleFontSize}
          />
          <NumberField
            label="ขนาดหัวข้อข้อมูลติดต่อ (px)"
            value={contactInfoTitleFontSize}
            onChange={setContactInfoTitleFontSize}
          />
          <NumberField
            label="ขนาดเนื้อหาข้อมูลติดต่อ (px)"
            value={contactInfoBodyFontSize}
            onChange={setContactInfoBodyFontSize}
          />
          <NumberField
            label="ขนาดป้ายช่องกรอกฟอร์ม (px)"
            value={formLabelFontSize}
            onChange={setFormLabelFontSize}
          />
          <NumberField
            label="ขนาดตัวอักษรในช่องกรอก (px)"
            value={formInputFontSize}
            onChange={setFormInputFontSize}
          />
        </div>
      </div>
    </SectionCard>
  )
}
