import type { CollectionConfig } from 'payload'

export const PortfolioArticles: CollectionConfig = {
  slug: 'portfolio-articles',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'tag', 'highlight', 'createdAt'],
  },
  access: {
    read: () => true,
  },
  timestamps: true,
  fields: [
    {
      name: 'title',
      label: 'ชื่อผลงาน',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      label: 'ชื่อรอง',
      type: 'text',
    },
    {
      name: 'highlight',
      label: 'แสดงเป็นผลงานเด่น',
      type: 'checkbox',
    },
    {
      name: 'sectionTitle',
      label: 'หัวข้อรายละเอียด',
      type: 'text',
    },
    {
      name: 'sectionDetail',
      label: 'รายละเอียดผลงาน',
      type: 'textarea',
      required: true,
    },
    {
      name: 'sectionImage',
      label: 'รูปภาพหลัก',
      type: 'relationship',
      relationTo: 'gallery-media',
      hasMany: false,
    },
    {
      name: 'gallery',
      label: 'รูปแกลเลอรี',
      type: 'relationship',
      relationTo: 'gallery-media',
      hasMany: true,
    },
    {
      name: 'tag',
      label: 'แท็ก',
      type: 'text',
    },
    {
      name: 'slug',
      label: 'Slug (ที่อยู่ URL)',
      type: 'text',
      required: true,
      unique: true,
    },
  ],
}
