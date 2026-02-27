import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRenewal extends Document {
  clientId: number;
  membershipType: mongoose.Types.ObjectId;
  joiningDate?: Date;
  expiryDate?: Date;
  membershipFee?: number;
  discount?: number;
  paidAmount?: number;
  paymentDate?: Date;
  paymentMode?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RenewalSchema = new Schema<IRenewal>(
  {
    clientId: {
      type: Number,
      required: true,
      index: true,
      min: 1,
    },
    membershipType: {
      type: Schema.Types.ObjectId,
      ref: 'Membership',
      required: true,
    },
    joiningDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    membershipFee: {
      type: Number,
    },
    discount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
    },
    paymentDate: {
      type: Date,
    },
    paymentMode: {
      type: String,
    },
    transactionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Renewal: Model<IRenewal> =
  mongoose.models.Renewal || mongoose.model<IRenewal>('Renewal', RenewalSchema);

export default Renewal;

