'use client'

import { api } from '@/lib/apiClient'
import { useState } from 'react'

interface PromoResult {
  valid: boolean
  message?: string
  data?: {
    couponId: string
    code: string
    discountAmount: number
    discountType: string
    discountValue: number
  }
}

interface PromoCodeInputProps {
  orderTotal: number
  onApplied: (code: string, discountAmount: number) => void
  appliedCode?: string | null
  className?: string
}

export default function PromoCodeInput({
  orderTotal,
  onApplied,
  appliedCode,
  className = '',
}: PromoCodeInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleApply = async () => {
    const trimmed = code.trim()
    if (!trimmed) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await api.post<{ success: boolean } & PromoResult>('/api/promos/validate', {
        code: trimmed,
        orderTotal,
      })
      const data = res.data
      if (data.valid && data.data) {
        onApplied(data.data.code, data.data.discountAmount)
        setMessage(`Applied! -${data.data.discountAmount.toFixed(2)}`)
      } else {
        setMessage(data.message || 'Invalid code')
      }
    } catch {
      setMessage('Failed to validate code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      {appliedCode ? (
        <p className="text-green-600 text-sm">Promo applied: {appliedCode}</p>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Promo code"
              className="flex-1 border rounded px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleApply}
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? '...' : 'Apply'}
            </button>
          </div>
          {message && (
            <p className={`text-sm mt-1 ${message.startsWith('Applied') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </>
      )}
    </div>
  )
}
