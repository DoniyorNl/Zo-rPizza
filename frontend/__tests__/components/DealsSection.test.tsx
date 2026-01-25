// frontend/__tests__/components/DealsSection.test.tsx
// 🎁 DEALS SECTION COMPONENT TESTS - Senior Level

import { render, screen, fireEvent } from '@testing-library/react'
import { DealsSection } from '@/components/home/DealsSection'
import { useDeals } from '@/hooks/useDeals'

// Mock hooks
jest.mock('@/hooks/useDeals')
jest.mock('next/navigation', () => ({
	useRouter: () => ({
		push: jest.fn(),
	}),
}))
jest.mock('next/image', () => ({
	__esModule: true,
	default: (props: any) => {
		// eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
		return <img {...props} />
	},
}))

const mockUseDeals = useDeals as jest.MockedFunction<typeof useDeals>

// Mock data
const mockDeals = [
	{
		id: 'deal-1',
		name: 'Family Deal',
		description: '2 Large pizzas + 2 drinks',
		imageUrl: 'https://example.com/deal1.jpg',
		discountType: 'PERCENTAGE' as const,
		discountValue: 30,
		startDate: '2026-01-01',
		endDate: '2026-12-31',
		isActive: true,
		minOrderAmount: 100000,
		maxUsageCount: null,
		currentUsageCount: 0,
		priority: 1,
		terms: 'Valid on all pizzas',
		createdAt: '2026-01-01',
		updatedAt: '2026-01-01',
	},
	{
		id: 'deal-2',
		name: 'Weekend Special',
		description: 'Buy 1 Get 1 Free',
		imageUrl: 'https://example.com/deal2.jpg',
		discountType: 'BUY_X_GET_Y' as const,
		discountValue: 0,
		startDate: '2026-01-20',
		endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
		isActive: true,
		minOrderAmount: null,
		maxUsageCount: 100,
		currentUsageCount: 50,
		priority: 2,
		terms: null,
		createdAt: '2026-01-01',
		updatedAt: '2026-01-01',
	},
]

describe('DealsSection Component', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should render all deals', () => {
		mockUseDeals.mockReturnValue({
			deals: mockDeals,
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		render(<DealsSection />)

		expect(screen.getByText('Family Deal')).toBeInTheDocument()
		expect(screen.getByText('Weekend Special')).toBeInTheDocument()
	})

	it('should show loading skeleton', () => {
		mockUseDeals.mockReturnValue({
			deals: [],
			loading: true,
			error: null,
			refetch: jest.fn(),
		})

		const { container } = render(<DealsSection />)

		expect(screen.getByText('🎁 Aksiyalar')).toBeInTheDocument()
		const skeletons = container.querySelectorAll('.animate-pulse')
		expect(skeletons.length).toBeGreaterThan(0)
	})

	it('should show error message', () => {
		mockUseDeals.mockReturnValue({
			deals: [],
			loading: false,
			error: 'Failed to load deals',
			refetch: jest.fn(),
		})

		render(<DealsSection />)

		expect(screen.getByText('Failed to load deals')).toBeInTheDocument()
	})

	it('should return null when no deals available', () => {
		mockUseDeals.mockReturnValue({
			deals: [],
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		const { container } = render(<DealsSection />)

		expect(container.firstChild).toBeNull()
	})

	it('should display discount badges correctly', () => {
		mockUseDeals.mockReturnValue({
			deals: mockDeals,
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		render(<DealsSection />)

		expect(screen.getByText('30%')).toBeInTheDocument()
		expect(screen.getByText('1+1')).toBeInTheDocument()
	})

	it('should show expiring soon badge for deals ending in <= 3 days', () => {
		mockUseDeals.mockReturnValue({
			deals: mockDeals,
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		render(<DealsSection />)

		expect(screen.getByText(/kun qoldi!/)).toBeInTheDocument()
	})

	it('should limit display to 6 deals and show "View All" button', () => {
		const manyDeals = Array(10)
			.fill(null)
			.map((_, i) => ({
				...mockDeals[0],
				id: `deal-${i}`,
				name: `Deal ${i}`,
			}))

		mockUseDeals.mockReturnValue({
			deals: manyDeals,
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		render(<DealsSection />)

		expect(screen.getByText(/Barcha aksiyalarni ko'rish \(10\)/)).toBeInTheDocument()
	})

	it('should not show "View All" button when deals <= 6', () => {
		mockUseDeals.mockReturnValue({
			deals: mockDeals.slice(0, 3),
			loading: false,
			error: null,
			refetch: jest.fn(),
		})

		render(<DealsSection />)

		expect(screen.queryByText(/Barcha aksiyalarni ko'rish/)).not.toBeInTheDocument()
	})
})
