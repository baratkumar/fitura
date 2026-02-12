/**
 * Check if the "test" database has data. Uses same cluster as MONGODB_URI but db name "test".
 * Usage: node scripts/check-test-db.js
 */

const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
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

let uri = process.env.MONGODB_URI
if (!uri) {
  console.error('Missing MONGODB_URI in .env.local')
  process.exit(1)
}
// Switch to "test" database (replace /fitura with /test, or add /test before ?)
uri = uri.replace(/\/([^/]*)\?/, '/test?').replace(/\/$/, '/test')

async function main() {
  const mongoose = require('mongoose')
  console.log('Connecting to "test" database...')
  await mongoose.connect(uri)
  const db = mongoose.connection.db
  const collections = await db.listCollections().toArray()
  console.log('\nCollections in "test" database:\n')
  let total = 0
  for (const { name } of collections) {
    const count = await db.collection(name).countDocuments()
    total += count
    console.log(`  ${name}: ${count} documents`)
  }
  console.log('\nTotal documents:', total)
  await mongoose.disconnect()
  console.log('Done.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
