'use client'

import { Header } from '@/components/layout/Header'
import { buildApiUrl } from '@/lib/apiBaseUrl'
import { MapPin, Phone } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface Branch {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  phone: string | null
  isActive: boolean
}

interface NearestBranch extends Branch {
  distanceKm: number
}

export default function BranchFinderPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [nearest, setNearest] = useState<NearestBranch | null>(null)
  const [alternatives, setAlternatives] = useState<NearestBranch[]>([])
  const [loading, setLoading] = useState(true)
  const [useLocation, setUseLocation] = useState(false)

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch(buildApiUrl('/api/branches'))
      const data = await res.json()
      if (data.success && data.data) setBranches(data.data)
    } catch {
      setBranches([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  const fetchNearest = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported')
      return
    }
    setUseLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        fetch(
          buildApiUrl(`/api/branches/nearest?lat=${latitude}&lng=${longitude}`),
        )
          .then((r) => r.json())
          .then((data) => {
            if (data.success && data.data) {
              setNearest(data.data)
              setAlternatives(data.alternatives || [])
            }
          })
          .catch(() => setNearest(null))
      },
      () => alert('Could not get your location'),
    )
  }, [])

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Filiallar</h1>
        <p className="text-gray-600 mb-6">
          Yaqin filialni topish yoki barcha filiallar ro&apos;yxati
        </p>

        <button
          type="button"
          onClick={fetchNearest}
          className="mb-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          {useLocation ? 'Mening joylashuvim bo\'yicha yaqin filial' : 'Yaqin filialni topish'}
        </button>

        {nearest && (
          <div className="mb-8 p-6 bg-white rounded-xl shadow border-l-4 border-orange-500">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Eng yaqin filial</h2>
            <p className="font-semibold text-gray-800">{nearest.name}</p>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {nearest.address}
            </p>
            {nearest.phone && (
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 flex-shrink-0" />
                {nearest.phone}
              </p>
            )}
            <p className="text-orange-600 font-semibold mt-2">{nearest.distanceKm.toFixed(1)} km</p>
            {alternatives.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">Boshqa yaqin filiallar: {alternatives.map((a) => a.name).join(', ')}</p>
            )}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Yuklanmoqda...</p>
        ) : branches.length === 0 ? (
          <p className="text-gray-500">Filiallar ro&apos;yxati bo&apos;sh</p>
        ) : (
          <div className="space-y-4">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="p-6 bg-white rounded-xl shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-bold text-gray-800">{branch.name}</h3>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {branch.address}
                </p>
                {branch.phone && (
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    {branch.phone}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
