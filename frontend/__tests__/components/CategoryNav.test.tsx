// frontend/__tests__/components/CategoryNav.test.tsx
// 📂 CATEGORY NAV COMPONENT TESTS - Senior Level

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CategoryNav } from '@/components/home/CategoryNav'
import { useCategories } from '@/hooks/useCategories'

// Mock hooks
jest.mock('@/hooks/useCategories')
jest.mock('next/navigation', () => ({
	useRouter: () => ({
		push: jest.fn(),
	}),
}))

const mockUseCategories = useCategories as jest.MockedFunction<typeof useCategories>

// Mock data
const mockCategories = [
	{
		id: 'cat-1',
		name: 'Pizza',
		description: 'Delicious pizzas',
		imageUrl: 'https://example.com/pizza.jpg',
		icon: '🍕',
		isActive: true,
		displayOrder: 1,
		productCount: 12,
		createdAt: '2026-01-01',
		updatedAt: '2026-01-01',
	},
	{
		id: 'cat-2',
		name: 'Drinks',
		description: 'Refreshing drinks',
		imageUrl: 'https://example.com/drinks.jpg',
		icon: '🥤',
		isActive: true,
		displayOrder: 2,
		productCount: 5,
		createdAt: '2026-01-01',
		updatedAt: '2026-01-01',
	},
	{
		id: 'cat-3',
		name: 'Dessert',
		description: 'Sweet treats',
		imageUrl: 'https://example.com/dessert.jpg',
		icon: '🍰',
		isActive: true,
		displayOrder: 3,
		productCount: 8,
		createdAt: '2026-01-01',
		updatedAt: '2026-01-01',
	},
]

describe('CategoryNav Component', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		// Clear custom events
		window.removeEventListener('categoryFilter', () => {})
	})

	it('should render all categories with icons and counts', () => {
		mockUseCategories.mockReturnValue({
			categories: mockCategories,
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		render(<CategoryNav />)

		expect(screen.getByText('Pizza')).toBeInTheDocument()
		expect(screen.getByText('Drinks')).toBeInTheDocument()
		expect(screen.getByText('Dessert')).toBeInTheDocument()
		expect(screen.getByText('12')).toBeInTheDocument() // Product count
		expect(screen.getByText('5')).toBeInTheDocument()
		expect(screen.getByText('8')).toBeInTheDocument()
	})

	it('should show "Hammasi" (All) button', () => {
		mockUseCategories.mockReturnValue({
			categories: mockCategories,
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		render(<CategoryNav />)

		expect(screen.getByText('Hammasi')).toBeInTheDocument()
	})

	it('should show loading skeleton when loading', () => {
		mockUseCategories.mockReturnValue({
			categories: [],
			loading: true,
			error: null,
			refetch: jest.fn(),
		})

		const { container } = render(<CategoryNav />)

		const skeletons = container.querySelectorAll('.animate-pulse')
		expect(skeletons.length).toBeGreaterThan(0)
	})

	it('should return null when no categories', () => {
		mockUseCategories.mockReturnValue({
			categories: [],
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		const { container } = render(<CategoryNav />)

		expect(container.firstChild).toBeNull()
	})

	it('should highlight selected category on click', () => {
		mockUseCategories.mockReturnValue({
			categories: mockCategories,
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		render(<CategoryNav />)

		const pizzaButton = screen.getByText('Pizza').closest('button')
		fireEvent.click(pizzaButton!)

		expect(pizzaButton).toHaveClass('bg-orange-600', 'text-white')
	})

	it('should deselect category when clicked again', () => {
		mockUseCategories.mockReturnValue({
			categories: mockCategories,
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		render(<CategoryNav />)

		const pizzaButton = screen.getByText('Pizza').closest('button')
		
		// First click - select
		fireEvent.click(pizzaButton!)
		expect(pizzaButton).toHaveClass('bg-orange-600')

		// Second click - deselect
		fireEvent.click(pizzaButton!)
		expect(pizzaButton).not.toHaveClass('bg-orange-600')
	})

	it('should emit categoryFilter event on click', () => {
		mockUseCategories.mockReturnValue({
			categories: mockCategories,
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		const eventListener = jest.fn()
		window.addEventListener('categoryFilter', eventListener)

		render(<CategoryNav />)

		const pizzaButton = screen.getByText('Pizza').closest('button')
		fireEvent.click(pizzaButton!)

		expect(eventListener).toHaveBeenCalled()

		window.removeEventListener('categoryFilter', eventListener)
	})

	it('should render scroll buttons', () => {
		mockUseCategories.mockReturnValue({
			categories: mockCategories,
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		render(<CategoryNav />)

		const scrollButtons = screen.getAllByRole('button', { name: /scroll/i })
		expect(scrollButtons).toHaveLength(2) // Left and right
	})
})
