import { NextResponse } from 'next/server'
import { getExpiringClients } from '@/lib/clientStore'

export async function GET() {
  try {
    const clients = await getExpiringClients()
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching expiring clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expiring clients' },
      { status: 500 }
    )
  }
}
