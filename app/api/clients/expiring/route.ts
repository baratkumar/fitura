import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { getClientsExpiringThisMonthPaginated } from '@/lib/clientStore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50))
    const gym = searchParams.get('gym')?.trim() || undefined

    const result = await getClientsExpiringThisMonthPaginated(page, limit, gym)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching expiring clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expiring clients' },
      { status: 500 }
    )
  }
}
