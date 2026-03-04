/**
 * Migrate all collections from a source MongoDB (e.g. test db) to a target MongoDB.
 * Uses MONGODB_SOURCE_URI and MONGODB_TARGET_URI. Optional: SOURCE_DB, TARGET_DB (default: test).
 *
 * Example .env.local (do not commit real credentials):
 *   MONGODB_SOURCE_URI=mongodb+srv://user:pass@maxpayne.qifdhq.mongodb.net/?appName=MaxPayne
 *   MONGODB_TARGET_URI=mongodb+srv://user:pass@cluster1.kv00l1p.mongodb.net/
 *   SOURCE_DB=test
 *   TARGET_DB=test
 *
 * Usage:
 *   node scripts/migrate-db.js
 *   SOURCE_DB=test TARGET_DB=fitura node scripts/migrate-db.js
 */

const fs = require('fs')
const path = require('path')

// Load .env.local into process.env
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

const MONGODB_SOURCE_URI = process.env.MONGODB_SOURCE_URI
const MONGODB_TARGET_URI = process.env.MONGODB_TARGET_URI
const SOURCE_DB = process.env.SOURCE_DB || 'test'
const TARGET_DB = process.env.TARGET_DB || 'test'

if (!MONGODB_SOURCE_URI || !MONGODB_TARGET_URI) {
  console.error('Missing MONGODB_SOURCE_URI or MONGODB_TARGET_URI.')
  console.error('Set them in .env.local or in the environment.')
  console.error('Example:')
  console.error('  MONGODB_SOURCE_URI="mongodb+srv://user:pass@source-host/"')
  console.error('  MONGODB_TARGET_URI="mongodb+srv://user:pass@target-host/"')
  process.exit(1)
}

async function main() {
  const { MongoClient } = require('mongodb')

  const sourceClient = new MongoClient(MONGODB_SOURCE_URI)
  const targetClient = new MongoClient(MONGODB_TARGET_URI)

  try {
    console.log('Connecting to source...')
    await sourceClient.connect()
    console.log('Connecting to target...')
    await targetClient.connect()

    const sourceDb = sourceClient.db(SOURCE_DB)
    const targetDb = targetClient.db(TARGET_DB)

    const collections = await sourceDb.listCollections().toArray()
    console.log(`\nFound ${collections.length} collection(s) in source db "${SOURCE_DB}".\n`)

    for (const { name } of collections) {
      const docs = await sourceDb.collection(name).find({}).toArray()
      console.log(`  ${name}: ${docs.length} document(s)`)

      if (docs.length === 0) {
        await targetDb.collection(name).deleteMany({})
        console.log(`    → Cleared "${name}" on target (0 docs to insert).`)
        continue
      }

      // Replace entire collection on target: drop and insert (avoids duplicate _id issues)
      await targetDb.collection(name).drop().catch(() => {})
      const result = await targetDb.collection(name).insertMany(docs)
      console.log(`    → Migrated ${result.insertedCount} document(s) to target db "${TARGET_DB}".`)
    }

    console.log('\nMigration done.')
  } finally {
    await sourceClient.close()
    await targetClient.close()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
