import { AlertTriangle, CalendarClock, CheckCircle2, XCircle } from 'lucide-react'
import { getMembershipRenewalInfo } from '@/lib/membershipRenewal'

type MembershipRenewalCardProps = {
  expiryDate?: string | null
}

const URGENCY_STYLES = {
  expired: {
    wrap: 'bg-red-50 border-red-200',
    icon: 'bg-red-100 text-red-600',
    number: 'text-red-600',
    label: 'text-red-800',
    sub: 'text-red-600/80',
    Icon: XCircle,
    title: 'Membership lapsed',
  },
  'expires-today': {
    wrap: 'bg-red-50 border-red-200 ring-2 ring-red-200/60',
    icon: 'bg-red-100 text-red-600',
    number: 'text-red-600',
    label: 'text-red-800',
    sub: 'text-red-600/80',
    Icon: AlertTriangle,
    title: 'Renewal due today',
  },
  urgent: {
    wrap: 'bg-red-50 border-red-200 ring-2 ring-red-200/60',
    icon: 'bg-red-100 text-red-600',
    number: 'text-red-600',
    label: 'text-red-800',
    sub: 'text-red-600/80',
    Icon: AlertTriangle,
    title: 'Renewal coming up',
  },
  ok: {
    wrap: 'bg-emerald-50 border-emerald-200',
    icon: 'bg-emerald-100 text-emerald-600',
    number: 'text-emerald-700',
    label: 'text-emerald-900',
    sub: 'text-emerald-700/80',
    Icon: CheckCircle2,
    title: 'Membership active',
  },
} as const

export default function MembershipRenewalCard({ expiryDate }: MembershipRenewalCardProps) {
  const info = getMembershipRenewalInfo(expiryDate)

  if (info.urgency === 'none') {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">No expiry date on file</p>
            <p className="text-xs text-gray-500 mt-0.5">Add a membership expiry to track renewals.</p>
          </div>
        </div>
      </div>
    )
  }

  const style = URGENCY_STYLES[info.urgency]
  const StatusIcon = style.Icon
  const showBigNumber =
    info.daysRemaining !== null && info.urgency !== 'expired' && info.daysRemaining >= 0

  return (
    <div className={`rounded-xl border p-4 text-left ${style.wrap}`}>
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.icon}`}
        >
          <StatusIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wide ${style.sub}`}>
            {style.title}
          </p>
          {showBigNumber ? (
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-4xl font-black tabular-nums leading-none ${style.number}`}>
                {info.daysRemaining}
              </span>
              <span className={`text-sm font-semibold ${style.label}`}>
                {info.daysRemaining === 1 ? 'day left' : 'days left'}
              </span>
            </div>
          ) : (
            <p className={`text-xl font-bold mt-1 ${style.label}`}>{info.daysLabel}</p>
          )}
          <p className={`text-xs mt-2 ${style.sub}`}>
            Expires {info.expiryFormatted}
          </p>
          {info.urgency === 'urgent' || info.urgency === 'expires-today' ? (
            <p className="text-xs font-medium text-red-700 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Follow up for renewal before membership lapses
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
