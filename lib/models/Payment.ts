import mongoose, { Schema, Document, Model } from 'mongoose';

/** Extra amount paid later against the current membership, not a renewal. */
export interface IPayment extends Document {
  clientId: number;
  renewalId?: mongoose.Types.ObjectId | null;
  amount: number;
  paymentDate: Date;
  paymentMode?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    clientId: {
      type: Number,
      required: true,
      index: true,
      min: 1,
    },
    renewalId: {
      type: Schema.Types.ObjectId,
      ref: 'Renewal',
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      required: true,
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
    collection: 'payments',
  }
);

PaymentSchema.index({ clientId: 1, renewalId: 1 });
PaymentSchema.index({ paymentDate: 1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
