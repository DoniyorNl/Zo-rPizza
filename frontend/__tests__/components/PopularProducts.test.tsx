// frontend/__tests__/components/PopularProducts.test.tsx
// ⭐ POPULAR PRODUCTS COMPONENT TESTS - Senior Level

import { render, screen } from '@testing-library/react'
import { PopularProducts } from '@/components/home/PopularProducts'
import { usePopularProducts } from '@/hooks/usePopularProducts'

// Mock hooks
jest.mock('@/hooks/usePopularProducts')
jest.mock('next/navigation', () => ({
	useRouter: () => ({
		push: jest.fn(),
	}),
}))
jest.mock('@/components/products/ProductCard', () => ({
	ProductCard: ({ product }: { product: { id: string; name: string } }) => (
		<div data-testid={`product-${product.id}`}>{product.name}</div>
	),
}))
jest.mock('@/components/skeletons', () => ({
	ProductCardSkeletonGrid: ({ count }: { count?: number }) => (
		<div data-testid="skeleton-grid" className="animate-pulse">
			{Array.from({ length: count || 4 }).map((_, i) => (
				<div key={i} className="animate-pulse">Skeleton {i + 1}</div>
			))}
		</div>
	),
}))

const mockUsePopularProducts = usePopularProducts as jest.MockedFunction<typeof usePopularProducts>

// Mock data
const mockProducts = [
	{
		id: 'product-1',
		name: 'Pepperoni Pizza',
		description: 'Classic pepperoni',
		basePrice: 50000,
		imageUrl: 'https://example.com/pepperoni.jpg',
		images: ['https://example.com/pepperoni.jpg'],
		categoryId: 'cat-1',
		isActive: true,
		prepTime: 20,
		allergens: [],
		createdAt: '2026-01-01',
		updatedAt: '2026-01-01',
		orderCount: 150,
	},
	{
		id: 'product-2',
		name: 'Margherita Pizza',
		description: 'Fresh mozzarella',
		basePrice: 45000,
		imageUrl: 'https://example.com/margherita.jpg',
		images: ['https://example.com/margherita.jpg'],
		categoryId: 'cat-1',
		isActive: true,
		prepTime: 20,
		allergens: [],
		createdAt: '2026-01-01',
		updatedAt: '2026-01-01',
		orderCount: 120,
	},
]

describe('PopularProducts Component', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should render all popular products', () => {
		mockUsePopularProducts.mockReturnValue({
			popularProducts: mockProducts,
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		render(<PopularProducts />)

		expect(screen.getByText('Pepperoni Pizza')).toBeInTheDocument()
		expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
	})

	it('should show loading skeleton', () => {
		mockUsePopularProducts.mockReturnValue({
			popularProducts: [],
			loading: true,
			error: null,
			refetch: jest.fn(),
		})

		const { container } = render(<PopularProducts />)

		// Check for section title (without emoji in test)
		expect(screen.getByText('Mashhur Mahsulotlar')).toBeInTheDocument()
		
		// Check for skeleton component
		expect(screen.getByTestId('skeleton-grid')).toBeInTheDocument()
		
		// Check for animate-pulse class
		const skeletons = container.querySelectorAll('.animate-pulse')
		expect(skeletons.length).toBeGreaterThan(0)
	})

	it('should return null on error', () => {
		mockUsePopularProducts.mockReturnValue({
			popularProducts: [],
			loading: false,
			error: 'Failed to load',
			refetch: jest.fn(),
		})

		const { container } = render(<PopularProducts />)

		expect(container.firstChild).toBeNull()
	})

	it('should return null when no products', () => {
		mockUsePopularProducts.mockReturnValue({
			popularProducts: [],
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		const { container } = render(<PopularProducts />)

		expect(container.firstChild).toBeNull()
	})

	it('should render section header with badge', () => {
		mockUsePopularProducts.mockReturnValue({
			popularProducts: mockProducts,
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		render(<PopularProducts />)

		expect(screen.getByText('Mashhur Mahsulotlar')).toBeInTheDocument()
		expect(screen.getByText('Eng Ko\'p Sotilgan')).toBeInTheDocument()
	})

	it('should render "See All" buttons (desktop and mobile)', () => {
		mockUsePopularProducts.mockReturnValue({
			popularProducts: mockProducts,
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		render(<PopularProducts />)

		const seeAllButtons = screen.getAllByText('Barchasini ko\'rish')
		expect(seeAllButtons).toHaveLength(2) // Desktop and mobile
	})

	it('should render products in grid layout', () => {
		mockUsePopularProducts.mockReturnValue({
			popularProducts: mockProducts,
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		render(<PopularProducts />)

		expect(screen.getByTestId('product-product-1')).toBeInTheDocument()
		expect(screen.getByTestId('product-product-2')).toBeInTheDocument()
	})
})
