import type { Faq } from '@/payload-types'
import { loadGlobal } from '@/lib/contentStore'

export const getFaqGlobal = async (): Promise<Faq> => {
  return loadGlobal<Faq>('faq')
}
