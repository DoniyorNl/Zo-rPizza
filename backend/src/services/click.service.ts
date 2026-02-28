// backend/src/services/click.service.ts
// 💳 CLICK.UZ Payment Integration (Production-ready)

import crypto from 'crypto'
import prisma from '../lib/prisma'

// ============================================================================
// CLICK CONFIG
// ============================================================================
const CLICK_SERVICE_ID = process.env.CLICK_SERVICE_ID
const CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID
const CLICK_SECRET_KEY = process.env.CLICK_SECRET_KEY // For signature verification
const FRONTEND_URL = process.env.FRONTEND_URLS?.split(',')[0] || 'http://localhost:3000'

if (!CLICK_SERVICE_ID || !CLICK_MERCHANT_ID) {
	console.warn('⚠️  CLICK credentials not configured. Click payments will use simulation mode.')
}

// ============================================================================
// CLICK URL GENERATION
// ============================================================================

export interface CreateClickURLParams {
	orderId: string
	amount: number
	orderNumber: string
}

/**
 * Generate Click payment URL
 */
export const createClickPaymentURL = (params: CreateClickURLParams): string => {
	const { orderId, amount, orderNumber } = params

	// If credentials not set, return simulation URL
	if (!CLICK_SERVICE_ID || !CLICK_MERCHANT_ID) {
		const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'
		return `${backendUrl}/api/payments/simulate/click/${orderId}`
	}

	const returnUrl = `${FRONTEND_URL}/checkout/success?orderId=${encodeURIComponent(orderId)}&orderNumber=${encodeURIComponent(orderNumber)}&paid=1&provider=CLICK`

	const clickUrl = new URL('https://my.click.uz/services/pay')
	clickUrl.searchParams.set('service_id', CLICK_SERVICE_ID)
	clickUrl.searchParams.set('merchant_id', CLICK_MERCHANT_ID)
	clickUrl.searchParams.set('amount', String(Math.round(amount)))
	clickUrl.searchParams.set('transaction_param', orderId)
	clickUrl.searchParams.set('return_url', returnUrl)

	return clickUrl.toString()
}

// ============================================================================
// CLICK SIGNATURE VERIFICATION
// ============================================================================

/**
 * Verify Click callback signature
 * Click sends: sign_string = md5(click_trans_id + service_id + secret_key + merchant_trans_id + amount + action + sign_time)
 */
export const verifyClickSignature = (params: {
	click_trans_id: string
	service_id: string
	merchant_trans_id: string
	amount: string
	action: string
	sign_time: string
	sign_string: string
}): boolean => {
	if (!CLICK_SECRET_KEY) {
		console.warn('⚠️  CLICK_SECRET_KEY not set. Signature verification skipped.')
		return true // Skip verification in dev mode
	}

	const {
		click_trans_id,
		service_id,
		merchant_trans_id,
		amount,
		action,
		sign_time,
		sign_string,
	} = params

	// Reconstruct signature string
	const signatureString = `${click_trans_id}${service_id}${CLICK_SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`
	const expectedSignature = crypto.createHash('md5').update(signatureString).digest('hex')

	return expectedSignature === sign_string
}

// ============================================================================
// CLICK CALLBACK HANDLERS
// ============================================================================

export interface ClickCallbackParams {
	click_trans_id: string
	service_id: string
	click_paydoc_id: string
	merchant_trans_id: string // orderId
	amount: string
	action: string // 0 = prepare, 1 = complete
	error: string // 0 = success, negative = error
	error_note?: string
	sign_time: string
	sign_string: string
}

/**
 * Handle Click Prepare callback (action = 0)
 */
export const handleClickPrepare = async (params: ClickCallbackParams) => {
	const { merchant_trans_id: orderId, amount, click_trans_id, error } = params

	// Verify signature
	if (!verifyClickSignature(params)) {
		console.error('❌ [CLICK] Invalid signature')
		return { error: -1, error_note: 'SIGN CHECK FAILED' }
	}

	// Check if order exists
	const order = await prisma.order.findUnique({
		where: { id: orderId },
		select: { id: true, totalPrice: true, paymentStatus: true },
	})

	if (!order) {
		return { error: -5, error_note: 'Order not found' }
	}

	// Check if already paid
	if (order.paymentStatus === 'PAID') {
		return { error: -4, error_note: 'Already paid' }
	}

	// Check amount
	const expectedAmount = Math.round(order.totalPrice)
	const receivedAmount = Math.round(parseFloat(amount))

	if (expectedAmount !== receivedAmount) {
		return { error: -2, error_note: 'Incorrect amount' }
	}

	// If error from Click side
	if (error !== '0') {
		return { error: parseInt(error), error_note: params.error_note || 'Payment error' }
	}

	// Success - update payment
	const payment = await prisma.payment.findFirst({
		where: { orderId: order.id, provider: 'CLICK' },
		orderBy: { createdAt: 'desc' },
	})

	if (payment) {
		await prisma.payment.update({
			where: { id: payment.id },
			data: {
				externalId: click_trans_id,
				metadata: params as any,
			},
		})
	}

	return {
		click_trans_id,
		merchant_trans_id: orderId,
		merchant_prepare_id: payment?.id || orderId,
		error: 0,
		error_note: 'Success',
	}
}

/**
 * Handle Click Complete callback (action = 1)
 */
export const handleClickComplete = async (params: ClickCallbackParams) => {
	const { merchant_trans_id: orderId, click_trans_id, error } = params

	// Verify signature
	if (!verifyClickSignature(params)) {
		console.error('❌ [CLICK] Invalid signature')
		return { error: -1, error_note: 'SIGN CHECK FAILED' }
	}

	// If error from Click side
	if (error !== '0') {
		return { error: parseInt(error), error_note: params.error_note || 'Payment error' }
	}

	// Find payment and mark as paid
	const payment = await prisma.payment.findFirst({
		where: { orderId, provider: 'CLICK' },
		orderBy: { createdAt: 'desc' },
	})

	if (!payment) {
		return { error: -6, error_note: 'Transaction not found' }
	}

	if (payment.status === 'PAID') {
		// Already paid, return success
		return {
			click_trans_id,
			merchant_trans_id: orderId,
			merchant_confirm_id: payment.id,
			error: 0,
			error_note: 'Success',
		}
	}

	// Mark as paid
	await prisma.$transaction([
		prisma.payment.update({
			where: { id: payment.id },
			data: {
				status: 'PAID',
				paidAt: new Date(),
				externalId: click_trans_id,
				metadata: params as any,
			},
		}),
		prisma.order.update({
			where: { id: orderId },
			data: { paymentStatus: 'PAID' },
		}),
	])

	console.log('✅ [CLICK] Payment completed:', click_trans_id)

	return {
		click_trans_id,
		merchant_trans_id: orderId,
		merchant_confirm_id: payment.id,
		error: 0,
		error_note: 'Success',
	}
}
