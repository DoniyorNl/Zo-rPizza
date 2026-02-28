// backend/src/controllers/payments.controller.ts
// 💳 PAYMENTS CONTROLLER - Click/Payme Integration (Production-ready)

import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/firebase-auth.middleware'
import {
	createClickPaymentURL,
	handleClickPrepare,
	handleClickComplete,
	type ClickCallbackParams,
} from '../services/click.service'
import {
	createPaymePaymentURL,
	verifyPaymeAuth,
	handleCheckPerformTransaction,
	handleCreateTransaction,
	handlePerformTransaction,
	handleCancelTransaction,
	handleCheckTransaction,
	handleGetStatement,
	type PaymeRPCRequest,
	type PaymeRPCResponse,
} from '../services/payme.service'

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

// ============================================================================
// INITIATE PAYMENT (Click/Payme)
// ============================================================================

export const initiatePayment = async (req: Request, res: Response) => {
	try {
		const authReq = req as AuthRequest
		const { orderId, provider } = req.body as { orderId?: string; provider?: Provider }

		// Validation
		if (!orderId || !provider) {
			return res.status(400).json({ success: false, message: 'orderId va provider majburiy' })
		}
		if (provider !== 'CLICK' && provider !== 'PAYME') {
			return res
				.status(400)
				.json({ success: false, message: "provider CLICK yoki PAYME bo'lishi kerak" })
		}

		const user = await getCurrentDbUser(authReq.userId)
		if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' })

		// Get order
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			select: { id: true, userId: true, totalPrice: true, paymentStatus: true, orderNumber: true },
		})

		if (!order) {
			return res.status(404).json({ success: false, message: 'Order topilmadi' })
		}

		if (order.userId !== user.id) {
			return res.status(403).json({ success: false, message: "Ruxsat yo'q" })
		}

		if (order.paymentStatus === 'PAID') {
			return res.status(400).json({ success: false, message: "Buyurtma allaqachon to'langan" })
		}

		// Check if payment already exists
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

		// Generate payment URL using service layer
		const redirectUrl =
			provider === 'CLICK'
				? createClickPaymentURL({
						orderId: order.id,
						amount: order.totalPrice,
						orderNumber: order.orderNumber,
					})
				: createPaymePaymentURL({
						orderId: order.id,
						amount: order.totalPrice,
						orderNumber: order.orderNumber,
					})

		// Update payment with redirect URL
		await prisma.payment.update({
			where: { id: payment.id },
			data: {
				redirectUrl,
				metadata: {
					...(payment.metadata as object | null),
					initiatedFrom: 'checkout',
					initiatedAt: new Date().toISOString(),
				},
			},
		})

		// Update order payment method
		await prisma.order.update({
			where: { id: order.id },
			data: { paymentMethod: provider },
		})

		console.log(`✅ [${provider}] Payment initiated:`, payment.id)

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

// ============================================================================
// GET PAYMENT STATUS
// ============================================================================

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
		if (order.userId !== user.id)
			return res.status(403).json({ success: false, message: "Ruxsat yo'q" })

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

// ============================================================================
// SIMULATE PAYMENT SUCCESS (Development only)
// ============================================================================

