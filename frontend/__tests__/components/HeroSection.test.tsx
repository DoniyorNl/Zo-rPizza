// frontend/__tests__/components/HeroSection.test.tsx
// 🎨 HERO SECTION TESTS - Welcome Component

import { HeroSection } from '@/components/home/HeroSection'
import { act, fireEvent, render, screen } from '@testing-library/react'

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

describe('HeroSection Component', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		jest.useFakeTimers()
	})

	afterEach(() => {
		jest.useRealTimers()
	})

	async function renderWithMount() {
		await act(async () => {
			render(<HeroSection />)
		})
		await act(async () => {
			jest.runOnlyPendingTimers()
		})
	}

	it('should render hero section after mount', async () => {
		const { container } = render(<HeroSection />)
		await act(async () => {
			jest.runOnlyPendingTimers()
		})
		expect(container.firstChild).not.toBeNull()
	})

	it('should display greeting message', async () => {
		await renderWithMount()
		expect(screen.getByText(/Xayrli/i)).toBeInTheDocument()
	})

	it('should display main heading', async () => {
		await renderWithMount()
		expect(screen.getByText(/Pitsa ishtahasi ochganmi/i)).toBeInTheDocument()
	})

	it('should display CTA buttons', async () => {
		await renderWithMount()
		expect(screen.getByText('Buyurtma berish')).toBeInTheDocument()
		expect(screen.getByText('Aksiyalar')).toBeInTheDocument()
	})

	it('should display quick stats', async () => {
		await renderWithMount()
		expect(screen.getByText('1000+')).toBeInTheDocument()
		expect(screen.getByText('30 daq')).toBeInTheDocument()
		expect(screen.getByText('50+')).toBeInTheDocument()
		expect(screen.getByText('4.9⭐')).toBeInTheDocument()
	})

	it('should scroll to products section on button click', async () => {
		const mockElement = document.createElement('div')
		mockElement.id = 'products-section'
		document.body.appendChild(mockElement)

		await renderWithMount()
		const button = screen.getByText('Buyurtma berish')
		fireEvent.click(button)
		expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
			behavior: 'smooth',
		})

		document.body.removeChild(mockElement)
	})

	it('should scroll to deals section on button click', async () => {
		const mockElement = document.createElement('div')
		mockElement.id = 'deals-section'
		document.body.appendChild(mockElement)

		await renderWithMount()
		const button = screen.getByText('Aksiyalar')
		fireEvent.click(button)
		expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
			behavior: 'smooth',
		})

		document.body.removeChild(mockElement)
	})
})
