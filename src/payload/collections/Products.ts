import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category', 'createdAt'],
  },
  access: {
    read: () => true,
  },
  timestamps: true,
  fields: [
    {
      name: 'title',
      label: 'ชื่อสินค้า',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      label: 'ชื่อรอง',
      type: 'text',
    },
    {
      name: 'category',
      label: 'หมวดหมู่',
      type: 'text',
    },
    {
      name: 'mode',
      label: 'รูปแบบการขาย',
      type: 'select',
      required: true,
      defaultValue: 'quote',
      options: [
        { label: 'ขอใบเสนอราคา (ไม่มีราคาแสดง)', value: 'quote' },
        { label: 'ซื้อได้เลย (มีราคาแสดง)', value: 'buy' },
      ],
    },
    {
      name: 'price',
      label: 'ราคา (บาท)',
      type: 'number',
      min: 0,
      admin: {
        description: 'ใส่เฉพาะเมื่อรูปแบบการขายเป็น "ซื้อได้เลย"',
        condition: (data) => (data as { mode?: string }).mode === 'buy',
      },
    },
    {
      name: 'description',
      label: 'คำอธิบายสินค้า',
      type: 'textarea',
      required: true,
    },
    {
      name: 'image',
      label: 'รูปสินค้า',
      type: 'relationship',
      relationTo: 'gallery-media',
      hasMany: false,
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
