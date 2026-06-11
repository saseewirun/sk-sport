import type { ProductsHero } from '@/payload-types'
import { loadGlobal } from '@/lib/contentStore'

export const getProductsHeroGlobal = async (): Promise<ProductsHero> => {
  return loadGlobal<ProductsHero>('products-hero')
}
