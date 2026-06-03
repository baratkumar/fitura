import { NextRequest, NextResponse } from 'next/server'
import { sendAbsenceReminders } from '@/lib/absenceReminder'
import { isWhatsAppConfigured, getMissingWhatsAppEnvVars } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true

  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${secret}`) return true

  const key = request.nextUrl.searchParams.get('key')
  return key === secret
}

async function runJob(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isWhatsAppConfigured()) {
    return NextResponse.json(
      {
        error: 'WhatsApp API is not configured',
        missingEnvVars: getMissingWhatsAppEnvVars(),
      },
      { status: 500 }
    )
  }

  const thresholdParam = request.nextUrl.searchParams.get('thresholdDays')
  const thresholdDays = thresholdParam ? Number(thresholdParam) : 3

  if (!Number.isInteger(thresholdDays) || thresholdDays < 1 || thresholdDays > 30) {
    return NextResponse.json(
      { error: 'Invalid thresholdDays. Use an integer between 1 and 30.' },
      { status: 400 }
    )
  }

  const result = await sendAbsenceReminders(thresholdDays)
  return NextResponse.json({
    success: true,
    ...result,
    timestamp: new Date().toISOString(),
  })
}

export async function GET(request: NextRequest) {
  try {
    return await runJob(request)
  } catch (error) {
    console.error('Error running absent-reminders job:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to run absent-reminders job' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    return await runJob(request)
  } catch (error) {
    console.error('Error running absent-reminders job:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to run absent-reminders job' },
      { status: 500 }
    )
  }
}
