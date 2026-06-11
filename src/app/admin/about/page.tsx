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
type YoutubeVideo = { id?: string; title?: string | null; youtubeUrl: string }

type AboutGlobal = {
  historySectionTitle?: string | null
  companyName?: string | null
  historyDescription?: string | null
  historyHighlights?: Highlight[] | null
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
          <TeamCard initial={founders.data} save={founders.saveFields} />
          <FontSizesCard
            hero={hero.data}
            about={about.data}
            saveHero={hero.saveFields}
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
    </SectionCard>
  )
}

function HistoryCard({ data, save }: { data: AboutGlobal; save: SaveFn<AboutGlobal> }) {
  const [title, setTitle] = useState(data.historySectionTitle ?? '')
  const [company, setCompany] = useState(data.companyName ?? '')
  const [desc, setDesc] = useState(data.historyDescription ?? '')
  const [highlights, setHighlights] = useState<Highlight[]>(data.historyHighlights ?? [])
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
    </SectionCard>
  )
}

function VideosCard({ data, save }: { data: AboutGlobal; save: SaveFn<AboutGlobal> }) {
  const [title, setTitle] = useState(data.videoSectionTitle ?? '')
  const [videos, setVideos] = useState<YoutubeVideo[]>(data.youtubeVideos ?? [])
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
    </SectionCard>
  )
}

const toMediaList = (poly: PolyMedia[] | null | undefined): MediaDoc[] =>
  (poly ?? []).map((p) => p.value).filter(Boolean)

function TeamCard({ initial, save }: { initial: Founder[]; save: SaveFn<Founder[]> }) {
  const [members, setMembers] = useState(initial)
  const [openId, setOpenId] = useState<string | null>(null)

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
    </SectionCard>
  )
}

const ABOUT_FONTS = [
  { key: 'sectionTitleFontSize', label: 'ขนาดหัวข้อแต่ละส่วน (px)', fallback: 32 },
  { key: 'highlightCardTitleFontSize', label: 'ขนาดหัวข้อการ์ดทีมงาน (px)', fallback: 20 },
  { key: 'highlightCardBodyFontSize', label: 'ขนาดเนื้อหาการ์ดทีมงาน (px)', fallback: 15 },
  { key: 'statNumberFontSize', label: 'ขนาดตัวเลขกล่องสถิติ (px)', fallback: 28 },
  { key: 'statLabelFontSize', label: 'ขนาดป้ายกล่องสถิติ (px)', fallback: 14 },
  { key: 'missionVisionTitleFontSize', label: 'ขนาดหัวข้อพันธกิจ/วิสัยทัศน์ (px)', fallback: 28 },
  { key: 'missionVisionBodyFontSize', label: 'ขนาดเนื้อหาพันธกิจ/วิสัยทัศน์ (px)', fallback: 16 },
  { key: 'videoSectionTitleFontSize', label: 'ขนาดหัวข้อส่วนวิดีโอ (px)', fallback: 32 },
] as const

function FontSizesCard({
  hero,
  about,
  saveHero,
  saveAbout,
}: {
  hero: AboutHero
  about: AboutGlobal
  saveHero: SaveFn<AboutHero>
  saveAbout: SaveFn<AboutGlobal>
}) {
  const [heroTitlePx, setHeroTitlePx] = useState(hero.heroTitleFontSize ?? 56)
  const [heroSubPx, setHeroSubPx] = useState(hero.heroSubtitleFontSize ?? 20)
  const [sizes, setSizes] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      ABOUT_FONTS.map((f) => [f.key, (about[f.key] as number | null) ?? f.fallback]),
    ),
  )
  return (
    <SectionCard
      order={6}
      title="🔠 ขนาดตัวอักษรของหน้านี้"
      description="ปรับขนาดตัวหนังสือส่วนต่างๆ ของหน้า เกี่ยวกับเรา (พิกเซล)"
      collapsible
      onSave={async () => {
        await saveHero('แก้ไขเกี่ยวกับเรา: ขนาดตัวอักษรแบนเนอร์', (latest) => ({
          ...latest,
          heroTitleFontSize: heroTitlePx,
          heroSubtitleFontSize: heroSubPx,
        }))
        await saveAbout('แก้ไขเกี่ยวกับเรา: ขนาดตัวอักษร', (latest) => ({ ...latest, ...sizes }))
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="ขนาดหัวข้อบนแบนเนอร์ (px)"
          value={heroTitlePx}
          onChange={setHeroTitlePx}
        />
        <NumberField
          label="ขนาดคำอธิบายบนแบนเนอร์ (px)"
          value={heroSubPx}
          onChange={setHeroSubPx}
        />
        {ABOUT_FONTS.map((f) => (
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
