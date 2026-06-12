import type { PrivacyPolicy } from '@/payload-types'
import { loadGlobal } from '@/lib/contentStore'

export const getPrivacyPolicyGlobal = async (): Promise<PrivacyPolicy> => {
  return loadGlobal<PrivacyPolicy>('privacy-policy')
}
