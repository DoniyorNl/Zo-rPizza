'use client'

import { api } from '@/lib/apiClient'
import { useEffect, useState } from 'react'

interface LoyaltyBalance {
  points: number
  totalSpent: number
  redeemableDiscount: number
}

interface LoyaltyDisplayProps {
  onRedeem?: (pointsToUse: number) => void
  className?: string
}

export default function LoyaltyDisplay({ onRedeem, className = '' }: LoyaltyDisplayProps) {
  const [balance, setBalance] = useState<LoyaltyBalance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ success: boolean; data: LoyaltyBalance }>('/api/loyalty/balance')
      .then((res) => {
        if (res.data.success && res.data.data) setBalance(res.data.data)
      })
      .catch(() => setBalance(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !balance) return null
  if (balance.points <= 0) return null

  return (
    <div className={`rounded-lg border p-4 bg-amber-50 border-amber-200 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">Loyalty points</p>
          <p className="text-2xl font-bold text-amber-600">{balance.points} pts</p>
          <p className="text-xs text-gray-600">
            Up to {balance.redeemableDiscount} off (100 pts = 1 currency)
          </p>
        </div>
        {onRedeem && balance.redeemableDiscount > 0 && (
          <button
            type="button"
            onClick={() => onRedeem(Math.min(balance.points, balance.redeemableDiscount * 100))}
            className="px-3 py-1.5 bg-amber-500 text-white rounded text-sm hover:bg-amber-600"
          >
            Use points
          </button>
        )}
      </div>
    </div>
  )
}
