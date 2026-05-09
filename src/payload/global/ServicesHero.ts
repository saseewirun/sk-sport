import { GlobalConfig } from 'payload'

export const ServicesHero: GlobalConfig = {
  slug: 'services-hero',
  admin: {
    group: 'Page Heroes',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heroTitle',
      label: 'หัวข้อหลักหน้า Services',
      type: 'text',
    },
    {
      name: 'heroSubtitle',
      label: 'คำอธิบายใต้หัวข้อหน้า Services',
      type: 'text',
    },
    {
      name: 'heroTitleFontSize',
      label: 'ขนาดหัวข้อหลักหน้า Services (px)',
      type: 'number',
      defaultValue: 56,
      min: 32,
      max: 96,
      admin: {
        description:
          'ใช้กำหนดขนาดตัวอักษรของหัวข้อหลัก (บรรทัดแรกและบรรทัดสอง) บนส่วน Hero หน้าแสดงรายการบริการ',
      },
    },
    {
      name: 'heroSubtitleFontSize',
      label: 'ขนาดคำอธิบายหน้า Services (px)',
      type: 'number',
      defaultValue: 20,
      min: 14,
      max: 32,
      admin: {
        description: 'ใช้กำหนดขนาดตัวอักษรของคำอธิบายใต้หัวข้อบนส่วน Hero หน้าแสดงรายการบริการ',
      },
    },
    {
      name: 'serviceCardTitleFontSize',
      label: 'ขนาดหัวข้อการ์ดบริการ (px)',
      type: 'number',
      defaultValue: 28,
      min: 18,
      max: 48,
      admin: {
        description: 'ใช้กำหนดขนาดตัวอักษรของชื่อบริการบนแต่ละการ์ด ในหน้าแสดงรายการบริการ',
      },
    },
    {
      name: 'serviceCardBodyFontSize',
      label: 'ขนาดคำอธิบายในการ์ดบริการ (px)',
      type: 'number',
      defaultValue: 16,
      min: 14,
      max: 24,
      admin: {
        description: 'ใช้กำหนดขนาดตัวอักษรของคำอธิบายย่อบนแต่ละการ์ด ในหน้าแสดงรายการบริการ',
      },
    },
    {
      name: 'detailHeroTitleFontSize',
      label: 'ขนาดหัวข้อหลักหน้ารายละเอียดบริการ (px)',
      type: 'number',
      defaultValue: 48,
      min: 32,
      max: 88,
      admin: {
        description:
          'ใช้กำหนดขนาดตัวอักษรของหัวข้อหลักบนส่วน Hero ด้านบน หน้ารายละเอียดแต่ละบริการ',
      },
    },
    {
      name: 'detailContentTitleFontSize',
      label: 'ขนาดหัวข้อเนื้อหาหน้ารายละเอียดบริการ (px)',
      type: 'number',
      defaultValue: 28,
      min: 20,
      max: 48,
      admin: {
        description: 'ใช้กำหนดขนาดตัวอักษรของหัวข้อแต่ละย่อ ในเนื้อหาหลักบนหน้ารายละเอียดบริการ',
      },
    },
    {
      name: 'detailContentBodyFontSize',
      label: 'ขนาดรายละเอียดเนื้อหาบริการ (px)',
      type: 'number',
      defaultValue: 16,
      min: 14,
      max: 24,
      admin: {
        description:
          'ใช้กำหนดขนาดตัวอักษรของเนื้อหา / รายละเอียดใต้หัวข้อแต่ละย่อ บนหน้ารายละเอียดบริการ',
      },
    },
    {
      name: 'relatedHeadingFontSize',
      label: 'ขนาดหัวข้อบทความที่เกี่ยวข้อง (px)',
      type: 'number',
      defaultValue: 22,
      min: 18,
      max: 36,
      admin: {
        description:
          'ใช้กำหนดขนาดตัวอักษรของหัวข้อด้านบนรายการ “บทความที่เกี่ยวข้อง” บนหน้ารายละเอียดบริการ',
      },
    },
    {
      name: 'relatedItemTitleFontSize',
      label: 'ขนาดชื่อบทความที่เกี่ยวข้อง (px)',
      type: 'number',
      defaultValue: 14,
      min: 12,
      max: 22,
      admin: {
        description:
          'ใช้กำหนดขนาดตัวอักษรของชื่อบทความแต่ละรายการ ไม่รวมลิงก์ “Read more / อ่านเพิ่ม”',
      },
    },
    {
      name: 'heroMedia',
      label: 'รูปภาพ Hero',
      type: 'relationship',
      relationTo: 'hero-media',
      hasMany: true,
    },
  ],
}
