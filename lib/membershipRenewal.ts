import { istYmd } from './istCalendar'

export type RenewalUrgency = 'none' | 'expired' | 'expires-today' | 'urgent' | 'ok'

export interface MembershipRenewalInfo {
  urgency: RenewalUrgency
  daysRemaining: number | null
  daysLabel: string
  expiryFormatted: string
}

export function getMembershipRenewalInfo(
  expiryDate?: string | null,
  ref: Date = new Date()
): MembershipRenewalInfo {
  if (!expiryDate?.trim()) {
    return { urgency: 'none', daysRemaining: null, daysLabel: '', expiryFormatted: '' }
  }

  const expiryStr = expiryDate.split('T')[0]
  const todayStr = istYmd(ref)
  const today = new Date(`${todayStr}T00:00:00+05:30`)
  const expiry = new Date(`${expiryStr}T00:00:00+05:30`)
  const daysRemaining = Math.round((expiry.getTime() - today.getTime()) / 86_400_000)

  const expiryFormatted = expiry.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  })

  if (daysRemaining < 0) {
    const ago = Math.abs(daysRemaining)
    return {
      urgency: 'expired',
      daysRemaining,
      daysLabel: `Expired ${ago} day${ago === 1 ? '' : 's'} ago`,
      expiryFormatted,
    }
  }

  if (daysRemaining === 0) {
    return {
      urgency: 'expires-today',
      daysRemaining: 0,
      daysLabel: 'Expires today',
      expiryFormatted,
    }
  }

  if (daysRemaining < 5) {
    return {
      urgency: 'urgent',
      daysRemaining,
      daysLabel: `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`,
      expiryFormatted,
    }
  }

  return {
    urgency: 'ok',
    daysRemaining,
    daysLabel: `${daysRemaining} days left for renewal`,
    expiryFormatted,
  }
}
