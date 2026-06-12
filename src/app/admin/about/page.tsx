'use client'

import React, { useState } from 'react'
import { AdminShell } from '@/admin/components/AdminShell'
import { SectionCard } from '@/admin/components/SectionCard'
import { TextField, TextAreaField, NumberField, ToggleField } from '@/admin/components/fields'
import { ImageListEditor } from '@/admin/components/ImageListEditor'
import { ImageField } from '@/admin/components/ImageField'
import { ItemList } from '@/admin/components/ItemList'
import { useContentFile, LoadingOrError } from '@/admin/useContentFile'
import { thaiSafeSlug, uniqueSlug } from '@/admin/slug'
import type { MediaDoc } from '@/admin/media'

const ABOUT_HERO = 'content/globals/about-hero.json'
const ABOUT = 'content/globals/about.json'
const FOUNDERS = 'content/collections/founders.json'

type AboutHero = {
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroMedia?: MediaDoc[] | null
  heroTitleFontSize?: number | null
  heroSubtitleFontSize?: number | null
} & Record<string, unknown>

type Highlight = { id?: string; value: string; label: string }
type HistoryCard = { id?: string; title: string; description: string }
type YoutubeVideo = { id?: string; title?: string | null; youtubeUrl: string }

/** ค่าเริ่มต้นของการ์ดประวัติ — ตรงกับ INTRO_CARDS บนหน้าจริง เพื่อให้หน้าเว็บไม่เปลี่ยนจนกว่าจะแก้ */
const DEFAULT_HISTORY_CARDS: HistoryCard[] = [
  {
    title: 'Authorized Global Brands',
    description:
      'Official distributor in Thailand for leading international sports science and equipment brands across gymnastics, athletics, basketball, outdoor fitness, and performance assessment.',
  },
  {
    title: 'Founder-Led Experience',
    description:
      'Led by Dr. Sasiwiral Kaenchanhom, a former Thai national athlete with deep experience in elite sport, management, and performance-focused organizations.',
  },
  {
    title: 'Science-Driven Expertise',
    description:
      'Built on sports science knowledge, practical field experience, and long-term partnerships with global manufacturers and trusted institutions.',
  },
  {
    title: 'Beyond Equipment',
    description:
      'Part of the United Group network, with extended capabilities in sports tourism and international field-trip programs through United Discovery Co., Ltd.',
  },
]

type AboutGlobal = {
  historySectionTitle?: string | null
  companyName?: string | null
  historyDescription?: string | null
  historyHighlights?: Highlight[] | null
  historyCards?: HistoryCard[] | null
  missionTitle?: string | null
  missionDescription?: string | null
  visionTitle?: string | null
  visionDescription?: string | null
  videoSectionTitle?: string | null
  youtubeVideos?: YoutubeVideo[] | null
} & Record<string, unknown>

/** สมาชิกทีมใช้รูปแบบ {relationTo, value} ตามที่ Payload export ไว้ */
type PolyMedia = { relationTo: string; value: MediaDoc }

type Founder = {
  id: string
  name: string
  slug?: string | null
  role?: string | null
  excerpt?: string | null
  description?: string | null
  quote?: string | null
  aboutImage?: PolyMedia | null
  gallery?: PolyMedia[] | null
  sortOrder?: number | null
  isVisible?: boolean | null
  createdAt?: string
  updatedAt?: string
} & Record<string, unknown>

type SaveFn<T> = (message: string, apply: (latest: T) => T) => Promise<void>

export default function AdminAboutPage() {
  const hero = useContentFile<AboutHero>(ABOUT_HERO)
  const about = useContentFile<AboutGlobal>(ABOUT)
  const founders = useContentFile<Founder[]>(FOUNDERS)

  const loading = !hero.data || !about.data || !founders.data
  const error = hero.error || about.error || founders.error

  return (
    <AdminShell active="about">
      <LoadingOrError error={error} loading={loading} />
      {hero.data && about.data && founders.data && (
        <>
          <HeroCard data={hero.data} save={hero.saveFields} />
          <HistoryCard data={about.data} save={about.saveFields} />
          <MissionVisionCard data={about.data} save={about.saveFields} />
          <VideosCard data={about.data} save={about.saveFields} />
          <TeamCard
            initial={founders.data}
            save={founders.saveFields}
            about={about.data}
            saveAbout={about.saveFields}
          />
        </>
      )}
    </AdminShell>
  )
}

