import type { CollectionConfig } from 'payload'

function slugify(name: string): string {
  const s = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || 'founder'
}

export const Founders: CollectionConfig = {
  slug: 'founders',
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'role', 'sortOrder', 'isVisible'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      label: 'ชื่อสมาชิก',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'Slug (ที่อยู่ URL)',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'ที่อยู่ URL ของหน้ารายละเอียด เช่น /about/founders/john-doe — ระบบสร้างอัตโนมัติจากชื่อเมื่อบันทึกครั้งแรก ห้ามแก้ไขหลังเผยแพร่แล้ว',
      },
    },
    {
      name: 'role',
      label: 'ตำแหน่งงาน',
      type: 'text',
    },
    {
      name: 'excerpt',
      label: 'คำอธิบายสั้น (แสดงบนการ์ดหน้า About)',
      type: 'textarea',
    },
    {
      name: 'description',
      label: 'คำอธิบายเต็ม (แสดงบนหน้ารายละเอียด)',
      type: 'textarea',
    },
    {
      name: 'quote',
      label: 'คำคม',
      type: 'textarea',
    },
    {
      name: 'aboutImage',
      label: 'รูปภาพ (สำหรับการ์ดหน้า About)',
      type: 'relationship',
      relationTo: ['hero-media', 'gallery-media'],
    },
    {
      name: 'gallery',
      label: 'รูปแกลเลอรี (สำหรับหน้ารายละเอียดเท่านั้น)',
      type: 'relationship',
      relationTo: ['hero-media', 'gallery-media'],
      hasMany: true,
    },
    {
      name: 'sortOrder',
      label: 'ลำดับการแสดง',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'เลขน้อยแสดงก่อน เช่น 0 = แรกสุด, 1 = ถัดไป — ใช้กำหนดลำดับบนหน้า About',
      },
    },
    {
      name: 'isVisible',
      label: 'แสดงบนเว็บไซต์',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) return data
        const name = typeof data.name === 'string' ? data.name : ''
        const rawSlug = typeof data.slug === 'string' ? data.slug : ''
        const slug = rawSlug.trim()
        if (name && !slug) {
          data.slug = slugify(name)
        }
        return data
      },
    ],
  },
}
