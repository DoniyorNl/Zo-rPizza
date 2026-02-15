// frontend/__tests__/components/PromoCodeInput.test.tsx
// 🎟️ PROMO CODE INPUT TESTS

import PromoCodeInput from '@/components/checkout/PromoCodeInput'
import { api } from '@/lib/apiClient'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

jest.mock('@/lib/apiClient')

const mockOnApplied = jest.fn()
const mockedApi = api as jest.Mocked<typeof api>

describe('PromoCodeInput', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render input and apply button when no code applied', () => {
    render(
      <PromoCodeInput orderTotal={100000} onApplied={mockOnApplied} />,
    )

    expect(screen.getByPlaceholderText('Promo code')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
  })

  it('should show applied code when appliedCode prop is set', () => {
    render(
      <PromoCodeInput
        orderTotal={100000}
        onApplied={mockOnApplied}
        appliedCode="SAVE20"
      />,
    )

    expect(screen.getByText(/Promo applied: SAVE20/i)).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Promo code')).not.toBeInTheDocument()
  })

  it('should apply promo successfully and call onApplied', async () => {
    mockedApi.post.mockResolvedValue({
      data: {
        valid: true,
        data: {
          code: 'SAVE20',
          discountAmount: 20000,
          discountType: 'FIXED',
          discountValue: 20000,
        },
      },
    })

    render(
      <PromoCodeInput orderTotal={100000} onApplied={mockOnApplied} />,
    )

    fireEvent.change(screen.getByPlaceholderText('Promo code'), {
      target: { value: 'save20' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(mockOnApplied).toHaveBeenCalledWith('SAVE20', 20000)
    })

    expect(screen.getByText(/Applied!.*20000/)).toBeInTheDocument()
  })

  it('should not call API when input is empty', async () => {
    render(
      <PromoCodeInput orderTotal={100000} onApplied={mockOnApplied} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {})

    expect(mockedApi.post).not.toHaveBeenCalled()
  })

  it('should show error on invalid code', async () => {
    mockedApi.post.mockResolvedValue({
      data: {
        valid: false,
        message: 'Promo kodi noto\'g\'ri',
      },
    })

    render(
      <PromoCodeInput orderTotal={100000} onApplied={mockOnApplied} />,
    )

    fireEvent.change(screen.getByPlaceholderText('Promo code'), {
      target: { value: 'invalid' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(screen.getByText(/Promo kodi noto'g'ri|Invalid code/i)).toBeInTheDocument()
    })

    expect(mockOnApplied).not.toHaveBeenCalled()
  })

  it('should show error on API failure', async () => {
    mockedApi.post.mockRejectedValue(new Error('Network error'))

    render(
      <PromoCodeInput orderTotal={100000} onApplied={mockOnApplied} />,
    )

    fireEvent.change(screen.getByPlaceholderText('Promo code'), {
      target: { value: 'SAVE20' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(screen.getByText('Failed to validate code')).toBeInTheDocument()
    })
  })

  it('should convert input to uppercase', () => {
    render(
      <PromoCodeInput orderTotal={100000} onApplied={mockOnApplied} />,
    )

    const input = screen.getByPlaceholderText('Promo code')
    fireEvent.change(input, { target: { value: 'save20' } })

    expect((input as HTMLInputElement).value).toBe('SAVE20')
  })
})