function HeroCard({ data, save }: { data: AboutHero; save: SaveFn<AboutHero> }) {
  const [title, setTitle] = useState(data.heroTitle ?? '')
  const [subtitle, setSubtitle] = useState(data.heroSubtitle ?? '')
  const [media, setMedia] = useState<MediaDoc[]>(data.heroMedia ?? [])
  const [heroTitleFontSize, setHeroTitleFontSize] = useState(data.heroTitleFontSize ?? 56)
  const [heroSubtitleFontSize, setHeroSubtitleFontSize] = useState(data.heroSubtitleFontSize ?? 20)
  return (
    <SectionCard
      order={1}
      title="รูป + ข้อความแบนเนอร์"
      description="แบนเนอร์ใหญ่บนสุดของหน้า เกี่ยวกับเรา"
      onSave={() =>
        save('แก้ไขเกี่ยวกับเรา: แบนเนอร์', (latest) => ({
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
        description="ข้อความใหญ่ทับบนรูป (เว้นว่าง = ใช้ข้อความมาตรฐานของเว็บ)"
        value={title}
        onChange={setTitle}
      />
      <TextField label="คำอธิบายใต้หัวข้อ" value={subtitle} onChange={setSubtitle} />
      <ImageListEditor
        items={media}
        onChange={setMedia}
        folder="hero-media"
        uploadCommitMessage="แก้ไขเกี่ยวกับเรา: อัปโหลดรูปแบนเนอร์"
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

function HistoryCard({ data, save }: { data: AboutGlobal; save: SaveFn<AboutGlobal> }) {
  const [title, setTitle] = useState(data.historySectionTitle ?? '')
  const [company, setCompany] = useState(data.companyName ?? '')
  const [desc, setDesc] = useState(data.historyDescription ?? '')
  const [highlights, setHighlights] = useState<Highlight[]>(data.historyHighlights ?? [])
  const [cards, setCards] = useState<HistoryCard[]>(
    data.historyCards && data.historyCards.length > 0
      ? data.historyCards.map((c) => ({ title: c.title ?? '', description: c.description ?? '' }))
      : DEFAULT_HISTORY_CARDS,
  )
  const [sectionTitleFontSize, setSectionTitleFontSize] = useState(
    (data.sectionTitleFontSize as number | null) ?? 32,
  )
  const [statNumberFontSize, setStatNumberFontSize] = useState(
    (data.statNumberFontSize as number | null) ?? 28,
  )
  const [statLabelFontSize, setStatLabelFontSize] = useState(
    (data.statLabelFontSize as number | null) ?? 14,
  )
  return (
    <SectionCard
      order={2}
      title="ประวัติบริษัท"
      description="ส่วนเล่าเรื่องบริษัท พร้อมกล่องตัวเลขสถิติ ใต้แบนเนอร์"
      onSave={() =>
        save('แก้ไขเกี่ยวกับเรา: ประวัติบริษัท', (latest) => ({
          ...latest,
          historySectionTitle: title || null,
          companyName: company || null,
          historyDescription: desc || null,
          historyHighlights: highlights,
          historyCards: cards,
          sectionTitleFontSize,
          statNumberFontSize,
          statLabelFontSize,
        }))
      }
    >
      <TextField
        label="หัวข้อส่วนนี้"
        description="เช่น “เกี่ยวกับเรา Our Story”"
        value={title}
        onChange={setTitle}
      />
      <TextField label="ชื่อบริษัท" value={company} onChange={setCompany} />
      <TextAreaField label="คำบรรยายประวัติบริษัท" value={desc} onChange={setDesc} rows={6} />
      <div>
        <p className="text-sm font-medium">การ์ดแนะนำ 4 ใบ</p>
        <p className="mb-2 text-xs text-base-content/55">
          การ์ด 4 ใบที่แสดงใต้หัวข้อ “About Us” บนหน้าจริง — แก้หัวข้อและเนื้อหาของแต่ละใบได้
        </p>
        <div className="flex flex-col gap-3">
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-lg border border-base-200 bg-base-50 p-3"
            >
              <p className="text-xs font-semibold text-base-content/60">การ์ดที่ {i + 1}</p>
              <TextField
                label="หัวข้อการ์ด"
                value={card.title}
                onChange={(v) => setCards(cards.map((c, j) => (i === j ? { ...c, title: v } : c)))}
              />
              <TextAreaField
                label="เนื้อหาการ์ด"
                value={card.description}
                onChange={(v) =>
                  setCards(cards.map((c, j) => (i === j ? { ...c, description: v } : c)))
                }
                rows={3}
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium">กล่องสถิติ</p>
        <p className="mb-2 text-xs text-base-content/55">
          ตัวเลขเด่นใต้คำบรรยาย เช่น ปีที่ก่อตั้ง จำนวนโครงการ (ตัวเลข + ป้ายกำกับ)
        </p>
        <ItemList
          items={highlights}
          onChange={setHighlights}
          addLabel="เพิ่มกล่องสถิติ"
          makeNew={() => ({ value: '', label: '' })}
          itemTitle={(h, i) => h.value || `กล่องที่ ${i + 1}`}
          renderItem={(h, update) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField
                label="ตัวเลข"
                description="เช่น 2015 หรือ 100+"
                value={h.value}
                onChange={(v) => update({ ...h, value: v })}
              />
              <TextField
                label="ป้ายกำกับ"
                description="เช่น Founded หรือ โครงการที่สำเร็จ"
                value={h.label}
                onChange={(v) => update({ ...h, label: v })}
              />
            </div>
          )}
        />
      </div>
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="ขนาดหัวข้อแต่ละส่วน (px)"
            value={sectionTitleFontSize}
            onChange={setSectionTitleFontSize}
          />
          <NumberField
            label="ขนาดตัวเลขกล่องสถิติ (px)"
            value={statNumberFontSize}
            onChange={setStatNumberFontSize}
          />
          <NumberField
            label="ขนาดป้ายกล่องสถิติ (px)"
            value={statLabelFontSize}
            onChange={setStatLabelFontSize}
          />
        </div>
      </div>
    </SectionCard>
  )
}

function MissionVisionCard({ data, save }: { data: AboutGlobal; save: SaveFn<AboutGlobal> }) {
  const [m, setM] = useState({
    missionTitle: data.missionTitle ?? '',
    missionDescription: data.missionDescription ?? '',
    visionTitle: data.visionTitle ?? '',
    visionDescription: data.visionDescription ?? '',
  })
  const set = (k: keyof typeof m) => (v: string) => setM({ ...m, [k]: v })
  const [missionVisionTitleFontSize, setMissionVisionTitleFontSize] = useState(
    (data.missionVisionTitleFontSize as number | null) ?? 28,
  )
  const [missionVisionBodyFontSize, setMissionVisionBodyFontSize] = useState(
    (data.missionVisionBodyFontSize as number | null) ?? 16,
  )
  return (
    <SectionCard
      order={3}
      title="พันธกิจ / วิสัยทัศน์"
      description="กล่องคู่ พันธกิจ-วิสัยทัศน์ ถัดจากประวัติบริษัท"
      onSave={() =>
        save('แก้ไขเกี่ยวกับเรา: พันธกิจ/วิสัยทัศน์', (latest) => ({
          ...latest,
          missionTitle: m.missionTitle || null,
          missionDescription: m.missionDescription || null,
          visionTitle: m.visionTitle || null,
          visionDescription: m.visionDescription || null,
          missionVisionTitleFontSize,
          missionVisionBodyFontSize,
        }))
      }
    >
      <TextField label="หัวข้อพันธกิจ" value={m.missionTitle} onChange={set('missionTitle')} />
      <TextAreaField
        label="เนื้อหาพันธกิจ"
        value={m.missionDescription}
        onChange={set('missionDescription')}
        rows={4}
      />
      <TextField label="หัวข้อวิสัยทัศน์" value={m.visionTitle} onChange={set('visionTitle')} />
      <TextAreaField
        label="เนื้อหาวิสัยทัศน์"
        value={m.visionDescription}
        onChange={set('visionDescription')}
        rows={4}
      />
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="ขนาดหัวข้อพันธกิจ/วิสัยทัศน์ (px)"
            value={missionVisionTitleFontSize}
            onChange={setMissionVisionTitleFontSize}
          />
          <NumberField
            label="ขนาดเนื้อหาพันธกิจ/วิสัยทัศน์ (px)"
            value={missionVisionBodyFontSize}
            onChange={setMissionVisionBodyFontSize}
          />
        </div>
      </div>
    </SectionCard>
  )
}

function VideosCard({ data, save }: { data: AboutGlobal; save: SaveFn<AboutGlobal> }) {
  const [title, setTitle] = useState(data.videoSectionTitle ?? '')
  const [videos, setVideos] = useState<YoutubeVideo[]>(data.youtubeVideos ?? [])
  const [videoSectionTitleFontSize, setVideoSectionTitleFontSize] = useState(
    (data.videoSectionTitleFontSize as number | null) ?? 32,
  )
  return (
    <SectionCard
      order={4}
      title="วิดีโอ YouTube"
      description="ส่วนวิดีโอแนะนำบริษัท — วางลิงก์จาก YouTube ได้เลย"
      onSave={() =>
        save('แก้ไขเกี่ยวกับเรา: วิดีโอ', (latest) => ({
          ...latest,
          videoSectionTitle: title || null,
          youtubeVideos: videos,
          videoSectionTitleFontSize,
        }))
      }
    >
      <TextField label="หัวข้อส่วนวิดีโอ" value={title} onChange={setTitle} />
      <ItemList
        items={videos}
        onChange={setVideos}
        addLabel="เพิ่มวิดีโอ"
        makeNew={() => ({ title: '', youtubeUrl: '' })}
        itemTitle={(v, i) => v.title || `วิดีโอที่ ${i + 1}`}
        renderItem={(v, update) => (
          <>
            <TextField
              label="ชื่อวิดีโอ"
              value={v.title ?? ''}
              onChange={(x) => update({ ...v, title: x })}
            />
            <TextField
              label="ลิงก์ YouTube"
              description="กดปุ่ม แชร์ ใต้วิดีโอใน YouTube แล้วคัดลอกลิงก์มาวางที่นี่"
              value={v.youtubeUrl}
              onChange={(x) => update({ ...v, youtubeUrl: x })}
            />
          </>
        )}
      />
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <NumberField
          label="ขนาดหัวข้อส่วนวิดีโอ (px)"
          value={videoSectionTitleFontSize}
          onChange={setVideoSectionTitleFontSize}
        />
      </div>
    </SectionCard>
  )
}

const toMediaList = (poly: PolyMedia[] | null | undefined): MediaDoc[] =>
  (poly ?? []).map((p) => p.value).filter(Boolean)

function TeamCard({
  initial,
  save,
  about,
  saveAbout,
}: {
  initial: Founder[]
  save: SaveFn<Founder[]>
  about: AboutGlobal
  saveAbout: SaveFn<AboutGlobal>
}) {
  const [members, setMembers] = useState(initial)
  const [openId, setOpenId] = useState<string | null>(null)
  const [highlightCardTitleFontSize, setHighlightCardTitleFontSize] = useState(
    (about.highlightCardTitleFontSize as number | null) ?? 20,
  )
  const [highlightCardBodyFontSize, setHighlightCardBodyFontSize] = useState(
    (about.highlightCardBodyFontSize as number | null) ?? 15,
  )
  const [founderCardTitleFontSize, setFounderCardTitleFontSize] = useState(
    (about.founderCardTitleFontSize as number | null) ?? 28,
  )
  const [founderCardBodyFontSize, setFounderCardBodyFontSize] = useState(
    (about.founderCardBodyFontSize as number | null) ?? 16,
  )
  const [founderQuoteFontSize, setFounderQuoteFontSize] = useState(
    (about.founderQuoteFontSize as number | null) ?? 18,
  )
  const [founderDetailTitleFontSize, setFounderDetailTitleFontSize] = useState(
    (about.founderDetailTitleFontSize as number | null) ?? 42,
  )
  const [founderDetailBodyFontSize, setFounderDetailBodyFontSize] = useState(
    (about.founderDetailBodyFontSize as number | null) ?? 16,
  )

  function update(id: string, next: Partial<Founder>) {
    setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, ...next } : m)))
  }

  function addMember() {
    const member: Founder = {
      id: crypto.randomUUID(),
      name: '',
      slug: null,
      role: '',
      excerpt: '',
      description: '',
      quote: '',
      aboutImage: null,
      gallery: [],
      sortOrder: members.length,
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setMembers([...members, member])
    setOpenId(member.id)
  }

  async function handleSave() {
    // เรียง sortOrder ตามลำดับในรายการ + สร้างที่อยู่ลิงก์ให้สมาชิกใหม่อัตโนมัติ
    const finalized = members.map((m, i) => ({
      ...m,
      sortOrder: i,
      slug:
        m.slug && m.slug.trim() !== ''
          ? m.slug
          : uniqueSlug(
              thaiSafeSlug(m.name || 'member'),
              members.map((x) => x.slug),
            ),
      updatedAt: new Date().toISOString(),
    }))
    setMembers(finalized)
    await save('แก้ไขเกี่ยวกับเรา: ทีมงาน', () => finalized)
    await saveAbout('แก้ไขเกี่ยวกับเรา: ขนาดตัวอักษรการ์ดทีมงาน', (latest) => ({
      ...latest,
      highlightCardTitleFontSize,
      highlightCardBodyFontSize,
      founderCardTitleFontSize,
      founderCardBodyFontSize,
      founderQuoteFontSize,
      founderDetailTitleFontSize,
      founderDetailBodyFontSize,
    }))
  }

  return (
    <SectionCard
      order={5}
      title="ทีมงาน (Team Member)"
      description="รายชื่อสมาชิกทีมบนหน้า เกี่ยวกับเรา — กดชื่อเพื่อแก้ไขรายคน"
      onSave={handleSave}
    >
      <ul className="flex flex-col gap-2">
        {members.map((m, index) => (
          <li key={m.id} className="rounded-lg border border-base-200">
            <div className="flex items-center gap-2 p-2">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                onClick={() => setOpenId(openId === m.id ? null : m.id)}
              >
                {m.aboutImage?.value ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/uploads/${m.aboutImage.value.prefix}/${m.aboutImage.value.filename}`}
                    alt={m.name}
                    className="h-10 w-10 shrink-0 rounded-full bg-base-200 object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-200 text-xs text-base-content/40">
                    ไม่มีรูป
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {m.name || '(ยังไม่ใส่ชื่อ)'}
                    {m.isVisible === false && (
                      <span className="ml-2 badge badge-ghost badge-sm">ซ่อนอยู่</span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-base-content/50">{m.role}</span>
                </span>
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                aria-label="เลื่อนขึ้น"
                disabled={index === 0}
                onClick={() => {
                  const next = [...members]
                  ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                  setMembers(next)
                }}
              >
                ↑
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                aria-label="เลื่อนลง"
                disabled={index === members.length - 1}
                onClick={() => {
                  const next = [...members]
                  ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
                  setMembers(next)
                }}
              >
                ↓
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => setOpenId(openId === m.id ? null : m.id)}
              >
                {openId === m.id ? 'ปิด' : 'แก้ไข'}
              </button>
            </div>

            {openId === m.id && (
              <div className="flex flex-col gap-4 border-t border-base-200 p-3">
                <TextField
                  label="ชื่อ"
                  description="ที่อยู่ลิงก์ (URL) ของหน้านี้สร้างอัตโนมัติจากชื่อ และจะถูกแปลงเป็นภาษาอังกฤษเสมอ — แนะนำให้ตั้งชื่อเป็นภาษาอังกฤษเพื่อให้ลิงก์อ่านง่าย"
                  value={m.name}
                  onChange={(v) => update(m.id, { name: v })}
                />
                <TextField
                  label="ตำแหน่ง"
                  value={m.role ?? ''}
                  onChange={(v) => update(m.id, { role: v })}
                />
                <TextAreaField
                  label="คำแนะนำสั้น"
                  description="ข้อความสั้นบนการ์ดหน้า เกี่ยวกับเรา"
                  value={m.excerpt ?? ''}
                  onChange={(v) => update(m.id, { excerpt: v })}
                  rows={2}
                />
                <TextAreaField
                  label="ประวัติเต็ม"
                  description="แสดงบนหน้ารายละเอียดของสมาชิกคนนี้"
                  value={m.description ?? ''}
                  onChange={(v) => update(m.id, { description: v })}
                  rows={5}
                />
                <TextAreaField
                  label="คำคม"
                  value={m.quote ?? ''}
                  onChange={(v) => update(m.id, { quote: v })}
                  rows={2}
                />
                <ImageField
                  label="รูปการ์ด"
                  description="รูปประจำตัวบนการ์ดหน้า เกี่ยวกับเรา"
                  value={m.aboutImage?.value ?? null}
                  folder="gallery-media"
                  uploadCommitMessage={`แก้ไขเกี่ยวกับเรา: รูปทีมงาน ${m.name || ''}`.trim()}
                  onChange={(media) =>
                    update(m.id, { aboutImage: { relationTo: 'gallery-media', value: media } })
                  }
                />
                <div>
                  <p className="text-sm font-medium">แกลเลอรีรูป</p>
                  <p className="mb-2 text-xs text-base-content/55">
                    รูปเพิ่มเติมบนหน้ารายละเอียดของสมาชิกคนนี้
                  </p>
                  <ImageListEditor
                    items={toMediaList(m.gallery)}
                    folder="gallery-media"
                    uploadCommitMessage={`แก้ไขเกี่ยวกับเรา: แกลเลอรีทีมงาน ${m.name || ''}`.trim()}
                    onChange={(list) =>
                      update(m.id, {
                        gallery: list.map((v) => ({ relationTo: 'gallery-media', value: v })),
                      })
                    }
                  />
                </div>
                <ToggleField
                  label="แสดงบนเว็บไซต์"
                  description="ปิดไว้ = ซ่อนสมาชิกคนนี้จากหน้าเว็บ โดยไม่ต้องลบข้อมูล"
                  value={m.isVisible !== false}
                  onChange={(v) => update(m.id, { isVisible: v })}
                />
                <button
                  type="button"
                  className="btn btn-outline btn-error btn-sm w-fit"
                  onClick={() => {
                    if (window.confirm(`ลบ ${m.name || 'สมาชิกคนนี้'} ออกจากทีม?`)) {
                      setMembers(members.filter((x) => x.id !== m.id))
                    }
                  }}
                >
                  ลบสมาชิกคนนี้
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-outline btn-sm w-fit" onClick={addMember}>
        + เพิ่มสมาชิกใหม่
      </button>
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="ขนาดหัวข้อการ์ดทีมงาน (px)"
            value={highlightCardTitleFontSize}
            onChange={setHighlightCardTitleFontSize}
          />
          <NumberField
            label="ขนาดเนื้อหาการ์ดทีมงาน (px)"
            value={highlightCardBodyFontSize}
            onChange={setHighlightCardBodyFontSize}
          />
          <NumberField
            label="ขนาดชื่อบนการ์ดผู้ก่อตั้ง (px)"
            description="ชื่อสมาชิกบนการ์ดหน้า เกี่ยวกับเรา"
            value={founderCardTitleFontSize}
            onChange={setFounderCardTitleFontSize}
          />
          <NumberField
            label="ขนาดคำแนะนำบนการ์ดผู้ก่อตั้ง (px)"
            description="คำแนะนำสั้นบนการ์ดสมาชิก"
            value={founderCardBodyFontSize}
            onChange={setFounderCardBodyFontSize}
          />
          <NumberField
            label="ขนาดคำคม (px)"
            description="ข้อความคำคมของสมาชิก"
            value={founderQuoteFontSize}
            onChange={setFounderQuoteFontSize}
          />
          <NumberField
            label="ขนาดหัวข้อหน้ารายละเอียดผู้ก่อตั้ง (px)"
            description="ชื่อบนหน้ารายละเอียดของสมาชิก"
            value={founderDetailTitleFontSize}
            onChange={setFounderDetailTitleFontSize}
          />
          <NumberField
            label="ขนาดเนื้อหาหน้ารายละเอียดผู้ก่อตั้ง (px)"
            description="ประวัติเต็มบนหน้ารายละเอียดของสมาชิก"
            value={founderDetailBodyFontSize}
            onChange={setFounderDetailBodyFontSize}
          />
        </div>
      </div>
    </SectionCard>
  )
}
