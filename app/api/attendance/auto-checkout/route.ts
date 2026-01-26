import { NextRequest, NextResponse } from 'next/server'
import { autoCheckoutEndOfDay } from '@/lib/attendanceStore'

/**
 * API endpoint to manually trigger auto-checkout
 * This can be called by:
 * - Vercel Cron Jobs (recommended)
 * - Manual trigger
 * - Scheduled tasks
 * 
 * Usage:
 * - GET /api/attendance/auto-checkout - Auto-checkout with default end time (23:59:59)
 * - GET /api/attendance/auto-checkout?endTime=22:00:00 - Auto-checkout with custom end time
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const endTime = searchParams.get('endTime') || '23:59:59'
    
    // Validate endTime format (HH:MM:SS or HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
    if (!timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: 'Invalid endTime format. Use HH:MM:SS or HH:MM (e.g., 23:59:59 or 22:00)' },
        { status: 400 }
      )
    }
    
    // Ensure endTime has seconds
    const endTimeFormatted = endTime.includes(':') && endTime.split(':').length === 2
      ? `${endTime}:59`
      : endTime
    
    const checkedOutCount = await autoCheckoutEndOfDay(endTimeFormatted)
    
    return NextResponse.json({
      success: true,
      message: `Auto-checkout completed. ${checkedOutCount} client(s) checked out.`,
      checkedOutCount,
      endTime: endTimeFormatted,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error in auto-checkout:', error)
    return NextResponse.json(
      { 
        error: 'Failed to perform auto-checkout', 
        details: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}


