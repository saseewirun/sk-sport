import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

// Health / keepalive endpoint.
//
// Purpose: a scheduled GitHub Actions job hits this every ~5 days to run a
// tiny read against Supabase Postgres, which keeps the free-tier project from
// pausing due to inactivity.
//
// Security: read-only, performs a single COUNT, exposes no secrets and no row
// data. Safe to be public. Must never be cached.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    // Lightweight DB touch — counting users is cheap and keeps Postgres active.
    const { totalDocs } = await payload.count({ collection: 'users' })
    return NextResponse.json(
      { ok: true, db: 'up', users: totalDocs, ts: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (err) {
    console.error('[health] db check failed:', (err as Error)?.message)
    return NextResponse.json(
      { ok: false, db: 'down', error: (err as Error)?.message ?? 'unknown' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
