import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
  clientId: mongoose.Types.ObjectId;
  attendanceDate: Date;
  inTime: string;
  outTime?: string;
  status: 'IN' | 'OUT';
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    attendanceDate: {
      type: Date,
      required: true,
      index: true,
    },
    inTime: {
      type: String,
      required: true,
    },
    outTime: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['IN', 'OUT'],
      default: 'IN',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to allow one record per client per date (for IN/OUT toggle)
AttendanceSchema.index({ clientId: 1, attendanceDate: 1 }, { unique: true });

// Delete the model if it exists to force recompilation with new schema (removes old attendanceTime field)
if (mongoose.models.Attendance) {
  delete mongoose.models.Attendance;
}

// Prevent re-compilation during development
const Attendance: Model<IAttendance> = mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;


