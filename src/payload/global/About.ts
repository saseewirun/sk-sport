import { GlobalConfig } from 'payload'

export const About: GlobalConfig = {
  slug: 'about',
  admin: {
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heroTitle',
      label: 'หัวข้อ Hero (สำรอง / ร่วมกับ About Hero)',
      type: 'text',
    },
    {
      name: 'heroSubtitle',
      label: 'คำอธิบาย Hero (สำรอง / ร่วมกับ About Hero)',
      type: 'text',
    },
    {
      name: 'historySectionTitle',
      label: 'หัวข้อส่วน History',
      type: 'text',
    },
    {
      name: 'companyName',
      label: 'ชื่อบริษัท',
      type: 'text',
    },
    {
      name: 'historyDescription',
      label: 'คำอธิบาย History',
      type: 'textarea',
    },
    {
      name: 'historyHighlights',
      label: 'ไฮไลต์ / สถิติ',
      type: 'array',
      fields: [
        {
          name: 'value',
          label: 'ค่า (ตัวเลข)',
          type: 'text',
        },
        {
          name: 'label',
          label: 'คำอธิบาย',
          type: 'text',
        },
      ],
    },
    {
      name: 'missionTitle',
      label: 'หัวข้อพันธกิจ',
      type: 'text',
    },
    {
      name: 'missionDescription',
      label: 'รายละเอียดพันธกิจ',
      type: 'textarea',
    },
    {
      name: 'visionTitle',
      label: 'หัวข้อวิสัยทัศน์',
      type: 'text',
    },
    {
      name: 'visionDescription',
      label: 'รายละเอียดวิสัยทัศน์',
      type: 'textarea',
    },
    {
      name: 'founderSectionTitle',
      label: 'หัวข้อส่วน Team Member',
      type: 'text',
      defaultValue: 'Team Member',
      admin: {
        description: 'หัวข้อที่แสดงเหนือการ์ดสมาชิกทีม ค่าเริ่มต้น: "Team Member"',
      },
    },
    {
      name: 'founderImage',
      label: 'รูป Founder',
      type: 'relationship',
      relationTo: 'hero-media',
      hasMany: false,
    },
    {
      name: 'founderName',
      label: 'ชื่อ Founder',
      type: 'text',
    },
    {
      name: 'founderRole',
      label: 'ตำแหน่ง Founder',
      type: 'text',
    },
    {
      name: 'founderDescription',
      label: 'คำอธิบาย Founder',
      type: 'textarea',
    },
    {
      name: 'founderQuote',
      label: 'คำคม Founder',
      type: 'textarea',
    },
    {
      name: 'featuredProjectsSectionTitle',
      label: 'หัวข้อส่วนโปรเจกต์เด่น',
      type: 'text',
    },
    {
      name: 'featuredProjectsSectionSubtitle',
      label: 'คำอธิบายส่วนโปรเจกต์เด่น',
      type: 'textarea',
    },
    {
      name: 'featuredProjectsCtaText',
      label: 'ข้อความปุ่ม CTA โปรเจกต์เด่น',
      type: 'text',
    },
    {
      name: 'servicesSectionTitle',
      label: 'หัวข้อส่วน Services',
      type: 'text',
    },
    {
      name: 'servicesSectionSubtitle',
      label: 'คำอธิบายส่วน Services',
      type: 'textarea',
    },
    {
      name: 'servicesCtaText',
      label: 'ข้อความปุ่ม CTA Services',
      type: 'text',
    },
    {
      name: 'productsSectionTitle',
      label: 'หัวข้อส่วน Products',
      type: 'text',
    },
    {
      name: 'productsSectionSubtitle',
      label: 'คำอธิบายส่วน Products',
      type: 'textarea',
    },
    {
      name: 'productsCtaText',
      label: 'ข้อความปุ่ม CTA Products',
      type: 'text',
    },
    {
      name: 'sectionTitleFontSize',
      label: 'ขนาดหัวข้อเนื้อหาแต่ละ Section (px)',
      type: 'number',
      defaultValue: 32,
      min: 22,
      max: 56,
      admin: {
        description: 'เช่น หัว “About Us” หรือหัวส่วน Founder บนหน้า About',
      },
    },
    {
      name: 'highlightCardTitleFontSize',
      label: 'ขนาดหัวข้อการ์ดไฮไลต์/แนะนำ (px)',
      type: 'number',
      defaultValue: 20,
      min: 16,
      max: 36,
      admin: {
        description: 'หัวข้อบนการ์ดตัวเติม 4 ใบใต้ส่วน About',
      },
    },
    {
      name: 'highlightCardBodyFontSize',
      label: 'ขนาดเนื้อหาในการ์ดไฮไลต์ (px)',
      type: 'number',
      defaultValue: 15,
      min: 13,
      max: 24,
      admin: {
        description: 'เนื้อหาหลักบนการ์ดตัวเติม 4 ใบ',
      },
    },
    {
      name: 'statNumberFontSize',
      label: 'ขนาดตัวเลขสถิติ (px)',
      type: 'number',
      defaultValue: 28,
      min: 20,
      max: 48,
      admin: {
        description: 'ตัวเลขบนกล่อง “ไฮไลต์ / สถิติ” จาก CMS',
      },
    },
    {
      name: 'statLabelFontSize',
      label: 'ขนาดคำอธิบายใต้สถิติ (px)',
      type: 'number',
      defaultValue: 14,
      min: 12,
      max: 22,
      admin: {
        description: 'คำอธิบายใต้ตัวเลขในกล่องสถิติ',
      },
    },
    {
      name: 'missionVisionTitleFontSize',
      label: 'ขนาดหัวข้อพันธกิจ / วิสัยทัศน์ (px)',
      type: 'number',
      defaultValue: 28,
      min: 20,
      max: 48,
      admin: {
        description: 'หัวพันธกิจและหัววิสัยทัศน์ บล็อกสองฝั่ง',
      },
    },
    {
      name: 'missionVisionBodyFontSize',
      label: 'ขนาดเนื้อหาพันธกิจ / วิสัยทัศน์ (px)',
      type: 'number',
      defaultValue: 16,
      min: 14,
      max: 24,
      admin: {
        description: 'เนื้อหาใต้หัวพันธกิจและวิสัยทัศน์',
      },
    },
    {
      name: 'videoSectionTitle',
      label: 'หัวข้อ Section วิดีโอ',
      type: 'text',
      defaultValue: 'Video',
    },
    {
      name: 'videoSectionTitleFontSize',
      label: 'ขนาดหัวข้อ Section วิดีโอ (px)',
      type: 'number',
      defaultValue: 32,
      min: 20,
      max: 56,
      admin: {
        description: 'ขนาดตัวอักษรของหัวข้อ Section วิดีโอบนหน้า About',
      },
    },
    {
      name: 'youtubeVideos',
      label: 'คลิป YouTube',
      type: 'array',
      minRows: 0,
      fields: [
        {
          name: 'title',
          label: 'ชื่อคลิป',
          type: 'text',
        },
        {
          name: 'youtubeUrl',
          label: 'ลิงก์ YouTube',
          type: 'text',
          admin: {
            description:
              'วางลิงก์ YouTube เช่น https://www.youtube.com/watch?v=... หรือ https://youtu.be/...',
          },
        },
        {
          name: 'embedTitle',
          label: 'คำอธิบายสำหรับ iframe',
          type: 'text',
          defaultValue: 'YouTube video',
        },
      ],
    },
    {
      name: 'founderCardTitleFontSize',
      label: 'ขนาดชื่อบนการ์ด Founder (px)',
      type: 'number',
      defaultValue: 28,
      min: 20,
      max: 48,
      admin: {
        description: 'ชื่อบนการ์ด Founder หน้า About (ไม่รวมป้ายตำแหน่ง/ปุ่ม Read more)',
      },
    },
    {
      name: 'founderCardBodyFontSize',
      label: 'ขนาดคำอธิบายบนการ์ด Founder (px)',
      type: 'number',
      defaultValue: 16,
      min: 14,
      max: 24,
      admin: {
        description: 'ย่อ/คำอธิบายบนการ์ด Founder หน้า About',
      },
    },
    {
      name: 'founderQuoteFontSize',
      label: 'ขนาดคำคมบนการ์ด Founder (px)',
      type: 'number',
      defaultValue: 18,
      min: 14,
      max: 28,
      admin: {
        description: 'ข้อความคำคม (blockquote) บนการ์ด Founder หน้า About',
      },
    },
    {
      name: 'founderDetailTitleFontSize',
      label: 'ขนาดหัวข้อหน้ารายละเอียด Founder (px)',
      type: 'number',
      defaultValue: 42,
      min: 28,
      max: 72,
      admin: {
        description: 'ชื่อบนหน้า /about/founders/[slug] (ไม่รวมป้าย role หรือปุ่ม)',
      },
    },
    {
      name: 'founderDetailBodyFontSize',
      label: 'ขนาดเนื้อหาหน้ารายละเอียด Founder (px)',
      type: 'number',
      defaultValue: 16,
      min: 14,
      max: 24,
      admin: {
        description:
          'เนื้อหาหลัก (คำอธิบาย) บนหน้า founder — ไม่รวมคำคมใน blockquote หรือลิงก์กลับ',
      },
    },
  ],
}
