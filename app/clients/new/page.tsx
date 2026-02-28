'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, CreditCard, Phone, Heart, Camera, X } from 'lucide-react'
import PageLoader from '@/components/PageLoader'

interface Membership {
  membershipId: number
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
  const today = new Date().toISOString().split('T')[0]
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', age: '', height: '', weight: '',
    gender: '', bloodGroup: '', bmi: '', aadharNumber: '',
    photoUrl: '', address: '', membershipType: '',
    joiningDate: today, expiryDate: '',
    emergencyContactName: '', emergencyContactPhone: '',
    medicalConditions: '', fitnessGoals: '',
    firstTimeInGym: '', previousGymDetails: '',
    membershipFee: '', discount: '', paymentDate: today,
    paymentMode: '', transactionId: '', paidAmount: '',
  })
  const [calculatedFee, setCalculatedFee] = useState(0)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => { fetchMemberships() }, [])

  useEffect(() => {
    if (formData.membershipType) {
      const m = memberships.find(m => m.membershipId.toString() === formData.membershipType)
      if (m) {
        const fee = m.price || 0
        const discount = parseFloat(formData.discount) || 0
        setCalculatedFee(Math.max(0, fee - discount))
        setFormData(prev => ({ ...prev, membershipFee: fee.toString() }))
      }
    }
  }, [formData.membershipType, formData.discount, memberships])

  useEffect(() => {
    if (formData.dateOfBirth) {
      const birth = new Date(formData.dateOfBirth)
      const now = new Date()
      let age = now.getFullYear() - birth.getFullYear()
      if (now.getMonth() - birth.getMonth() < 0 || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--
      setFormData(prev => ({ ...prev, age: age.toString() }))
    } else {
      setFormData(prev => ({ ...prev, age: '' }))
    }
  }, [formData.dateOfBirth])

  useEffect(() => {
    if (formData.joiningDate && formData.membershipType) {
      const m = memberships.find(m => m.membershipId.toString() === formData.membershipType)
      if (m?.durationDays) {
        const d = new Date(formData.joiningDate)
        d.setDate(d.getDate() + m.durationDays)
        setFormData(prev => ({ ...prev, expiryDate: d.toISOString().split('T')[0] }))
      }
    }
  }, [formData.joiningDate, formData.membershipType, memberships])

  const fetchMemberships = async () => {
    try {
      const res = await fetch('/api/memberships')
      if (res.ok) {
        const data = await res.json()
        setMemberships(data)
        if (data.length > 0 && !formData.membershipType)
          setFormData(prev => ({ ...prev, membershipType: data[0].membershipId.toString() }))
      }
    } catch (e) {
      console.error('Error fetching memberships:', e)
    } finally {
      setLoadingMemberships(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'height' || name === 'weight') {
        const h = name === 'height' ? parseFloat(value) : parseFloat(prev.height)
        const w = name === 'weight' ? parseFloat(value) : parseFloat(prev.weight)
        if (h && w && h > 0) {
          updated.bmi = (w / ((h / 100) ** 2)).toFixed(2)
        } else {
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
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let photoUrl = formData.photoUrl || ''
      if (photoFile) {
        setUploadingPhoto(true)
        const fd = new FormData()
        fd.append('file', photoFile)
        try {
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json()
            photoUrl = uploadData.url
          } else {
            const err = await uploadRes.json()
            if (!err.error?.includes('not configured')) alert(err.error || 'Photo upload failed.')
            photoUrl = ''
          }
        } catch { photoUrl = '' }
        finally { setUploadingPhoto(false) }
      }
      const { photoUrl: _, ...rest } = formData
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...rest,
          photoUrl: photoUrl || undefined,
          membershipFee: formData.membershipFee ? parseFloat(formData.membershipFee) : undefined,
          discount: formData.discount ? parseFloat(formData.discount) : undefined,
          paidAmount: formData.paidAmount ? parseFloat(formData.paidAmount) : undefined,
        }),
      })
      if (res.ok) {
        router.push('/clients')
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to register client')
      }
    } catch (e) {
      console.error('Error registering client:', e)
      alert('An error occurred while registering the client')
    } finally {
      setLoading(false)
      setUploadingPhoto(false)
    }
  }

  // Shared styles
  const inputCls = "w-full px-4 py-2.5 bg-luxury-card border border-luxury-border rounded-xl text-luxury-text text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors placeholder-luxury-subtle"
  const readOnlyCls = "w-full px-4 py-2.5 bg-luxury-black border border-luxury-border rounded-xl text-luxury-subtle text-sm cursor-not-allowed"
  const labelCls = "block text-xs font-semibold text-luxury-muted uppercase tracking-wider mb-1.5"
  const sectionTitleCls = "flex items-center gap-2.5 text-sm font-bold text-gold uppercase tracking-widest mb-6"
  const cardCls = "bg-luxury-surface border border-luxury-border rounded-2xl p-6 sm:p-8 relative overflow-hidden"

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">

      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <Link href="/clients"
          className="p-2 rounded-xl border border-luxury-border text-luxury-muted hover:border-gold/40 hover:text-gold transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-0.5">Clients</p>
          <h1 className="text-3xl font-black text-luxury-text">Register New Client</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── PERSONAL INFO ── */}
        <div className={cardCls}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <h2 className={sectionTitleCls}><User className="w-4 h-4" /> Personal Information</h2>

          {/* Photo Upload */}
          <div className="mb-6">
            <label className={labelCls}>Client Photo</label>
            <div className="flex items-center gap-5">
              {photoPreview || formData.photoUrl ? (
                <div className="relative shrink-0">
                  <img
                    src={photoPreview || formData.photoUrl}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-xl border-2 border-gold/30"
                  />
                  {photoPreview && (
                    <button type="button"
                      onClick={() => { setPhotoFile(null); setPhotoPreview(null); setFormData(prev => ({ ...prev, photoUrl: '' })) }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-luxury-border bg-luxury-card flex flex-col items-center justify-center shrink-0">
                  <Camera className="w-6 h-6 text-luxury-subtle" />
                  <span className="text-[10px] text-luxury-subtle mt-1">No photo</span>
                </div>
              )}
              <div className="flex-1">
                <input type="file" id="photo" name="photo" accept="image/*" onChange={handlePhotoChange}
                  className="block w-full text-sm text-luxury-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gold file:text-luxury-black hover:file:bg-gold-light file:cursor-pointer file:transition-colors" />
                <p className="mt-1.5 text-xs text-luxury-subtle">JPG, PNG or GIF · max 10MB · auto-resized to 1080×1920</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className={labelCls}>First Name <span className="text-red-400">*</span></label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className={inputCls} placeholder="John" />
            </div>
            <div>
              <label htmlFor="lastName" className={labelCls}>Last Name <span className="text-red-400">*</span></label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className={inputCls} placeholder="Doe" />
            </div>
            <div>
              <label htmlFor="email" className={labelCls}>Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} placeholder="john@example.com" />
            </div>
            <div>
              <label htmlFor="phone" className={labelCls}>Phone <span className="text-red-400">*</span></label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className={inputCls} placeholder="+91 00000 00000" />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className={labelCls}>Date of Birth <span className="text-red-400">*</span></label>
              <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Age <span className="text-[10px] font-normal text-gold/60 normal-case tracking-normal">Auto</span></label>
              <input type="number" value={formData.age} readOnly className={readOnlyCls} placeholder="Calculated from DOB" />
            </div>

            {/* Gender */}
            <div>
              <label className={labelCls}>Gender</label>
              <div className="flex gap-2 mt-1">
                {['male', 'female', 'other'].map(g => (
                  <button key={g} type="button" onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border capitalize transition-all
                      ${formData.gender === g
                        ? 'bg-gold/15 border-gold/50 text-gold'
                        : 'bg-luxury-card border-luxury-border text-luxury-muted hover:border-gold/30 hover:text-gold'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="bloodGroup" className={labelCls}>Blood Group</label>
              <select id="bloodGroup" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className={inputCls}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-','Bombay (hh)','Unknown'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="height" className={labelCls}>Height (cm)</label>
              <input type="number" id="height" name="height" value={formData.height} onChange={handleChange} min="1" max="300" step="0.1" className={inputCls} placeholder="170" />
            </div>
            <div>
              <label htmlFor="weight" className={labelCls}>Weight (kg)</label>
              <input type="number" id="weight" name="weight" value={formData.weight} onChange={handleChange} min="1" max="500" step="0.1" className={inputCls} placeholder="70" />
            </div>
            <div>
              <label className={labelCls}>BMI <span className="text-[10px] font-normal text-gold/60 normal-case tracking-normal">Auto</span></label>
              <input type="number" value={formData.bmi} readOnly className={readOnlyCls} placeholder="Calculated from height & weight" />
            </div>
            <div>
              <label htmlFor="aadharNumber" className={labelCls}>Aadhar Number</label>
              <input type="text" id="aadharNumber" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} maxLength={12} pattern="[0-9]{12}" className={inputCls} placeholder="12-digit number" />
            </div>
          </div>
        </div>

        {/* ── MEMBERSHIP ── */}
        <div className={cardCls}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <h2 className={sectionTitleCls}><CreditCard className="w-4 h-4" /> Membership & Payment</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="membershipType" className={labelCls}>Membership Type <span className="text-red-400">*</span></label>
              {loadingMemberships ? (
                <div className={`${readOnlyCls} flex items-center justify-center`}><PageLoader size="sm" message="" className="py-0" /></div>
              ) : (
                <select id="membershipType" name="membershipType" value={formData.membershipType} onChange={handleChange} required className={inputCls}>
                  {memberships.length === 0
                    ? <option value="">No memberships available</option>
                    : memberships.map(m => <option key={m.membershipId} value={m.membershipId}>{m.name}{m.description ? ` — ${m.description}` : ''}</option>)
                  }
                </select>
              )}
            </div>
            <div>
              <label className={labelCls}>Membership Fee <span className="text-[10px] font-normal text-gold/60 normal-case tracking-normal">Auto</span></label>
              <input type="number" value={formData.membershipFee} readOnly className={readOnlyCls} placeholder="0.00" />
            </div>
            <div>
              <label htmlFor="joiningDate" className={labelCls}>Joining Date <span className="text-red-400">*</span></label>
              <input type="date" id="joiningDate" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required className={inputCls} />
            </div>
            <div>
              <label htmlFor="expiryDate" className={labelCls}>Expiry Date <span className="text-[10px] font-normal text-gold/60 normal-case tracking-normal">Auto · editable</span></label>
              <input type="date" id="expiryDate" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label htmlFor="discount" className={labelCls}>Discount (₹)</label>
              <input type="number" id="discount" name="discount" value={formData.discount} onChange={handleChange} min="0" step="0.01" className={inputCls} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>Final Amount <span className="text-[10px] font-normal text-gold/60 normal-case tracking-normal">Auto</span></label>
              <div className={`${readOnlyCls} font-bold text-gold`}>₹{calculatedFee.toFixed(2)}</div>
            </div>
            <div>
              <label htmlFor="paymentDate" className={labelCls}>Payment Date</label>
              <input type="date" id="paymentDate" name="paymentDate" value={formData.paymentDate} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label htmlFor="paymentMode" className={labelCls}>Payment Mode</label>
              <select id="paymentMode" name="paymentMode" value={formData.paymentMode} onChange={handleChange} className={inputCls}>
                <option value="">Select mode</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div>
              <label htmlFor="transactionId" className={labelCls}>Transaction ID</label>
              <input type="text" id="transactionId" name="transactionId" value={formData.transactionId} onChange={handleChange} className={inputCls} placeholder="Optional" />
            </div>
            <div>
              <label htmlFor="paidAmount" className={labelCls}>Paid Amount (₹)</label>
              <input type="number" id="paidAmount" name="paidAmount" value={formData.paidAmount} onChange={handleChange} min="0" step="0.01" className={inputCls} placeholder="0.00" />
            </div>
          </div>
        </div>

        {/* ── ADDRESS & EXPERIENCE ── */}
        <div className={cardCls}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <h2 className={sectionTitleCls}><Phone className="w-4 h-4" /> Address & Experience</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className={labelCls}>Address <span className="text-red-400">*</span></label>
              <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required className={inputCls} placeholder="Full address" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>First Time in Gym?</label>
                <div className="flex gap-2 mt-1">
                  {['yes', 'no'].map(v => (
                    <button key={v} type="button" onClick={() => setFormData(prev => ({ ...prev, firstTimeInGym: v }))}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border capitalize transition-all
                        ${formData.firstTimeInGym === v
                          ? 'bg-gold/15 border-gold/50 text-gold'
                          : 'bg-luxury-card border-luxury-border text-luxury-muted hover:border-gold/30 hover:text-gold'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="previousGymDetails" className={labelCls}>Previous Gym Details</label>
                <textarea id="previousGymDetails" name="previousGymDetails" value={formData.previousGymDetails} onChange={handleChange}
                  disabled={formData.firstTimeInGym !== 'no'} rows={3}
                  className={`${formData.firstTimeInGym !== 'no' ? readOnlyCls : inputCls} resize-none`}
                  placeholder="Gym name, duration, type of training…" />
              </div>
            </div>
          </div>
        </div>

        {/* ── EMERGENCY CONTACT ── */}
        <div className={cardCls}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <h2 className={sectionTitleCls}><Phone className="w-4 h-4" /> Emergency Contact</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emergencyContactName" className={labelCls}>Contact Name <span className="text-red-400">*</span></label>
              <input type="text" id="emergencyContactName" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} required className={inputCls} placeholder="Full name" />
            </div>
            <div>
              <label htmlFor="emergencyContactPhone" className={labelCls}>Contact Phone <span className="text-red-400">*</span></label>
              <input type="tel" id="emergencyContactPhone" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} required className={inputCls} placeholder="+91 00000 00000" />
            </div>
          </div>
        </div>

        {/* ── HEALTH & FITNESS ── */}
        <div className={cardCls}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <h2 className={sectionTitleCls}><Heart className="w-4 h-4" /> Health & Fitness</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="medicalConditions" className={labelCls}>Medical Conditions / Allergies</label>
              <textarea id="medicalConditions" name="medicalConditions" value={formData.medicalConditions} onChange={handleChange}
                rows={3} className={`${inputCls} resize-none`} placeholder="List any medical conditions, allergies, or injuries…" />
            </div>
            <div>
              <label htmlFor="fitnessGoals" className={labelCls}>Fitness Goals</label>
              <textarea id="fitnessGoals" name="fitnessGoals" value={formData.fitnessGoals} onChange={handleChange}
                rows={3} className={`${inputCls} resize-none`} placeholder="Weight loss, muscle gain, general fitness…" />
            </div>
          </div>
        </div>

        {/* ── SUBMIT ── */}
        <div className="flex gap-3 pt-2 pb-6">
          <button type="submit" disabled={loading || uploadingPhoto}
            className="flex-1 sm:flex-none sm:px-10 py-3.5 bg-gold text-luxury-black font-bold text-sm rounded-xl hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_24px_rgba(212,175,55,0.35)]">
            {uploadingPhoto ? 'Uploading photo…' : loading ? 'Registering…' : 'Register Client'}
          </button>
          <Link href="/clients"
            className="px-8 py-3.5 border border-luxury-border rounded-xl text-sm font-medium text-luxury-muted hover:border-gold/30 hover:text-gold transition-all text-center">
            Cancel
          </Link>
        </div>

      </form>
    </div>
  )
}
