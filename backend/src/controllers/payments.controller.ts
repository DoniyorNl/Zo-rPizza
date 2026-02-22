import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/firebase-auth.middleware'

type Provider = 'CLICK' | 'PAYME'

const FRONTEND_URL =
	process.env.FRONTEND_URL ||
	process.env.FRONTEND_URLS?.split(',')[0]?.trim() ||
	'http://localhost:3000'
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`

const isProduction = process.env.NODE_ENV === 'production'

async function getCurrentDbUser(firebaseUid?: string) {
	if (!firebaseUid) return null
	return prisma.user.findFirst({ where: { firebaseUid }, select: { id: true } })
}

async function markPaymentPaid(paymentId: string, externalId?: string, metadata?: object) {
	const payment = await prisma.payment.findUnique({
		where: { id: paymentId },
		include: { order: true },
	})
	if (!payment) return null
	if (payment.status === 'PAID') return payment

	await prisma.$transaction([
		prisma.payment.update({
			where: { id: payment.id },
			data: {
				status: 'PAID',
				paidAt: new Date(),
				...(externalId ? { externalId } : {}),
				...(metadata ? { metadata } : {}),
			},
		}),
		prisma.order.update({
			where: { id: payment.orderId },
			data: { paymentStatus: 'PAID' },
		}),
	])

	return prisma.payment.findUnique({
		where: { id: payment.id },
		include: { order: true },
	})
}

function createClickUrl(orderId: string, amount: number, fallbackUrl: string) {
	const serviceId = process.env.CLICK_SERVICE_ID
	const merchantId = process.env.CLICK_MERCHANT_ID
	if (!serviceId || !merchantId) return fallbackUrl

	const returnUrl = `${FRONTEND_URL}/checkout/success?orderId=${encodeURIComponent(orderId)}&paid=1&provider=CLICK`
	return `https://my.click.uz/services/pay?service_id=${encodeURIComponent(serviceId)}&merchant_id=${encodeURIComponent(merchantId)}&amount=${encodeURIComponent(
		String(Math.round(amount)),
	)}&transaction_param=${encodeURIComponent(orderId)}&return_url=${encodeURIComponent(returnUrl)}`
}

function createPaymeUrl(orderId: string, amount: number, fallbackUrl: string) {
	const merchantId = process.env.PAYME_MERCHANT_ID
	if (!merchantId) return fallbackUrl

	const payload = {
		m: merchantId,
		ac: { order_id: orderId },
		a: Math.round(amount * 100), // tiyin
		c: `${BACKEND_URL}/api/payments/callback/payme`,
	}
	return `https://checkout.paycom.uz/${Buffer.from(JSON.stringify(payload)).toString('base64')}`
}

