import { NextRequest, NextResponse } from 'next/server'
import { getMembership, updateMembership, deleteMembership } from '@/lib/membershipStore'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid membership ID' }, { status: 400 })
    }

    const membership = await getMembership(id)
    if (!membership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    return NextResponse.json(membership)
  } catch (error) {
    console.error('Error fetching membership:', error)
    return NextResponse.json(
      { error: 'Failed to fetch membership' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid membership ID' }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, durationDays, price, isActive } = body

    if (durationDays !== undefined && durationDays < 1) {
      return NextResponse.json(
        { error: 'Duration days must be at least 1' },
        { status: 400 }
      )
    }

    const membership = await updateMembership(id, {
      name,
      description,
      durationDays: durationDays ? parseInt(durationDays) : undefined,
      price: price !== undefined ? parseFloat(price) : undefined,
      isActive,
    })

    if (!membership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    return NextResponse.json(membership)
  } catch (error: any) {
    console.error('Error updating membership:', error)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A membership with this name already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update membership' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid membership ID' }, { status: 400 })
    }

    const success = await deleteMembership(id)
    if (!success) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Membership deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting membership:', error)
    if (error.code === '23503') {
      // Foreign key constraint violation
      return NextResponse.json(
        { error: 'Cannot delete membership that is assigned to clients' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete membership' },
      { status: 500 }
    )
  }
}









