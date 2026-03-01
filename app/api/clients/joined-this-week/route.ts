import { NextRequest, NextResponse } from 'next/server'
import { getClientsJoinedThisWeekPaginated } from '@/lib/clientStore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10))

    const result = await getClientsJoinedThisWeekPaginated(page, limit)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching clients joined this week:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients joined this week', details: error.message },
      { status: 500 }
    )
  }
}
