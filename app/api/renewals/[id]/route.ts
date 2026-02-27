import { NextRequest, NextResponse } from 'next/server'
import { deleteRenewal, updateRenewal } from '@/lib/renewalStore'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()

    const {
      membershipType,
      joiningDate,
      expiryDate,
      membershipFee,
      discount,
      paidAmount,
      paymentDate,
      paymentMode,
      transactionId,
    } = body

    const updated = await updateRenewal(id, {
      membershipType: membershipType !== undefined ? String(membershipType) : undefined,
      joiningDate: joiningDate !== undefined ? joiningDate : undefined,
      expiryDate: expiryDate !== undefined ? expiryDate : undefined,
      membershipFee:
        membershipFee !== undefined && membershipFee !== null ? Number(membershipFee) : undefined,
      discount: discount !== undefined && discount !== null ? Number(discount) : undefined,
      paidAmount: paidAmount !== undefined && paidAmount !== null ? Number(paidAmount) : undefined,
      paymentDate: paymentDate !== undefined ? paymentDate : undefined,
      paymentMode: paymentMode !== undefined ? paymentMode : undefined,
      transactionId: transactionId !== undefined ? transactionId : undefined,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Renewal not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating renewal:', error)
    return NextResponse.json(
      { error: 'Failed to update renewal', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const success = await deleteRenewal(id)

    if (!success) {
      return NextResponse.json({ error: 'Renewal not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Renewal deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting renewal:', error)
    return NextResponse.json(
      { error: 'Failed to delete renewal', details: error.message },
      { status: 500 }
    )
  }
}

