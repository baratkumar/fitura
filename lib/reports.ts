import * as XLSX from 'xlsx'
import connectDB from './db'
import Client from './models/Client'
import Renewal from './models/Renewal'
import Payment from './models/Payment'
import Attendance from './models/Attendance'
import Membership from './models/Membership'
import { clientMatchWithGymAnd, gymMatchOnNestedClient } from './dashboardQueries'
import { istYmd } from './istCalendar'
import mongoose from 'mongoose'

// Ensure Membership schema is registered for Client/Renewal populate()
void Membership

export const REPORT_TYPES = [
  'monthly',
  'clients',
  'renewals',
  'attendance',
  'expiring',
] as const

export type ReportType = (typeof REPORT_TYPES)[number]

export const MEMBERSHIP_STATUSES = ['all', 'active', 'lapsed'] as const
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number]

export interface ReportFilters {
  type: ReportType
  from: string // YYYY-MM-DD
  to: string // YYYY-MM-DD
  gym?: string
  membershipStatus?: MembershipStatus
  /** YYYY-MM — when set for monthly reports, overrides from/to to that calendar month (IST) */
  month?: string
}

function daysInMonth(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate()
}

/** Resolve from/to for a report; monthly + month=YYYY-MM uses full calendar month IST. */
export function resolveReportDateRange(filters: ReportFilters): { from: string; to: string } {
  if (filters.type === 'monthly' && filters.month && /^\d{4}-\d{2}$/.test(filters.month)) {
    const [y, m] = filters.month.split('-').map(Number)
    const last = daysInMonth(y, m)
    return {
      from: `${y}-${String(m).padStart(2, '0')}-01`,
      to: `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`,
    }
  }
  return { from: filters.from, to: filters.to }
}

function parseDayStart(ymd: string): Date {
  return new Date(`${ymd}T00:00:00+05:30`)
}

function parseDayEnd(ymd: string): Date {
  return new Date(`${ymd}T23:59:59.999+05:30`)
}

function formatDateCell(d?: Date | string | null): string {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
}

function formatMoney(n?: number | null): number | '' {
  if (n === undefined || n === null || Number.isNaN(n)) return ''
  return Math.round(n * 100) / 100
}

function workbookToBuffer(wb: XLSX.WorkBook): Buffer {
  const out = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  return out
}

function sheetFromRows(rows: Record<string, unknown>[], sheetName: string): XLSX.WorkBook {
  const wb = XLSX.utils.book_new()
  appendSheet(wb, rows, sheetName)
  return wb
}

function appendSheet(wb: XLSX.WorkBook, rows: Record<string, unknown>[], sheetName: string) {
  const ws =
    rows.length > 0
      ? XLSX.utils.json_to_sheet(rows)
      : XLSX.utils.aoa_to_sheet([['(No records for this period)']])
  const keys = rows.length > 0 ? Object.keys(rows[0]) : ['A']
  ws['!cols'] = keys.map((k) => ({ wch: Math.min(28, Math.max(12, String(k).length + 2)) }))
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31))
}

async function buildClientsReport(filters: ReportFilters): Promise<{ buffer: Buffer; filename: string; rowCount: number }> {
  await connectDB()
  const start = parseDayStart(filters.from)
  const end = parseDayEnd(filters.to)
  const todayStart = parseDayStart(istYmd())

  const extra: Record<string, unknown> = {
    $or: [
      { joiningDate: { $gte: start, $lte: end } },
      {
        $and: [
          { $or: [{ joiningDate: null }, { joiningDate: { $exists: false } }] },
          { createdAt: { $gte: start, $lte: end } },
        ],
      },
    ],
  }

  if (filters.membershipStatus === 'active') {
    extra.expiryDate = { $gte: todayStart }
  } else if (filters.membershipStatus === 'lapsed') {
    extra.expiryDate = { $lt: todayStart, $exists: true, $ne: null }
  }

  const match = clientMatchWithGymAnd(filters.gym, extra)
  const docs = await Client.find(match as mongoose.FilterQuery<unknown>)
    .populate('membershipType', 'name')
    .sort({ clientId: 1 })
    .lean()

  const rows = docs.map((c: any) => ({
    'Client ID': c.clientId,
    'First Name': c.firstName || '',
    'Last Name': c.lastName || '',
    Email: c.email || '',
    Phone: c.phone || '',
    Gym: c.gym || 'Rival Fitness Studio I',
    Membership: c.membershipType?.name || '',
    'Joining Date': formatDateCell(c.joiningDate),
    'Expiry Date': formatDateCell(c.expiryDate),
    'Membership Fee': formatMoney(c.membershipFee),
    Discount: formatMoney(c.discount),
    'Paid Amount': formatMoney(c.paidAmount),
    'Payment Date': formatDateCell(c.paymentDate),
    'Payment Mode': c.paymentMode || '',
    Gender: c.gender || '',
    Address: c.address || '',
    'Registered On': formatDateCell(c.createdAt),
  }))

  const wb = sheetFromRows(rows, 'Clients')
  return {
    buffer: workbookToBuffer(wb),
    filename: `fitura-clients-${filters.from}-to-${filters.to}.xlsx`,
    rowCount: rows.length,
  }
}