export const initiatePayment = async (req: Request, res: Response) => {
	try {
		const authReq = req as AuthRequest
		const { orderId, provider } = req.body as { orderId?: string; provider?: Provider }
		if (!orderId || !provider) {
			return res.status(400).json({ success: false, message: 'orderId va provider majburiy' })
		}
		if (provider !== 'CLICK' && provider !== 'PAYME') {
			return res.status(400).json({ success: false, message: 'provider CLICK yoki PAYME bo‘lishi kerak' })
		}

		const user = await getCurrentDbUser(authReq.userId)
		if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' })

		const order = await prisma.order.findUnique({
			where: { id: orderId },
			select: { id: true, userId: true, totalPrice: true, paymentStatus: true, orderNumber: true },
		})
		if (!order) return res.status(404).json({ success: false, message: 'Order topilmadi' })
		if (order.userId !== user.id) return res.status(403).json({ success: false, message: 'Ruxsat yo‘q' })
		if (order.paymentStatus === 'PAID') {
			return res.status(400).json({ success: false, message: 'Buyurtma allaqachon to‘langan' })
		}

		const existingPending = await prisma.payment.findFirst({
			where: { orderId: order.id, provider, status: 'PENDING' },
			orderBy: { createdAt: 'desc' },
		})

		const payment =
			existingPending ||
			(await prisma.payment.create({
				data: {
					orderId: order.id,
					provider,
					amount: order.totalPrice,
					status: 'PENDING',
				},
			}))

		const simulateUrl = `${BACKEND_URL}/api/payments/simulate/${payment.id}/success`
		const redirectUrl =
			provider === 'CLICK'
				? createClickUrl(order.id, order.totalPrice, simulateUrl)
				: createPaymeUrl(order.id, order.totalPrice, simulateUrl)

		await prisma.payment.update({
			where: { id: payment.id },
			data: {
				redirectUrl,
				metadata: {
					...(payment.metadata as object | null),
					initiatedFrom: 'checkout',
				},
			},
		})

		// payment method ni orderda provider bilan bir xil tutamiz
		await prisma.order.update({
			where: { id: order.id },
			data: { paymentMethod: provider },
		})

		return res.status(200).json({
			success: true,
			data: {
				paymentId: payment.id,
				orderId: order.id,
				orderNumber: order.orderNumber,
				provider,
				amount: order.totalPrice,
				redirectUrl,
			},
		})
	} catch (error) {
		console.error('initiatePayment error:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

export const getPaymentStatus = async (req: Request, res: Response) => {
	try {
		const authReq = req as AuthRequest
		const user = await getCurrentDbUser(authReq.userId)
		if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' })

		const orderId = String(req.params.orderId || '')
		if (!orderId) return res.status(400).json({ success: false, message: 'orderId required' })

		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				payments: { orderBy: { createdAt: 'desc' }, take: 1 },
			},
		})
		if (!order) return res.status(404).json({ success: false, message: 'Order topilmadi' })
		if (order.userId !== user.id) return res.status(403).json({ success: false, message: 'Ruxsat yo‘q' })

		return res.status(200).json({
			success: true,
			data: {
				orderId: order.id,
				orderNumber: order.orderNumber,
				paymentMethod: order.paymentMethod,
				paymentStatus: order.paymentStatus,
				lastPayment: order.payments[0] || null,
			},
		})
	} catch (error) {
		console.error('getPaymentStatus error:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

// Dev/sandbox flow: provider bo'lmasa ham checkout flow ni yakunlash uchun.
export const simulatePaymentSuccess = async (req: Request, res: Response) => {
	try {
		if (isProduction) {
			return res.status(404).json({ success: false, message: 'Not found' })
		}
		const paymentId = String(req.params.paymentId || '')
		if (!paymentId) return res.status(400).json({ success: false, message: 'paymentId required' })

		const paid = await markPaymentPaid(paymentId, `SIM-${Date.now()}`, { simulated: true })
		if (!paid) return res.status(404).json({ success: false, message: 'Payment topilmadi' })

		return res.redirect(
			`${FRONTEND_URL}/checkout/success?orderId=${encodeURIComponent(paid.orderId)}&orderNumber=${encodeURIComponent(
				paid.order.orderNumber,
			)}&paid=1&provider=${paid.provider}&simulated=1`,
		)
	} catch (error) {
		console.error('simulatePaymentSuccess error:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

// Click callback (minimal). Real tekshiruv: sign string validatsiya qo‘shiladi.
export const clickCallback = async (req: Request, res: Response) => {
	try {
		const body = req.body as Record<string, unknown>
		const clickTransId = String(body.click_trans_id || body.transaction_id || '')
		const orderId = String(body.merchant_trans_id || body.transaction_param || body.order_id || '')
		const status = String(body.status || body.error || '0')

		const payment = await prisma.payment.findFirst({
			where: { orderId, provider: 'CLICK' },
			orderBy: { createdAt: 'desc' },
		})
		if (!payment) return res.status(404).json({ error: -6, error_note: 'Transaction not found' })

		if (status === '0' || status === 'PAID' || status === 'success') {
			await markPaymentPaid(payment.id, clickTransId, body as object)
			return res.status(200).json({ error: 0, error_note: 'Success' })
		}

		await prisma.payment.update({
			where: { id: payment.id },
			data: { status: 'FAILED', metadata: body as object },
		})
		await prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: 'FAILED' } })
		return res.status(200).json({ error: -9, error_note: 'Failed' })
	} catch (error) {
		console.error('clickCallback error:', error)
		return res.status(500).json({ error: -9, error_note: 'Server error' })
	}
}

// Payme JSON-RPC callback (minimal).
export const paymeCallback = async (req: Request, res: Response) => {
	try {
		const { method, params, id } = req.body as {
			method?: string
			params?: Record<string, any>
			id?: number | string
		}
		const ok = (result: unknown) => res.status(200).json({ result, id })
		const fail = (code: number, message: string) => res.status(200).json({ error: { code, message }, id })

		if (method === 'CheckPerformTransaction') {
			const orderId = String(params?.account?.order_id || params?.account?.orderId || '')
			const amount = Number(params?.amount || 0) / 100
			const order = await prisma.order.findUnique({ where: { id: orderId } })
			if (!order) return fail(-31050, 'Order not found')
			if (Math.round(order.totalPrice) !== Math.round(amount)) return fail(-31001, 'Invalid amount')
			if (order.paymentStatus === 'PAID') return fail(-31050, 'Already paid')
			return ok({ allow: true })
		}

		if (method === 'PerformTransaction') {
			const orderId = String(params?.account?.order_id || params?.account?.orderId || '')
			const transId = String(params?.id || '')
			const payment = await prisma.payment.findFirst({
				where: { orderId, provider: 'PAYME' },
				orderBy: { createdAt: 'desc' },
			})
			if (!payment) return fail(-31050, 'Payment not found')
			await markPaymentPaid(payment.id, transId, params || {})
			return ok({ transaction: transId, state: 2 })
		}

		if (method === 'CancelTransaction') {
			const transId = String(params?.id || '')
			const payment = await prisma.payment.findFirst({
				where: { externalId: transId, provider: 'PAYME' },
				orderBy: { createdAt: 'desc' },
			})
			if (payment) {
				await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } })
				await prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: 'FAILED' } })
			}
			return ok({ transaction: transId, state: -1 })
		}

		return fail(-32601, 'Method not found')
	} catch (error) {
		console.error('paymeCallback error:', error)
		return res.status(200).json({ error: { code: -32400, message: 'Server error' }, id: req.body?.id || 0 })
	}
}

