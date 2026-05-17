import type { CollectionConfig } from 'payload'
import { sanitizeFilename } from '@/utils/sanitizeFilename'

export const ServiceMedia: CollectionConfig = {
  slug: 'service-media',
  admin: {
    group: 'Media',
    description:
      'รูปภาพสำหรับหน้า Services — แนะนำขนาด 1200×900 px (ระบบบีบอัดและปรับขนาดให้อัตโนมัติ)',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeOperation: [
      async ({ args, operation }) => {
        if ((operation === 'create' || operation === 'update') && args.req?.file) {
          args.req.file.name = sanitizeFilename(args.req.file.name)
        }
        return args
      },
    ],
  },
  upload: {
    resizeOptions: { width: 1200, height: 900, fit: 'inside', withoutEnlargement: true },
    formatOptions: {
      format: 'webp',
      options: {
        quality: 82,
      },
    },
  },
  fields: [
    {
      name: 'alt',
      label: 'คำอธิบายรูป (Alt text)',
      type: 'text',
      required: true,
      admin: {
        description: 'อธิบายว่าภาพนี้คืออะไร สำหรับคนใช้ screen reader และ SEO',
      },
    },
  ],
}
