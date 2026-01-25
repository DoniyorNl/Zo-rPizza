// frontend/__tests__/components/DeliveryToggle.test.tsx
// 🚚 DELIVERY TOGGLE TESTS

import { render, screen, fireEvent } from '@testing-library/react'
import { DeliveryToggle } from '@/components/home/DeliveryToggle'

describe('DeliveryToggle Component', () => {
	it('should render delivery toggle', () => {
		render(<DeliveryToggle />)
		
		expect(screen.getByText(/Yetkazib berish/i) || screen.getByText(/Yetkazish/i)).toBeInTheDocument()
		expect(screen.getByText(/Olib ketish/i) || screen.getByText(/Olib ket/i)).toBeInTheDocument()
	})

	it('should toggle between delivery and pickup', () => {
		render(<DeliveryToggle />)
		
		const deliveryButton = screen.getByText(/Yetkazib berish/i) || screen.getByText(/Yetkazish/i)
		const pickupButton = screen.getByText(/Olib ketish/i) || screen.getByText(/Olib ket/i)
		
		fireEvent.click(pickupButton)
		expect(pickupButton).toBeInTheDocument()
		
		fireEvent.click(deliveryButton)
		expect(deliveryButton).toBeInTheDocument()
	})

	it('should display estimated time', () => {
		render(<DeliveryToggle />)
		
		expect(screen.getByText(/daqiqa/i)).toBeInTheDocument()
	})

	it('should display location/store selector', () => {
		render(<DeliveryToggle />)
		
		expect(screen.getByText(/Manzilni tanlang/i) || screen.getByText(/Do'konni tanlang/i)).toBeInTheDocument()
	})
})
