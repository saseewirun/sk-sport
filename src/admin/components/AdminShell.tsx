'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiLoggedIn } from '../api'

/** เมนูหลัก — เรียงตามเมนูบนเว็บจริง (spec §2) */
export const ADMIN_MENU = [
  { key: 'home', icon: '🏠', label: 'หน้าแรก', href: '/admin/home', sitePath: '/' },
  { key: 'about', icon: '👥', label: 'เกี่ยวกับเรา', href: '/admin/about', sitePath: '/about' },
  { key: 'services', icon: '🛠', label: 'บริการ', href: '/admin/services', sitePath: '/service' },
  { key: 'products', icon: '📦', label: 'สินค้า', href: '/admin/products', sitePath: '/product' },
  {
    key: 'portfolio',
    icon: '🏆',
    label: 'ผลงาน',
    href: '/admin/portfolio',
    sitePath: '/portfolio',
  },
  { key: 'contact', icon: '☎️', label: 'ติดต่อเรา', href: '/admin/contact', sitePath: '/contact' },
  { key: 'faq', icon: '❓', label: 'คำถามที่พบบ่อย', href: '/admin/faq', sitePath: '/faq' },
  {
    key: 'policies',
    icon: '📄',
    label: 'นโยบาย & ข้อกำหนด',
    href: '/admin/policies',
    sitePath: '/privacy-policy',
  },
  {
    key: 'orders',
    icon: '🧾',
    label: 'ประวัติการสั่งซื้อ',
    href: '/admin/orders',
    sitePath: null,
  },
  {
    key: 'payment',
    icon: '⚙️',
    label: 'ตั้งค่าการชำระเงิน',
    href: '/admin/payment',
    sitePath: '/checkout',
  },
] as const

export type AdminMenuKey = (typeof ADMIN_MENU)[number]['key']

/**
 * โครงหน้า admin ทุกหน้า: เมนูซ้าย (มือถือ = drawer) + แถบบนพร้อมปุ่ม
 * "ดูหน้าเว็บจริง" (กติกา spec ข้อ 5) + เช็ค session ก่อนแสดงผล
 */
export function AdminShell({
  active,
  children,
}: {
  active: AdminMenuKey
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const current = ADMIN_MENU.find((m) => m.key === active)

  useEffect(() => {
    let cancelled = false
    apiLoggedIn().then((ok) => {
      if (cancelled) return
      if (!ok) {
        router.replace('/admin')
      } else {
        setAuthed(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [router])

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg" aria-label="กำลังตรวจสอบสิทธิ์" />
      </div>
    )
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex min-h-screen flex-col">
        <header className="navbar sticky top-0 z-30 border-b border-base-300 bg-base-100 shadow-sm">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="admin-drawer"
              aria-label="เปิดเมนู"
              className="btn btn-square btn-ghost"
            >
              <span className="text-xl">☰</span>
            </label>
          </div>
          <div className="flex-1 px-2">
            <span className="text-lg font-semibold">
              {current ? `${current.icon} ${current.label}` : 'ระบบจัดการเว็บไซต์'}
            </span>
          </div>
          {current?.sitePath != null && (
            <div className="flex-none">
              <a
                href={current.sitePath}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                ดูหน้าเว็บจริง ↗
              </a>
            </div>
          )}
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      </div>

      <div className="drawer-side z-40">
        <label htmlFor="admin-drawer" aria-label="ปิดเมนู" className="drawer-overlay" />
        <aside className="flex min-h-full w-72 flex-col bg-base-100 border-r border-base-300">
          <div className="px-5 py-5 border-b border-base-300">
            <p className="text-lg font-bold">SK Sport</p>
            <p className="text-sm text-base-content/60">ระบบจัดการเว็บไซต์</p>
          </div>
          <ul className="menu w-full grow gap-1 p-3">
            {ADMIN_MENU.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={item.key === active ? 'menu-active font-semibold' : ''}
                >
                  <span aria-hidden>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-base-300 p-3 text-xs text-base-content/50">
            บันทึกแล้วเว็บไซต์จริงจะอัปเดตภายใน 2-3 นาที
          </div>
        </aside>
      </div>
    </div>
  )
}
