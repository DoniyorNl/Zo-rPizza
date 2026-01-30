// =====================================
// 📁 FILE PATH: frontend/__tests__/components/ProductCard.test.tsx
// 🧪 PRODUCT CARD COMPONENT TESTS
// =====================================

import { ProductCard } from '@/components/products/ProductCard'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'

// Mock useRouter
jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
}))

// Mock next/image to avoid fill/non-boolean attribute warnings and test leakage
jest.mock('next/image', () => ({
	__esModule: true,
	default: (props: { src: string; alt: string; className?: string }) => (
		// eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
		<img src={props.src} alt={props.alt} className={props.className} />
	),
}))

describe('ProductCard Component', () => {
	const mockPush = jest.fn()

	afterEach(() => {
		jest.useRealTimers()
		cleanup()
	})

	const mockProduct = {
		id: 'prod-1',
		name: 'Test Pizza',
		description: 'Delicious cheese pizza',
		basePrice: 50000,
		imageUrl: '/pizza.jpg',
		prepTime: 20,
		calories: 500,
		difficulty: 'Easy',
		categoryName: 'Pizza',
        isActive: true
	}

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({
			push: mockPush,
		})
        jest.clearAllMocks()
	})

	it('should render product details correctly', () => {
		render(<ProductCard product={mockProduct} />)

		expect(screen.getByText('Test Pizza')).toBeInTheDocument()
		expect(screen.getByText('Delicious cheese pizza')).toBeInTheDocument()
		// Price is split across text nodes, so use regex
		expect(screen.getByText(/50,000/)).toBeInTheDocument()
		expect(screen.getByText(/so'm/)).toBeInTheDocument()
		expect(screen.getByText(/20/)).toBeInTheDocument()
		expect(screen.getByText(/daqiqa/)).toBeInTheDocument()
		expect(screen.getByText(/500/)).toBeInTheDocument()
		expect(screen.getByText(/kkal/)).toBeInTheDocument()
        expect(screen.getByText('Easy')).toBeInTheDocument()
        expect(screen.getByText('Pizza')).toBeInTheDocument()
	})

    it('should show "from" price if multiple variations exist', () => {
        const productWithVariations = {
            ...mockProduct,
            variations: [
                { id: 'v1', size: 'Small', price: 40000 },
                { id: 'v2', size: 'Medium', price: 60000 }
            ]
        }

        render(<ProductCard product={productWithVariations} />)

        expect(screen.getByText('40,000 so\'m')).toBeInTheDocument()
        expect(screen.getByText('dan boshlab')).toBeInTheDocument()
        expect(screen.getByText('2 ta o\'lcham')).toBeInTheDocument()
    })

    it('should navigate to product page on clicking the card', () => {
        render(<ProductCard product={mockProduct} />)
        
        // Find the card (it has handleClick on it)
        // Since we can't select by class easily on the Card component wrapper without a test-id, 
        // we can click strictly on the product name for now or check if the container is clickable.
        // But the onClick is on the root Card.
        
        const cardTitle = screen.getByText('Test Pizza')
        // Clicking title should trigger bubbling to card
        fireEvent.click(cardTitle)

        expect(mockPush).toHaveBeenCalledWith('/products/prod-1')
    })

    it('should call onAddToCart when "Tanlash" button is clicked', () => {
        const mockAddToCart = jest.fn()
        render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />)

        const button = screen.getByRole('button', { name: /tanlash/i })
        fireEvent.click(button)

        expect(mockAddToCart).toHaveBeenCalledWith('prod-1')
        // Should NOT navigate when button is clicked (stopPropagation)
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('should navigate on "Tanlash" click if onAddToCart is not provided', () => {
        render(<ProductCard product={mockProduct} />)

        const button = screen.getByRole('button', { name: /tanlash/i })
        fireEvent.click(button)

        expect(mockPush).toHaveBeenCalledWith('/products/prod-1')
    })
})
