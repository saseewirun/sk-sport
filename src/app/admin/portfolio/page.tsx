'use client'

import React, { useState } from 'react'
import { AdminShell } from '@/admin/components/AdminShell'
import { SectionCard } from '@/admin/components/SectionCard'
import { TextField, TextAreaField, NumberField, ToggleField } from '@/admin/components/fields'
import { ImageListEditor } from '@/admin/components/ImageListEditor'
import { ImageField } from '@/admin/components/ImageField'
import { useContentFile, LoadingOrError } from '@/admin/useContentFile'
import { thaiSafeSlug, uniqueSlug } from '@/admin/slug'
import { previewUrl, type MediaDoc } from '@/admin/media'

const PORTFOLIO_HERO = 'content/globals/portfolio-hero.json'
const ARTICLES = 'content/collections/portfolio-articles.json'

type PortfolioHero = {
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroMedia?: MediaDoc[] | null
} & Record<string, unknown>

type Article = {
  id: string
  title: string
  subtitle?: string | null
  highlight?: boolean | null
  sectionTitle?: string | null
  sectionDetail?: string | null
  sectionImage?: MediaDoc | null
  gallery?: { id?: string; image?: MediaDoc }[] | MediaDoc[] | null
  tag?: string | null
  slug: string
  createdAt?: string
  updatedAt?: string
} & Record<string, unknown>

type SaveFn<T> = (message: string, apply: (latest: T) => T) => Promise<void>

/** gallery ของผลงานอาจ export มาเป็น MediaDoc ตรงๆ หรือห่อใน {image} — รองรับทั้งคู่ */
function galleryToList(gallery: Article['gallery']): MediaDoc[] {
  if (!gallery) return []
  return (gallery as ({ image?: MediaDoc } | MediaDoc)[])
    .map((g) => ('image' in g && g.image ? g.image : (g as MediaDoc)))
    .filter((g): g is MediaDoc => Boolean(g && (g as MediaDoc).filename))
}

export default function AdminPortfolioPage() {
  const hero = useContentFile<PortfolioHero>(PORTFOLIO_HERO)
  const articles = useContentFile<Article[]>(ARTICLES)

  return (
    <AdminShell active="portfolio">
      <LoadingOrError error={hero.error || articles.error} loading={!hero.data || !articles.data} />
      {hero.data && articles.data && (
        <>
          <HeroCard data={hero.data} save={hero.saveFields} />
          <ArticleListCard
            initial={articles.data}
            save={articles.saveFields}
            heroData={hero.data}
            saveHero={hero.saveFields}
          />
        </>
      )}
    </AdminShell>
  )
}

