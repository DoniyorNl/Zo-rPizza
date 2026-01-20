// =====================================
// 📁 FILE PATH: frontend/__tests__/components/ErrorBoundary.test.tsx
// 🧪 ERROR BOUNDARY COMPONENT TESTS
// =====================================

import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Component that throws error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
	if (shouldThrow) {
		throw new Error('Test error message')
	}
	return <div>No error</div>
}

describe('ErrorBoundary', () => {
	// Suppress console.error in tests
	const originalError = console.error
	beforeAll(() => {
		console.error = jest.fn()
	})
	afterAll(() => {
		console.error = originalError
	})

	it('should render children when no error', () => {
		render(
			<ErrorBoundary>
				<ThrowError shouldThrow={false} />
			</ErrorBoundary>,
		)

		expect(screen.getByText('No error')).toBeInTheDocument()
	})

	it('should render error UI when error occurs', () => {
		render(
			<ErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		)

		expect(screen.getByText('Xatolik yuz berdi')).toBeInTheDocument()
		expect(screen.getByText(/Test error message/)).toBeInTheDocument()
	})

	it('should show reset button', () => {
		render(
			<ErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		)

		expect(screen.getByText('Sahifani yangilash')).toBeInTheDocument()
	})

	it('should show home button', () => {
		render(
			<ErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		)

		expect(screen.getByText('Bosh sahifaga qaytish')).toBeInTheDocument()
	})

	it('should render custom fallback if provided', () => {
		const customFallback = <div>Custom error UI</div>

		render(
			<ErrorBoundary fallback={customFallback}>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>,
		)

		expect(screen.getByText('Custom error UI')).toBeInTheDocument()
		expect(screen.queryByText('Xatolik yuz berdi')).not.toBeInTheDocument()
	})
})
