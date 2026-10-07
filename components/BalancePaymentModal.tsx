'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import ClientAvatar from '@/components/ClientAvatar'
import { istYmd } from '@/lib/istCalendar'

interface BalancePaymentRow {
  id: string
  amount: number
  paymentDate: string
  paymentMode?: string
  transactionId?: string
}

interface BalanceSummary {
  charge: number
  basePaid: number
  installmentPaid: number
  totalPaid: number
  balanceDue: number
  payments: BalancePaymentRow[]
}

interface Props {
  clientId: number
  firstName: string
  lastName: string
  photoUrl?: string
  onClose: () => void
  onSaved: () => void
}

function money(n: number) {
  return `₹${n.toFixed(2)}`
}

export default function BalancePaymentModal({
  clientId,
  firstName,
  lastName,
  photoUrl,
  onClose,
  onSaved,
}: Props) {
  const [summary, setSummary] = useState<BalanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(istYmd())
  const [paymentMode, setPaymentMode] = useState('')
  const [transactionId, setTransactionId] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/clients/${clientId}/payments`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load balance')
        if (cancelled) return
        setSummary(data)
        setAmount(data.balanceDue > 0 ? data.balanceDue.toFixed(2) : '')
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load balance')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [clientId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/clients/${clientId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentDate,
          paymentMode: paymentMode || undefined,
          transactionId: transactionId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to record payment')
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={() => !saving && onClose()}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Update payment</h2>
            <button
              type="button"
              onClick={() => !saving && onClose()}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <ClientAvatar
              photoUrl={photoUrl}
              firstName={firstName}
              lastName={lastName}
              clientId={clientId}
              size="lg"
            />
            <div>
              <p className="font-semibold text-gray-900">
                {firstName} {lastName}
              </p>
              <p className="text-sm text-gray-500">ID: {clientId}</p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading balance…</p>
          ) : summary ? (
            <>
              <div className="grid grid-cols-3 gap-3 mb-5 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Charge</p>
                  <p className="font-semibold">{money(summary.charge)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Paid</p>
                  <p className="font-semibold">{money(summary.totalPaid)}</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-xs text-red-600">Balance</p>
                  <p className="font-semibold text-red-700">{money(summary.balanceDue)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                First payment {money(summary.basePaid)}
                {summary.installmentPaid > 0 ? `, plus ${money(summary.installmentPaid)} paid later` : ''}.
                This records the rest of the same membership. It does not change the expiry date.
              </p>
              {summary.payments.length > 0 ? (
                <ul className="mb-4 space-y-1 text-sm text-gray-600">
                  {summary.payments.map((p) => (
                    <li key={p.id}>
                      {money(p.amount)} on {new Date(`${p.paymentDate}T12:00:00+05:30`).toLocaleDateString('en-IN')}
                      {p.paymentMode ? ` · ${p.paymentMode}` : ''}
                    </li>
                  ))}
                </ul>
              ) : null}

              {summary.balanceDue <= 0 ? (
                <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3">
                  This membership is fully paid.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="balance-amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount now (₹)
                    </label>
                    <input
                      id="balance-amount"
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      max={summary.balanceDue}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="balance-date" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment date
                    </label>
                    <input
                      id="balance-date"
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="balance-mode" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment mode
                      </label>
                      <select
                        id="balance-mode"
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
                      >
                        <option value="">Select</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="balance-txn" className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction ID
                      </label>
                      <input
                        id="balance-txn"
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Optional"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fitura-blue focus:border-transparent"
                      />
                    </div>
                  </div>
                  {error ? (
                    <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{error}</p>
                  ) : null}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => !saving && onClose()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-fitura-dark text-white rounded-lg font-medium hover:bg-fitura-blue disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Save payment'}
                    </button>
                  </div>
                </form>
              )}
              {summary.balanceDue <= 0 && error ? (
                <p className="text-sm text-red-700 mt-3">{error}</p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-red-700">{error || 'Could not load this balance.'}</p>
          )}
        </div>
      </div>
    </div>
  )
}
