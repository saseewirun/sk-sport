import type { GalleryMedia, PaymentSetting } from '@/payload-types'
import { loadGlobal } from '@/lib/contentStore'

/** Serializable display props for bank transfer UI (e.g. checkout client). */
export type CheckoutPaymentSettings = {
  isEnabled: boolean
  bankName: string | null
  accountName: string | null
  accountNumber: string | null
  branch: string | null
  paymentInstructions: string | null
  qrCodeUrl: string | null
}

/** Safe baseline when the global is missing or the content file is absent. */
const DEFAULT_PAYMENT_SETTINGS: PaymentSetting = {
  id: '',
  isEnabled: true,
  orderNotificationEmail: null,
  bankName: null,
  accountName: null,
  accountNumber: null,
  branch: null,
  paymentInstructions: null,
  qrCodeImage: null,
  updatedAt: null,
  createdAt: null,
}

/**
 * Public payment (bank) settings from the content store.
 * Never throws: merges with a safe default; on error returns a disabled fallback.
 */
export async function getPaymentSettingsGlobal(): Promise<PaymentSetting> {
  try {
    const data = loadGlobal<PaymentSetting>('payment-settings')
    return {
      ...DEFAULT_PAYMENT_SETTINGS,
      ...data,
      isEnabled: data.isEnabled ?? true,
    }
  } catch {
    return { ...DEFAULT_PAYMENT_SETTINGS, isEnabled: false }
  }
}

function qrCodeUrlFromSetting(s: PaymentSetting): string | null {
  const qr = s.qrCodeImage
  if (typeof qr === 'object' && qr !== null && 'url' in qr) {
    const u = (qr as GalleryMedia).url
    if (typeof u === 'string' && u.trim() !== '') return u
  }
  return null
}

/** Maps global payment settings to plain fields for the checkout page. */
export function toCheckoutPaymentView(s: PaymentSetting): CheckoutPaymentSettings {
  return {
    isEnabled: s.isEnabled !== false,
    bankName: s.bankName ?? null,
    accountName: s.accountName ?? null,
    accountNumber: s.accountNumber ?? null,
    branch: s.branch ?? null,
    paymentInstructions: s.paymentInstructions ?? null,
    qrCodeUrl: qrCodeUrlFromSetting(s),
  }
}

export async function getCheckoutPaymentSettings(): Promise<CheckoutPaymentSettings> {
  return toCheckoutPaymentView(await getPaymentSettingsGlobal())
}
