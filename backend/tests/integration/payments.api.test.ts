import { Request, Response } from 'express'
import {
	getPaymentStatus,
	initiatePayment,
	simulatePaymentSuccess,
} from '../../src/controllers/payments.controller'
import { prismaMock } from '../setup'

const mockReq = (overrides: Partial<Request> = {}) => overrides as Request

describe('Payments API Integration', () => {
	let res: Partial<Response>
	let status: jest.Mock
	let json: jest.Mock
	let redirect: jest.Mock

	beforeEach(() => {
		json = jest.fn()
		redirect = jest.fn()
		status = jest.fn().mockReturnValue({ json, redirect })
		res = { status, json, redirect }
	})

	it('initiates CLICK payment and returns redirectUrl', async () => {
		const req = mockReq({
			body: { orderId: 'ord-1', provider: 'CLICK' },
			userId: 'firebase-1',
		} as any)

		prismaMock.user.findFirst.mockResolvedValue({ id: 'db-user-1' } as any)
		prismaMock.order.findUnique.mockResolvedValue({
			id: 'ord-1',
			userId: 'db-user-1',
			totalPrice: 100000,
			paymentStatus: 'PENDING',
			orderNumber: '#0001',
		} as any)
		prismaMock.payment.findFirst.mockResolvedValue(null)
		prismaMock.payment.create.mockResolvedValue({
			id: 'pay-1',
			orderId: 'ord-1',
			provider: 'CLICK',
			amount: 100000,
			status: 'PENDING',
		} as any)

		await initiatePayment(req, res as Response)

		expect(status).toHaveBeenCalledWith(200)
		expect(json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				data: expect.objectContaining({
					paymentId: 'pay-1',
					orderId: 'ord-1',
					provider: 'CLICK',
				}),
			}),
		)
	})

	it('returns payment status for order owner', async () => {
		const req = mockReq({
			params: { orderId: 'ord-1' },
			userId: 'firebase-1',
		} as any)
		prismaMock.user.findFirst.mockResolvedValue({ id: 'db-user-1' } as any)
		prismaMock.order.findUnique.mockResolvedValue({
			id: 'ord-1',
			orderNumber: '#0001',
			userId: 'db-user-1',
			paymentMethod: 'CLICK',
			paymentStatus: 'PENDING',
			payments: [{ id: 'pay-1', status: 'PENDING' }],
		} as any)

		await getPaymentStatus(req, res as Response)

		expect(status).toHaveBeenCalledWith(200)
		expect(json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				data: expect.objectContaining({
					orderId: 'ord-1',
					paymentStatus: 'PENDING',
				}),
			}),
		)
	})

	it('simulates payment success in non-production', async () => {
		const req = mockReq({ params: { paymentId: 'pay-1' } })
		prismaMock.payment.findUnique.mockResolvedValue({
			id: 'pay-1',
			orderId: 'ord-1',
			order: { orderNumber: '#0001' },
			status: 'PENDING',
		} as any)
		prismaMock.payment.update.mockResolvedValue({} as any)
		prismaMock.order.update.mockResolvedValue({} as any)
		prismaMock.$transaction.mockResolvedValue([] as any)

		await simulatePaymentSuccess(req, res as Response)

		expect(redirect).toHaveBeenCalled()
	})
})

