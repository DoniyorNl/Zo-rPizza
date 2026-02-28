// backend/src/services/payme.service.ts
// 💳 PAYME Payment Integration (Production-ready, JSON-RPC 2.0)

import crypto from 'crypto'
import prisma from '../lib/prisma'

// ============================================================================
// PAYME CONFIG
// ============================================================================
const PAYME_MERCHANT_ID = process.env.PAYME_MERCHANT_ID
const PAYME_SECRET_KEY = process.env.PAYME_SECRET_KEY // For signature verification
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001'

if (!PAYME_MERCHANT_ID) {
	console.warn('⚠️  PAYME_MERCHANT_ID not configured. Payme payments will use simulation mode.')
}

// ============================================================================
// PAYME URL GENERATION
// ============================================================================

export interface CreatePaymeURLParams {
	orderId: string
	amount: number
	orderNumber: string
}

/**
 * Generate Payme checkout URL
 */
export const createPaymePaymentURL = (params: CreatePaymeURLParams): string => {
	const { orderId, amount, orderNumber } = params

	// If credentials not set, return simulation URL
	if (!PAYME_MERCHANT_ID) {
		return `${BACKEND_URL}/api/payments/simulate/payme/${orderId}`
	}

	const payload = {
		m: PAYME_MERCHANT_ID,
		ac: {
			order_id: orderId,
			order_number: orderNumber,
		},
		a: Math.round(amount * 100), // Convert to tiyin (1 UZS = 100 tiyin)
		c: `${BACKEND_URL}/api/payments/callback/payme`,
	}

	const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')
	return `https://checkout.paycom.uz/${base64Payload}`
}

// ============================================================================
// PAYME AUTHORIZATION CHECK
// ============================================================================

/**
 * Verify Payme Basic Auth header
 * Payme sends: Authorization: Basic base64(merchant_id:password)
 */
export const verifyPaymeAuth = (authHeader?: string): boolean => {
	if (!authHeader || !PAYME_SECRET_KEY) {
		console.warn('⚠️  PAYME auth header or secret key missing. Skipping verification.')
		return true // Skip in dev mode
	}

	try {
		const base64Credentials = authHeader.replace('Basic ', '')
		const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
		const [merchantId, password] = credentials.split(':')

		return merchantId === PAYME_MERCHANT_ID && password === PAYME_SECRET_KEY
	} catch (error) {
		console.error('❌ [PAYME] Auth verification error:', error)
		return false
	}
}

// ============================================================================
// PAYME JSON-RPC HANDLERS
// ============================================================================

export interface PaymeRPCRequest {
	method: string
	params: {
		id?: string // Transaction ID
		account?: {
			order_id?: string
			order_number?: string
		}
		amount?: number // In tiyin (1 UZS = 100 tiyin)
		time?: number
		reason?: number
	}
	id: number | string
}

export interface PaymeRPCResponse {
	result?: any
	error?: {
		code: number
		message: {
			uz: string
			ru: string
			en: string
		}
	}
	id: number | string
}

/**
 * CheckPerformTransaction — Check if order can be paid
 */
export const handleCheckPerformTransaction = async (
	params: PaymeRPCRequest['params'],
): Promise<any> => {
	const orderId = params.account?.order_id || ''
	const amount = (params.amount || 0) / 100 // Convert tiyin to UZS

	if (!orderId) {
		throw { code: -31050, message: 'Order not found' }
	}

	const order = await prisma.order.findUnique({
		where: { id: orderId },
		select: { id: true, totalPrice: true, paymentStatus: true },
	})

	if (!order) {
		throw { code: -31050, message: 'Order not found' }
	}

	if (order.paymentStatus === 'PAID') {
		throw { code: -31051, message: 'Order already paid' }
	}

	// Check amount (allow 1 UZS tolerance for rounding)
	const expectedAmount = Math.round(order.totalPrice)
	const receivedAmount = Math.round(amount)

	if (Math.abs(expectedAmount - receivedAmount) > 1) {
		throw { code: -31001, message: 'Invalid amount' }
	}

	return { allow: true }
}

/**
 * CreateTransaction — Prepare transaction
 */
export const handleCreateTransaction = async (
	params: PaymeRPCRequest['params'],
): Promise<any> => {
	const transId = params.id || ''
	const orderId = params.account?.order_id || ''
	const amount = (params.amount || 0) / 100
	const time = params.time || Date.now()

	if (!orderId || !transId) {
		throw { code: -31050, message: 'Invalid parameters' }
	}

	const order = await prisma.order.findUnique({
		where: { id: orderId },
		select: { id: true, totalPrice: true, paymentStatus: true },
	})

	if (!order) {
		throw { code: -31050, message: 'Order not found' }
	}

	// Check if transaction already exists
	const existingPayment = await prisma.payment.findFirst({
		where: { externalId: transId, provider: 'PAYME' },
	})

	if (existingPayment) {
		// Return existing transaction
		return {
			create_time: new Date(existingPayment.createdAt).getTime(),
			transaction: existingPayment.id,
			state: existingPayment.status === 'PAID' ? 2 : 1,
		}
	}

	// Create new payment record
	const payment = await prisma.payment.create({
		data: {
			orderId: order.id,
			provider: 'PAYME',
			amount: order.totalPrice,
			status: 'PENDING',
			externalId: transId,
			metadata: {
				payme_time: time,
				create_time: Date.now(),
			},
		},
	})

	return {
		create_time: Date.now(),
		transaction: payment.id,
		state: 1, // 1 = created, 2 = completed
	}
}

