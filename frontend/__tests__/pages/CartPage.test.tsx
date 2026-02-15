// frontend/__tests__/pages/CartPage.test.tsx
// 🛒 CART PAGE TESTS

import CartPage from '@/app/(shop)/cart/page'
import { useCartStore } from '@/store/cartStore'
import { act, fireEvent, render, screen } from '@testing-library/react'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
jest.mock('@/components/layout/UnifiedHeader', () => ({ UnifiedHeader: () => null }))
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { src: string; alt: string; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={props.src} alt={props.alt} className={props.className} />
  ),
}))

const mockProduct = {
  productId: 'prod-1',
  variationId: 'var-1',
  name: 'Pepperoni Pizza',
  size: 'Medium',
  price: 50000,
  imageUrl: 'https://example.com/pizza.jpg',
  addedToppingIds: [],
  removedToppingIds: [],
}

describe('CartPage', () => {
  beforeEach(() => {
    act(() => useCartStore.getState().clearCart())
    localStorage.clear()
    mockPush.mockClear()
  })

  it('should show empty cart message when no items', () => {
    render(<CartPage />)

    expect(screen.getByText(/Savatcha bo'sh/i)).toBeInTheDocument()
    expect(screen.getByText(/Hozircha hech narsa qo'shilmagan/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Menyu'ga qaytish/i })).toBeInTheDocument()
  })

  it('should render cart items and summary when cart has items', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct)
      useCartStore.getState().addItem(mockProduct)
    })

    render(<CartPage />)

    expect(screen.getByText('Savatcha')).toBeInTheDocument()
    expect(screen.getByText('Pepperoni Pizza')).toBeInTheDocument()
    expect(screen.getByText(/50,000.*so'm/)).toBeInTheDocument()
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Jami/i)).toBeInTheDocument()
    expect(screen.getByText(/100,000.*so'm/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Buyurtma berish/i })).toBeInTheDocument()
  })

  it('should navigate to checkout when Buyurtma berish is clicked', () => {
    act(() => useCartStore.getState().addItem({ ...mockProduct }))

    render(<CartPage />)

    fireEvent.click(screen.getByRole('button', { name: /Buyurtma berish/i }))
    expect(mockPush).toHaveBeenCalledWith('/checkout')
  })

  it('should increase quantity when plus button clicked', () => {
    act(() => useCartStore.getState().addItem(mockProduct))

    render(<CartPage />)
    const qtySpan = screen.getAllByText('1').find(s => s.className?.includes('text-xl')) || screen.getByText('1')
    const container = qtySpan.parentElement!
    const [, plusBtn] = Array.from(container.querySelectorAll('button'))
    fireEvent.click(plusBtn)

    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1)
  })

  it('should decrease quantity when minus button clicked', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct)
      useCartStore.getState().addItem(mockProduct)
    })

    render(<CartPage />)
    const qtySpans = screen.getAllByText('2')
    const qtySpan = qtySpans.find(s => s.className?.includes('text-xl')) || qtySpans[1]
    const container = qtySpan.parentElement!
    const [minusBtn] = Array.from(container.querySelectorAll('button'))
    fireEvent.click(minusBtn)

    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1)
  })

  it('should clear cart when Hammasini o\'chirish clicked', () => {
    act(() => useCartStore.getState().addItem(mockProduct))

    render(<CartPage />)
    expect(screen.getByText('Pepperoni Pizza')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Hammasini o'chirish/i }))

    expect(screen.getByText(/Savatcha bo'sh/i)).toBeInTheDocument()
  })
})
