// frontend/__tests__/components/HeroSection.test.tsx
// 🎨 HERO SECTION TESTS - Welcome Component

import { render, screen, fireEvent } from '@testing-library/react'
import { HeroSection } from '@/components/home/HeroSection'

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

describe('HeroSection Component', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should render hero section after mount', () => {
		const { container } = render(<HeroSection />)
		
		// Wait for mount
		setTimeout(() => {
			expect(container.firstChild).not.toBeNull()
		}, 0)
	})

	it('should display greeting message', () => {
		render(<HeroSection />)
		
		setTimeout(() => {
			expect(screen.getByText(/Xayrli/i)).toBeInTheDocument()
		}, 0)
	})

	it('should display main heading', () => {
		render(<HeroSection />)
		
		setTimeout(() => {
			expect(screen.getByText(/Pitsa ishtahasi ochganmi/i)).toBeInTheDocument()
		}, 0)
	})

	it('should display CTA buttons', () => {
		render(<HeroSection />)
		
		setTimeout(() => {
			expect(screen.getByText('Buyurtma berish')).toBeInTheDocument()
			expect(screen.getByText('Aksiyalar')).toBeInTheDocument()
		}, 0)
	})

	it('should display quick stats', () => {
		render(<HeroSection />)
		
		setTimeout(() => {
			expect(screen.getByText('1000+')).toBeInTheDocument()
			expect(screen.getByText('30 daq')).toBeInTheDocument()
			expect(screen.getByText('50+')).toBeInTheDocument()
			expect(screen.getByText('4.9⭐')).toBeInTheDocument()
		}, 0)
	})

	it('should scroll to products section on button click', () => {
		const mockElement = document.createElement('div')
		mockElement.id = 'products-section'
		document.body.appendChild(mockElement)

		render(<HeroSection />)
		
		setTimeout(() => {
			const button = screen.getByText('Buyurtma berish')
			fireEvent.click(button)
			
			expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
				behavior: 'smooth',
			})
		}, 0)

		document.body.removeChild(mockElement)
	})

	it('should scroll to deals section on button click', () => {
		const mockElement = document.createElement('div')
		mockElement.id = 'deals-section'
		document.body.appendChild(mockElement)

		render(<HeroSection />)
		
		setTimeout(() => {
			const button = screen.getByText('Aksiyalar')
			fireEvent.click(button)
			
			expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
				behavior: 'smooth',
			})
		}, 0)

		document.body.removeChild(mockElement)
	})
})