async function buildRenewalsReport(filters: ReportFilters): Promise<{ buffer: Buffer; filename: string; rowCount: number }> {
  await connectDB()
  const start = parseDayStart(filters.from)
  const end = parseDayEnd(filters.to)
  const gym = String(filters.gym || '').trim()

  const pipeline: mongoose.PipelineStage[] = [
    { $match: { paymentDate: { $gte: start, $lte: end } } },
    {
      $lookup: {
        from: 'clients',
        localField: 'clientId',
        foreignField: 'clientId',
        as: 'cl',
      },
    },
    { $unwind: { path: '$cl', preserveNullAndEmptyArrays: true } },
  ]

  if (gym) {
    pipeline.push({ $match: gymMatchOnNestedClient('cl', gym) as Record<string, unknown> })
  }

  pipeline.push(
    {
      $lookup: {
        from: 'memberships',
        localField: 'membershipType',
        foreignField: '_id',
        as: 'mem',
      },
    },
    { $unwind: { path: '$mem', preserveNullAndEmptyArrays: true } },
    { $sort: { paymentDate: 1, clientId: 1 } }
  )

  const docs = await Renewal.aggregate(pipeline)

  const rows = docs.map((r: any) => ({
    'Client ID': r.clientId,
    'First Name': r.cl?.firstName || '',
    'Last Name': r.cl?.lastName || '',
    Phone: r.cl?.phone || '',
    Gym: r.cl?.gym || 'Rival Fitness Studio I',
    Membership: r.mem?.name || '',
    'Joining Date': formatDateCell(r.joiningDate),
    'Expiry Date': formatDateCell(r.expiryDate),
    'Membership Fee': formatMoney(r.membershipFee),
    Discount: formatMoney(r.discount),
    'Paid Amount': formatMoney(r.paidAmount),
    'Payment Date': formatDateCell(r.paymentDate),
    'Payment Mode': r.paymentMode || '',
    'Transaction ID': r.transactionId || '',
  }))

  // Include first-time registrations in range with or without payment (no paidAmount filter)
  const clientMatch = clientMatchWithGymAnd(filters.gym, {
    $or: [
      { paymentDate: { $gte: start, $lte: end } },
      {
        $and: [
          { $or: [{ paymentDate: null }, { paymentDate: { $exists: false } }] },
          {
            $or: [
              { joiningDate: { $gte: start, $lte: end } },
              { createdAt: { $gte: start, $lte: end } },
            ],
          },
        ],
      },
    ],
  })
  const signupClients = await Client.find(clientMatch as mongoose.FilterQuery<unknown>)
    .populate('membershipType', 'name')
    .lean()

  const signupIds = signupClients.map((c: any) => Number(c.clientId))
  const clientsWithRenewals = signupIds.length
    ? await Renewal.distinct('clientId', { clientId: { $in: signupIds } })
    : []
  const hasRenewalSet = new Set(clientsWithRenewals.map((id: unknown) => Number(id)))

  for (const c of signupClients as any[]) {
    if (hasRenewalSet.has(Number(c.clientId))) continue
    rows.push({
      'Client ID': c.clientId,
      'First Name': c.firstName || '',
      'Last Name': c.lastName || '',
      Phone: c.phone || '',
      Gym: c.gym || 'Rival Fitness Studio I',
      Membership: c.membershipType?.name || '',
      'Joining Date': formatDateCell(c.joiningDate),
      'Expiry Date': formatDateCell(c.expiryDate),
      'Membership Fee': formatMoney(c.membershipFee),
      Discount: formatMoney(c.discount),
      'Paid Amount': formatMoney(c.paidAmount),
      'Payment Date': formatDateCell(c.paymentDate),
      'Payment Mode': c.paymentMode || '',
      'Transaction ID': c.transactionId || '',
    })
  }

  const paymentPipeline: mongoose.PipelineStage[] = [
    { $match: { paymentDate: { $gte: start, $lte: end } } },
    {
      $lookup: {
        from: 'clients',
        localField: 'clientId',
        foreignField: 'clientId',
        as: 'cl',
      },
    },
    { $unwind: { path: '$cl', preserveNullAndEmptyArrays: true } },
  ]
  if (gym) {
    paymentPipeline.push({ $match: gymMatchOnNestedClient('cl', gym) as Record<string, unknown> })
  }
  paymentPipeline.push({ $sort: { paymentDate: 1, clientId: 1 } })
  const balancePayments = await Payment.aggregate(paymentPipeline)
  for (const p of balancePayments as any[]) {
    rows.push({
      'Client ID': p.clientId,
      'First Name': p.cl?.firstName || '',
      'Last Name': p.cl?.lastName || '',
      Phone: p.cl?.phone || '',
      Gym: p.cl?.gym || 'Rival Fitness Studio I',
      Membership: 'Balance payment',
      'Joining Date': '',
      'Expiry Date': '',
      'Membership Fee': '',
      Discount: '',
      'Paid Amount': formatMoney(p.amount),
      'Payment Date': formatDateCell(p.paymentDate),
      'Payment Mode': p.paymentMode || '',
      'Transaction ID': p.transactionId || '',
    })
  }

  rows.sort((a, b) => {
    const da = String(a['Payment Date'])
    const db = String(b['Payment Date'])
    return da.localeCompare(db) || Number(a['Client ID']) - Number(b['Client ID'])
  })

  const wb = sheetFromRows(rows, 'Renewals & Revenue')
  return {
    buffer: workbookToBuffer(wb),
    filename: `fitura-revenue-${filters.from}-to-${filters.to}.xlsx`,
    rowCount: rows.length,
  }
}

