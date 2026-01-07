'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Membership {
  id: number
  name: string
  description?: string
  durationDays: number
  price?: number
  isActive: boolean
}

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loadingMemberships, setLoadingMemberships] = useState(true)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    age: '',
    height: '',
    weight: '',
    gender: '',
    bloodGroup: '',
    bmi: '',
    aadharNumber: '',
    photoUrl: '',
    address: '',
    membershipType: '',
    joiningDate: '',
    expiryDate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    fitnessGoals: '',
    firstTimeInGym: '',
    previousGymDetails: '',
    photoUrl: '',
    membershipFee: '',
    discount: '',
    paymentDate: '',
    paymentMode: '',
    transactionId: '',
    paidAmount: '',
  })
  const [calculatedFee, setCalculatedFee] = useState<number>(0)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    fetchMemberships()
  }, [])

  // Calculate membership fee when membership type or discount changes
  useEffect(() => {
    if (formData.membershipType) {
      const selectedMembership = memberships.find(m => m.id.toString() === formData.membershipType)
      if (selectedMembership) {
        const fee = selectedMembership.price || 0
        const discount = parseFloat(formData.discount) || 0
        const finalAmount = Math.max(0, fee - discount)
        setCalculatedFee(finalAmount)
        setFormData(prev => ({ ...prev, membershipFee: fee.toString() }))
      }
    }
  }, [formData.membershipType, formData.discount, memberships])

  // Calculate age when date of birth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      setFormData(prev => ({ ...prev, age: age.toString() }))
    } else {
      setFormData(prev => ({ ...prev, age: '' }))
    }
  }, [formData.dateOfBirth])

  // Calculate expiry date when joining date or membership type changes
  useEffect(() => {
    if (formData.joiningDate && formData.membershipType) {
      const selectedMembership = memberships.find(m => m.id.toString() === formData.membershipType)
      if (selectedMembership && selectedMembership.durationDays) {
        const joiningDate = new Date(formData.joiningDate)
        const expiryDate = new Date(joiningDate)
        expiryDate.setDate(expiryDate.getDate() + selectedMembership.durationDays)
        
        // Format as YYYY-MM-DD for date input
        const formattedExpiryDate = expiryDate.toISOString().split('T')[0]
        setFormData(prev => {
          // Only auto-update if expiry date hasn't been manually edited
          // We'll track this with a flag, but for now, always update
          return { ...prev, expiryDate: formattedExpiryDate }
        })
      }
    }
  }, [formData.joiningDate, formData.membershipType, memberships])

  const fetchMemberships = async () => {
    try {
      const response = await fetch('/api/memberships')
      if (response.ok) {
        const data = await response.json()
        setMemberships(data)
        if (data.length > 0 && !formData.membershipType) {
          setFormData(prev => ({ ...prev, membershipType: data[0].id.toString() }))
        }
      }
    } catch (error) {
      console.error('Error fetching memberships:', error)
    } finally {
      setLoadingMemberships(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      }
      
      // Auto-calculate BMI when height and weight are provided
      if (name === 'height' || name === 'weight') {
        const height = name === 'height' ? parseFloat(value) : parseFloat(prev.height)
        const weight = name === 'weight' ? parseFloat(value) : parseFloat(prev.weight)
        
        if (height && weight && height > 0) {
          const heightInMeters = height / 100
          const calculatedBMI = weight / (heightInMeters * heightInMeters)
          updated.bmi = calculatedBMI.toFixed(2)
        } else if (!height || !weight) {
          updated.bmi = ''
        }
      }
      
      return updated
    })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let photoUrl = formData.photoUrl

      // Upload photo if a new file is selected
      if (photoFile) {
        setUploadingPhoto(true)
        const uploadFormData = new FormData()
        uploadFormData.append('file', photoFile)

        try {
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          })

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json()
            photoUrl = uploadData.url
          } else {
            const error = await uploadResponse.json()
            // If blob storage is not configured, allow form submission without photo
            if (error.error?.includes('not configured')) {
              console.warn('Blob storage not configured, proceeding without photo upload')
              photoUrl = ''
            } else {
              alert(error.error || 'Failed to upload photo. You can still submit the form without a photo.')
              // Don't return, allow form submission to continue
            }
          }
        } catch (error) {
          console.error('Error uploading photo:', error)
          // Allow form submission to continue even if photo upload fails
          alert('Photo upload failed. You can still submit the form without a photo.')
        } finally {
          setUploadingPhoto(false)
        }
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          photoUrl,
          membershipFee: formData.membershipFee ? parseFloat(formData.membershipFee) : undefined,
          discount: formData.discount ? parseFloat(formData.discount) : undefined,
          paidAmount: formData.paidAmount ? parseFloat(formData.paidAmount) : undefined,
        }),
      })

      if (response.ok) {
        router.push('/clients')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to register client')
      }
    } catch (error) {
      console.error('Error registering client:', error)
      alert('An error occurred while registering the client')
    } finally {
      setLoading(false)
      setUploadingPhoto(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/clients" 
          className="text-fitura-blue hover:text-fitura-magenta mb-4 inline-block"
        >
          ← Back to Clients
        </Link>
        <h1 className="text-4xl font-bold mb-2">Register New Client</h1>
        <p className="text-gray-600">Fill out the form below to register a new gym member</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-fitura-blue">Personal Information</h2>
            
            {/* Photo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Photo
              </label>
              <div className="flex items-center gap-6">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null)
                        setPhotoPreview(null)
                        setFormData(prev => ({ ...prev, photoUrl: '' }))
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : formData.photoUrl ? (
                  <div className="relative">
                    <img
                      src={formData.photoUrl}
                      alt="Current photo"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No photo</span>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="photo"
                    name="photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-fitura-blue file:text-white hover:file:bg-fitura-purple-600 file:cursor-pointer"
                  />
                  <p className="mt-1 text-xs text-gray-500">JPG, PNG or GIF (max. 5MB)</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  readOnly
                  min="1"
                  max="120"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  placeholder="Auto-calculated from date of birth"
                />
                <p className="mt-1 text-xs text-gray-500">Automatically calculated from date of birth</p>
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleChange}
                      className="w-4 h-4 text-fitura-purple-600 focus:ring-fitura-purple-500"
                    />
                    <span className="ml-2 text-gray-700">Male</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleChange}
                      className="w-4 h-4 text-fitura-purple-600 focus:ring-fitura-purple-500"
                    />
                    <span className="ml-2 text-gray-700">Female</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={formData.gender === 'other'}
                      onChange={handleChange}
                      className="w-4 h-4 text-fitura-purple-600 focus:ring-fitura-purple-500"
                    />
                    <span className="ml-2 text-gray-700">Other</span>
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group
                </label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  min="1"
                  max="300"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  placeholder="Enter height in cm"
                />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="1"
                  max="500"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  placeholder="Enter weight in kg"
                />
              </div>
              <div>
                <label htmlFor="bmi" className="block text-sm font-medium text-gray-700 mb-2">
                  BMI (Body Mass Index)
                </label>
                <input
                  type="number"
                  id="bmi"
                  name="bmi"
                  value={formData.bmi}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent bg-gray-50"
                  placeholder="Auto-calculated from height & weight"
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">Automatically calculated from height and weight</p>
              </div>
              <div>
                <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhar Number
                </label>
                <input
                  type="text"
                  id="aadharNumber"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  maxLength={12}
                  pattern="[0-9]{12}"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  placeholder="Enter 12-digit Aadhar number"
                />
                <p className="mt-1 text-xs text-gray-500">12-digit unique identification number</p>
              </div>
            </div>
            
            {/* Membership Type and Membership Fee in same row */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="membershipType" className="block text-sm font-medium text-gray-700 mb-2">
                  Membership Type <span className="text-red-500">*</span>
                </label>
                {loadingMemberships ? (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100">
                    Loading memberships...
                  </div>
                ) : (
                  <select
                    id="membershipType"
                    name="membershipType"
                    value={formData.membershipType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                    required
                  >
                    {memberships.length === 0 ? (
                      <option value="">No memberships available</option>
                    ) : (
                      memberships.map((membership) => (
                        <option key={membership.id} value={membership.id}>
                          {membership.name}
                          {membership.description && ` - ${membership.description}`}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>
              <div>
                <label htmlFor="membershipFee" className="block text-sm font-medium text-gray-700 mb-2">
                  Membership Fee
                </label>
                <input
                  type="number"
                  id="membershipFee"
                  name="membershipFee"
                  value={formData.membershipFee}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {/* Joining Date and Expiry Date in same row */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="joiningDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Joining Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="joiningDate"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Auto-calculated from joining date and membership duration (editable)</p>
              </div>
            </div>

            {/* Discount and Final Amount */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                  Discount
                </label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Amount
                </label>
                <input
                  type="text"
                  value={`₹${calculatedFee.toFixed(2)}`}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed font-semibold"
                />
              </div>
            </div>

            {/* Payment Information */}
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4 text-fitura-blue">Payment Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    id="paymentDate"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Mode
                  </label>
                  <select
                    id="paymentMode"
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  >
                    <option value="">Select payment mode</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    id="transactionId"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                    placeholder="Enter transaction ID"
                  />
                </div>
                <div>
                  <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Paid Amount
                  </label>
                  <input
                    type="number"
                    id="paidAmount"
                    name="paidAmount"
                    value={formData.paidAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mt-6">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First time in Gym?
                </label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="firstTimeInGym"
                      value="yes"
                      checked={formData.firstTimeInGym === 'yes'}
                      onChange={handleChange}
                      className="w-4 h-4 text-fitura-purple-600 focus:ring-fitura-purple-500"
                    />
                    <span className="ml-2 text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="firstTimeInGym"
                      value="no"
                      checked={formData.firstTimeInGym === 'no'}
                      onChange={handleChange}
                      className="w-4 h-4 text-fitura-purple-600 focus:ring-fitura-purple-500"
                    />
                    <span className="ml-2 text-gray-700">No</span>
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="previousGymDetails" className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Gym Experience Details
                </label>
                <textarea
                  id="previousGymDetails"
                  name="previousGymDetails"
                  value={formData.previousGymDetails}
                  onChange={handleChange}
                  disabled={formData.firstTimeInGym !== 'no'}
                  rows={4}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent ${
                    formData.firstTimeInGym !== 'no' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-900'
                  }`}
                  placeholder="Please provide details about your previous gym experience (e.g., gym name, duration, type of training, etc.)"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-fitura-blue">Emergency Contact</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-fitura-blue">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="medicalConditions" className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Conditions / Allergies
                </label>
                <textarea
                  id="medicalConditions"
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  placeholder="Please list any medical conditions, allergies, or injuries we should be aware of..."
                />
              </div>
              <div>
                <label htmlFor="fitnessGoals" className="block text-sm font-medium text-gray-700 mb-2">
                  Fitness Goals
                </label>
                <textarea
                  id="fitnessGoals"
                  name="fitnessGoals"
                  value={formData.fitnessGoals}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-purple-500 focus:border-transparent"
                  placeholder="What are your fitness goals? (e.g., weight loss, muscle gain, general fitness, etc.)"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || uploadingPhoto}
              className="bg-fitura-dark text-white px-8 py-3 rounded-lg font-semibold hover:bg-fitura-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingPhoto ? 'Uploading photo...' : loading ? 'Registering...' : 'Register Client'}
            </button>
            <Link
              href="/clients"
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

