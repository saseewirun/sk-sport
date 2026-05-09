'use client'

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CaretLeftIcon,
  CaretRightIcon,
  FunnelSimpleIcon,
  ListIcon,
  MagnifyingGlassIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react'

export interface ProductItem {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  category?: string | null
  description?: string | null
  imageUrl?: string
  mode: 'quote' | 'buy'
  /** Set when `mode` is `buy` (e.g. THB from CMS) */
  price?: number | null
}

interface ProductClientProps {
  products: ProductItem[]
  /** From ProductsHero global; clamped in this component. */
  categoryTitleFontSize?: number | null
  productCardTitleFontSize?: number | null
  productPriceFontSize?: number | null
}

const ITEMS_PER_PAGE = 9
const CATEGORY_PAGE_SIZE = 4

const thb = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' })

const CATEGORY_TITLE_PX_MIN = 20
const CATEGORY_TITLE_PX_MAX = 56
const CATEGORY_TITLE_PX_DEFAULT = 32
const PRODUCT_CARD_TITLE_PX_MIN = 14
const PRODUCT_CARD_TITLE_PX_MAX = 36
const PRODUCT_CARD_TITLE_PX_DEFAULT = 22
const PRODUCT_PRICE_PX_MIN = 12
const PRODUCT_PRICE_PX_MAX = 28
const PRODUCT_PRICE_PX_DEFAULT = 16

function clampCategoryTitlePx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return CATEGORY_TITLE_PX_DEFAULT
  return Math.min(CATEGORY_TITLE_PX_MAX, Math.max(CATEGORY_TITLE_PX_MIN, Math.round(v)))
}

function clampProductCardTitlePx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return PRODUCT_CARD_TITLE_PX_DEFAULT
  return Math.min(PRODUCT_CARD_TITLE_PX_MAX, Math.max(PRODUCT_CARD_TITLE_PX_MIN, Math.round(v)))
}

function clampProductPricePx(v: number | null | undefined): number {
  if (v == null || !Number.isFinite(v)) return PRODUCT_PRICE_PX_DEFAULT
  return Math.min(PRODUCT_PRICE_PX_MAX, Math.max(PRODUCT_PRICE_PX_MIN, Math.round(v)))
}

export type ProductListingPurchaseFilter = 'all' | 'readyToBuy' | 'requestQuote'

function isProductPurchasable(p: ProductItem): p is ProductItem & { price: number } {
  return p.mode === 'buy' && typeof p.price === 'number' && Number.isFinite(p.price) && p.price > 0
}

function categoryKeyToParam(key: string): string {
  if (key === 'OTHER') return 'other'
  return key.toLowerCase().replace(/\s+/g, '-')
}

function paramToCategoryKey(param: string | null): string {
  if (!param || param.trim() === '') return 'ALL'
  const p = param.trim().toLowerCase()
  if (p === 'other') return 'OTHER'
  return p.replace(/-/g, ' ').toUpperCase()
}

function resolveCategoryFilter(param: string | null, productList: ProductItem[]): string {
  const key = paramToCategoryKey(param)
  if (key === 'ALL') return 'ALL'
  if (key === 'OTHER') {
    return productList.some((p) => !p.category?.trim()) ? 'OTHER' : 'ALL'
  }
  return productList.some((p) => (p.category?.toUpperCase() ?? '') === key) ? key : 'ALL'
}

type CategoryGroup = { key: string; label: string; items: ProductItem[] }

