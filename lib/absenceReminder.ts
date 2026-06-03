import mongoose from 'mongoose'
import connectDB from './db'
import Attendance from './models/Attendance'
import Client from './models/Client'
import AbsenceReminderLog from './models/AbsenceReminderLog'
import { sendWhatsAppTextMessage } from './whatsapp'

type LastAttendanceRow = {
  _id: mongoose.Types.ObjectId
  lastAttendanceDate: Date
}

export type AbsenceReminderRunResult = {
  thresholdDays: number
  eligibleClients: number
  sent: number
  skippedAlreadySent: number
  skippedNoPhone: number
  failed: Array<{ clientId: number; reason: string }>
}

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function getAbsenceDays(lastAttendanceDate: Date): number {
  const today = startOfToday()
  const last = new Date(lastAttendanceDate)
  last.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
}

function buildAbsenceMessage(clientName: string, absenceDays: number): string {
  return `Hi ${clientName}, we miss seeing you at Fitura. You have been absent for ${absenceDays} days. Reply to this message if you need any support to get back on track.`
}

export async function sendAbsenceReminders(thresholdDays: number = 3): Promise<AbsenceReminderRunResult> {
  await connectDB()

  const result: AbsenceReminderRunResult = {
    thresholdDays,
    eligibleClients: 0,
    sent: 0,
    skippedAlreadySent: 0,
    skippedNoPhone: 0,
    failed: [],
  }

  const lastAttendanceByClient = (await Attendance.aggregate([
    {
      $group: {
        _id: '$clientId',
        lastAttendanceDate: { $max: '$attendanceDate' },
      },
    },
  ])) as LastAttendanceRow[]

  if (lastAttendanceByClient.length === 0) {
    return result
  }

  const clientIds = lastAttendanceByClient.map((row) => row._id)
  const clients = await Client.find({ _id: { $in: clientIds } })
    .select('clientId firstName lastName phone')
    .lean()

  const byClientId = new Map<string, LastAttendanceRow>(
    lastAttendanceByClient.map((row) => [row._id.toString(), row])
  )

  for (const client of clients) {
    const aggregateRow = byClientId.get(client._id.toString())
    if (!aggregateRow?.lastAttendanceDate) continue

    const absenceDays = getAbsenceDays(new Date(aggregateRow.lastAttendanceDate))
    if (absenceDays < thresholdDays) continue

    result.eligibleClients += 1

    const phone = String(client.phone || '').trim()
    if (!phone) {
      result.skippedNoPhone += 1
      continue
    }

    const alreadySent = await AbsenceReminderLog.exists({
      clientId: client._id,
      lastAttendanceDate: aggregateRow.lastAttendanceDate,
      thresholdDays,
    })

    if (alreadySent) {
      result.skippedAlreadySent += 1
      continue
    }

    const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Member'
    const message = buildAbsenceMessage(fullName, absenceDays)

    try {
      await sendWhatsAppTextMessage({
        to: phone,
        body: message,
      })

      await AbsenceReminderLog.create({
        clientId: client._id,
        clientNumber: client.clientId,
        lastAttendanceDate: aggregateRow.lastAttendanceDate,
        thresholdDays,
        phone,
        message,
        sentAt: new Date(),
      })

      result.sent += 1
    } catch (error) {
      result.failed.push({
        clientId: Number(client.clientId),
        reason: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return result
}
