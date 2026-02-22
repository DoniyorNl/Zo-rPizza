// frontend/__tests__/pages/CheckoutPage.test.tsx
// 💳 CHECKOUT PAGE TESTS

import CheckoutPage from '@/app/(shop)/checkout/page'
import api from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { geocodeAddress } from '@/lib/geocoding'
import { useCartStore } from '@/store/cartStore'
import { useDeliveryStore } from '@/store/deliveryStore'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'

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
    post: jest.fn(),
  },
}))
jest.mock('@/lib/geocoding')
jest.mock('@/components/layout/UnifiedHeader', () => ({ UnifiedHeader: () => null }))
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: unknown }) => <div>{children as any}</div>,
  PaymentElement: () => <div data-testid="stripe-payment-element">Stripe PaymentElement</div>,
  useStripe: () => ({
    confirmPayment: jest.fn().mockResolvedValue({}),
  }),
  useElements: () => ({}),
}))
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn().mockResolvedValue({}),
}))

const mockUser = {
  uid: 'user-123',
  getIdToken: jest.fn().mockResolvedValue('fake-token'),
} as unknown as import('firebase/auth').User

const mockCartItem = {
  id: 'item-1',
  productId: 'prod-1',
  variationId: 'var-1',
  name: 'Pepperoni Pizza',
  size: 'Medium',
  price: 50000,
  imageUrl: 'https://example.com/pizza.jpg',
  quantity: 1,
  addedToppingIds: [],
  removedToppingIds: [],
}

const mockBranch = {
  id: 'branch-1',
  name: 'Chilonzor',
  address: 'Toshkent, Chilonzor 9',
  lat: 41.3,
  lng: 69.2,
  phone: '+998901234567',
  isActive: true,
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock'
    ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })
    act(() => {
      useCartStore.getState().clearCart()
      useCartStore.getState().addItem({
        productId: mockCartItem.productId,
        variationId: mockCartItem.variationId,
        name: mockCartItem.name,
        size: mockCartItem.size,
        price: mockCartItem.price,
        imageUrl: mockCartItem.imageUrl,
        addedToppingIds: [],
        removedToppingIds: [],
      })
    })
    useDeliveryStore.setState({ method: 'delivery', selectedBranch: null })
    ;(api.get as jest.Mock).mockResolvedValue({ data: { success: true, data: [] } })
    ;(api.post as jest.Mock).mockResolvedValue({
      data: { data: { id: 'order-1', orderNumber: 'ORD-001' } },
    })
    ;(geocodeAddress as jest.Mock).mockResolvedValue({ lat: 41.3, lng: 69.2 })
  })

  it('should show loading when user is not logged in', () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: null })

    render(<CheckoutPage />)

    expect(screen.getByText(/Yuklanmoqda/i)).toBeInTheDocument()
  })

  it('should show loading when cart is empty', () => {
    act(() => useCartStore.getState().clearCart())
    ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })

    render(<CheckoutPage />)

    expect(screen.getByText(/Yuklanmoqda/i)).toBeInTheDocument()
  })

  it('should render delivery form when user and cart items exist', () => {
    render(<CheckoutPage />)

    expect(screen.getByRole('heading', { name: /Buyurtma berish/i })).toBeInTheDocument()
    expect(screen.getByText(/Yetkazib berish ma'lumotlari/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Toshkent, Chilonzor/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('+998901234567')).toBeInTheDocument()
    expect(screen.getByText(/Naqd pul/i)).toBeInTheDocument()
    expect(screen.getByText(/Karta/i)).toBeInTheDocument()
    expect(screen.getByText(/Buyurtma tafsilotlari/i)).toBeInTheDocument()
  })

  it('should show pickup warning when method is pickup and no branch selected', () => {
    useDeliveryStore.setState({ method: 'pickup', selectedBranch: null })

    render(<CheckoutPage />)

    expect(screen.getByText(/Olib ketish uchun/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Bosh sahifaga/i })).toBeInTheDocument()
  })

  it('should show selected branch when pickup with branch', () => {
    useDeliveryStore.setState({ method: 'pickup', selectedBranch: mockBranch })

    render(<CheckoutPage />)

    expect(screen.getByText('Chilonzor')).toBeInTheDocument()
    expect(screen.getByText(/Toshkent, Chilonzor 9/i)).toBeInTheDocument()
  })

  it('should toggle payment method', () => {
    render(<CheckoutPage />)

    const cardBtn = screen.getByText('💳 Karta')
    fireEvent.click(cardBtn)
    expect(cardBtn.closest('button')).toHaveClass('border-orange-600')

    const cashBtn = screen.getByText('💵 Naqd pul')
    fireEvent.click(cashBtn)
    expect(cashBtn.closest('button')).toHaveClass('border-orange-600')
  })

  it('should open card payment modal and request client secret', async () => {
    ;(api.post as jest.Mock)
      .mockResolvedValueOnce({ data: { data: { id: 'order-1', orderNumber: 'ORD-001' } } })
      .mockResolvedValueOnce({ data: { data: { clientSecret: 'pi_secret_test' } } })

    render(<CheckoutPage />)

    fireEvent.change(screen.getByPlaceholderText(/Toshkent, Chilonzor/), {
      target: { value: 'Toshkent, Chilonzor 9' },
    })
    fireEvent.change(screen.getByPlaceholderText('+998901234567'), {
      target: { value: '+998901234567' },
    })
    fireEvent.click(screen.getByText('💳 Karta'))
    fireEvent.click(screen.getByRole('button', { name: 'Buyurtma berish' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenNthCalledWith(
        2,
        '/api/payment/create-intent',
        { orderId: 'order-1' },
        expect.any(Object),
      )
    })

    expect(screen.getByText(/Karta orqali to'lash/i)).toBeInTheDocument()
    expect(screen.getByTestId('stripe-payment-element')).toBeInTheDocument()
  })

  it('should submit order successfully for delivery', async () => {
    render(<CheckoutPage />)

    fireEvent.change(screen.getByPlaceholderText(/Toshkent, Chilonzor/), {
      target: { value: 'Toshkent, Chilonzor 9' },
    })
    fireEvent.change(screen.getByPlaceholderText('+998901234567'), {
      target: { value: '+998901234567' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Buyurtma berish' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/orders',
        expect.objectContaining({
          userId: 'user-123',
          deliveryType: 'delivery',
          deliveryAddress: 'Toshkent, Chilonzor 9',
          deliveryPhone: '+998901234567',
          paymentMethod: 'CASH',
        }),
        expect.any(Object),
      )
    })

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/checkout/success'),
    )
  })

  it('should submit order for pickup with branch', async () => {
    useDeliveryStore.setState({ method: 'pickup', selectedBranch: mockBranch })

    render(<CheckoutPage />)

    fireEvent.change(screen.getByPlaceholderText('+998901234567'), {
      target: { value: '+998901234567' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Buyurtma berish' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/orders',
        expect.objectContaining({
          deliveryType: 'pickup',
          branchId: 'branch-1',
          deliveryAddress: 'Toshkent, Chilonzor 9',
        }),
        expect.any(Object),
      )
    })
  })

  it('should display error on API failure', async () => {
    ;(api.post as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<CheckoutPage />)

    fireEvent.change(screen.getByPlaceholderText(/Toshkent, Chilonzor/), {
      target: { value: 'Toshkent' },
    })
    fireEvent.change(screen.getByPlaceholderText('+998901234567'), {
      target: { value: '+998901234567' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Buyurtma berish' }))

    await waitFor(() => {
      expect(screen.getByTestId('checkout-error')).toBeInTheDocument()
    })
  })
})
