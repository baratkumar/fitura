/**
 * Run this script to import Users List (9).csv into the app database.
 * Set BASE_URL to your running app (e.g. http://localhost:3000 or your production URL).
 * The app must have MONGODB_URI pointing to your remote DB.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 node scripts/import-users-to-remote.js
 *   BASE_URL=https://your-app.vercel.app node scripts/import-users-to-remote.js
 */

const fs = require('fs')
const path = require('path')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const CSV_PATH = path.join(__dirname, '..', 'Users List (9).csv')

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error('CSV file not found:', CSV_PATH)
    process.exit(1)
  }

  const csvText = fs.readFileSync(CSV_PATH, 'utf8')
  const url = `${BASE_URL.replace(/\/$/, '')}/api/clients/import`

  console.log('POSTing CSV to', url, '...')

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv: csvText }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('Import failed:', res.status, data)
    process.exit(1)
  }

  console.log('Result:', data.message)
  console.log('Created:', data.created, 'Skipped:', data.skipped)
  if (data.errors?.length) {
    console.log('First errors:', data.errors.slice(0, 10))
  }
}

main()
