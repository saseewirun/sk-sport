import type { CollectionConfig } from 'payload'
import type { Service } from '../../payload-types'
import { revalidateAfterChange, revalidateAfterDelete } from '@/payload/hooks/revalidate'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'subtitle', 'createdAt'],
  },
  access: {
    read: () => true,
  },
  timestamps: true,
  fields: [
    {
      name: 'title',
      label: 'ชื่อบริการ',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      label: 'ชื่อรองบริการ',
      type: 'text',
    },
    {
      name: 'hero',
      label: 'รูปภาพแบนเนอร์บริการ',
      type: 'upload',
      relationTo: 'service-media',
    },
    {
      name: 'slug',
      label: 'Slug (ที่อยู่ URL — ใช้ชื่อบริการเป็นค่าเริ่มต้น)',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [
          ({ data, value }: { data?: Partial<Service> | null; value?: string | null }) => {
            if (!value && data && typeof data.title === 'string') {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'sections',
      label: 'ส่วนเนื้อหาบริการ',
      type: 'array',
      fields: [
        {
          name: 'sectionTitle',
          label: 'หัวข้อส่วนนี้',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          label: 'คำอธิบาย',
          type: 'textarea',
        },
        {
          name: 'variant',
          label: 'รูปแบบการแสดงผล',
          type: 'select',
          options: [
            { label: 'แบบตาราง (กริดรูปภาพหลายรูป)', value: 'column' },
            { label: 'แบบแถว (รูปภาพ + ข้อความ)', value: 'row' },
          ],
          defaultValue: 'column',
          required: true,
        },
        {
          name: 'images',
          label: 'รูปภาพ (หลายรูป)',
          type: 'array',
          admin: {
            condition: (_: Partial<Service>, siblingData: { variant?: string }) =>
              siblingData?.variant === 'column',
          },
          fields: [
            {
              name: 'image',
              label: 'รูปภาพ',
              type: 'upload',
              relationTo: 'service-media',
              required: true,
            },
          ],
        },
        {
          name: 'image',
          label: 'รูปภาพ (รูปเดียว)',
          type: 'upload',
          relationTo: 'service-media',
          admin: {
            condition: (_: Partial<Service>, siblingData: { variant?: string }) =>
              siblingData?.variant === 'row',
          },
        },
        {
          name: 'alignment',
          label: 'ตำแหน่งรูปภาพ',
          type: 'select',
          options: [
            { label: 'ซ้าย', value: 'left' },
            { label: 'ขวา', value: 'right' },
          ],
          defaultValue: 'left',
          admin: {
            condition: (_: Partial<Service>, siblingData: { variant?: string }) =>
              siblingData?.variant === 'row',
          },
        },
      ],
    },
    {
      name: 'tags',
      label: 'แท็ก',
      type: 'array',
      fields: [
        {
          name: 'tag',
          label: 'แท็ก',
          type: 'text',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
}
