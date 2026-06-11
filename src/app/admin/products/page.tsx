'use client'

import React, { useState } from 'react'
import { AdminShell } from '@/admin/components/AdminShell'
import { SectionCard } from '@/admin/components/SectionCard'
import { TextField, TextAreaField, NumberField, SelectField } from '@/admin/components/fields'
import { ImageListEditor } from '@/admin/components/ImageListEditor'
import { ImageField } from '@/admin/components/ImageField'
import { useContentFile, LoadingOrError } from '@/admin/useContentFile'
import { productSlug, uniqueSlug } from '@/admin/slug'
import { previewUrl, type MediaDoc } from '@/admin/media'

const PRODUCTS_HERO = 'content/globals/products-hero.json'
const PRODUCTS = 'content/collections/products.json'

type ProductsHero = {
  heroTitle?: string | null
  heroSubtitle?: string | null
  eyebrow?: string | null
  heroMedia?: MediaDoc[] | null
} & Record<string, unknown>

type Product = {
  id: string
  title: string
  subtitle?: string | null
  category?: string | null
  mode: 'quote' | 'buy'
  price?: number | null
  description?: string | null
  image?: MediaDoc | null
  slug: string
  createdAt?: string
  updatedAt?: string
} & Record<string, unknown>

type SaveFn<T> = (message: string, apply: (latest: T) => T) => Promise<void>

export default function AdminProductsPage() {
  const hero = useContentFile<ProductsHero>(PRODUCTS_HERO)
  const products = useContentFile<Product[]>(PRODUCTS)

  return (
    <AdminShell active="products">
      <LoadingOrError error={hero.error || products.error} loading={!hero.data || !products.data} />
      {hero.data && products.data && (
        <>
          <HeroCard data={hero.data} save={hero.saveFields} />
          <ProductListCard initial={products.data} save={products.saveFields} />
          <FontSizesCard data={hero.data} save={hero.saveFields} />
        </>
      )}
    </AdminShell>
  )
}

function HeroCard({ data, save }: { data: ProductsHero; save: SaveFn<ProductsHero> }) {
  const [title, setTitle] = useState(data.heroTitle ?? '')
  const [subtitle, setSubtitle] = useState(data.heroSubtitle ?? '')
  const [eyebrow, setEyebrow] = useState(data.eyebrow ?? '')
  const [media, setMedia] = useState<MediaDoc[]>(data.heroMedia ?? [])
  return (
    <SectionCard
      order={1}
      title="แบนเนอร์หน้ารวมสินค้า"
      description="แบนเนอร์บนสุดของหน้า สินค้า"
      onSave={() =>
        save('แก้ไขสินค้า: แบนเนอร์', (latest) => ({
          ...latest,
          heroTitle: title || null,
          heroSubtitle: subtitle || null,
          eyebrow: eyebrow || null,
          heroMedia: media,
        }))
      }
    >
      <TextField
        label="ป้ายเล็กเหนือหัวข้อ"
        description="ข้อความตัวเล็กเหนือหัวข้อใหญ่ เช่น “Equipment & Gear”"
        value={eyebrow}
        onChange={setEyebrow}
      />
      <TextField label="หัวข้อบนแบนเนอร์" value={title} onChange={setTitle} />
      <TextField label="คำอธิบายใต้หัวข้อ" value={subtitle} onChange={setSubtitle} />
      <ImageListEditor
        items={media}
        onChange={setMedia}
        folder="hero-media"
        uploadCommitMessage="แก้ไขสินค้า: อัปโหลดรูปแบนเนอร์"
      />
    </SectionCard>
  )
}

