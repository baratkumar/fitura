import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IAbsenceReminderLog extends Document {
  clientId: mongoose.Types.ObjectId
  clientNumber: number
  lastAttendanceDate: Date
  thresholdDays: number
  phone: string
  message: string
  sentAt: Date
}

const AbsenceReminderLogSchema = new Schema<IAbsenceReminderLog>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    clientNumber: {
      type: Number,
      required: true,
      index: true,
    },
    lastAttendanceDate: {
      type: Date,
      required: true,
      index: true,
    },
    thresholdDays: {
      type: Number,
      required: true,
      default: 3,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

AbsenceReminderLogSchema.index(
  { clientId: 1, lastAttendanceDate: 1, thresholdDays: 1 },
  { unique: true }
)

if (mongoose.models.AbsenceReminderLog) {
  delete mongoose.models.AbsenceReminderLog
}

const AbsenceReminderLog: Model<IAbsenceReminderLog> = mongoose.model<IAbsenceReminderLog>(
  'AbsenceReminderLog',
  AbsenceReminderLogSchema
)

export default AbsenceReminderLog
