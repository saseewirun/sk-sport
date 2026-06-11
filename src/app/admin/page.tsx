'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiLogin, apiLoggedIn, AdminApiError } from '@/admin/api'

/**
 * หน้าเข้าสู่ระบบ — ช่องรหัสผ่านช่องเดียว (spec §1) ไม่มี username ไม่ต้อง
 * รู้จัก GitHub; token อยู่ฝั่งเซิร์ฟเวอร์เท่านั้น
 */
export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // เข้าระบบค้างไว้อยู่แล้ว → ตรงไปหน้าแรกของ admin
    apiLoggedIn().then((ok) => {
      if (ok) router.replace('/admin/home')
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password || submitting) return
    setError('')
    setSubmitting(true)
    try {
      await apiLogin(password)
      router.replace('/admin/home')
    } catch (err) {
      setError(
        err instanceof AdminApiError && err.status === 401
          ? 'รหัสผ่านไม่ถูกต้อง — กรุณาลองใหม่อีกครั้ง'
          : err instanceof AdminApiError
            ? err.message
            : 'เข้าสู่ระบบไม่สำเร็จ — กรุณาลองใหม่',
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm border border-base-300 bg-base-100 shadow-md">
        <form className="card-body gap-4" onSubmit={handleSubmit}>
          <div className="text-center">
            <h1 className="text-xl font-bold">SK Sport</h1>
            <p className="mt-1 text-sm text-base-content/60">ระบบจัดการเว็บไซต์</p>
          </div>

          <label className="form-control flex w-full flex-col gap-1">
            <span className="text-sm font-medium">รหัสผ่าน</span>
            <input
              type="password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
              placeholder="กรอกรหัสผ่านของคุณ"
            />
          </label>

          {error && <p className="text-sm text-error">❌ {error}</p>}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={submitting || !password}
          >
            {submitting && <span className="loading loading-spinner loading-xs" />}
            {submitting ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  )
}