async function buildAttendanceReport(filters: ReportFilters): Promise<{ buffer: Buffer; filename: string; rowCount: number }> {
  await connectDB()
  const start = parseDayStart(filters.from)
  const end = parseDayEnd(filters.to)
  const gym = String(filters.gym || '').trim()

  const pipeline: mongoose.PipelineStage[] = [
    { $match: { attendanceDate: { $gte: start, $lte: end } } },
    {
      $lookup: {
        from: 'clients',
        localField: 'clientId',
        foreignField: '_id',
        as: 'cl',
      },
    },
    { $unwind: { path: '$cl', preserveNullAndEmptyArrays: true } },
  ]

  if (gym) {
    pipeline.push({ $match: gymMatchOnNestedClient('cl', gym) as Record<string, unknown> })
  }

  pipeline.push({ $sort: { attendanceDate: 1, inTime: 1 } })

  const docs = await Attendance.aggregate(pipeline)

  const rows = docs.map((a: any) => {
    const inT = a.inTime || ''
    const outT = a.outTime || ''
    let duration = ''
    if (inT && outT) {
      try {
        const [ih, im] = inT.split(':').map(Number)
        const [oh, om] = outT.split(':').map(Number)
        let mins = oh * 60 + om - (ih * 60 + im)
        if (mins < 0) mins += 24 * 60
        const h = Math.floor(mins / 60)
        const m = mins % 60
        duration = `${h}h ${m}m`
      } catch {
        duration = ''
      }
    }
    return {
      'Client ID': a.cl?.clientId ?? '',
      'First Name': a.cl?.firstName || '',
      'Last Name': a.cl?.lastName || '',
      Phone: a.cl?.phone || '',
      Gym: a.cl?.gym || 'Rival Fitness Studio I',
      Date: formatDateCell(a.attendanceDate),
      'In Time': inT,
      'Out Time': outT,
      Status: a.status || '',
      Duration: duration,
    }
  })

  const wb = sheetFromRows(rows, 'Attendance')
  return {
    buffer: workbookToBuffer(wb),
    filename: `fitura-attendance-${filters.from}-to-${filters.to}.xlsx`,
    rowCount: rows.length,
  }
}

