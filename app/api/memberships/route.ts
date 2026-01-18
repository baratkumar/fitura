import { NextRequest, NextResponse } from 'next/server'
import {
  getAllMemberships,
  getAllMembershipsIncludingInactive,
  createMembership,
} from '@/lib/membershipStore'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const memberships = includeInactive
      ? await getAllMembershipsIncludingInactive()
      : await getAllMemberships()

    return NextResponse.json(memberships)
  } catch (error) {
    console.error('Error fetching memberships:', error)
    return NextResponse.json(
      { error: 'Failed to fetch memberships' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, durationDays, price, isActive } = body

    if (!name || !durationDays) {
      return NextResponse.json(
        { error: 'Name and duration days are required' },
        { status: 400 }
      )
    }

    if (durationDays < 1) {
      return NextResponse.json(
        { error: 'Duration days must be at least 1' },
        { status: 400 }
      )
    }

    const membership = await createMembership({
      name,
      description,
      durationDays: parseInt(durationDays),
      price: price ? parseFloat(price) : undefined,
      isActive: isActive !== undefined ? isActive : true,
    })

    return NextResponse.json(membership, { status: 201 })
  } catch (error: any) {
    console.error('Error creating membership:', error)
    if (error.code === 11000 || error.code === '11000') {
      // MongoDB duplicate key error
      return NextResponse.json(
        { error: 'A membership with this name already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create membership', details: error.message },
      { status: 500 }
    )
  }
}










