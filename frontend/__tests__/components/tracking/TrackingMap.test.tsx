// frontend/__tests__/components/tracking/TrackingMap.test.tsx
import TrackingMap from '@/components/tracking/TrackingMap'
import '@testing-library/jest-dom'
import { act, render, screen, waitFor } from '@testing-library/react'

jest.mock('leaflet', () => ({
	map: jest.fn().mockReturnValue({
		setView: jest.fn().mockReturnThis(),
		remove: jest.fn(),
		removeLayer: jest.fn(),
		fitBounds: jest.fn(),
	}),
	tileLayer: jest.fn().mockReturnValue({
		addTo: jest.fn(),
	}),
	marker: jest.fn().mockReturnValue({
		addTo: jest.fn().mockReturnThis(),
		bindPopup: jest.fn().mockReturnThis(),
		setLatLng: jest.fn(),
	}),
	polyline: jest.fn().mockReturnValue({
		addTo: jest.fn(),
	}),
	divIcon: jest.fn(),
	latLngBounds: jest.fn().mockReturnValue({
		extend: jest.fn(),
	}),
	Icon: {
		Default: {
			prototype: {},
			mergeOptions: jest.fn(),
		},
	},
}))

jest.mock('leaflet/dist/leaflet.css', () => ({}))

describe('TrackingMap Component', () => {
	const deliveryLocation = { lat: 41.31, lng: 69.25 }
	const driverLocation = { lat: 41.3, lng: 69.24 }
	const restaurantLocation = { lat: 41.2995, lng: 69.2401 }

	async function renderMap(ui: React.ReactElement) {
		await act(async () => {
			render(ui)
			await Promise.resolve()
		})
	}

	it('should render map container', async () => {
		await renderMap(<TrackingMap deliveryLocation={deliveryLocation} />)

		const mapContainer = screen.getByText(/Loading map.../i)
		expect(mapContainer).toBeInTheDocument()
	})

	it('should show loading state initially', async () => {
		await renderMap(<TrackingMap deliveryLocation={deliveryLocation} />)

		expect(screen.getByText('Loading map...')).toBeInTheDocument()
	})

	it('should render legend when driver location is provided', async () => {
		await renderMap(
			<TrackingMap deliveryLocation={deliveryLocation} driverLocation={driverLocation} />,
		)

		await waitFor(() => {
			expect(screen.getByText('Restaurant')).toBeInTheDocument()
			expect(screen.getByText('Driver')).toBeInTheDocument()
			expect(screen.getByText('Delivery')).toBeInTheDocument()
		})
	})

	it('should render legend without driver when no driver location', async () => {
		await renderMap(<TrackingMap deliveryLocation={deliveryLocation} />)

		await waitFor(() => {
			expect(screen.getByText('Restaurant')).toBeInTheDocument()
			expect(screen.getByText('Delivery')).toBeInTheDocument()
			expect(screen.queryByText('Driver')).not.toBeInTheDocument()
		})
	})

	it('should apply custom height', async () => {
		const { container } = render(<TrackingMap deliveryLocation={deliveryLocation} height='600px' />)

		const mapDiv = container.querySelector('div[style*="height"]')
		expect(mapDiv).toHaveStyle({ height: '600px' })
	})

	it('should handle restaurant location prop', async () => {
		await renderMap(
			<TrackingMap deliveryLocation={deliveryLocation} restaurantLocation={restaurantLocation} />,
		)

		expect(screen.getByText(/Loading map.../i)).toBeInTheDocument()
	})

	it('should show route when showRoute is true and driver location exists', async () => {
		await renderMap(
			<TrackingMap
				deliveryLocation={deliveryLocation}
				driverLocation={driverLocation}
				showRoute={true}
			/>,
		)

		expect(screen.getByText(/Loading map.../i)).toBeInTheDocument()
	})

	it('should not show route when showRoute is false', async () => {
		await renderMap(
			<TrackingMap
				deliveryLocation={deliveryLocation}
				driverLocation={driverLocation}
				showRoute={false}
			/>,
		)

		expect(screen.getByText(/Loading map.../i)).toBeInTheDocument()
	})
})
