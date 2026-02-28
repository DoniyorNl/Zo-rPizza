'use client'

import { buildApiUrl } from '@/lib/apiBaseUrl'
import { useEffect, useState } from 'react'

interface EstimateResult {
  estimatedMinutes: number
  branchId?: string
  branchName?: string
  distanceKm?: number
}

interface DeliveryTimeEstimateProps {
  lat?: number | null
  lng?: number | null
  className?: string
}

export default function DeliveryTimeEstimate({ lat, lng, className = '' }: DeliveryTimeEstimateProps) {
  const [data, setData] = useState<EstimateResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (lat == null || lng == null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(
      buildApiUrl(`/api/delivery/estimate?lat=${lat}&lng=${lng}`),
    )
      .then((res) => res.json())
      .then((res) => {
        if (cancelled) return
        if (res.success && res.data) setData(res.data)
        else setData(null)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load estimate')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [lat, lng])

  if (loading) {
    return <span className={className}>Estimating...</span>
  }
  if (error || !data) {
    return null
  }
  return (
    <span className={className}>
      ~{data.estimatedMinutes} min
      {data.branchName && (
        <span className="text-gray-500 text-sm ml-1">from {data.branchName}</span>
      )}
    </span>
  )
}
