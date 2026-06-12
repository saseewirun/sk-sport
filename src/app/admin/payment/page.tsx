'use client'

import React, { useState } from 'react'
import { AdminShell } from '@/admin/components/AdminShell'
import { SectionCard } from '@/admin/components/SectionCard'
import { TextField, TextAreaField, ToggleField } from '@/admin/components/fields'
import { ImageField } from '@/admin/components/ImageField'
import { useContentFile, LoadingOrError } from '@/admin/useContentFile'
import type { MediaDoc } from '@/admin/media'

const PAYMENT = 'content/globals/payment-settings.json'

type PaymentSettings = {
  isEnabled?: boolean | null
  orderNotificationEmail?: string | null
  bankName?: string | null
  accountName?: string | null
  accountNumber?: string | null
  branch?: string | null
  paymentInstructions?: string | null
  qrCodeImage?: MediaDoc | null
} & Record<string, unknown>

type SaveFn<T> = (message: string, apply: (latest: T) => T) => Promise<void>

export default function AdminPaymentPage() {
  const payment = useContentFile<PaymentSettings>(PAYMENT)

  return (
    <AdminShell active="payment">
      <LoadingOrError error={payment.error} loading={!payment.data} />
      {payment.data && <PaymentCard data={payment.data} save={payment.saveFields} />}
    </AdminShell>
  )
}

function PaymentCard({ data, save }: { data: PaymentSettings; save: SaveFn<PaymentSettings> }) {
  const [enabled, setEnabled] = useState(data.isEnabled !== false)
  const [email, setEmail] = useState(data.orderNotificationEmail ?? '')
  const [bank, setBank] = useState({
    bankName: data.bankName ?? '',
    accountName: data.accountName ?? '',
    accountNumber: data.accountNumber ?? '',
    branch: data.branch ?? '',
  })
  const [instructions, setInstructions] = useState(data.paymentInstructions ?? '')
  const [qr, setQr] = useState<MediaDoc | null>(data.qrCodeImage ?? null)
  const setBankField = (k: keyof typeof bank) => (v: string) => setBank({ ...bank, [k]: v })

  return (
    <SectionCard
      order={1}
      title="การชำระเงินด้วยการโอน"
      description="ข้อมูลบัญชีที่ลูกค้าเห็นบนหน้า ชำระเงิน เมื่อกดซื้อสินค้า"
      onSave={() =>
        save('แก้ไขตั้งค่าการชำระเงิน', (latest) => ({
          ...latest,
          isEnabled: enabled,
          orderNotificationEmail: email || null,
          bankName: bank.bankName || null,
          accountName: bank.accountName || null,
          accountNumber: bank.accountNumber || null,
          branch: bank.branch || null,
          paymentInstructions: instructions || null,
          qrCodeImage: qr,
        }))
      }
    >
      <ToggleField
        label="เปิดรับชำระด้วยการโอนเงิน"
        description="ปิดไว้ = ลูกค้าจะสั่งซื้อผ่านเว็บไม่ได้ชั่วคราว (ขอใบเสนอราคายังใช้ได้)"
        value={enabled}
        onChange={setEnabled}
      />
      <TextField
        label="อีเมลรับแจ้งออเดอร์ใหม่"
        description="ทุกออเดอร์ใหม่จะส่งอีเมลแจ้งมาที่นี่"
        value={email}
        onChange={setEmail}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="ธนาคาร"
          description="เช่น ไทยพาณิชย์ (SCB)"
          value={bank.bankName}
          onChange={setBankField('bankName')}
        />
        <TextField label="สาขา" value={bank.branch} onChange={setBankField('branch')} />
        <TextField
          label="ชื่อบัญชี"
          value={bank.accountName}
          onChange={setBankField('accountName')}
        />
        <TextField
          label="เลขบัญชี"
          value={bank.accountNumber}
          onChange={setBankField('accountNumber')}
        />
      </div>
      <TextAreaField
        label="คำแนะนำการโอน"
        description="ข้อความเพิ่มเติมใต้ข้อมูลบัญชี เช่น “โอนแล้วแนบสลิปในแบบฟอร์ม”"
        value={instructions}
        onChange={setInstructions}
        rows={3}
      />
      <ImageField
        label="รูป QR Code รับเงิน"
        description="QR พร้อมเพย์/ธนาคาร ให้ลูกค้าสแกนจ่ายได้เลย (ไม่บังคับ)"
        value={qr}
        folder="payment-slips"
        uploadCommitMessage="แก้ไขตั้งค่าการชำระเงิน: รูป QR Code"
        onChange={setQr}
      />
    </SectionCard>
  )
}
