// frontend/components/tracking/TrackingMap.tsx
'use client'

import { getRestaurantLocation } from '@/lib/trackingConfig'
import { useEffect, useRef, useState } from 'react'

interface Location {
	lat: number
	lng: number
}

interface TrackingMapProps {
	deliveryLocation: Location
	driverLocation?: Location
	restaurantLocation?: Location
	/** Filial nomi (olib ketishda) – marker popup va legend uchun */
	restaurantName?: string
	/** Foydalanuvchining hozirgi joylashuvi (brauzer GPS) – xaritada "Sizning joyingiz" marker */
	userCurrentLocation?: Location
	zoom?: number
	height?: string
	showRoute?: boolean
}

export default function TrackingMap({
	deliveryLocation,
	driverLocation,
	restaurantLocation = getRestaurantLocation(),
	restaurantName,
	userCurrentLocation,
	zoom = 13,
	height = '400px',
	showRoute = true,
}: TrackingMapProps) {
	const mapRef = useRef<HTMLDivElement>(null)
	const mapInstanceRef = useRef<import('leaflet').Map | null>(null)
	const [isMapReady, setIsMapReady] = useState(false)

	useEffect(() => {
		if (process.env.NODE_ENV === 'test') return
		if (typeof window === 'undefined' || !mapRef.current) return

		const wrapper = mapRef.current
		const container = document.createElement('div')
		container.style.height = '100%'
		container.style.width = '100%'
		wrapper.innerHTML = ''
		wrapper.appendChild(container)

		let map: import('leaflet').Map
		let L: typeof import('leaflet')

		const initMap = async () => {
			L = (await import('leaflet')).default
			await import('leaflet/dist/leaflet.css')

			// Fix default marker icons
			delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
				iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
				shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
			})

			const centerLat = userCurrentLocation
				? (restaurantLocation.lat + userCurrentLocation.lat) / 2
				: restaurantLocation.lat
			const centerLng = userCurrentLocation
				? (restaurantLocation.lng + userCurrentLocation.lng) / 2
				: restaurantLocation.lng
			map = L.map(container).setView([centerLat, centerLng], zoom)
			mapInstanceRef.current = map

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
				maxZoom: 19,
			}).addTo(map)

			// Restaurant marker
			const restaurantIcon = L.divIcon({
				html: '<div style="background:#ef4444;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><span style="font-size:24px">🍕</span></div>',
				className: '',
				iconSize: [40, 40],
				iconAnchor: [20, 20],
			})
			const pizzeriaLabel = restaurantName ? `${restaurantName}` : "Zo'r Pizza"
			L.marker([restaurantLocation.lat, restaurantLocation.lng], { icon: restaurantIcon })
				.addTo(map)
				.bindPopup('<b>Pizzeria</b><br>' + pizzeriaLabel)

			// Faqat pizzeria + foydalanuvchi (va haydovchi bor bo‘lsa). Yetkazib berish manzili markeri yo‘q.
			const boundsPoints: [number, number][] = [
				[restaurantLocation.lat, restaurantLocation.lng],
			]

			// Foydalanuvchining hozirgi joyi (brauzer GPS) – "Sizning joylashuvingiz"
			if (userCurrentLocation) {
				const userIcon = L.divIcon({
					html: '<div style="background:#3b82f6;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><span style="font-size:22px">📍</span></div>',
					className: '',
					iconSize: [44, 44],
					iconAnchor: [22, 22],
				})
				L.marker([userCurrentLocation.lat, userCurrentLocation.lng], { icon: userIcon })
					.addTo(map)
					.bindPopup('<b>Sizning joylashuvingiz</b>')
				boundsPoints.push([userCurrentLocation.lat, userCurrentLocation.lng])
			}

			// Haydovchi marker (yo‘lda bo‘lsa)
			if (driverLocation) {
				const driverIcon = L.divIcon({
					html: '<div style="background:#f97316;border-radius:50%;width:50px;height:50px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);animation:pulse 2s infinite"><span style="font-size:28px">🏍️</span></div>',
					className: '',
					iconSize: [50, 50],
					iconAnchor: [25, 25],
				})
				L.marker([driverLocation.lat, driverLocation.lng], { icon: driverIcon })
					.addTo(map)
					.bindPopup('<b>Haydovchi</b><br>Yo‘lda!')

				if (showRoute && deliveryLocation) {
					L.polyline(
						[
							[driverLocation.lat, driverLocation.lng],
							[deliveryLocation.lat, deliveryLocation.lng],
						],
						{
							color: '#f97316',
							weight: 4,
							opacity: 0.7,
							dashArray: '10, 10',
						},
					).addTo(map)
				}

				boundsPoints.push([driverLocation.lat, driverLocation.lng])
			}
			const bounds = L.latLngBounds(boundsPoints)
			map.fitBounds(bounds, { padding: [50, 50], animate: false })

			setIsMapReady(true)
		}

		initMap()

		return () => {
			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove()
				mapInstanceRef.current = null
			}
			if (container.parentNode) container.remove()
			setIsMapReady(false)
		}
	}, [deliveryLocation, driverLocation, restaurantLocation, restaurantName, userCurrentLocation, zoom, showRoute])

	return (
		<div className='relative rounded-lg overflow-hidden shadow-lg' style={{ height }}>
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
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4'></div>
						<p className='text-gray-600'>Loading map...</p>
					</div>
				</div>
			)}

			<div
				className='absolute top-4 right-4 z-[500] bg-white rounded-lg shadow-lg p-3 space-y-2 text-sm pointer-events-auto'
				style={{ transform: 'translateZ(0)' }}
			>
				<div className='flex items-center gap-2'>
					<span className='text-2xl'>🍕</span>
					<span>{restaurantName ? `Pizzeria – ${restaurantName}` : 'Pizzeria'}</span>
				</div>
				{userCurrentLocation && (
					<div className='flex items-center gap-2'>
						<span className='text-2xl'>📍</span>
						<span>Sizning joylashuvingiz</span>
					</div>
				)}
				{driverLocation && (
					<div className='flex items-center gap-2'>
						<span className='text-2xl'>🏍️</span>
						<span>Haydovchi</span>
					</div>
				)}
			</div>

			<style>{`
				@keyframes pulse {
					0%,
					100% {
						opacity: 1;
					}
					50% {
						opacity: 0.7;
						transform: scale(1.1);
					}
				}
			`}</style>
		</div>
	)
}
