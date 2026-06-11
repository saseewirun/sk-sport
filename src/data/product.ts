import type { Product } from '@/payload-types'
import { byCreatedAtDesc, loadCollection } from '@/lib/contentStore'

/** Returns full product docs including `mode` and `price` (image pre-populated in export). */
export const getAllProducts = async (): Promise<Product[]> => {
  return loadCollection<Product>('products').sort(byCreatedAtDesc)
}

/** Resolves by slug with `mode`, `price`, and populated `image`. */
export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const all = await getAllProducts()
  return all.find((p) => p.slug === slug) ?? null
}

const normCategory = (c: string | null | undefined) => (c ?? '').trim().toLowerCase()

/** Same-category first, then others; excludes current product id. */
export const getRecommendedProducts = async (
  excludeId: string,
  category: string | null | undefined,
  limit = 3,
): Promise<Product[]> => {
  const all = await getAllProducts()
  const others = all.filter((p) => p.id !== excludeId)
  const cat = normCategory(category)
  const same = cat ? others.filter((p) => normCategory(p.category) === cat) : []
  const rest = others.filter((p) => !same.includes(p))
  return [...same, ...rest].slice(0, limit)
}
