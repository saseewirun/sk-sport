import type { ContactHero } from '@/payload-types'
import { loadGlobal } from '@/lib/contentStore'

export const getContactHeroGlobal = async (): Promise<ContactHero> => {
  return loadGlobal<ContactHero>('contact-hero')
}
