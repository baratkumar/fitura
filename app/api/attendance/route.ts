import { NextRequest, NextResponse } from 'next/server'
import {
  getAllAttendance,
  getAttendanceByDate,
  getAttendanceByClientId,
  addAttendance,
  deleteAttendance,
} from '@/lib/attendanceStore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const clientId = searchParams.get('clientId')

    // If both filters are provided, filter by both
    if (date && clientId) {
      const parsedClientId = parseInt(clientId)
      if (isNaN(parsedClientId)) {
        return NextResponse.json(
          { error: 'Invalid client ID' },
          { status: 400 }
        )
      }
      // Get attendance by client ID and then filter by date on the client side
      // Or we could create a combined query function
      const allClientAttendance = await getAttendanceByClientId(parsedClientId)
      const filtered = allClientAttendance.filter(a => a.attendanceDate === date)
      return NextResponse.json(filtered)
    }

    if (date) {
      const attendance = await getAttendanceByDate(date)
      return NextResponse.json(attendance)
    }

    if (clientId) {
      const parsedClientId = parseInt(clientId)
      if (isNaN(parsedClientId)) {
        return NextResponse.json(
          { error: 'Invalid client ID' },
          { status: 400 }
        )
      }
      const attendance = await getAttendanceByClientId(parsedClientId)
      return NextResponse.json(attendance)
    }

    const attendance = await getAllAttendance()
    return NextResponse.json(attendance)
  } catch (error: any) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, attendanceDate, attendanceTime } = body

    if (!clientId || !attendanceDate || !attendanceTime) {
      return NextResponse.json(
        { error: 'Client ID, date, and time are required' },
        { status: 400 }
      )
    }

    const parsedClientId = parseInt(clientId)
    if (isNaN(parsedClientId) || parsedClientId <= 0) {
      return NextResponse.json(
        { error: 'Invalid client ID. Please enter a valid client ID number.' },
        { status: 400 }
      )
    }

    try {
      const newAttendance = await addAttendance({
        clientId: parsedClientId,
        attendanceDate,
        attendanceTime,
      })

      return NextResponse.json(newAttendance, { status: 201 })
    } catch (error: any) {
      // Handle specific errors
      if (error.message?.includes('not found') || error.message?.includes('Client not found')) {
        return NextResponse.json(
          { 
            error: `Client ID ${parsedClientId} not found. Please verify the client ID exists in the system.`,
            clientId: parsedClientId
          },
          { status: 404 }
        )
      }
      
      // Handle duplicate attendance records
      if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
        return NextResponse.json(
          { 
            error: 'This attendance record already exists for this client, date, and time.',
            hint: 'Please check if the attendance was already recorded.'
          },
          { status: 409 }
        )
      }
      
      // Re-throw other errors to be handled by outer catch
      throw error
    }
  } catch (error: any) {
    console.error('Error creating attendance:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create attendance', 
        details: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

