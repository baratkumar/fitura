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
      // Get attendance by client ID and then filter by date on the client side
      const allClientAttendance = await getAttendanceByClientId(clientId)
      const filtered = allClientAttendance.filter(a => a.attendanceDate === date)
      return NextResponse.json(filtered)
    }

    if (date) {
      const attendance = await getAttendanceByDate(date)
      return NextResponse.json(attendance)
    }

    if (clientId) {
      const attendance = await getAttendanceByClientId(clientId)
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

    try {
      const attendance = await addAttendance({
        clientId: clientId,
        attendanceDate,
        attendanceTime,
      })

      // Return attendance data with client info included
      return NextResponse.json({
        id: attendance.id,
        clientId: attendance.clientId,
        clientName: attendance.clientName,
        attendanceDate: attendance.attendanceDate,
        inTime: attendance.inTime,
        outTime: attendance.outTime,
        status: attendance.status,
        duration: attendance.duration,
        createdAt: attendance.createdAt,
      }, { status: 201 })
    } catch (error: any) {
      // Handle specific errors
      if (error.message?.includes('not found') || error.message?.includes('Client not found')) {
        return NextResponse.json(
          { 
            error: `Client ID ${clientId} not found. Please verify the client ID exists in the system.`,
            clientId: clientId
          },
          { status: 404 }
        )
      }
      
      // Handle duplicate attendance records (shouldn't happen with new logic, but keep for safety)
      if (error.code === 11000 || error.message?.includes('unique') || error.message?.includes('duplicate')) {
        return NextResponse.json(
          { 
            error: 'This attendance record already exists for this client and date.',
            hint: 'The system will toggle between IN and OUT automatically.'
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

