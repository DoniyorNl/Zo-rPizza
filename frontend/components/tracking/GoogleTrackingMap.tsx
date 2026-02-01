'use client'

/**
 * Google Maps based tracking map (optional).
 * Hozir Leaflet ishlatiladi. Google uchun NEXT_PUBLIC_GOOGLE_MAPS_API_KEY kerak.
 * @see docs/TRACKING_GOOGLE_MAPS.md
 */
import { getRestaurantLocation } from '@/lib/trackingConfig'
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api'
import { useMemo, useState } from 'react'

interface Location {
	lat: number
	lng: number
}

interface GoogleTrackingMapProps {
	deliveryLocation: Location
	driverLocation?: Location
	restaurantLocation?: Location
	height?: string
	showRoute?: boolean
}


export default function GoogleTrackingMap({
	deliveryLocation,
	driverLocation,
	restaurantLocation = getRestaurantLocation(),
	height = '500px',
	showRoute = true,
}: GoogleTrackingMapProps) {
	const [mapReady, setMapReady] = useState(false)

	const mapContainerStyle = useMemo(
		() => ({
			width: '100%',
			height,
			borderRadius: '0.5rem',
			overflow: 'hidden' as const,
		}),
		[height],
	)

	const bounds = useMemo(() => {
		const points = [
			{ lat: deliveryLocation.lat, lng: deliveryLocation.lng },
			{ lat: restaurantLocation.lat, lng: restaurantLocation.lng },
		]
		if (driverLocation) {
			points.push({ lat: driverLocation.lat, lng: driverLocation.lng })
		}
		const lats = points.map(p => p.lat)
		const lngs = points.map(p => p.lng)
		return {
			ne: { lat: Math.max(...lats), lng: Math.max(...lngs) },
			sw: { lat: Math.min(...lats), lng: Math.min(...lngs) },
		}
	}, [deliveryLocation, restaurantLocation, driverLocation])

	const routePath = useMemo(() => {
		if (!driverLocation || !showRoute) return []
		return [
			{ lat: driverLocation.lat, lng: driverLocation.lng },
			{ lat: deliveryLocation.lat, lng: deliveryLocation.lng },
		]
	}, [driverLocation, deliveryLocation, showRoute])

	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
	if (!apiKey) return null

	return (
		<div className="relative rounded-lg overflow-hidden shadow-lg">
			<LoadScript
				googleMapsApiKey={apiKey}
				loadingElement={
					<div
						className="flex items-center justify-center bg-gray-100"
						style={{ height }}
					>
						<div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent" />
					</div>
				}
				onLoad={() => setMapReady(true)}
			>
				<GoogleMap
					mapContainerStyle={mapContainerStyle}
					center={{
						lat: (bounds.sw.lat + bounds.ne.lat) / 2,
						lng: (bounds.sw.lng + bounds.ne.lng) / 2,
					}}
					zoom={13}
					onLoad={map => {
						const b = new google.maps.LatLngBounds(bounds.sw, bounds.ne)
						map.fitBounds(b, 60)
					}}
					options={{
						zoomControl: true,
						mapTypeControl: true,
						streetViewControl: false,
						fullscreenControl: true,
					}}
				>
					{/* Restaurant */}
					<Marker
						position={restaurantLocation}
						title="Restoran"
						label={{ text: '🍕', fontSize: '20px' }}
					/>
					{/* Delivery address */}
					<Marker
						position={deliveryLocation}
						title="Yetkazish manzili"
						label={{ text: '🏠', fontSize: '20px' }}
					/>
					{/* Driver */}
					{driverLocation && (
						<Marker
							position={driverLocation}
							title="Haydovchi"
							label={{ text: '🏍️', fontSize: '24px' }}
						/>
					)}
					{routePath.length === 2 && (
						<Polyline
							path={routePath}
							options={{
								strokeColor: '#3b82f6',
								strokeOpacity: 0.8,
								strokeWeight: 4,
							}}
						/>
					)}
				</GoogleMap>
			</LoadScript>
			{!mapReady && (
				<div
					className="absolute inset-0 flex items-center justify-center bg-gray-100"
					style={{ height }}
				>
					<p className="text-gray-600">Xarita yuklanmoqda...</p>
				</div>
			)}
			<div className="absolute top-4 right-4 bg-white rounded-lg shadow p-3 space-y-2 text-sm">
				<div className="flex items-center gap-2">
					<span className="text-xl">🍕</span>
					<span>Restoran</span>
				</div>
				{driverLocation && (
					<div className="flex items-center gap-2">
						<span className="text-xl">🏍️</span>
						<span>Haydovchi</span>
					</div>
				)}
				<div className="flex items-center gap-2">
					<span className="text-xl">🏠</span>
					<span>Manzil</span>
				</div>
			</div>
		</div>
	)
}
