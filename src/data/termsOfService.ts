import type { TermsOfService } from '@/payload-types'
import { loadGlobal } from '@/lib/contentStore'

export const getTermsOfServiceGlobal = async (): Promise<TermsOfService> => {
  return loadGlobal<TermsOfService>('terms-of-service')
}
