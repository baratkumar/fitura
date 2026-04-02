/**
 * Deletes renewal documents whose paymentDate matches the client's paymentDate
 * (registration duplicates). Registration payment stays on the client document.
 *
 *   npx tsx scripts/remove-renewals-matching-client-createdat.ts
 *   npx tsx scripts/remove-renewals-matching-client-createdat.ts --apply
 */

import * as fs from 'fs'
import * as path from 'path'

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) return
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) {
      const key = m[1].trim()
      if (process.env[key] !== undefined) return
      let val = m[2].trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1)
      process.env[key] = val
    }
  })
}

async function main() {
  loadEnvLocal()
  const connectDB = (await import('../lib/db')).default
  const Renewal = (await import('../lib/models/Renewal')).default

  const apply = process.argv.includes('--apply')
  const batchSizeArg = process.argv.find((a) => a.startsWith('--batch-size='))
  const batchSize = Math.max(100, Number(batchSizeArg?.split('=')[1] || 1000))

  await connectDB()

  // Match renewals whose paymentDate day equals the linked client's paymentDate day.
  const matchPipeline: Record<string, unknown>[] = [
    {
      $match: {
        paymentDate: { $ne: null, $exists: true },
      },
    },
    {
      $lookup: {
        from: 'clients',
        localField: 'clientId',
        foreignField: 'clientId',
        as: 'cl',
      },
    },
    { $unwind: '$cl' },
    {
      $match: {
        'cl.paymentDate': { $ne: null, $exists: true },
      },
    },
    {
      $addFields: {
        renewalPaymentDayUtc: { $dateToString: { date: '$paymentDate', format: '%Y-%m-%d', timezone: 'UTC' } },
        clientPaymentDayUtc: {
          $dateToString: { date: '$cl.paymentDate', format: '%Y-%m-%d', timezone: 'UTC' },
        },
      },
    },
    {
      $match: {
        $expr: { $eq: ['$renewalPaymentDayUtc', '$clientPaymentDayUtc'] },
      },
    },
    {
      $project: {
        _id: 1,
        clientId: 1,
      },
    },
  ]

  if (!apply) {
    const countRows = await Renewal.aggregate([
      ...matchPipeline,
      { $count: 'n' },
    ] as any)
    const n = countRows?.[0]?.n ?? 0
    console.log(`Dry run: ${n} renewal row(s) would be deleted (paymentDate matches client.paymentDate).`)
    console.log('Run with --apply to delete.')
    return
  }

  const rows = await Renewal.aggregate(matchPipeline as any)
  const total = rows.length
  if (total === 0) {
    console.log('Deleted: 0')
    console.log('Affected clients: 0')
    return
  }

  console.log(`Matched ${total} duplicate renewal row(s). Deleting in batches of ${batchSize}...`)

  let deleted = 0
  const affected = new Set<number>()
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize)
    const ids = chunk.map((r: any) => r._id)
    const res = await Renewal.deleteMany({ _id: { $in: ids } })
    deleted += res.deletedCount || 0
    chunk.forEach((r: any) => affected.add(Number(r.clientId)))
    console.log(`Deleted ${Math.min(i + batchSize, total)}/${total}`)
  }

  console.log('Deleted:', deleted)
  console.log('Affected clients:', affected.size)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
