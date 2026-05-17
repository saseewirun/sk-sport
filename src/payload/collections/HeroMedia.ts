import type { CollectionConfig } from 'payload'
import { sanitizeFilename } from '@/utils/sanitizeFilename'

export const HeroMedia: CollectionConfig = {
  slug: 'hero-media',
  admin: {
    group: 'Media',
    description:
      'รูปภาพสำหรับ Hero Banner ทุกหน้า — แนะนำขนาด 1920×1080 px, ไม่เกิน 500 KB (ระบบบีบอัดและปรับขนาดให้อัตโนมัติ)',
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
    resizeOptions: { width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true },
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
