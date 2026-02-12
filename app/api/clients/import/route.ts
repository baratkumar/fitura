import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Membership from '@/lib/models/Membership'
import { addClient } from '@/lib/clientStore'
import { createMembership } from '@/lib/membershipStore'
import { parseCsvToRows, toDurationDays, CsvRow } from '@/lib/importUsersCsv'

/** Find or create a membership by durationDays and price; returns membershipId (number). */
async function getOrCreateMembership(durationDays: number, price: number): Promise<number> {
  await connectDB()
  const existing = await Membership.findOne({ durationDays, price }).lean()
  if (existing?.membershipId) return existing.membershipId as number

  const months = Math.round(durationDays / 30)
  const name = `${months} Month${months !== 1 ? 's' : ''} - ₹${price}`
  const created = await createMembership({
    name,
    durationDays,
    price,
    isActive: true,
  })
  return created.membershipId
}

function rowToClientPayload(row: CsvRow, membershipId: number) {
  const joiningDate = row.joinedDate || row.renewedDate
  const expiryDate = row.expiryDate
  const paymentDate = row.recentPaidDate || joiningDate

  return {
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email || undefined,
    phone: row.mobile,
    dateOfBirth: row.dateOfBirth || '1990-01-01',
    address: row.address,
    emergencyContactName: 'Emergency Contact',
    emergencyContactPhone: row.mobile,
    membershipType: String(membershipId),
    joiningDate: joiningDate || undefined,
    expiryDate: expiryDate || undefined,
    membershipFee: row.subscriptionAmount || undefined,
    discount: 0,
    paidAmount: row.paidAmount || undefined,
    paymentDate: paymentDate || undefined,
    gender: row.gender || undefined,
    height: row.height ? parseFloat(row.height) : undefined,
    weight: row.weight ? parseFloat(row.weight) : undefined,
    aadharNumber: row.aadhar || undefined,
    fitnessGoals: row.gymGoal || undefined,
  }
}

export async function POST(request: NextRequest) {
  try {
    let csvText: string
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      if (!file) {
        return NextResponse.json({ error: 'No file provided. Use "file" field.' }, { status: 400 })
      }
      csvText = await file.text()
    } else {
      const raw = await request.text()
      if (raw.trimStart().startsWith('{')) {
        try {
          const body = JSON.parse(raw) as { csv?: string; data?: string }
          csvText = body.csv ?? body.data ?? raw
        } catch {
          csvText = raw
        }
      } else {
        csvText = raw
      }
    }

    if (!csvText?.trim()) {
      return NextResponse.json({ error: 'No CSV content provided.' }, { status: 400 })
    }

    const rows = parseCsvToRows(csvText)
    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data rows in CSV.' }, { status: 400 })
    }

    const membershipIdByKey = new Map<string, number>()

    const results = { created: 0, skipped: 0, errors: [] as string[] }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      try {
        const durationDays = toDurationDays(row.subscriptionMonths)
        const price = row.subscriptionAmount || 0
        const key = `${durationDays}-${price}`

        let membershipId = membershipIdByKey.get(key)
        if (membershipId == null) {
          membershipId = await getOrCreateMembership(durationDays, price)
          membershipIdByKey.set(key, membershipId)
        }

        const payload = rowToClientPayload(row, membershipId)
        await addClient(payload)
        results.created++
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        results.errors.push(`Row ${i + 2} (${row.firstName} ${row.lastName}): ${msg}`)
        results.skipped++
      }
    }

    return NextResponse.json({
      message: `Import complete. Created: ${results.created}, Skipped: ${results.skipped}`,
      created: results.created,
      skipped: results.skipped,
      errors: results.errors.slice(0, 50),
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    )
  }
}