async function buildExpiringReport(filters: ReportFilters): Promise<{ buffer: Buffer; filename: string; rowCount: number }> {
  await connectDB()
  const start = parseDayStart(filters.from)
  const end = parseDayEnd(filters.to)

  const match = clientMatchWithGymAnd(filters.gym, {
    expiryDate: { $gte: start, $lte: end },
  })

  const docs = await Client.find(match as mongoose.FilterQuery<unknown>)
    .populate('membershipType', 'name')
    .sort({ expiryDate: 1, clientId: 1 })
    .lean()

  const todayStart = parseDayStart(istYmd())
  const rows = docs.map((c: any) => {
    const expiry = c.expiryDate ? new Date(c.expiryDate) : null
    let status = ''
    let daysLeft: number | '' = ''
    if (expiry) {
      const days = Math.round((expiry.getTime() - todayStart.getTime()) / 86_400_000)
      daysLeft = days
      if (days < 0) status = 'Lapsed'
      else if (days === 0) status = 'Expires today'
      else status = 'Active'
    }
    return {
      'Client ID': c.clientId,
      'First Name': c.firstName || '',
      'Last Name': c.lastName || '',
      Email: c.email || '',
      Phone: c.phone || '',
      Gym: c.gym || 'Rival Fitness Studio I',
      Membership: c.membershipType?.name || '',
      'Expiry Date': formatDateCell(c.expiryDate),
      'Days Left': daysLeft,
      Status: status,
      'Paid Amount': formatMoney(c.paidAmount),
    }
  })

  const wb = sheetFromRows(rows, 'Expiring Memberships')
  return {
    buffer: workbookToBuffer(wb),
    filename: `fitura-expiring-${filters.from}-to-${filters.to}.xlsx`,
    rowCount: rows.length,
  }
}

async function buildMonthlyReport(filters: ReportFilters): Promise<{ buffer: Buffer; filename: string; rowCount: number }> {
  const { from, to } = resolveReportDateRange(filters)
  const base: ReportFilters = {
    ...filters,
    from,
    to,
    membershipStatus: 'all',
  }

  const [joined, renewals, attendance, expiring] = await Promise.all([
    buildClientsReport({ ...base, type: 'clients' }),
    buildRenewalsReport({ ...base, type: 'renewals' }),
    buildAttendanceReport({ ...base, type: 'attendance' }),
    buildExpiringReport({ ...base, type: 'expiring' }),
  ])

  const wb = XLSX.utils.book_new()
  const parts: { name: string; result: { buffer: Buffer; rowCount: number } }[] = [
    { name: 'Joined', result: joined },
    { name: 'Renewals', result: renewals },
    { name: 'Attendance', result: attendance },
    { name: 'Expiring', result: expiring },
  ]

  const summaryRows = [
    {
      Month: filters.month || `${from.slice(0, 7)}`,
      Period: `${from} to ${to}`,
      Gym: filters.gym?.trim() || 'All gyms',
      'Joined (all, paid or unpaid)': joined.rowCount,
      'Renewals / registrations': renewals.rowCount,
      'Attendance records': attendance.rowCount,
      'Expiring memberships': expiring.rowCount,
    },
  ]
  appendSheet(wb, summaryRows, 'Summary')

  for (const part of parts) {
    const src = XLSX.read(part.result.buffer, { type: 'buffer' })
    const sheetName = src.SheetNames[0]
    const sheet = src.Sheets[sheetName]
    XLSX.utils.book_append_sheet(wb, sheet, part.name.slice(0, 31))
  }

  const monthLabel = filters.month || from.slice(0, 7)
  return {
    buffer: workbookToBuffer(wb),
    filename: `fitura-monthly-${monthLabel}.xlsx`,
    rowCount: joined.rowCount + renewals.rowCount + attendance.rowCount + expiring.rowCount,
  }
}

export async function generateReport(filters: ReportFilters): Promise<{ buffer: Buffer; filename: string; rowCount: number }> {
  const range = resolveReportDateRange(filters)
  const resolved: ReportFilters = { ...filters, from: range.from, to: range.to }

  switch (resolved.type) {
    case 'monthly':
      return buildMonthlyReport(resolved)
    case 'clients':
      return buildClientsReport(resolved)
    case 'renewals':
      return buildRenewalsReport(resolved)
    case 'attendance':
      return buildAttendanceReport(resolved)
    case 'expiring':
      return buildExpiringReport(resolved)
    default:
      throw new Error(`Unknown report type: ${resolved.type}`)
  }
}

export function defaultReportDateRange(ref: Date = new Date()): { from: string; to: string } {
  const to = istYmd(ref)
  const [y, m] = to.split('-').map(Number)
  const from = `${y}-${String(m).padStart(2, '0')}-01`
  return { from, to }
}
