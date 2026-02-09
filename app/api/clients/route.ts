import { NextRequest, NextResponse } from 'next/server'
import { getAllClients, getClientsPaginated, addClient } from '@/lib/clientStore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')

    if (pageParam !== null || limitParam !== null) {
      const page = Math.max(1, parseInt(pageParam || '1', 10) || 1)
      const limit = Math.min(100, Math.max(1, parseInt(limitParam || '10', 10) || 10))
      const result = await getClientsPaginated(page, limit)
      return NextResponse.json(result)
    }

    const clients = await getAllClients()
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[POST /api/clients] Received request body. photoUrl:', body.photoUrl, 'typeof:', typeof body.photoUrl)
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      age,
      height,
      weight,
      gender,
      bloodGroup,
      bmi,
      aadharNumber,
      photoUrl,
      address,
      membershipType,
      joiningDate,
      expiryDate,
      membershipFee,
      discount,
      paymentDate,
      paymentMode,
      transactionId,
      paidAmount,
      emergencyContactName,
      emergencyContactPhone,
      medicalConditions,
      fitnessGoals,
      firstTimeInGym,
      previousGymDetails,
    } = body
    console.log('[POST /api/clients] Extracted photoUrl:', photoUrl, 'typeof:', typeof photoUrl)

    // Validate required fields
    if (!firstName || !lastName || !phone || !dateOfBirth || !membershipType || !address || address.trim() === '' || !emergencyContactName || !emergencyContactPhone) {
      return NextResponse.json(
        { error: 'Missing required fields. Please fill in all required fields including address.' },
        { status: 400 }
      )
    }

    // Validate email format when provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    // Validate Aadhar Number if provided (must be 12 digits)
    if (aadharNumber && (!/^\d{12}$/.test(aadharNumber))) {
      return NextResponse.json(
        { error: 'Aadhar Number must be exactly 12 digits' },
        { status: 400 }
      )
    }

    // Validate membershipType before creating client
    if (membershipType) {
      const membershipIdNum = parseInt(membershipType);
      // If it's a huge number, it's likely a MongoDB ObjectId - reject it
      if (!isNaN(membershipIdNum) && membershipIdNum > 100000) {
        return NextResponse.json(
          { error: 'Invalid membership selected. Please refresh the page and select a membership again.' },
          { status: 400 }
        );
      }
    }

    console.log('[POST /api/clients] Calling addClient with photoUrl:', photoUrl)
    const newClient = await addClient({
      firstName,
      lastName,
      email: email?.trim() || undefined,
      phone,
      dateOfBirth,
      age: age ? parseInt(age) : undefined,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      gender: gender || undefined,
      bloodGroup: bloodGroup || undefined,
      bmi: bmi ? parseFloat(bmi) : undefined,
      aadharNumber: aadharNumber || undefined,
      photoUrl: photoUrl && photoUrl.trim() !== '' ? photoUrl.trim() : undefined, // Only include non-empty photoUrl
      address: address || '',
      membershipType,
      joiningDate: joiningDate || undefined,
      expiryDate: expiryDate || undefined,
      membershipFee: membershipFee ? parseFloat(membershipFee) : undefined,
      discount: discount ? parseFloat(discount) : undefined,
      paymentDate: paymentDate || undefined,
      paymentMode: paymentMode || undefined,
      transactionId: transactionId || undefined,
      paidAmount: paidAmount ? parseFloat(paidAmount) : undefined,
      emergencyContactName,
      emergencyContactPhone,
      medicalConditions: medicalConditions || '',
      fitnessGoals: fitnessGoals || '',
      firstTimeInGym: firstTimeInGym || undefined,
      previousGymDetails: previousGymDetails || undefined,
    })

    return NextResponse.json(newClient, { status: 201 })
  } catch (error: any) {
    console.error('Error creating client:', error)
    
    // Provide more specific error messages
    if (error.code === 11000 || error.code === '11000') {
      // MongoDB duplicate key error (unique constraint)
      if (error.message?.includes('email')) {
        return NextResponse.json(
          { error: 'A client with this email already exists' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Duplicate entry. This record already exists.' },
        { status: 400 }
      )
    }
    
    if (error.name === 'CastError' || error.message?.includes('Cast to ObjectId')) {
      return NextResponse.json(
        { error: 'Invalid membership type selected' },
        { status: 400 }
      )
    }
    
    // Handle membership not found errors
    if (error.message?.includes('Membership with ID') || error.message?.includes('Membership not found') || error.message?.includes('Invalid membership ID')) {
      return NextResponse.json(
        { 
          error: error.message || 'Invalid membership selected. Please refresh the page and select a valid membership.',
          hint: 'The membership you selected may have been deleted. Please refresh the page and try again.'
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create client', 
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

