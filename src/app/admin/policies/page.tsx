'use client'

import React, { useState } from 'react'
import { AdminShell } from '@/admin/components/AdminShell'
import { SectionCard } from '@/admin/components/SectionCard'
import { TextField, TextAreaField } from '@/admin/components/fields'
import { useContentFile, LoadingOrError } from '@/admin/useContentFile'
import { lexicalToPlainText, plainTextToLexical, type LexicalContent } from '@/admin/lexical'

const PRIVACY = 'content/globals/privacy-policy.json'
const TERMS = 'content/globals/terms-of-service.json'

type PolicyGlobal = {
  heroTitle?: string | null
  lastUpdated?: string | null
  content?: LexicalContent | null
} & Record<string, unknown>

type SaveFn<T> = (message: string, apply: (latest: T) => T) => Promise<void>

/**
 * นโยบาย & ข้อกำหนด — แท็บ 2 อัน เนื้อหาเป็นกล่องข้อความหลายย่อหน้า
 * (ระบบแปลงเป็นรูปแบบที่เว็บใช้แสดงผลให้อัตโนมัติ — spec §3)
 */
export default function AdminPoliciesPage() {
  const privacy = useContentFile<PolicyGlobal>(PRIVACY)
  const terms = useContentFile<PolicyGlobal>(TERMS)
  const [tab, setTab] = useState<'privacy' | 'terms'>('privacy')

  return (
    <AdminShell active="policies">
      <LoadingOrError error={privacy.error || terms.error} loading={!privacy.data || !terms.data} />
      {privacy.data && terms.data && (
        <>
          <div role="tablist" className="tabs tabs-border mb-4">
            <button
              role="tab"
              className={`tab ${tab === 'privacy' ? 'tab-active font-semibold' : ''}`}
              onClick={() => setTab('privacy')}
            >
              นโยบายความเป็นส่วนตัว
            </button>
            <button
              role="tab"
              className={`tab ${tab === 'terms' ? 'tab-active font-semibold' : ''}`}
              onClick={() => setTab('terms')}
            >
              ข้อกำหนดการใช้งาน
            </button>
          </div>

          {tab === 'privacy' ? (
            <PolicyCard
              key="privacy"
              pageName="นโยบายความเป็นส่วนตัว"
              sitePath="/privacy-policy"
              data={privacy.data}
              save={privacy.saveFields}
            />
          ) : (
            <PolicyCard
              key="terms"
              pageName="ข้อกำหนดการใช้งาน"
              sitePath="/terms"
              data={terms.data}
              save={terms.saveFields}
            />
          )}
        </>
      )}
    </AdminShell>
  )
}

function PolicyCard({
  pageName,
  sitePath,
  data,
  save,
}: {
  pageName: string
  sitePath: string
  data: PolicyGlobal
  save: SaveFn<PolicyGlobal>
}) {
  const [title, setTitle] = useState(data.heroTitle ?? '')
  const [updated, setUpdated] = useState(data.lastUpdated ?? '')
  const [body, setBody] = useState(() => lexicalToPlainText(data.content))

  return (
    <SectionCard
      order={1}
      title={pageName}
      description={`เนื้อหาทั้งหมดของหน้า ${pageName} (เปิดดูได้ที่ ${sitePath})`}
      onSave={() =>
        save(`แก้ไข${pageName}`, (latest) => ({
          ...latest,
          heroTitle: title || null,
          lastUpdated: updated || null,
          content: plainTextToLexical(body),
        }))
      }
    >
      <TextField label="หัวข้อหน้า" value={title} onChange={setTitle} />
      <TextField
        label="วันที่อัปเดตล่าสุด"
        description="ข้อความแสดงใต้หัวข้อ เช่น “อัปเดตล่าสุด: มกราคม 2569”"
        value={updated}
        onChange={setUpdated}
      />
      <TextAreaField
        label="เนื้อหา"
        description="พิมพ์เป็นย่อหน้าธรรมดา เว้นบรรทัดว่าง 1 บรรทัดระหว่างย่อหน้า"
        value={body}
        onChange={setBody}
        rows={18}
      />
    </SectionCard>
  )
}
