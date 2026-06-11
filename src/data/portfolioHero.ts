import type { PortfolioHero } from '@/payload-types'
import { loadGlobal } from '@/lib/contentStore'

export const getPortfolioHeroGlobal = async (): Promise<PortfolioHero> => {
  return loadGlobal<PortfolioHero>('portfolio-hero')
}
