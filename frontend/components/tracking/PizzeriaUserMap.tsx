// Pizzeria + foydalanuvchi joylashuvi. Yo'l masofasi va vaqt (OSRM yoki fallback).
'use client'

import { getRestaurantLocation } from '@/lib/trackingConfig'
import { distanceKm } from '@/lib/geoUtils'
import { getRoute } from '@/lib/osrm'
import { useEffect, useRef, useState } from 'react'

interface Location {
	lat: number
	lng: number
}

interface PizzeriaUserMapProps {
	userLocation: Location
	restaurantLocation?: Location
	height?: string
	showDistance?: boolean
}

export default function PizzeriaUserMap({
	userLocation,
	restaurantLocation = getRestaurantLocation(),
	height = '500px',
	showDistance = true,
}: PizzeriaUserMapProps) {
	const mapRef = useRef<HTMLDivElement>(null)
	const mapInstanceRef = useRef<any>(null)
	const [isMapReady, setIsMapReady] = useState(false)
	const straightKm = distanceKm(restaurantLocation, userLocation)
	const [routeInfo, setRouteInfo] = useState<{
		roadKm: number
		durationMin: number
		isFallback: boolean
	} | null>(null)

	useEffect(() => {
		if (process.env.NODE_ENV === 'test') return
		if (typeof window === 'undefined' || !mapRef.current) return

		const wrapper = mapRef.current
		const container = document.createElement('div')
		container.style.height = '100%'
		container.style.width = '100%'
		wrapper.innerHTML = ''
		wrapper.appendChild(container)

		let map: any
		let L: any

		const initMap = async () => {
			L = (await import('leaflet')).default
			await import('leaflet/dist/leaflet.css')

			delete (L.Icon.Default.prototype as any)._getIconUrl
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
				iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
				shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
			})

			const centerLat = (restaurantLocation.lat + userLocation.lat) / 2
			const centerLng = (restaurantLocation.lng + userLocation.lng) / 2
			map = L.map(container).setView([centerLat, centerLng], 12)
			mapInstanceRef.current = map

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
				maxZoom: 19,
			}).addTo(map)

			const restaurantIcon = L.divIcon({
				html: '<div style="background:#ef4444;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><span style="font-size:24px">🍕</span></div>',
				className: '',
				iconSize: [40, 40],
				iconAnchor: [20, 20],
			})
			L.marker([restaurantLocation.lat, restaurantLocation.lng], { icon: restaurantIcon })
				.addTo(map)
				.bindPopup('<b>Pizzeria</b><br>Zo\'r Pizza')

			const userIcon = L.divIcon({
				html: '<div style="background:#3b82f6;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><span style="font-size:22px">📍</span></div>',
				className: '',
				iconSize: [44, 44],
				iconAnchor: [22, 22],
			})
			L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
				.addTo(map)
				.bindPopup('<b>Sizning joylashuvingiz</b>')

			// Vaqtincha to'g'ri chiziq; OSRM kelgach yo'l chizamiz
			let straightLine = L.polyline(
				[
					[restaurantLocation.lat, restaurantLocation.lng],
					[userLocation.lat, userLocation.lng],
				],
				{ color: '#f97316', weight: 4, opacity: 0.6, dashArray: '8, 8' }
			).addTo(map)

			const bounds = L.latLngBounds(
				[
					[restaurantLocation.lat, restaurantLocation.lng],
					[userLocation.lat, userLocation.lng],
				]
			)
			map.fitBounds(bounds, { padding: [50, 50], animate: false })
			setIsMapReady(true)

			// OSRM yo'l masofasi va vaqt
			const osrm = await getRoute(restaurantLocation, userLocation)
			if (!mapInstanceRef.current) return
			if (osrm && osrm.coordinates.length >= 2) {
				map.removeLayer(straightLine)
				const latLngs = osrm.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])
				const routeLine = L.polyline(latLngs, {
					color: '#ea580c',
					weight: 5,
					opacity: 0.9,
				}).addTo(map)
				map.fitBounds(routeLine.getBounds(), { padding: [50, 50], animate: false })
				setRouteInfo({
					roadKm: osrm.roadDistanceKm,
					durationMin: osrm.durationMinutes,
					isFallback: false,
				})
			} else {
				const estMin = Math.max(1, Math.round((straightKm / 30) * 60))
				setRouteInfo({
					roadKm: straightKm,
					durationMin: estMin,
					isFallback: true,
				})
			}
		}

		initMap()
		return () => {
			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove()
				mapInstanceRef.current = null
			}
			if (container.parentNode) container.remove()
			setIsMapReady(false)
			setRouteInfo(null)
		}
	}, [userLocation.lat, userLocation.lng, restaurantLocation.lat, restaurantLocation.lng])

	const displayKm = routeInfo?.roadKm ?? straightKm
	const displayMin = routeInfo?.durationMin ?? Math.max(1, Math.round((straightKm / 30) * 60))

	return (
		<div className='relative rounded-lg overflow-hidden shadow-lg' style={{ height }}>
			{/* Xarita – GPU qatlamida, scroll/paint da markerlar pirpiramasin */}
			<div
				ref={mapRef}
				className='absolute inset-0'
				style={{
					height,
					width: '100%',
					transform: 'translateZ(0)',
					backfaceVisibility: 'hidden' as const,
					contain: 'layout style paint',
				}}
			/>
			{!isMapReady && (
				<div className='absolute inset-0 z-[1000] flex items-center justify-center bg-gray-100 rounded-lg'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4' />
						<p className='text-gray-600'>Xarita yuklanmoqda...</p>
					</div>
				</div>
			)}
			{/* Overlay: legend va masofa – pointer-events faqat kartochkalarda */}
			<div className='absolute inset-0 z-[500] pointer-events-none' aria-hidden>
				{showDistance && isMapReady && (
					<div className='absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-56 bg-white rounded-xl shadow-lg p-4 border-2 border-orange-200 space-y-2 pointer-events-auto'>
						<div className='flex justify-between items-baseline'>
							<span className='text-sm text-gray-600'>Yo&apos;l masofasi</span>
							<span className='text-xl font-bold text-orange-600'>{displayKm.toFixed(1)} km</span>
						</div>
						<div className='flex justify-between items-baseline'>
							<span className='text-sm text-gray-600'>Taxminiy vaqt</span>
							<span className='text-xl font-bold text-blue-600'>
								{displayMin < 60 ? `${displayMin} min` : `${Math.floor(displayMin / 60)} soat ${displayMin % 60} min`}
							</span>
						</div>
						{routeInfo?.isFallback && (
							<p className='text-xs text-gray-500'>To&apos;g&apos;ri chiziq masofa, ~30 km/h</p>
						)}
					</div>
				)}
				<div className='absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 space-y-2 text-sm pointer-events-auto' style={{ transform: 'translateZ(0)' }}>
					<div className='flex items-center gap-2'>
						<span className='text-2xl'>🍕</span>
						<span>Pizzeria</span>
					</div>
					<div className='flex items-center gap-2'>
						<span className='text-2xl'>📍</span>
						<span>Sizning joylashuvingiz</span>
					</div>
				</div>
			</div>
		</div>
	)
}
