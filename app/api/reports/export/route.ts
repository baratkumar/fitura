import { NextRequest, NextResponse } from 'next/server'
import {
  generateReport,
  REPORT_TYPES,
  MEMBERSHIP_STATUSES,
  type ReportType,
  type MembershipStatus,
} from '@/lib/reports'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as ReportType | null
    const month = searchParams.get('month')?.trim() || undefined
    let from = searchParams.get('from')?.trim() || ''
    let to = searchParams.get('to')?.trim() || ''
    const gym = searchParams.get('gym')?.trim() || undefined
    const membershipStatus = (searchParams.get('membershipStatus') || 'all') as MembershipStatus

    if (!type || !REPORT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Use one of: ${REPORT_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    if (type === 'monthly') {
      if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return NextResponse.json(
          { error: 'month is required for monthly reports (YYYY-MM)' },
          { status: 400 }
        )
      }
      // from/to filled by resolveReportDateRange from month
      from = from || `${month}-01`
      to = to || `${month}-28`
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return NextResponse.json(
        { error: 'from and to dates are required (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    if (type !== 'monthly' && from > to) {
      return NextResponse.json({ error: 'from date must be on or before to date' }, { status: 400 })
    }

    if (!MEMBERSHIP_STATUSES.includes(membershipStatus)) {
      return NextResponse.json({ error: 'Invalid membershipStatus' }, { status: 400 })
    }

    const { buffer, filename, rowCount } = await generateReport({
      type,
      from,
      to,
      gym,
      membershipStatus,
      month,
    })

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Row-Count': String(rowCount),
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: unknown) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate report',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
