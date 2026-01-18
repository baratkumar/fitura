import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClient extends Document {
  clientId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  age?: number;
  height?: number;
  weight?: number;
  gender?: string;
  bloodGroup?: string;
  bmi?: number;
  aadharNumber?: string;
  photoUrl?: string;
  address: string;
  membershipType?: mongoose.Types.ObjectId;
  joiningDate?: Date;
  expiryDate?: Date;
  membershipFee?: number;
  discount?: number;
  paymentDate?: Date;
  paymentMode?: string;
  transactionId?: string;
  paidAmount?: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalConditions?: string;
  fitnessGoals?: string;
  firstTimeInGym?: string;
  previousGymDetails?: string;
}

const ClientSchema = new Schema<IClient>(
  {
    clientId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
      min: 1, // Ensure clientId always starts from 1
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    age: {
      type: Number,
    },
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    gender: {
      type: String,
    },
    bloodGroup: {
      type: String,
    },
    bmi: {
      type: Number,
    },
    aadharNumber: {
      type: String,
    },
    photoUrl: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    membershipType: {
      type: Schema.Types.ObjectId,
      ref: 'Membership',
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
    paymentDate: {
      type: Date,
    },
    paymentMode: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    paidAmount: {
      type: Number,
    },
    emergencyContactName: {
      type: String,
      required: true,
    },
    emergencyContactPhone: {
      type: String,
      required: true,
    },
    medicalConditions: {
      type: String,
    },
    fitnessGoals: {
      type: String,
    },
    firstTimeInGym: {
      type: String,
    },
    previousGymDetails: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Delete the model if it exists to force recompilation with new schema
if (mongoose.models.Client) {
  delete mongoose.models.Client;
}

// Prevent re-compilation during development
const Client: Model<IClient> = mongoose.model<IClient>('Client', ClientSchema);

export default Client;