function ProductListCard({ initial, save }: { initial: Product[]; save: SaveFn<Product[]> }) {
  const [products, setProducts] = useState(initial)
  const [openId, setOpenId] = useState<string | null>(null)

  function update(id: string, next: Partial<Product>) {
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, ...next } : p)))
  }

  function addProduct() {
    const product: Product = {
      id: crypto.randomUUID(),
      title: '',
      subtitle: '',
      category: '',
      mode: 'quote',
      price: null,
      description: '',
      image: null,
      slug: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProducts([product, ...products])
    setOpenId(product.id)
  }

  async function handleSave() {
    // ที่อยู่ลิงก์สร้างอัตโนมัติจากชื่อ (a-z0-9 เสมอ) เฉพาะสินค้าที่ยังไม่มี
    const finalized = products.map((p) => ({
      ...p,
      slug:
        p.slug && p.slug.trim() !== ''
          ? p.slug
          : uniqueSlug(
              productSlug(p.title || 'product'),
              products.map((x) => x.slug),
            ),
      price: p.mode === 'buy' ? (p.price ?? 0) : null,
      updatedAt: new Date().toISOString(),
    }))
    setProducts(finalized)
    await save('แก้ไขสินค้า: รายการสินค้า', () => finalized)
  }

  return (
    <SectionCard
      order={2}
      title="รายการสินค้า"
      description="สินค้าทั้งหมดบนหน้า สินค้า — กดชื่อเพื่อแก้ไขรายชิ้น สินค้าใหม่ใช้ปุ่มบนสุด"
      onSave={handleSave}
    >
      <button type="button" className="btn btn-primary btn-sm w-fit" onClick={addProduct}>
        + เพิ่มสินค้าใหม่
      </button>

      <ul className="flex flex-col gap-2">
        {products.map((p) => (
          <li key={p.id} className="rounded-lg border border-base-200">
            <button
              type="button"
              className="flex w-full items-center gap-3 p-2 text-left"
              onClick={() => setOpenId(openId === p.id ? null : p.id)}
            >
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl(p.image)}
                  alt={p.title}
                  className="h-12 w-16 shrink-0 rounded-md bg-base-200 object-cover"
                />
              ) : (
                <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-base-200 text-xs text-base-content/40">
                  ไม่มีรูป
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {p.title || '(สินค้าใหม่ ยังไม่ใส่ชื่อ)'}
                </span>
                <span className="block truncate text-xs text-base-content/50">
                  {p.category} · {p.mode === 'buy' ? `ซื้อเลย ฿${p.price ?? 0}` : 'ขอใบเสนอราคา'}
                </span>
              </span>
              <span className="btn btn-ghost btn-xs">{openId === p.id ? 'ปิด' : 'แก้ไข'}</span>
            </button>

            {openId === p.id && (
              <div className="flex flex-col gap-4 border-t border-base-200 p-3">
                <TextField
                  label="ชื่อสินค้า"
                  description="ที่อยู่ลิงก์ของหน้าสินค้าสร้างให้อัตโนมัติจากชื่อนี้"
                  value={p.title}
                  onChange={(v) => update(p.id, { title: v })}
                />
                <TextField
                  label="ชื่อรอง / ยี่ห้อ"
                  value={p.subtitle ?? ''}
                  onChange={(v) => update(p.id, { subtitle: v })}
                />
                <TextField
                  label="หมวดสินค้า"
                  description="สินค้าหมวดเดียวกันจะแสดงรวมกลุ่มกัน เช่น “อุปกรณ์ยิมนาสติก”"
                  value={p.category ?? ''}
                  onChange={(v) => update(p.id, { category: v })}
                />
                <SelectField
                  label="รูปแบบการขาย"
                  description="ขอใบเสนอราคา = ลูกค้ากดขอราคา • ซื้อเลย = แสดงราคาและซื้อผ่านเว็บได้"
                  value={p.mode}
                  onChange={(v) => update(p.id, { mode: v as 'quote' | 'buy' })}
                  options={[
                    { value: 'quote', label: 'ขอใบเสนอราคา' },
                    { value: 'buy', label: 'ซื้อเลย (แสดงราคา)' },
                  ]}
                />
                {p.mode === 'buy' && (
                  <NumberField
                    label="ราคา (บาท)"
                    value={p.price ?? 0}
                    min={0}
                    onChange={(v) => update(p.id, { price: v })}
                  />
                )}
                <TextAreaField
                  label="คำอธิบายสินค้า"
                  value={p.description ?? ''}
                  onChange={(v) => update(p.id, { description: v })}
                  rows={5}
                />
                <ImageField
                  label="รูปสินค้า"
                  value={p.image ?? null}
                  folder="service-media"
                  uploadCommitMessage={`แก้ไขสินค้า: รูปสินค้า ${p.title || 'ใหม่'}`}
                  onChange={(media) => update(p.id, { image: media })}
                />
                <button
                  type="button"
                  className="btn btn-outline btn-error btn-sm w-fit"
                  onClick={() => {
                    if (window.confirm(`ลบสินค้า “${p.title || 'สินค้าใหม่'}” ?`)) {
                      setProducts(products.filter((x) => x.id !== p.id))
                    }
                  }}
                >
                  ลบสินค้านี้
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

const PRODUCT_FONTS = [
  { key: 'titleFontSize', label: 'ขนาดหัวข้อบนแบนเนอร์ (px)', fallback: 56 },
  { key: 'subtitleFontSize', label: 'ขนาดคำอธิบายบนแบนเนอร์ (px)', fallback: 20 },
  { key: 'categoryTitleFontSize', label: 'ขนาดหัวข้อหมวดสินค้า (px)', fallback: 28 },
  { key: 'productCardTitleFontSize', label: 'ขนาดชื่อสินค้าบนการ์ด (px)', fallback: 18 },
  { key: 'productPriceFontSize', label: 'ขนาดราคาบนการ์ด (px)', fallback: 16 },
  { key: 'detailTitleFontSize', label: 'ขนาดชื่อสินค้าในหน้ารายละเอียด (px)', fallback: 36 },
  { key: 'detailSubtitleFontSize', label: 'ขนาดชื่อรองในหน้ารายละเอียด (px)', fallback: 20 },
  { key: 'detailSectionTitleFontSize', label: 'ขนาดหัวข้อย่อยในหน้ารายละเอียด (px)', fallback: 24 },
  { key: 'detailBodyFontSize', label: 'ขนาดเนื้อหาในหน้ารายละเอียด (px)', fallback: 16 },
  { key: 'relatedTitleFontSize', label: 'ขนาดหัวข้อ “สินค้าอื่นๆ” (px)', fallback: 24 },
] as const

function FontSizesCard({ data, save }: { data: ProductsHero; save: SaveFn<ProductsHero> }) {
  const [sizes, setSizes] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      PRODUCT_FONTS.map((f) => [f.key, (data[f.key] as number | null) ?? f.fallback]),
    ),
  )
  return (
    <SectionCard
      order={3}
      title="🔠 ขนาดตัวอักษรของหน้านี้"
      description="ปรับขนาดตัวหนังสือของหน้า สินค้า และหน้ารายละเอียดสินค้า (พิกเซล)"
      collapsible
      onSave={() => save('แก้ไขสินค้า: ขนาดตัวอักษร', (latest) => ({ ...latest, ...sizes }))}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PRODUCT_FONTS.map((f) => (
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
