import { GlobalConfig } from 'payload'

export const PortfolioHero: GlobalConfig = {
  slug: 'portfolio-hero',
  admin: {
    group: 'Page Heroes',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heroTitle',
      label: 'หัวข้อหลักหน้า Portfolio',
      type: 'text',
    },
    {
      name: 'heroSubtitle',
      label: 'คำอธิบายใต้หัวข้อ',
      type: 'text',
    },
    {
      name: 'heroTitleFontSize',
      label: 'ขนาดหัวข้อหลักหน้า Portfolio (px)',
      type: 'number',
      defaultValue: 56,
      min: 32,
      max: 96,
      admin: {
        description: 'ใช้กำหนดขนาดตัวอักษรของหัวข้อหลักบนส่วน Hero หน้าแสดงรายการ Portfolio',
      },
    },
    {
      name: 'heroSubtitleFontSize',
      label: 'ขนาดคำอธิบายใต้หัวข้อ (px)',
      type: 'number',
      defaultValue: 20,
      min: 14,
      max: 32,
      admin: {
        description:
          'ใช้กำหนดขนาดตัวอักษรของคำอธิบายใต้หัวข้อ บนส่วน Hero หน้าแสดงรายการ Portfolio',
      },
    },
    {
      name: 'highlightsTitleFontSize',
      label: 'ขนาดหัวข้อ Highlights (px)',
      type: 'number',
      defaultValue: 40,
      min: 24,
      max: 72,
      admin: {
        description: 'ใช้กำหนดขนาดตัวอักษรของหัวข้อ “HIGHLIGHTS” บนหน้าแสดงรายการ Portfolio',
      },
    },
    {
      name: 'sectionTitleFontSize',
      label: 'ขนาดหัวข้อหมวดผลงาน (px)',
      type: 'number',
      defaultValue: 28,
      min: 20,
      max: 48,
      admin: {
        description: 'ใช้กำหนดขนาดตัวอักษรของหัวข้อ “OUR FACILITIES” บนหน้าแสดงรายการ Portfolio',
      },
    },
    {
      name: 'cardTitleFontSize',
      label: 'ขนาดชื่อผลงานในการ์ด (px)',
      type: 'number',
      defaultValue: 18,
      min: 14,
      max: 28,
      admin: {
        description:
          'ใช้กำหนดขนาดตัวอักษรของชื่อบนผลงาน ในแต่ละการ์ดบนการ์ด หน้าแสดงรายการ และหัวข้อบนผลงาน “เพิ่มเติม” หน้ารายละเอียด',
      },
    },
    {
      name: 'detailHeroTitleFontSize',
      label: 'ขนาดหัวข้อหลักหน้ารายละเอียดผลงาน (px)',
      type: 'number',
      defaultValue: 40,
      min: 28,
      max: 72,
      admin: {
        description: 'ใช้กำหนดขนาดตัวอักษรของหัวข้อหลัก บนส่วน Hero หน้ารายละเอียดผลงาน',
      },
    },
    {
      name: 'detailBodyFontSize',
      label: 'ขนาดเนื้อหาหน้ารายละเอียด (px)',
      type: 'number',
      defaultValue: 16,
      min: 14,
      max: 24,
      admin: {
        description:
          'ใช้กำหนดขนาดตัวอักษรของเนื้อหา / รายละเอียดหลัก ในส่วนเนื้อหา บนหน้ารายละเอียดผลงาน',
      },
    },
    {
      name: 'moreProjectsTitleFontSize',
      label: 'ขนาดหัวข้อผลงานเพิ่มเติม (px)',
      type: 'number',
      defaultValue: 24,
      min: 18,
      max: 36,
      admin: {
        description:
          'ใช้กำหนดขนาดตัวอักษรของหัวข้อ “More Projects / ผลงานเพิ่มเติม” บนหน้ารายละเอียดผลงาน',
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
