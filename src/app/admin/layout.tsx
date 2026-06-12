import React from 'react'
import type { Metadata, Viewport } from 'next'
import { prompt, sarabun } from '@/lib/fonts'
import '@/style/typography.css'
import '../(frontend)/styles.css'

export const metadata: Metadata = {
  title: 'ระบบจัดการเว็บไซต์ — SK Sport',
  description: 'ระบบหลังบ้านสำหรับแก้ไขเนื้อหาเว็บไซต์ SK Sport',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" data-theme="sksport">
      <body className={`${sarabun.variable} ${prompt.variable} bg-base-200 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
