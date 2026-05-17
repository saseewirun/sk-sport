import type { CollectionConfig } from 'payload'

export const GalleryMedia: CollectionConfig = {
  slug: 'gallery-media',
  admin: {
    group: 'Media',
    description: 'รูปภาพสำหรับ Portfolio และสินค้า — แนะนำขนาด 1200×900 px (ระบบบีบอัดและปรับขนาดให้อัตโนมัติ)',
  },
  access: {
    read: () => true,
  },
  upload: {
    resizeOptions: {
      width: 1200,
      height: 900,
      fit: 'inside',
      withoutEnlargement: true,
    },
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
