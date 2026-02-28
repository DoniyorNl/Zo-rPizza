// frontend/__tests__/components/LoyaltyDisplay.test.tsx
// ⭐ LOYALTY DISPLAY TESTS

import LoyaltyDisplay from '@/components/checkout/LoyaltyDisplay'
import { api } from '@/lib/apiClient'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

jest.mock('@/lib/apiClient')

const mockedApi = api as jest.Mocked<typeof api>

describe('LoyaltyDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render nothing while loading', () => {
    mockedApi.get.mockImplementation(
      () => new Promise(() => {}),
    )

    const { container } = render(<LoyaltyDisplay />)

    expect(container.firstChild).toBeNull()
  })

  it('should render nothing when balance is null or points <= 0', async () => {
    mockedApi.get.mockResolvedValue({
      data: { success: true, data: null },
    })

    const { unmount } = render(<LoyaltyDisplay />)

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/api/loyalty/balance')
    })

    unmount()

    mockedApi.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          points: 0,
          totalSpent: 100000,
          redeemableDiscount: 0,
        },
      },
    })

    render(<LoyaltyDisplay />)

    await waitFor(() => {})

    expect(screen.queryByText(/Loyalty points/i)).not.toBeInTheDocument()
  })

  it('should display loyalty points when balance exists', async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          points: 500,
          totalSpent: 200000,
          redeemableDiscount: 500,
        },
      },
    })

    render(<LoyaltyDisplay />)

    await waitFor(() => {
      expect(screen.getByText('Loyalty points')).toBeInTheDocument()
    })

    expect(screen.getByText('500 pts')).toBeInTheDocument()
    expect(screen.getByText(/Up to 500 off/)).toBeInTheDocument()
  })

  it('should show Use points button and call onRedeem when clicked', async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          points: 500,
          totalSpent: 200000,
          redeemableDiscount: 500,
        },
      },
    })

    const mockOnRedeem = jest.fn()

    render(<LoyaltyDisplay onRedeem={mockOnRedeem} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Use points' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Use points' }))

    expect(mockOnRedeem).toHaveBeenCalledWith(500)
  })

  it('should not show Use points when onRedeem not provided', async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          points: 500,
          totalSpent: 200000,
          redeemableDiscount: 500,
        },
      },
    })

    render(<LoyaltyDisplay />)

    await waitFor(() => {
      expect(screen.getByText('500 pts')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: 'Use points' })).not.toBeInTheDocument()
  })

  it('should handle API error gracefully', async () => {
    mockedApi.get.mockRejectedValue(new Error('Network error'))

    render(<LoyaltyDisplay />)

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalled()
    })

    expect(screen.queryByText('Loyalty points')).not.toBeInTheDocument()
  })
})