function HeroCard({ data, save }: { data: PortfolioHero; save: SaveFn<PortfolioHero> }) {
  const [title, setTitle] = useState(data.heroTitle ?? '')
  const [subtitle, setSubtitle] = useState(data.heroSubtitle ?? '')
  const [media, setMedia] = useState<MediaDoc[]>(data.heroMedia ?? [])
  const [heroTitleFontSize, setHeroTitleFontSize] = useState(
    (data.heroTitleFontSize as number | null) ?? 56,
  )
  const [heroSubtitleFontSize, setHeroSubtitleFontSize] = useState(
    (data.heroSubtitleFontSize as number | null) ?? 20,
  )
  return (
    <SectionCard
      order={1}
      title="แบนเนอร์หน้ารวมผลงาน"
      description="แบนเนอร์บนสุดของหน้า ผลงาน"
      onSave={() =>
        save('แก้ไขผลงาน: แบนเนอร์', (latest) => ({
          ...latest,
          heroTitle: title || null,
          heroSubtitle: subtitle || null,
          heroMedia: media,
          heroTitleFontSize,
          heroSubtitleFontSize,
        }))
      }
    >
      <TextField label="หัวข้อบนแบนเนอร์" value={title} onChange={setTitle} />
      <TextField label="คำอธิบายใต้หัวข้อ" value={subtitle} onChange={setSubtitle} />
      <ImageListEditor
        items={media}
        onChange={setMedia}
        folder="hero-media"
        uploadCommitMessage="แก้ไขผลงาน: อัปโหลดรูปแบนเนอร์"
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

const ARTICLE_LIST_FONTS = [
  { key: 'highlightsTitleFontSize', label: 'ขนาดหัวข้อส่วนผลงานเด่น (px)', fallback: 28 },
  { key: 'sectionTitleFontSize', label: 'ขนาดหัวข้อรายการผลงาน (px)', fallback: 32 },
  { key: 'cardTitleFontSize', label: 'ขนาดชื่อบนการ์ดผลงาน (px)', fallback: 18 },
  { key: 'detailHeroTitleFontSize', label: 'ขนาดชื่อบทความในหน้ารายละเอียด (px)', fallback: 40 },
  { key: 'detailBodyFontSize', label: 'ขนาดเนื้อหาบทความ (px)', fallback: 16 },
  { key: 'moreProjectsTitleFontSize', label: 'ขนาดหัวข้อ “ผลงานอื่นๆ” (px)', fallback: 24 },
] as const

function ArticleListCard({
  initial,
  save,
  heroData,
  saveHero,
}: {
  initial: Article[]
  save: SaveFn<Article[]>
  heroData: PortfolioHero
  saveHero: SaveFn<PortfolioHero>
}) {
  const [articles, setArticles] = useState(initial)
  const [openId, setOpenId] = useState<string | null>(null)
  const [sizes, setSizes] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      ARTICLE_LIST_FONTS.map((f) => [f.key, (heroData[f.key] as number | null) ?? f.fallback]),
    ),
  )

  function update(id: string, next: Partial<Article>) {
    setArticles((list) => list.map((a) => (a.id === id ? { ...a, ...next } : a)))
  }

  function addArticle() {
    const article: Article = {
      id: crypto.randomUUID(),
      title: '',
      subtitle: '',
      highlight: false,
      sectionTitle: '',
      sectionDetail: '',
      sectionImage: null,
      gallery: [],
      tag: '',
      slug: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setArticles([article, ...articles])
    setOpenId(article.id)
  }

  async function handleSave() {
    // ที่อยู่ลิงก์สร้างจากชื่อ — ตัดอักขระพิเศษที่พังลิงก์/ไฟล์ (| / \\ ฯลฯ) เสมอ
    const finalized = articles.map((a) => ({
      ...a,
      slug:
        a.slug && a.slug.trim() !== ''
          ? thaiSafeSlug(a.slug)
          : uniqueSlug(
              thaiSafeSlug(a.title || 'portfolio'),
              articles.map((x) => x.slug),
            ),
      updatedAt: new Date().toISOString(),
    }))
    setArticles(finalized)
    await save('แก้ไขผลงาน: บทความผลงาน', () => finalized)
    await saveHero('แก้ไขผลงาน: ขนาดตัวอักษรรายการผลงาน', (latest) => ({ ...latest, ...sizes }))
  }

  return (
    <SectionCard
      order={2}
      title="รายการบทความผลงาน"
      description="บทความผลงานทั้งหมดบนหน้า ผลงาน และส่วนผลงานบนหน้าแรก — กดชื่อเพื่อแก้ไข"
      onSave={handleSave}
    >
      <button type="button" className="btn btn-primary btn-sm w-fit" onClick={addArticle}>
        + เพิ่มบทความใหม่
      </button>

      <ul className="flex flex-col gap-2">
        {articles.map((a) => (
          <li key={a.id} className="rounded-lg border border-base-200">
            <button
              type="button"
              className="flex w-full items-center gap-3 p-2 text-left"
              onClick={() => setOpenId(openId === a.id ? null : a.id)}
            >
              {a.sectionImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl(a.sectionImage)}
                  alt={a.title}
                  className="h-12 w-20 shrink-0 rounded-md bg-base-200 object-cover"
                />
              ) : (
                <span className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md bg-base-200 text-xs text-base-content/40">
                  ไม่มีรูป
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {a.title || '(บทความใหม่ ยังไม่ใส่ชื่อ)'}
                  {a.highlight && <span className="ml-2 badge badge-primary badge-sm">เด่น</span>}
                </span>
                <span className="block truncate text-xs text-base-content/50">{a.tag}</span>
              </span>
              <span className="btn btn-ghost btn-xs">{openId === a.id ? 'ปิด' : 'แก้ไข'}</span>
            </button>

            {openId === a.id && (
              <div className="flex flex-col gap-4 border-t border-base-200 p-3">
                <TextField
                  label="ชื่อบทความ"
                  description="ที่อยู่ลิงก์สร้างให้อัตโนมัติจากชื่อนี้ (ตัดอักขระพิเศษให้เอง) — ที่อยู่ลิงก์ (URL) ของหน้านี้สร้างอัตโนมัติจากชื่อ และจะถูกแปลงเป็นภาษาอังกฤษเสมอ — แนะนำให้ตั้งชื่อเป็นภาษาอังกฤษเพื่อให้ลิงก์อ่านง่าย"
                  value={a.title}
                  onChange={(v) => update(a.id, { title: v })}
                />
                <TextField
                  label="คำโปรยใต้ชื่อ"
                  value={a.subtitle ?? ''}
                  onChange={(v) => update(a.id, { subtitle: v })}
                />
                <TextField
                  label="แท็ก / หมวดผลงาน"
                  description="ใช้กรองบนหน้า ผลงาน เช่น “ติดตั้งอุปกรณ์”"
                  value={a.tag ?? ''}
                  onChange={(v) => update(a.id, { tag: v })}
                />
                <ToggleField
                  label="เป็นผลงานเด่น"
                  description="ผลงานเด่นแสดงในส่วนไฮไลต์บนหน้า ผลงาน"
                  value={Boolean(a.highlight)}
                  onChange={(v) => update(a.id, { highlight: v })}
                />
                <TextField
                  label="หัวข้อเนื้อหา"
                  value={a.sectionTitle ?? ''}
                  onChange={(v) => update(a.id, { sectionTitle: v })}
                />
                <TextAreaField
                  label="เนื้อหาบทความ"
                  value={a.sectionDetail ?? ''}
                  onChange={(v) => update(a.id, { sectionDetail: v })}
                  rows={7}
                />
                <ImageField
                  label="รูปหลัก"
                  description="รูปใหญ่ของบทความ ใช้บนการ์ดและหัวบทความ"
                  value={a.sectionImage ?? null}
                  folder="gallery-media"
                  uploadCommitMessage={`แก้ไขผลงาน: รูปบทความ ${a.title || 'ใหม่'}`}
                  onChange={(media) => update(a.id, { sectionImage: media })}
                />
                <div>
                  <p className="text-sm font-medium">แกลเลอรีรูปในบทความ</p>
                  <p className="mb-2 text-xs text-base-content/55">
                    รูปประกอบเพิ่มเติม แสดงเป็นตารางใต้เนื้อหา
                  </p>
                  <ImageListEditor
                    items={galleryToList(a.gallery)}
                    folder="gallery-media"
                    uploadCommitMessage={`แก้ไขผลงาน: แกลเลอรี ${a.title || 'ใหม่'}`}
                    onChange={(list) => update(a.id, { gallery: list })}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-error btn-sm w-fit"
                  onClick={() => {
                    if (window.confirm(`ลบบทความ “${a.title || 'บทความใหม่'}” ?`)) {
                      setArticles(articles.filter((x) => x.id !== a.id))
                    }
                  }}
                >
                  ลบบทความนี้
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ARTICLE_LIST_FONTS.map((f) => (
            <NumberField
              key={f.key}
              label={f.label}
              value={sizes[f.key]}
              onChange={(v) => setSizes({ ...sizes, [f.key]: v })}
            />
          ))}
        </div>
      </div>
    </SectionCard>
  )
}
