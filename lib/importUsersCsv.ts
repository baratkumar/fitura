/**
 * Parse CSV text into rows of columns. Handles quoted fields containing commas.
 */
function parseCsv(csvText: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i]
    if (inQuotes) {
      if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        currentRow.push(current.trim())
        current = ''
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && csvText[i + 1] === '\n') i++
        currentRow.push(current.trim())
        current = ''
        if (currentRow.some(cell => cell !== '')) rows.push(currentRow)
        currentRow = []
      } else {
        current += ch
      }
    }
  }
  if (current.length > 0 || currentRow.length > 0) {
    currentRow.push(current.trim())
    if (currentRow.some(cell => cell !== '')) rows.push(currentRow)
  }
  return rows
}

/** Parse "X Month(s)" to duration days */
function subscriptionMonthsToDays(text: string): number {
  const n = parseInt(text.replace(/\D/g, ''), 10)
  if (isNaN(n)) return 30
  const lower = text.toLowerCase()
  if (lower.includes('month') && !lower.includes('months')) return n * 30
  return n * 30 // 1 month ≈ 30, 12 months = 360; use 30 per month for consistency
}

// Align common plans to exact durations
const MONTHS_TO_DAYS: Record<number, number> = {
  1: 30,
  2: 60,
  3: 90,
  6: 180,
  12: 365,
  13: 395,
  14: 420,
  15: 450,
}

function toDurationDays(subMonthsText: string): number {
  const n = parseInt(subMonthsText.replace(/\D/g, ''), 10)
  if (isNaN(n)) return 30
  return MONTHS_TO_DAYS[n] ?? n * 30
}

export interface CsvRow {
  userId: string
  firstName: string
  lastName: string
  gender: string
  subscriptionMonths: string
  subscriptionAmount: number
  paidAmount: number
  recentPaidDate: string
  joinedDate: string
  renewedDate: string
  expiryDate: string
  mobile: string
  aadhar: string
  height: string
  weight: string
  email: string
  dateOfBirth: string
  gymGoal: string
  address: string
}

const COL = {
  USER_ID: 0,
  FIRST_NAME: 1,
  LAST_NAME: 2,
  GENDER: 3,
  PT_ENABLED: 4,
  SUB_MONTHS: 5,
  SUB_AMOUNT: 6,
  PAID_AMOUNT: 7,
  PENDING: 8,
  RECENT_PAID: 9,
  JOINED: 10,
  RENEWED: 11,
  EXPIRY: 12,
  MOBILE: 13,
  AADHAR: 14,
  HEIGHT: 15,
  WEIGHT: 16,
  EMAIL: 17,
  DOB: 18,
  GYM_GOAL: 19,
  ADDRESS: 20,
  ADDED_BY: 21,
}

export function parseCsvToRows(csvText: string): CsvRow[] {
  const rows = parseCsv(csvText)
  if (rows.length < 2) return []
  const dataRows = rows.slice(1) // skip header
  return dataRows.map(row => ({
    userId: row[COL.USER_ID] ?? '',
    firstName: (row[COL.FIRST_NAME] ?? '').trim() || 'Unknown',
    lastName: (row[COL.LAST_NAME] ?? '').trim() || '.',
    gender: (row[COL.GENDER] ?? '').trim(),
    subscriptionMonths: (row[COL.SUB_MONTHS] ?? '').trim(),
    subscriptionAmount: parseFloat(row[COL.SUB_AMOUNT] ?? '0') || 0,
    paidAmount: parseFloat(row[COL.PAID_AMOUNT] ?? '0') || 0,
    recentPaidDate: (row[COL.RECENT_PAID] ?? '').trim(),
    joinedDate: (row[COL.JOINED] ?? '').trim(),
    renewedDate: (row[COL.RENEWED] ?? '').trim(),
    expiryDate: (row[COL.EXPIRY] ?? '').trim(),
    mobile: (row[COL.MOBILE] ?? '').trim().replace(/\s/g, '') || '0000000000',
    aadhar: (row[COL.AADHAR] ?? '').trim(),
    height: (row[COL.HEIGHT] ?? '').trim(),
    weight: (row[COL.WEIGHT] ?? '').trim(),
    email: (row[COL.EMAIL] ?? '').trim(),
    dateOfBirth: (row[COL.DOB] ?? '').trim(),
    gymGoal: (row[COL.GYM_GOAL] ?? '').trim(),
    address: (row[COL.ADDRESS] ?? '').trim() || 'N/A',
  }))
}

export { toDurationDays }
