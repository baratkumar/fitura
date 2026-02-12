/**
 * Import CSV directly into the TEST database (no server needed).
 * Run: npx tsx scripts/import-csv-to-test.ts
 *
 * Sets MONGODB_URI to test DB before loading any app code.
 */

import * as fs from 'fs'
import * as path from 'path'

// MUST set MONGODB_URI before any lib that reads it (lib/db is loaded later via dynamic import)
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) {
      const key = m[1].trim()
      let val = m[2].trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1)
      process.env[key] = val
    }
  })
}
let uri = process.env.MONGODB_URI || ''
uri = uri.replace(/\/([^/]*)\?/, '/test?').replace(/\/$/, '/test')
process.env.MONGODB_URI = uri
console.log('Using TEST database for import.\n')

import type { CsvRow } from '../lib/importUsersCsv'

async function main() {
  const { parseCsvToRows, toDurationDays } = await import('../lib/importUsersCsv')
  const connectDB = (await import('../lib/db')).default
  const Membership = (await import('../lib/models/Membership')).default
  const { addClient } = await import('../lib/clientStore')
  const { createMembership } = await import('../lib/membershipStore')

  async function getOrCreateMembership(durationDays: number, price: number): Promise<number> {
    await connectDB()
    const existing = await Membership.findOne({ durationDays, price }).lean()
    if (existing?.membershipId) return existing.membershipId as number
    const months = Math.round(durationDays / 30)
    const name = `${months} Month${months !== 1 ? 's' : ''} - ₹${price}`
    const created = await createMembership({ name, durationDays, price, isActive: true })
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

  const csvPath = path.join(__dirname, '..', 'Users List (9).csv')
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found:', csvPath)
    process.exit(1)
  }
  const csvText = fs.readFileSync(csvPath, 'utf8')
  const rows = parseCsvToRows(csvText)
  if (rows.length === 0) {
    console.error('No data rows in CSV.')
    process.exit(1)
  }
  console.log('Rows to import:', rows.length)

  const membershipIdByKey = new Map<string, number>()
  let created = 0
  let skipped = 0

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
      created++
      if (created % 50 === 0) console.log('  ...', created)
    } catch (err) {
      console.error(`Row ${i + 2} (${row.firstName} ${row.lastName}):`, err)
      skipped++
    }
  }

  console.log('\nImport complete. Created:', created, 'Skipped:', skipped)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
