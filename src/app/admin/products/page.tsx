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
  categories?: string[] | null
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
          <ProductListCard
            initial={products.data}
            save={products.saveFields}
            heroData={hero.data}
            saveHero={hero.saveFields}
          />
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
  const [titleFontSize, setTitleFontSize] = useState((data.titleFontSize as number | null) ?? 56)
  const [subtitleFontSize, setSubtitleFontSize] = useState(
    (data.subtitleFontSize as number | null) ?? 20,
  )
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
          titleFontSize,
          subtitleFontSize,
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
      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="ขนาดหัวข้อบนแบนเนอร์ (px)"
            value={titleFontSize}
            onChange={setTitleFontSize}
          />
          <NumberField
            label="ขนาดคำอธิบายบนแบนเนอร์ (px)"
            value={subtitleFontSize}
            onChange={setSubtitleFontSize}
          />
        </div>
      </div>
    </SectionCard>
  )
}

const PRODUCT_LIST_FONTS = [
  { key: 'categoryTitleFontSize', label: 'ขนาดหัวข้อหมวดสินค้า (px)', fallback: 28 },
  { key: 'productCardTitleFontSize', label: 'ขนาดชื่อสินค้าบนการ์ด (px)', fallback: 18 },
  { key: 'productPriceFontSize', label: 'ขนาดราคาบนการ์ด (px)', fallback: 16 },
  { key: 'detailTitleFontSize', label: 'ขนาดชื่อสินค้าในหน้ารายละเอียด (px)', fallback: 36 },
  { key: 'detailSubtitleFontSize', label: 'ขนาดชื่อรองในหน้ารายละเอียด (px)', fallback: 20 },
  { key: 'detailSectionTitleFontSize', label: 'ขนาดหัวข้อย่อยในหน้ารายละเอียด (px)', fallback: 24 },
  { key: 'detailBodyFontSize', label: 'ขนาดเนื้อหาในหน้ารายละเอียด (px)', fallback: 16 },
  { key: 'relatedTitleFontSize', label: 'ขนาดหัวข้อ “สินค้าอื่นๆ” (px)', fallback: 24 },
] as const

