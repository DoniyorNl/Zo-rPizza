// frontend/__tests__/components/MemberSection.test.tsx
// 👤 MEMBER SECTION TESTS

import { render, screen } from '@testing-library/react'
import { MemberSection } from '@/components/home/MemberSection'

jest.mock('next/navigation', () => ({
	useRouter: () => ({
		push: jest.fn(),
	}),
}))

describe('MemberSection Component', () => {
	it('should render member section', () => {
		render(<MemberSection />)
		
		const azoBoling = screen.getAllByText(/A'zo Bo'ling/i)
		expect(azoBoling.length).toBeGreaterThan(0)
	})

	it('should display benefits', () => {
		render(<MemberSection />)
		
		expect(screen.getByText(/Har safar ballar/i)).toBeInTheDocument()
		const maxsusTakliflar = screen.getAllByText(/Maxsus takliflar/i)
		expect(maxsusTakliflar.length).toBeGreaterThan(0)
	})

	it('should display exclusive deals', () => {
		render(<MemberSection />)
		
		expect(screen.getByText(/Maxsus A'zolar Takliflari/i)).toBeInTheDocument()
	})

	it('should have sign up buttons', () => {
		render(<MemberSection />)
		
		const signupButtons = screen.getAllByText(/A'zo Bo'lish/i)
		expect(signupButtons.length).toBeGreaterThan(0)
	})
})
