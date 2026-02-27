import { NextRequest, NextResponse } from 'next/server'
import { createRenewal, getRenewalsForClient } from '@/lib/renewalStore'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientIdParam = searchParams.get('clientId')

    if (!clientIdParam) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      )
    }

    const clientId = parseInt(clientIdParam)
    if (isNaN(clientId) || clientId < 1) {
      return NextResponse.json(
        { error: 'Invalid clientId' },
        { status: 400 }
      )
    }

    const renewals = await getRenewalsForClient(clientId)
    return NextResponse.json(renewals)
  } catch (error: any) {
    console.error('Error fetching renewals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch renewals', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clientId,
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

    if (!clientId || !membershipType) {
      return NextResponse.json(
        { error: 'clientId and membershipType are required' },
        { status: 400 }
      )
    }

    const numericClientId = parseInt(String(clientId))
    if (isNaN(numericClientId) || numericClientId < 1) {
      return NextResponse.json(
        { error: 'Invalid clientId' },
        { status: 400 }
      )
    }

    const renewal = await createRenewal({
      clientId: numericClientId,
      membershipType: String(membershipType),
      joiningDate: joiningDate || undefined,
      expiryDate: expiryDate || undefined,
      membershipFee: membershipFee !== undefined && membershipFee !== null ? Number(membershipFee) : undefined,
      discount: discount !== undefined && discount !== null ? Number(discount) : undefined,
      paidAmount: paidAmount !== undefined && paidAmount !== null ? Number(paidAmount) : undefined,
      paymentDate: paymentDate || undefined,
      paymentMode: paymentMode || undefined,
      transactionId: transactionId || undefined,
    })

    return NextResponse.json(renewal, { status: 201 })
  } catch (error: any) {
    console.error('Error creating renewal:', error)
    return NextResponse.json(
      { error: 'Failed to create renewal', details: error.message },
      { status: 500 }
    )
  }
}

