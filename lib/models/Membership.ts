import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMembership extends Document {
  membershipId: number;
  name: string;
  description?: string;
  durationDays: number;
  price?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    membershipId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
      min: 1, // Ensure membershipId always starts from 1
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    durationDays: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation during development
const Membership: Model<IMembership> =
  mongoose.models.Membership || mongoose.model<IMembership>('Membership', MembershipSchema);

export default Membership;