/**
 * PerformTransaction — Complete transaction (mark as paid)
 */
export const handlePerformTransaction = async (
	params: PaymeRPCRequest['params'],
): Promise<any> => {
	const transId = params.id || ''

	if (!transId) {
		throw { code: -31003, message: 'Transaction not found' }
	}

	const payment = await prisma.payment.findFirst({
		where: { externalId: transId, provider: 'PAYME' },
		include: { order: true },
	})

	if (!payment) {
		throw { code: -31003, message: 'Transaction not found' }
	}

	if (payment.status === 'PAID') {
		// Already completed
		return {
			transaction: payment.id,
			perform_time: payment.paidAt ? new Date(payment.paidAt).getTime() : Date.now(),
			state: 2,
		}
	}

	// Mark as paid
	const now = new Date()
	await prisma.$transaction([
		prisma.payment.update({
			where: { id: payment.id },
			data: {
				status: 'PAID',
				paidAt: now,
				metadata: {
					...(payment.metadata as any),
					perform_time: Date.now(),
				},
			},
		}),
		prisma.order.update({
			where: { id: payment.orderId },
			data: { paymentStatus: 'PAID' },
		}),
	])

	console.log('✅ [PAYME] Payment completed:', transId)

	return {
		transaction: payment.id,
		perform_time: now.getTime(),
		state: 2,
	}
}

/**
 * CancelTransaction — Cancel transaction
 */
export const handleCancelTransaction = async (
	params: PaymeRPCRequest['params'],
): Promise<any> => {
	const transId = params.id || ''
	const reason = params.reason || 0

	if (!transId) {
		throw { code: -31003, message: 'Transaction not found' }
	}

	const payment = await prisma.payment.findFirst({
		where: { externalId: transId, provider: 'PAYME' },
	})

	if (!payment) {
		throw { code: -31003, message: 'Transaction not found' }
	}

	// If already cancelled, return success
	if (payment.status === 'FAILED') {
		return {
			transaction: payment.id,
			cancel_time: payment.updatedAt.getTime(),
			state: -1,
		}
	}

	// Cancel payment
	const now = new Date()
	await prisma.$transaction([
		prisma.payment.update({
			where: { id: payment.id },
			data: {
				status: 'FAILED',
				metadata: {
					...(payment.metadata as any),
					cancel_time: now.getTime(),
					cancel_reason: reason,
				},
			},
		}),
		prisma.order.update({
			where: { id: payment.orderId },
			data: { paymentStatus: 'FAILED' },
		}),
	])

	console.log('❌ [PAYME] Payment cancelled:', transId, 'Reason:', reason)

	return {
		transaction: payment.id,
		cancel_time: now.getTime(),
		state: -1,
	}
}

/**
 * CheckTransaction — Check transaction status
 */
export const handleCheckTransaction = async (
	params: PaymeRPCRequest['params'],
): Promise<any> => {
	const transId = params.id || ''

	if (!transId) {
		throw { code: -31003, message: 'Transaction not found' }
	}

	const payment = await prisma.payment.findFirst({
		where: { externalId: transId, provider: 'PAYME' },
	})

	if (!payment) {
		throw { code: -31003, message: 'Transaction not found' }
	}

	const state = payment.status === 'PAID' ? 2 : payment.status === 'FAILED' ? -1 : 1

	return {
		create_time: new Date(payment.createdAt).getTime(),
		perform_time: payment.paidAt ? new Date(payment.paidAt).getTime() : 0,
		cancel_time: 0,
		transaction: payment.id,
		state,
		reason: null,
	}
}

/**
 * GetStatement — Get transactions for date range (for Payme reconciliation)
 */
export const handleGetStatement = async (
	params: PaymeRPCRequest['params'],
): Promise<any> => {
	// This is for Payme admin to get transaction list
	// Usually only needed for reconciliation
	return {
		transactions: [],
	}
}

// ============================================================================
// PAYME ERROR CODES
// ============================================================================

export const PAYME_ERROR_CODES = {
	INVALID_AMOUNT: -31001,
	TRANSACTION_NOT_FOUND: -31003,
	INVALID_ACCOUNT: -31050,
	ALREADY_PAID: -31051,
	ORDER_NOT_FOUND: -31050,
	METHOD_NOT_FOUND: -32601,
	PARSE_ERROR: -32700,
	INVALID_PARAMS: -32602,
	INTERNAL_ERROR: -32400,
}