export const simulatePaymentSuccess = async (req: Request, res: Response) => {
	try {
		if (isProduction) {
			return res.status(404).json({ success: false, message: 'Not found' })
		}

		const paymentId = String(req.params.paymentId || '')
		if (!paymentId) return res.status(400).json({ success: false, message: 'paymentId required' })

		const payment = await prisma.payment.findUnique({
			where: { id: paymentId },
			include: { order: true },
		})

		if (!payment) {
			return res.status(404).json({ success: false, message: 'Payment topilmadi' })
		}

		if (payment.status === 'PAID') {
			return res.redirect(
				`${FRONTEND_URL}/checkout/success?orderId=${encodeURIComponent(payment.orderId)}&orderNumber=${encodeURIComponent(
					payment.order.orderNumber,
				)}&paid=1&provider=${payment.provider}&simulated=1`,
			)
		}

		// Mark as paid
		await prisma.$transaction([
			prisma.payment.update({
				where: { id: payment.id },
				data: {
					status: 'PAID',
					paidAt: new Date(),
					externalId: `SIM-${Date.now()}`,
					metadata: { simulated: true },
				},
			}),
			prisma.order.update({
				where: { id: payment.orderId },
				data: { paymentStatus: 'PAID' },
			}),
		])

		console.log('✅ [SIMULATION] Payment marked as paid:', paymentId)

		return res.redirect(
			`${FRONTEND_URL}/checkout/success?orderId=${encodeURIComponent(payment.orderId)}&orderNumber=${encodeURIComponent(
				payment.order.orderNumber,
			)}&paid=1&provider=${payment.provider}&simulated=1`,
		)
	} catch (error) {
		console.error('simulatePaymentSuccess error:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

// ============================================================================
// CLICK CALLBACK (Production-ready with signature verification)
// ============================================================================

export const clickCallback = async (req: Request, res: Response) => {
	try {
		const params = req.body as ClickCallbackParams
		const action = parseInt(String(params.action || '0'))

		console.log(
			`🔔 [CLICK] Callback received - Action: ${action}, Order: ${params.merchant_trans_id}`,
		)

		// Handle based on action
		if (action === 0) {
			// Prepare phase (validation only)
			const result = await handleClickPrepare(params)
			console.log(`✅ [CLICK] Prepare result:`, result)
			return res.status(200).json(result)
		} else if (action === 1) {
			// Complete phase (mark as paid)
			const result = await handleClickComplete(params)
			console.log(`✅ [CLICK] Complete result:`, result)
			return res.status(200).json(result)
		} else {
			console.error(`❌ [CLICK] Invalid action: ${action}`)
			return res.status(200).json({ error: -3, error_note: 'Invalid action' })
		}
	} catch (error) {
		console.error('❌ [CLICK] Callback error:', error)
		return res.status(200).json({ error: -9, error_note: 'Server error' })
	}
}

// ============================================================================
// PAYME CALLBACK (Production-ready JSON-RPC 2.0)
// ============================================================================

export const paymeCallback = async (req: Request, res: Response) => {
	try {
		// Verify Basic Auth
		const authHeader = req.headers.authorization
		if (!verifyPaymeAuth(authHeader)) {
			console.error('❌ [PAYME] Unauthorized request')
			return res.status(200).json({
				error: { code: -32504, message: 'Unauthorized' },
				id: req.body?.id || null,
			})
		}

		const { method, params, id } = req.body as PaymeRPCRequest

		console.log(`🔔 [PAYME] RPC received - Method: ${method}`)

		const ok = (result: any): PaymeRPCResponse => ({ result, id })
		const fail = (code: number, message: string): PaymeRPCResponse => ({
			error: {
				code,
				message: {
					uz: message,
					ru: message,
					en: message,
				},
			},
			id,
		})

		try {
			// Route to appropriate handler
			let result: any

			switch (method) {
				case 'CheckPerformTransaction':
					result = await handleCheckPerformTransaction(params)
					console.log(`✅ [PAYME] CheckPerformTransaction:`, result)
					return res.status(200).json(ok(result))

				case 'CreateTransaction':
					result = await handleCreateTransaction(params)
					console.log(`✅ [PAYME] CreateTransaction:`, result)
					return res.status(200).json(ok(result))

				case 'PerformTransaction':
					result = await handlePerformTransaction(params)
					console.log(`✅ [PAYME] PerformTransaction:`, result)
					return res.status(200).json(ok(result))

				case 'CancelTransaction':
					result = await handleCancelTransaction(params)
					console.log(`✅ [PAYME] CancelTransaction:`, result)
					return res.status(200).json(ok(result))

				case 'CheckTransaction':
					result = await handleCheckTransaction(params)
					console.log(`✅ [PAYME] CheckTransaction:`, result)
					return res.status(200).json(ok(result))

				case 'GetStatement':
					result = await handleGetStatement(params)
					console.log(`✅ [PAYME] GetStatement:`, result)
					return res.status(200).json(ok(result))

				default:
					console.error(`❌ [PAYME] Unknown method: ${method}`)
					return res.status(200).json(fail(-32601, 'Method not found'))
			}
		} catch (serviceError: any) {
			// Service layer threw structured error
			if (serviceError.code && serviceError.message) {
				console.error(`❌ [PAYME] Service error:`, serviceError)
				return res.status(200).json(fail(serviceError.code, serviceError.message))
			}
			throw serviceError
		}
	} catch (error) {
		console.error('❌ [PAYME] Callback error:', error)
		return res.status(200).json({
			error: { code: -32400, message: 'Internal error' },
			id: req.body?.id || null,
		})
	}
}
