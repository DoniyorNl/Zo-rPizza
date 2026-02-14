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
	zoom?: number
	height?: string
	showRoute?: boolean
}

export default function TrackingMap({
	deliveryLocation,
	driverLocation,
	restaurantLocation = getRestaurantLocation(),
	zoom = 13,
	height = '400px',
	showRoute = true,
}: TrackingMapProps) {
	const mapRef = useRef<HTMLDivElement>(null)
	const [isMapReady, setIsMapReady] = useState(false)

	useEffect(() => {
		if (process.env.NODE_ENV === 'test') return
		if (typeof window === 'undefined' || !mapRef.current) return

		let map: any
		let L: any

		const initMap = async () => {
			L = (await import('leaflet')).default
			// @ts-ignore - CSS import for leaflet
			await import('leaflet/dist/leaflet.css')

			// Fix default marker icons
			delete (L.Icon.Default.prototype as any)._getIconUrl
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
				iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
				shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
			})

			map = L.map(mapRef.current!).setView([deliveryLocation.lat, deliveryLocation.lng], zoom)

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
			L.marker([restaurantLocation.lat, restaurantLocation.lng], { icon: restaurantIcon })
				.addTo(map)
				.bindPopup('<b>Restaurant</b><br>Zor Pizza')

			// Delivery marker
			const deliveryIcon = L.divIcon({
				html: '<div style="background:#10b981;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><span style="font-size:24px">🏠</span></div>',
				className: '',
				iconSize: [40, 40],
				iconAnchor: [20, 20],
			})
			L.marker([deliveryLocation.lat, deliveryLocation.lng], { icon: deliveryIcon })
				.addTo(map)
				.bindPopup('<b>Delivery Location</b>')

			// Driver marker
			if (driverLocation) {
				const driverIcon = L.divIcon({
					html: '<div style="background:#3b82f6;border-radius:50%;width:50px;height:50px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);animation:pulse 2s infinite"><span style="font-size:28px">🏍️</span></div>',
					className: '',
					iconSize: [50, 50],
					iconAnchor: [25, 25],
				})
				L.marker([driverLocation.lat, driverLocation.lng], { icon: driverIcon })
					.addTo(map)
					.bindPopup('<b>Driver</b><br>On the way!')

				if (showRoute) {
					L.polyline(
						[
							[driverLocation.lat, driverLocation.lng],
							[deliveryLocation.lat, deliveryLocation.lng],
						],
						{
							color: '#3b82f6',
							weight: 4,
							opacity: 0.7,
							dashArray: '10, 10',
						},
					).addTo(map)
				}

				const bounds = L.latLngBounds([
					[deliveryLocation.lat, deliveryLocation.lng],
					[driverLocation.lat, driverLocation.lng],
					[restaurantLocation.lat, restaurantLocation.lng],
				])
				map.fitBounds(bounds, { padding: [50, 50] })
			}

			setIsMapReady(true)
		}

		initMap()

		return () => {
			if (map) map.remove()
		}
	}, [deliveryLocation, driverLocation, restaurantLocation, zoom, showRoute])

	return (
		<div className='relative'>
			<div
				ref={mapRef}
				style={{ height, width: '100%' }}
				className='rounded-lg overflow-hidden shadow-lg'
			/>

			{!isMapReady && (
				<div className='absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4'></div>
						<p className='text-gray-600'>Loading map...</p>
					</div>
				</div>
			)}

			<div className='absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 space-y-2 text-sm'>
				<div className='flex items-center gap-2'>
					<span className='text-2xl'>🍕</span>
					<span>Restaurant</span>
				</div>
				{driverLocation && (
					<div className='flex items-center gap-2'>
						<span className='text-2xl'>🏍️</span>
						<span>Driver</span>
					</div>
				)}
				<div className='flex items-center gap-2'>
					<span className='text-2xl'>🏠</span>
					<span>Delivery</span>
				</div>
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