function CategoryCarouselRow({
  title,
  products,
  onSeeAll,
  categoryTitleFontPx,
  productCardTitleFontPx,
  productPriceFontPx,
}: {
  title: string
  products: ProductItem[]
  onSeeAll?: () => void
  categoryTitleFontPx: number
  productCardTitleFontPx: number
  productPriceFontPx: number
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [arrows, setArrows] = useState({ left: false, right: false })

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const isLg = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
    const epsilon = 2
    const { scrollLeft, scrollWidth, clientWidth } = el
    const needsScroll = scrollWidth > clientWidth + epsilon
    const atStart = scrollLeft <= epsilon
    const atEnd = scrollLeft + clientWidth >= scrollWidth - epsilon
    const allowArrows = !isLg || products.length > 4
    setArrows({
      left: allowArrows && needsScroll && !atStart,
      right: allowArrows && needsScroll && !atEnd,
    })
  }, [products.length])

  const productIds = products.map((p) => p.id).join(',')

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(() => updateArrows())
    ro.observe(el)
    el.addEventListener('scroll', updateArrows, { passive: true })
    updateArrows()
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', updateArrows)
    }
  }, [updateArrows, productIds])

  const scrollPage = (dir: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <section className="w-full">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2
          className="font-bold uppercase tracking-widest bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent"
          style={{ fontSize: `${categoryTitleFontPx}px` }}
        >
          {title}
        </h2>
        {onSeeAll ? (
          <button
            type="button"
            onClick={onSeeAll}
            className="body-sm shrink-0 font-semibold text-primary underline underline-offset-2 hover:opacity-80"
          >
            See All
          </button>
        ) : null}
      </div>
      <div className="relative">
        {arrows.left ? (
          <button
            type="button"
            aria-label="Scroll products left"
            onClick={() => scrollPage(-1)}
            className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-base-200 bg-primary-content text-base-content shadow-md md:h-10 md:w-10 md:-translate-x-1"
          >
            <CaretLeftIcon className="h-5 w-5" weight="bold" />
          </button>
        ) : null}
        {arrows.right ? (
          <button
            type="button"
            aria-label="Scroll products right"
            onClick={() => scrollPage(1)}
            className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-base-200 bg-primary-content text-base-content shadow-md md:h-10 md:w-10 md:translate-x-1"
          >
            <CaretRightIcon className="h-5 w-5" weight="bold" />
          </button>
        ) : null}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth px-10 py-1 no-scrollbar"
        >
          {products.map((product) => (
            <div key={product.id} className="w-[calc(50%-8px)] shrink-0 lg:w-[calc(25%-12px)]">
              <Link
                href={`/product/${product.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-box border border-base-300 bg-primary-content shadow-sm transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-ratio-4-3 relative w-full overflow-hidden bg-base-200">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-full w-full scale-125 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="body-sm text-subtle">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex min-h-0 w-full min-w-0 flex-col gap-2 px-4 py-3 md:px-5 md:py-4">
                  <h3
                    className="line-clamp-2 min-w-0 text-left leading-snug text-base-content"
                    style={{ fontSize: `${productCardTitleFontPx}px` }}
                  >
                    {product.title}
                  </h3>
                  {isProductPurchasable(product) ? (
                    <span
                      className="self-end text-right font-semibold tabular-nums text-base-content"
                      style={{ fontSize: `${productPriceFontPx}px` }}
                    >
                      {thb.format(product.price)}
                    </span>
                  ) : null}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ProductClient({
  products = [],
  categoryTitleFontSize,
  productCardTitleFontSize,
  productPriceFontSize,
}: ProductClientProps) {
  const categoryTitleFontPx = clampCategoryTitlePx(categoryTitleFontSize)
  const productCardTitleFontPx = clampProductCardTitlePx(productCardTitleFontSize)
  const productPriceFontPx = clampProductPricePx(productPriceFontSize)
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')

  const [search, setSearch] = useState('')
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const filterWrapRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [categoryPages, setCategoryPages] = useState<Record<string, number>>({})
  const [purchaseListingFilter, setPurchaseListingFilter] =
    useState<ProductListingPurchaseFilter>('all')

  const purchaseFiltered = useMemo(() => {
    return products.filter((p) => {
      if (purchaseListingFilter === 'all') return true
      const purchasable = isProductPurchasable(p)
      if (purchaseListingFilter === 'readyToBuy') return purchasable
      return !purchasable
    })
  }, [products, purchaseListingFilter])

  const categoryFilter = useMemo(
    () => resolveCategoryFilter(categoryParam, purchaseFiltered),
    [categoryParam, purchaseFiltered],
  )

  useEffect(() => {
    if (!categoryParam) return
    if (resolveCategoryFilter(categoryParam, purchaseFiltered) === 'ALL') {
      router.replace('/product')
    }
  }, [categoryParam, purchaseFiltered, router])

  useEffect(() => {
    setCurrentPage(1)
    setMobileExpanded(false)
    setCategoryPages({})
  }, [search, categoryFilter, purchaseListingFilter])

  useEffect(() => {
    if (!filterMenuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (filterWrapRef.current && !filterWrapRef.current.contains(e.target as Node)) {
        setFilterMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [filterMenuOpen])

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(purchaseFiltered.map((p) => p.category?.toUpperCase()).filter(Boolean)),
    ) as string[]
    return unique.sort()
  }, [purchaseFiltered])

  const filtered = purchaseFiltered.filter((product) => {
    const matchCategory =
      categoryFilter === 'ALL' || (product.category?.toUpperCase() ?? '') === categoryFilter
    const matchSearch = product.title.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  const groupedByCategory = useMemo((): CategoryGroup[] => {
    const map = new Map<string, ProductItem[]>()
    for (const p of filtered) {
      const key = p.category?.toUpperCase() || 'OTHER'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    }
    const keys = [...map.keys()].sort((a, b) => {
      if (a === 'OTHER') return 1
      if (b === 'OTHER') return -1
      return a.localeCompare(b)
    })
    return keys.map((key) => {
      const items = map.get(key)!
      const label = key === 'OTHER' ? 'Other' : (items[0]?.category ?? key)
      return { key, label, items }
    })
  }, [filtered])

  const listDisplay = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    let idx = 0
    const result: { key: string; label: string; items: ProductItem[] }[] = []
    for (const group of groupedByCategory) {
      const groupStart = idx
      const overlapStart = Math.max(start, groupStart)
      const overlapEnd = Math.min(end, groupStart + group.items.length)
      if (overlapStart < overlapEnd) {
        const localStart = overlapStart - groupStart
        const localEnd = overlapEnd - groupStart
        result.push({
          key: group.key,
          label: group.label,
          items: group.items.slice(localStart, localEnd),
        })
      }
      idx += group.items.length
      if (idx >= end) break
    }
    return result
  }, [groupedByCategory, currentPage])

  const listPageRowCount = useMemo(
    () => listDisplay.reduce((n, g) => n + g.items.length, 0),
    [listDisplay],
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  return (
    <div className="w-full bg-header-bg">
      {/* Control bar */}
      <div className="bg-primary-content px-6 py-6 md:px-8 md:py-8">
        <div className="flex w-full items-center justify-between gap-2 md:gap-4">
          {/* Search field */}
          <div ref={filterWrapRef} className="relative flex min-w-0 flex-1 items-center">
            <div className="product-search-bar-bg flex h-15 w-full max-w-3xl items-center gap-3 rounded-full px-4 shadow-sm ring-1 ring-base-content/10">
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search products..."
                className="body-sm min-w-0 flex-1 border-0 bg-transparent py-2 pl-3 text-left text-base-content outline-none placeholder:text-base-content/40 focus:ring-0"
              />
              <div className="flex shrink-0 items-center gap-2.5">
                <MagnifyingGlassIcon
                  className="h-5 w-5 shrink-0 text-base-content/45"
                  weight="bold"
                  aria-hidden
                />
                <span className="h-5 w-px shrink-0 bg-base-content/25" aria-hidden />
                <button
                  type="button"
                  onClick={() => setFilterMenuOpen((open) => !open)}
                  aria-expanded={filterMenuOpen}
                  aria-haspopup="listbox"
                  aria-label="Filter by category"
                  className="flex shrink-0 cursor-pointer rounded-full text-base-content/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <FunnelSimpleIcon className="h-5 w-5" weight="bold" aria-hidden />
                </button>
              </div>
            </div>
            {filterMenuOpen && (
              <div
                role="listbox"
                aria-label="Categories"
                className="absolute left-0 top-full z-20 mt-1 min-w-44 rounded-box border border-base-300 bg-primary-content py-1 shadow-lg"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={categoryFilter === 'ALL'}
                  onClick={() => {
                    router.push('/product')
                    setFilterMenuOpen(false)
                  }}
                  className={`body-sm flex w-full px-3 py-2 text-left hover:bg-base-200 ${
                    categoryFilter === 'ALL' ? 'font-semibold text-primary' : 'text-base-content'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    role="option"
                    aria-selected={categoryFilter === cat}
                    onClick={() => {
                      router.push(
                        `/product?category=${encodeURIComponent(categoryKeyToParam(cat))}`,
                      )
                      setFilterMenuOpen(false)
                    }}
                    className={`body-sm flex w-full px-3 py-2 text-left uppercase hover:bg-base-200 ${
                      categoryFilter === cat ? 'font-semibold text-primary' : 'text-base-content'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right cluster: view-mode toggle */}
          <div className="ml-1 flex shrink-0 items-center justify-end gap-1 md:ml-2">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex h-10 w-10 cursor-pointer items-center justify-center transition-colors md:h-10 md:w-10 ${
                viewMode === 'list' ? 'text-secondary' : 'text-base-content'
              }`}
              aria-label="List view"
            >
              <ListIcon size={30} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex h-10 w-10 cursor-pointer items-center justify-center transition-colors md:h-10 md:w-10 ${
                viewMode === 'grid' ? 'text-secondary' : 'text-base-content'
              }`}
              aria-label="Grid view"
            >
              <SquaresFourIcon size={30} />
            </button>
          </div>
        </div>

        <div
          className="mt-4 flex w-full flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter by purchase type"
        >
          {(
            [
              { id: 'all' as const, label: 'All Products' },
              { id: 'readyToBuy' as const, label: 'Ready to Buy' },
              { id: 'requestQuote' as const, label: 'Request a Quote' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPurchaseListingFilter(opt.id)}
              aria-pressed={purchaseListingFilter === opt.id}
              className={`body-sm rounded-full border px-4 py-2 shadow-sm transition-all duration-200 ${
                purchaseListingFilter === opt.id
                  ? 'border-transparent bg-gradient-to-r from-primary to-secondary font-semibold text-primary-content'
                  : 'border-base-300/80 bg-primary-content text-base-content hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10'
              } `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-primary-content px-6 pb-12 md:px-8 md:pb-16">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="body-sm text-subtle">No products match your search.</p>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setPurchaseListingFilter('all')
                router.push('/product')
              }}
              className="body-sm text-primary underline underline-offset-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="flex flex-col gap-10 pt-6 md:gap-12 md:pt-8">
                {categoryFilter === 'ALL'
                  ? groupedByCategory.map((group) => {
                      const catPage = categoryPages[group.key] ?? 1
                      const catTotalPages = Math.ceil(group.items.length / CATEGORY_PAGE_SIZE)
                      const pagedItems = group.items.slice(
                        (catPage - 1) * CATEGORY_PAGE_SIZE,
                        catPage * CATEGORY_PAGE_SIZE,
                      )
                      return (
                        <div key={group.key} className="flex flex-col gap-4">
                          <CategoryCarouselRow
                            title={group.label}
                            products={pagedItems}
                            categoryTitleFontPx={categoryTitleFontPx}
                            productCardTitleFontPx={productCardTitleFontPx}
                            productPriceFontPx={productPriceFontPx}
                            onSeeAll={
                              group.key !== 'OTHER'
                                ? () => {
                                    router.push(
                                      `/product?category=${encodeURIComponent(categoryKeyToParam(group.key))}`,
                                    )
                                  }
                                : undefined
                            }
                          />
                          {catTotalPages > 1 && (
                            <div className="flex items-center justify-center gap-3">
                              <button
                                type="button"
                                disabled={catPage === 1}
                                onClick={() =>
                                  setCategoryPages((prev) => ({
                                    ...prev,
                                    [group.key]: catPage - 1,
                                  }))
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-box border body-sm font-medium transition-colors border-base-300 bg-primary-content text-base-content hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Previous page"
                              >
                                ‹
                              </button>
                              <span className="body-sm text-base-content tabular-nums">
                                {catPage} / {catTotalPages}
                              </span>
                              <button
                                type="button"
                                disabled={catPage === catTotalPages}
                                onClick={() =>
                                  setCategoryPages((prev) => ({
                                    ...prev,
                                    [group.key]: catPage + 1,
                                  }))
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-box border body-sm font-medium transition-colors border-base-300 bg-primary-content text-base-content hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Next page"
                              >
                                ›
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  : (() => {
                      const catPage = categoryPages[categoryFilter] ?? 1
                      const catTotalPages = Math.ceil(filtered.length / CATEGORY_PAGE_SIZE)
                      const pagedItems = filtered.slice(
                        (catPage - 1) * CATEGORY_PAGE_SIZE,
                        catPage * CATEGORY_PAGE_SIZE,
                      )
                      return (
                        <div className="flex flex-col gap-4">
                          <CategoryCarouselRow
                            key={categoryFilter}
                            title={filtered[0]?.category ?? categoryFilter}
                            products={pagedItems}
                            categoryTitleFontPx={categoryTitleFontPx}
                            productCardTitleFontPx={productCardTitleFontPx}
                            productPriceFontPx={productPriceFontPx}
                          />
                          {catTotalPages > 1 && (
                            <div className="flex items-center justify-center gap-3">
                              <button
                                type="button"
                                disabled={catPage === 1}
                                onClick={() =>
                                  setCategoryPages((prev) => ({
                                    ...prev,
                                    [categoryFilter]: catPage - 1,
                                  }))
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-box border body-sm font-medium transition-colors border-base-300 bg-primary-content text-base-content hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Previous page"
                              >
                                ‹
                              </button>
                              <span className="body-sm text-base-content tabular-nums">
                                {catPage} / {catTotalPages}
                              </span>
                              <button
                                type="button"
                                disabled={catPage === catTotalPages}
                                onClick={() =>
                                  setCategoryPages((prev) => ({
                                    ...prev,
                                    [categoryFilter]: catPage + 1,
                                  }))
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-box border body-sm font-medium transition-colors border-base-300 bg-primary-content text-base-content hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Next page"
                              >
                                ›
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })()}
              </div>
            ) : (
              <div className="flex flex-col pt-6 md:pt-8">
                {listDisplay.map((group, gIdx) => {
                  const rowBase = listDisplay.slice(0, gIdx).reduce((s, g) => s + g.items.length, 0)
                  return (
                    <Fragment key={group.key}>
                      <h2
                        className={`inline-block max-w-full font-bold uppercase tracking-widest bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent ${
                          gIdx > 0 ? 'mt-8 md:mt-10' : ''
                        }`}
                        style={{ fontSize: `${categoryTitleFontPx}px` }}
                      >
                        {group.label}
                      </h2>
                      <div className="mt-2 flex flex-col gap-2 md:gap-3">
                        {group.items.map((product, i) => {
                          const rowOnPage = rowBase + i
                          return (
                            <div
                              key={product.id}
                              className={rowOnPage >= 3 && !mobileExpanded ? 'hidden md:block' : ''}
                            >
                              <Link
                                href={`/product/${product.slug}`}
                                className="group flex items-center gap-4 rounded-box border border-base-300 bg-primary-content px-4 py-4 shadow-sm transition-shadow hover:shadow-md md:gap-5 md:px-5 md:py-5"
                              >
                                <div className="aspect-ratio-4-3 relative w-16 shrink-0 overflow-hidden rounded bg-base-200 md:w-20">
                                  {product.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={product.imageUrl}
                                      alt={product.title}
                                      className="h-full w-full scale-125 object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <span className="body-sm text-subtle">—</span>
                                    </div>
                                  )}
                                </div>
                                <h3
                                  className="min-w-0 flex-1 text-left text-base-content leading-snug group-hover:text-primary"
                                  style={{ fontSize: `${productCardTitleFontPx}px` }}
                                >
                                  {product.title}
                                </h3>
                                {isProductPurchasable(product) ? (
                                  <span
                                    className="shrink-0 self-end font-semibold tabular-nums text-primary"
                                    style={{ fontSize: `${productPriceFontPx}px` }}
                                  >
                                    {thb.format(product.price)}
                                  </span>
                                ) : null}
                              </Link>
                            </div>
                          )
                        })}
                      </div>
                    </Fragment>
                  )
                })}
              </div>
            )}

            {viewMode === 'list' && !mobileExpanded && listPageRowCount > 3 && (
              <div className="flex justify-center pt-6 md:hidden">
                <button
                  type="button"
                  onClick={() => setMobileExpanded(true)}
                  className="btn-gradient-solid-border body-sm font-semibold px-8 h-10 text-primary-content cursor-pointer hover:opacity-90"
                >
                  More
                </button>
              </div>
            )}

            {viewMode === 'list' && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8 md:pt-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-9 w-9 items-center justify-center rounded-box border body-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'border-primary bg-linear-to-r from-primary to-secondary text-primary-content'
                        : 'border-base-300 bg-primary-content text-base-content hover:border-primary'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
