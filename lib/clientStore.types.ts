// Client data types for gym members

export interface Client {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  age?: number
  height?: number
  weight?: number
  gender?: string
  bloodGroup?: string
  bmi?: number
  aadharNumber?: string
  photoUrl?: string
  address: string
  membershipType: string // This will be the membership ID
  membershipName?: string // The name of the membership for display
  joiningDate?: string
  expiryDate?: string
  membershipFee?: number
  discount?: number
  paymentDate?: string
  paymentMode?: string
  transactionId?: string
  paidAmount?: number
  emergencyContactName: string
  emergencyContactPhone: string
  medicalConditions?: string
  fitnessGoals?: string
  firstTimeInGym?: string
  previousGymDetails?: string
  createdAt: string
  updatedAt?: string
}

