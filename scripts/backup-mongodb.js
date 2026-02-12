/**
 * Backup MongoDB database to JSON files.
 * Loads MONGODB_URI from .env.local (or env). Optional: BACKUP_DB=test to backup "test" database.
 *
 * Usage: node scripts/backup-mongodb.js
 *        BACKUP_DB=test node scripts/backup-mongodb.js
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

let MONGODB_URI = process.env.MONGODB_URI
const BACKUP_DB = process.env.BACKUP_DB
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI. Set it in .env.local or the environment.')
  process.exit(1)
}
if (BACKUP_DB) {
  MONGODB_URI = MONGODB_URI.replace(/\/([^/]*)\?/, `/${BACKUP_DB}?`).replace(/\/$/, `/${BACKUP_DB}`)
  console.log('Backing up database:', BACKUP_DB)
}

async function main() {
  const mongoose = require('mongoose')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const folderName = BACKUP_DB ? `${BACKUP_DB}-${timestamp}` : timestamp
  const backupDir = path.join(__dirname, '..', 'mongodb-backup', folderName)
  fs.mkdirSync(backupDir, { recursive: true })
  console.log('Backup directory:', backupDir)

  await mongoose.connect(MONGODB_URI)
  const db = mongoose.connection.db
  const collections = await db.listCollections().toArray()

  for (const { name } of collections) {
    const docs = await db.collection(name).find({}).toArray()
    const outPath = path.join(backupDir, `${name}.json`)
    fs.writeFileSync(outPath, JSON.stringify(docs, null, 2), 'utf8')
    console.log(name, '→', docs.length, 'documents')
  }

  await mongoose.disconnect()
  console.log('Backup done:', backupDir)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