function ProductListCard({
  initial,
  save,
  heroData,
  saveHero,
}: {
  initial: Product[]
  save: SaveFn<Product[]>
  heroData: ProductsHero
  saveHero: SaveFn<ProductsHero>
}) {
  const [products, setProducts] = useState(initial)
  const [openId, setOpenId] = useState<string | null>(null)
  // รายการหมวดหมู่ที่จัดการได้ — เริ่มจากค่าใน global ถ้ามี ไม่งั้นดึงจากหมวดที่สินค้าใช้อยู่จริง
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = (heroData.categories as string[] | null | undefined) ?? null
    if (saved && saved.length > 0) return saved
    const seen = new Set<string>()
    const seeded: string[] = []
    for (const p of initial) {
      const c = (p.category ?? '').trim()
      if (c && !seen.has(c)) {
        seen.add(c)
        seeded.push(c)
      }
    }
    return seeded
  })
  // สถานะของช่องเพิ่มหมวดหมู่ใหม่แบบ inline ต่อสินค้าแต่ละชิ้น
  const [addingCategoryFor, setAddingCategoryFor] = useState<string | null>(null)
  const [newCategoryDraft, setNewCategoryDraft] = useState('')
  const [sizes, setSizes] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      PRODUCT_LIST_FONTS.map((f) => [f.key, (heroData[f.key] as number | null) ?? f.fallback]),
    ),
  )

  function update(id: string, next: Partial<Product>) {
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, ...next } : p)))
  }

  function addProduct() {
    const product: Product = {
      id: crypto.randomUUID(),
      title: '',
      subtitle: '',
      category: categories[0] ?? '',
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

  function confirmNewCategory(productId: string) {
    const name = newCategoryDraft.trim()
    if (!name) return
    if (!categories.includes(name)) setCategories([...categories, name])
    update(productId, { category: name })
    setNewCategoryDraft('')
    setAddingCategoryFor(null)
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
    await saveHero('แก้ไขสินค้า: หมวดหมู่และขนาดตัวอักษรรายการสินค้า', (latest) => ({
      ...latest,
      ...sizes,
      categories,
    }))
  }

  // จัดกลุ่มสินค้าตามหมวดหมู่ที่จัดการไว้ — หมวดที่ไม่รู้จัก/ว่าง ไปอยู่กลุ่มท้ายสุด
  const UNCATEGORIZED = '(ไม่มีหมวดหมู่)'
  const grouped: { key: string; label: string; items: Product[] }[] = (() => {
    const byCat = new Map<string, Product[]>()
    for (const p of products) {
      const c = (p.category ?? '').trim()
      const key = c && categories.includes(c) ? c : c || UNCATEGORIZED
      if (!byCat.has(key)) byCat.set(key, [])
      byCat.get(key)!.push(p)
    }
    const out: { key: string; label: string; items: Product[] }[] = []
    for (const cat of categories) {
      if (byCat.has(cat)) {
        out.push({ key: cat, label: cat, items: byCat.get(cat)! })
        byCat.delete(cat)
      }
    }
    // หมวดที่ไม่อยู่ในรายการจัดการ (ยกเว้นกลุ่มไม่มีหมวดหมู่) ตามด้วยกลุ่มไม่มีหมวดหมู่ท้ายสุด
    for (const [key, items] of byCat) {
      if (key === UNCATEGORIZED) continue
      out.push({ key, label: key, items })
    }
    if (byCat.has(UNCATEGORIZED)) {
      out.push({ key: UNCATEGORIZED, label: UNCATEGORIZED, items: byCat.get(UNCATEGORIZED)! })
    }
    return out
  })()

  function renderProduct(p: Product) {
    return (
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
              description="ที่อยู่ลิงก์ของหน้าสินค้าสร้างให้อัตโนมัติจากชื่อนี้ — ที่อยู่ลิงก์ (URL) ของหน้านี้สร้างอัตโนมัติจากชื่อ และจะถูกแปลงเป็นภาษาอังกฤษเสมอ — แนะนำให้ตั้งชื่อเป็นภาษาอังกฤษเพื่อให้ลิงก์อ่านง่าย"
              value={p.title}
              onChange={(v) => update(p.id, { title: v })}
            />
            <TextField
              label="ชื่อรอง / ยี่ห้อ"
              value={p.subtitle ?? ''}
              onChange={(v) => update(p.id, { subtitle: v })}
            />
            <div className="flex flex-col gap-2">
              <SelectField
                label="หมวดสินค้า"
                description="สินค้าหมวดเดียวกันจะแสดงรวมกลุ่มกัน เช่น “อุปกรณ์ยิมนาสติก”"
                value={p.category ?? ''}
                onChange={(v) => update(p.id, { category: v })}
                options={[
                  ...(p.category && !categories.includes(p.category)
                    ? [{ value: p.category, label: p.category }]
                    : []),
                  ...categories.map((c) => ({ value: c, label: c })),
                ]}
              />
              {addingCategoryFor === p.id ? (
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-48 flex-1">
                    <TextField
                      label="ชื่อหมวดหมู่ใหม่"
                      value={newCategoryDraft}
                      onChange={setNewCategoryDraft}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => confirmNewCategory(p.id)}
                  >
                    เพิ่ม
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setNewCategoryDraft('')
                      setAddingCategoryFor(null)
                    }}
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs w-fit"
                  onClick={() => {
                    setNewCategoryDraft('')
                    setAddingCategoryFor(p.id)
                  }}
                >
                  + เพิ่มหมวดหมู่ใหม่
                </button>
              )}
            </div>
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
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary btn-sm w-fit" onClick={handleSave}>
                บันทึก
              </button>
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
          </div>
        )}
      </li>
    )
  }

  return (
    <SectionCard
      order={2}
      title="รายการสินค้า"
      description="สินค้าทั้งหมดบนหน้า สินค้า แสดงแยกตามหมวดหมู่ — กดชื่อเพื่อแก้ไขรายชิ้น สินค้าใหม่ใช้ปุ่มบนสุด"
      onSave={handleSave}
    >
      <button type="button" className="btn btn-primary btn-sm w-fit" onClick={addProduct}>
        + เพิ่มสินค้าใหม่
      </button>

      <div className="flex flex-col gap-5">
        {grouped.map((group) => (
          <div key={group.key} className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-base-content/70">{group.label}</p>
            <ul className="flex flex-col gap-2">{group.items.map(renderProduct)}</ul>
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-col gap-4 rounded-lg border border-base-200 bg-base-50 p-3">
        <p className="text-sm font-medium text-base-content/70">🔠 ขนาดตัวอักษร</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PRODUCT_LIST_FONTS.map((f) => (
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
