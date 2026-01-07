import { NextRequest, NextResponse } from 'next/server'
import { getAllClients, addClient } from '@/lib/clientStore'

export async function GET() {
  try {
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

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !dateOfBirth || !membershipType || !emergencyContactName || !emergencyContactPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate Aadhar Number if provided (must be 12 digits)
    if (aadharNumber && (!/^\d{12}$/.test(aadharNumber))) {
      return NextResponse.json(
        { error: 'Aadhar Number must be exactly 12 digits' },
        { status: 400 }
      )
    }

    const newClient = await addClient({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      age: age ? parseInt(age) : undefined,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      gender: gender || undefined,
      bloodGroup: bloodGroup || undefined,
      bmi: bmi ? parseFloat(bmi) : undefined,
      aadharNumber: aadharNumber || undefined,
      photoUrl: photoUrl || undefined,
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
    if (error.code === '23503') {
      // Foreign key constraint violation
      return NextResponse.json(
        { error: 'Invalid membership type selected' },
        { status: 400 }
      )
    }
    
    if (error.code === '23505') {
      // Unique constraint violation
      return NextResponse.json(
        { error: 'A client with this email already exists' },
        { status: 400 }
      )
    }
    
    if (error.code === '42703') {
      // Column does not exist
      return NextResponse.json(
        { 
          error: 'Database schema is out of date. Please run /api/init-db to update the database.',
          details: error.message 
        },
        { status: 500 }
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

