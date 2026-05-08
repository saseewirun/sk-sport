import { render } from '@react-email/components'
import type { CollectionConfig, Payload } from 'payload'

import type { PaymentSetting } from '@/payload-types'
import { QuoteRequestNotificationEmail } from '../../emails/QuoteRequestNotification'
import { QuoteRequestConfirmationEmail } from '../../emails/QuoteRequestConfirmation'

const QUOTE_NOTIFY_FALLBACK = 'saseewirun@sksporttrading.com'

function formatLogErr(err: unknown): string {
  if (err instanceof Error) return err.message
  return String(err)
}

/**
 * Quote request owner address (same priority as order notifications):
 * 1) PaymentSettings.orderNotificationEmail (if set)
 * 2) process.env.ORDER_NOTIFY_EMAIL
 * 3) static business fallback
 */
async function resolveQuoteOwnerNotifyTo(req: { payload: Payload }): Promise<string> {
  try {
    const settings = (await req.payload.findGlobal({
      slug: 'payment-settings',
      depth: 0,
      overrideAccess: true,
    })) as PaymentSetting
    const v = settings?.orderNotificationEmail
    if (typeof v === 'string' && v.trim() !== '') {
      return v.trim()
    }
  } catch (err) {
    req.payload.logger.error(
      `[Quote requests] could not read payment-settings for owner notification email: ${formatLogErr(err)}`,
    )
  }
  const env = process.env.ORDER_NOTIFY_EMAIL
  if (env && env.trim() !== '') {
    return env.trim()
  }
  return QUOTE_NOTIFY_FALLBACK
}

export const QuoteRequests: CollectionConfig = {
  slug: 'quote-requests',
  labels: { singular: 'Quote request', plural: 'Quote requests' },
  admin: {
    group: 'Sales',
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'email', 'status', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => false,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation !== 'create') return

        const to = await resolveQuoteOwnerNotifyTo(req)
        const quoteRequestId = String(doc.id)
        const customerName = typeof doc.customerName === 'string' ? doc.customerName : ''
        const email = typeof doc.email === 'string' ? doc.email : ''
        const phone = typeof doc.phone === 'string' ? doc.phone : ''
        const companyName = typeof doc.companyName === 'string' ? doc.companyName : ''
        const message = typeof doc.message === 'string' ? doc.message : ''
        const lineItems = Array.isArray(doc.lineItems) ? doc.lineItems : []
        const submittedAt = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })

        const lineRows = lineItems.map(
          (row: {
            productId?: string
            slug?: string
            title?: string
            category?: string | null
            quantity?: number
          }) => ({
            productId: row.productId ?? '—',
            slug: row.slug ?? '—',
            title: row.title ?? '—',
            category: row.category && String(row.category).trim() !== '' ? row.category : '—',
            quantity:
              typeof row.quantity === 'number' && Number.isFinite(row.quantity) ? row.quantity : 0,
          }),
        )

        try {
          const html = await render(
            QuoteRequestNotificationEmail({
              quoteRequestId,
              customerName,
              email,
              phone,
              companyName,
              message,
              lineRows,
              submittedAt,
            }),
          )
          await req.payload.sendEmail({
            to,
            subject: `[SK-Sport] New quote request ${quoteRequestId} from ${customerName || 'Unknown'}`,
            html,
          })
        } catch (err) {
          req.payload.logger.error(
            `[Quote requests] owner notification email failed: ${formatLogErr(err)}`,
          )
        }

        if (email.trim() === '') {
          return
        }

        try {
          const confirmHtml = await render(
            QuoteRequestConfirmationEmail({
              customerName: customerName || 'customer',
              message,
              lineRows,
            }),
          )
          await req.payload.sendEmail({
            to: email.trim(),
            subject: 'We have received your quote request — SK Sport',
            html: confirmHtml,
          })
        } catch (err) {
          req.payload.logger.error(
            `[Quote requests] customer confirmation email failed: ${formatLogErr(err)}`,
          )
        }
      },
    ],
  },
  timestamps: true,
  fields: [
    {
      name: 'status',
      label: 'สถานะ',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'ใหม่', value: 'new' },
        { label: 'ติดต่อแล้ว', value: 'contacted' },
        { label: 'ปิดแล้ว', value: 'closed' },
      ],
    },
    {
      name: 'customerName',
      label: 'ชื่อลูกค้า',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'อีเมล',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      label: 'เบอร์โทร',
      type: 'text',
    },
    {
      name: 'companyName',
      label: 'ชื่อบริษัท',
      type: 'text',
    },
    {
      name: 'message',
      label: 'ข้อความจากลูกค้า',
      type: 'textarea',
    },
    {
      name: 'lineItems',
      label: 'รายการสินค้าที่ขอใบเสนอราคา',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'productId',
          label: 'รหัสสินค้า',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          label: 'Slug สินค้า',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          label: 'ชื่อสินค้า',
          type: 'text',
          required: true,
        },
        {
          name: 'category',
          label: 'หมวดหมู่',
          type: 'text',
        },
        {
          name: 'quantity',
          label: 'จำนวน',
          type: 'number',
          required: true,
          min: 1,
        },
      ],
    },
    {
      name: 'adminNotes',
      label: 'หมายเหตุผู้ดูแล',
      type: 'textarea',
    },
  ],
}
