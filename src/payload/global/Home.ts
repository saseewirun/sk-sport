import { GlobalConfig } from 'payload'
import { revalidateGlobalAfterChange } from '@/payload/hooks/revalidate'

export const Home: GlobalConfig = {
  slug: 'home',
  admin: {
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobalAfterChange],
  },
  fields: [
    {
      name: 'heroMedia',
      label: 'รูป / วิดีโอ Hero',
      type: 'relationship',
      relationTo: 'hero-media',
      hasMany: true,
    },
    {
      name: 'galleryMedia',
      label: 'รูปแกลลอรี',
      type: 'relationship',
      relationTo: 'gallery-media',
      hasMany: true,
    },
    {
      name: 'partners',
      label: 'พาร์ตเนอร์ (โลโก้)',
      type: 'relationship',
      relationTo: 'partner-media',
      hasMany: true,
      admin: {
        description: 'ลำดับบนเว็บตามลำดับที่เลือก',
      },
    },
    {
      name: 'heroTitleFontSize',
      label: 'ขนาดหัวข้อ Hero หน้าแรก (px)',
      type: 'number',
      defaultValue: 56,
      min: 32,
      max: 96,
      admin: {
        description: 'หัวข้อหลักบนแบนเนอร์ (หลายบรรทัด) ไม่รวมปุ่ม',
      },
    },
    {
      name: 'heroSubtitleFontSize',
      label: 'ขนาดคำอธิบาย Hero หน้าแรก (px)',
      type: 'number',
      defaultValue: 20,
      min: 14,
      max: 32,
      admin: {
        description: 'คำอธิบายใต้หัวข้อ บนแบนเนอร์',
      },
    },
    {
      name: 'sectionTitleFontSize',
      label: 'ขนาดหัวข้อ Section (px)',
      type: 'number',
      defaultValue: 32,
      min: 20,
      max: 56,
      admin: {
        description: 'หัวรายส่วนเช่น บริการ สินค้า ผลงาน แกลเลอรี ฯลฯ',
      },
    },
    {
      name: 'highlightTitleFontSize',
      label: 'ขนาดหัวข้อเนื้อหาเน้น (px)',
      type: 'number',
      defaultValue: 28,
      min: 20,
      max: 48,
      admin: {
        description: 'หัวย่อยบล็อกเนื้อหา / รายละเอียด (เช่น About, รายละเอียดเด่น)',
      },
    },
    {
      name: 'highlightBodyFontSize',
      label: 'ขนาดเนื้อหาเน้น (px)',
      type: 'number',
      defaultValue: 16,
      min: 14,
      max: 24,
      admin: {
        description: 'เนื้อหายาวในบล็อกเน้น / ย่อยนำ ไม่รวมป้ายเล็ก',
      },
    },
    {
      name: 'cardTitleFontSize',
      label: 'ขนาดหัวข้อบนการ์ด (px)',
      type: 'number',
      defaultValue: 20,
      min: 16,
      max: 36,
      admin: {
        description: 'ชื่อบนการ์ดบริการ / สินค้า / ผลงาน ฯลฯ (ไม่รวมไอคอน/ปุ่ม)',
      },
    },
    {
      name: 'cardBodyFontSize',
      label: 'ขนาดเนื้อหาในการ์ด (px)',
      type: 'number',
      defaultValue: 14,
      min: 12,
      max: 22,
      admin: {
        description: 'คำอธิบาย/ย่อใต้หัวบนการ์ดใหญ่',
      },
    },
  ],
}
