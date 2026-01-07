import { NextRequest, NextResponse } from 'next/server'
import { deleteAttendance } from '@/lib/attendanceStore'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid attendance ID' },
        { status: 400 }
      )
    }

    const deleted = await deleteAttendance(id)
    
    if (deleted) {
      return NextResponse.json({ message: 'Attendance record deleted successfully' })
    } else {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      )
    }
  } catch (error: any) {
    console.error('Error deleting attendance:', error)
    return NextResponse.json(
      { error: 'Failed to delete attendance', details: error.message },
      { status: 500 }
    )
  }
}


