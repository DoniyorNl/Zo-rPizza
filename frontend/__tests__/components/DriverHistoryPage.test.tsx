// frontend/__tests__/components/DriverHistoryPage.test.tsx
// 🚗 DRIVER HISTORY PAGE TESTS

import DriverHistoryPage from '@/app/driver/history/page'
import { useAuth } from '@/lib/AuthContext'
import { buildApiUrl } from '@/lib/apiBaseUrl'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

jest.mock('@/lib/AuthContext', () => ({
	useAuth: jest.fn(),
}))

jest.mock('@/lib/apiBaseUrl', () => ({
	buildApiUrl: jest.fn(),
}))

const mockUseAuth = useAuth as jest.Mock
const mockBuildApiUrl = buildApiUrl as jest.Mock

const baseOrder = {
	id: 'order-1',
	orderNumber: '1001',
	status: 'DELIVERED',
	totalPrice: 32000,
	deliveryAddress: 'Tashkent, Chilonzor',
	deliveryInstructions: "Iltimos, oldindan qo'ng'iroq qiling",
	createdAt: '2026-02-08T08:00:00Z',
	updatedAt: '2026-02-08T10:00:00Z',
	user: {
		name: 'Ali',
		phone: '+998901112233',
	},
}

function mockFetch(orders: (typeof baseOrder)[]) {
	;(global.fetch as jest.Mock).mockResolvedValue({
		ok: true,
		json: async () => ({ success: true, data: orders }),
	})
}

describe('DriverHistoryPage', () => {
	beforeEach(() => {
		jest.useFakeTimers()
		jest.setSystemTime(new Date('2026-02-08T12:00:00Z'))
		jest.clearAllMocks()
		global.fetch = jest.fn()
		const storage: Record<string, string> = { firebaseToken: 'token' }
		const localStorageMock = {
			getItem: jest.fn((key: string) => storage[key] ?? null),
			setItem: jest.fn((key: string, value: string) => {
				storage[key] = value
			}),
			removeItem: jest.fn((key: string) => {
				delete storage[key]
			}),
			clear: jest.fn(() => {
				Object.keys(storage).forEach(key => {
					delete storage[key]
				})
			}),
		}
		Object.defineProperty(window, 'localStorage', {
			value: localStorageMock,
			writable: true,
		})
		global.localStorage = localStorageMock as unknown as Storage
		mockUseAuth.mockReturnValue({
			backendUser: { name: 'Test Driver' },
		})
		mockBuildApiUrl.mockImplementation((path: string) => path)
	})

	afterEach(() => {
		jest.useRealTimers()
	})

	it('filters orders by status', async () => {
		mockFetch([
			baseOrder,
			{
				...baseOrder,
				id: 'order-2',
				orderNumber: '1002',
				status: 'CANCELLED',
				updatedAt: '2026-02-07T09:00:00Z',
			},
			{
				...baseOrder,
				id: 'order-3',
				orderNumber: '1003',
				status: 'ON_THE_WAY',
				updatedAt: '2026-02-05T11:00:00Z',
			},
		])

		render(<DriverHistoryPage />)

		await screen.findByText('#1001')

		const statusSelect = screen.getByRole('combobox')
		fireEvent.change(statusSelect, { target: { value: 'ALL' } })

		await screen.findByText('#1002')
		await screen.findByText('#1003')

		fireEvent.change(statusSelect, { target: { value: 'CANCELLED' } })

		await waitFor(() => {
			expect(screen.getByText('#1002')).toBeInTheDocument()
			expect(screen.queryByText('#1001')).not.toBeInTheDocument()
			expect(screen.queryByText('#1003')).not.toBeInTheDocument()
		})
	})

	it('filters orders by custom date range', async () => {
		mockFetch([
			{
				...baseOrder,
				id: 'order-4',
				orderNumber: '2001',
				updatedAt: '2026-02-08T10:00:00Z',
			},
			{
				...baseOrder,
				id: 'order-5',
				orderNumber: '2002',
				updatedAt: '2026-02-02T10:00:00Z',
			},
		])

		render(<DriverHistoryPage />)

		await screen.findByText('#2001')

		const fromInput = screen.getByLabelText('Boshlanish sana') as HTMLInputElement
		const toInput = screen.getByLabelText('Tugash sana') as HTMLInputElement
		fireEvent.change(fromInput, { target: { value: '2026-02-07' } })
		fireEvent.change(toInput, { target: { value: '2026-02-08' } })

		await waitFor(() => {
			expect(screen.getByText('#2001')).toBeInTheDocument()
			expect(screen.queryByText('#2002')).not.toBeInTheDocument()
		})
	})
})
