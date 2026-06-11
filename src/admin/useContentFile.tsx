'use client'

import { useCallback, useEffect, useState } from 'react'
import { getContentFile, putContentFile } from './api'

/**
 * โหลดไฟล์เนื้อหา 1 ไฟล์ + ฟังก์ชันบันทึกแบบ "อ่านล่าสุด-แก้เฉพาะส่วน-เขียนกลับ"
 * เพื่อให้แต่ละการ์ดบันทึกเฉพาะช่องของตัวเอง ไม่ทับงานการ์ดอื่นที่ยังไม่กดบันทึก
 */
export function useContentFile<T>(file: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getContentFile<T>(file)
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ — กรุณารีเฟรชหน้านี้')
      })
    return () => {
      cancelled = true
    }
  }, [file])

  const saveFields = useCallback(
    async (message: string, apply: (latest: T) => T) => {
      const latest = await getContentFile<T>(file)
      const merged = apply(latest)
      await putContentFile(file, merged, message)
      setData(merged)
    },
    [file],
  )

  return { data, error, saveFields }
}

/** สถานะโหลดรวมของหลายไฟล์ในหน้าเดียว */
export function LoadingOrError({ error, loading }: { error: string; loading: boolean }) {
  if (error) return <div className="alert alert-error text-sm">❌ {error}</div>
  if (loading)
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg" aria-label="กำลังโหลดข้อมูล" />
      </div>
    )
  return null
}
