// frontend/__tests__/pages/ProfilePage.test.tsx
// 👤 PROFILE PAGE TESTS (Settings tab, notification toggle)

import ProfilePage from '@/app/(shop)/profile/page'
import api from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
	usePathname: () => '/',
	useSearchParams: () => new URLSearchParams(),
}))

jest.mock('@/lib/AuthContext')
jest.mock('@/lib/api', () => ({
	__esModule: true,
	default: {
		get: jest.fn(),
		put: jest.fn(),
		patch: jest.fn(),
		delete: jest.fn(),
	},
}))

jest.mock('@/components/layout/UnifiedHeader', () => ({ UnifiedHeader: () => <div data-testid="header">Header</div> }))

const mockUser = {
	uid: 'user-123',
	email: 'test@example.com',
	displayName: 'Test User',
	getIdToken: jest.fn().mockResolvedValue('fake-token'),
} as unknown as import('firebase/auth').User

const mockProfileData = {
	user: {
		id: 'user-1',
		email: 'test@example.com',
		name: 'Test User',
		phone: '+998901234567',
		avatar: null,
		dateOfBirth: null,
		gender: null,
		loyaltyPoints: 100,
		totalSpent: 500000,
		memberSince: '2024-01-01',
		dietaryPrefs: [],
		allergyInfo: [],
		loyaltyTier: 'SILVER',
		emailNotificationsEnabled: true,
	},
	statistics: {
		totalOrders: 5,
		totalSpent: 500000,
		avgOrderValue: 100000,
		loyaltyPoints: 100,
		memberSince: '2024-01-01',
		statusBreakdown: [
			{ status: 'DELIVERED', count: 4 },
			{ status: 'PENDING', count: 1 },
		],
	},
	recentOrders: [],
	favoriteProducts: [],
}

describe('ProfilePage', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })
		;(api.get as jest.Mock)
			.mockImplementation((url: string) => {
				if (url.includes('/stats')) {
					return Promise.resolve({ data: { success: true, data: mockProfileData } })
				}
				if (url.includes('/addresses')) {
					return Promise.resolve({ data: { success: true, data: [] } })
				}
				return Promise.resolve({ data: { success: true, data: mockProfileData } })
			})
	})

	it('should redirect to login when not authenticated', async () => {
		;(useAuth as jest.Mock).mockReturnValue({ user: null })

		render(<ProfilePage />)

		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith('/login')
		})
	})

	it('should render profile with stats when authenticated', async () => {
		render(<ProfilePage />)

		await waitFor(() => {
			expect(screen.getByText(/Mening Profilim/i)).toBeInTheDocument()
			expect(screen.getByText(/Jami buyurtmalar/i)).toBeInTheDocument()
		})
	})

	it('should show Settings tab content when Sozlamalar tab is clicked', async () => {
		const user = userEvent.setup()
		render(<ProfilePage />)

		await waitFor(() => {
			expect(screen.getByText(/Mening Profilim/i)).toBeInTheDocument()
		})

		await user.click(screen.getByRole('tab', { name: /Sozlamalar/i }))

		expect(await screen.findByText(/Bildirishnomalar/i)).toBeInTheDocument()
	})

	it('should call PATCH when notification toggle is clicked', async () => {
		const user = userEvent.setup()
		;(api.patch as jest.Mock).mockResolvedValue({
			data: {
				success: true,
				data: { ...mockProfileData.user, emailNotificationsEnabled: false },
			},
		})

		render(<ProfilePage />)

		await waitFor(() => {
			expect(screen.getByText(/Mening Profilim/i)).toBeInTheDocument()
		})

		await user.click(screen.getByRole('tab', { name: /Sozlamalar/i }))

		await screen.findByText(/Bildirishnomalar/i)
		const toggle = screen.getByRole('switch')
		await user.click(toggle)

		await waitFor(() => {
			expect(api.patch).toHaveBeenCalledWith(
				'/api/profile',
				{ emailNotificationsEnabled: false },
				expect.objectContaining({
					headers: { Authorization: 'Bearer fake-token' },
				})
			)
		})
	})
})
