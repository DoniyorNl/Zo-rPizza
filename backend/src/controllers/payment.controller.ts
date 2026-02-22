// Stripe to'lov: PaymentIntent yaratish va webhook
import { Request, Response } from 'express'
import Stripe from 'stripe'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/firebase-auth.middleware'

async function getCurrentDbUser(firebaseUid?: string) {
	if (!firebaseUid) return null
	return prisma.user.findFirst({ where: { firebaseUid }, select: { id: true } })
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe =
	typeof stripeSecretKey === 'string' && stripeSecretKey.length > 0
		? new Stripe(stripeSecretKey)
		: null

const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase()
const isZeroDecimal = ['jpy', 'krw', 'uzs'].includes(STRIPE_CURRENCY)

/**
 * POST /api/payment/create-intent
 * Buyurtma uchun Stripe PaymentIntent yaratadi, order ga payment_intent_id yozadi.
 */
export const createPaymentIntent = async (req: Request, res: Response) => {
	if (!stripe) {
		return res.status(503).json({
			success: false,
			message: 'Stripe sozlanmagan. STRIPE_SECRET_KEY ni .env ga qo\'ying.',
		})
	}

	try {
		const authReq = req as AuthRequest
		const firebaseUid = authReq.userId
		if (!firebaseUid) {
			return res.status(401).json({ success: false, message: 'Avtorizatsiya kerak' })
		}

		const dbUser = await getCurrentDbUser(firebaseUid)
		if (!dbUser) {
			return res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi' })
		}

		const { orderId } = req.body
		if (!orderId || typeof orderId !== 'string') {
			return res.status(400).json({ success: false, message: 'orderId kerak' })
		}

		const order = await prisma.order.findFirst({
			where: { id: orderId, userId: dbUser.id },
		})
		if (!order) {
			return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' })
		}
		if (order.paymentStatus === 'PAID') {
			return res.status(400).json({ success: false, message: 'Buyurtma allaqachon to\'langan' })
		}
		if (order.paymentMethod !== 'CARD') {
			return res.status(400).json({ success: false, message: 'To\'lov usuli karta emas' })
		}

		const amountMajor = Number(order.totalPrice)
		const amount = isZeroDecimal ? Math.round(amountMajor) : Math.round(amountMajor * 100)
		if (amount <= 0) {
			return res.status(400).json({ success: false, message: 'Summa noto\'g\'ri' })
		}

		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency: STRIPE_CURRENCY,
			metadata: {
				orderId: order.id,
				orderNumber: order.orderNumber,
			},
			automatic_payment_methods: { enabled: true },
		})

		await prisma.order.update({
			where: { id: order.id },
			data: { payment_intent_id: paymentIntent.id },
		})

		return res.status(200).json({
			success: true,
			data: {
				clientSecret: paymentIntent.client_secret,
				paymentIntentId: paymentIntent.id,
			},
		})
	} catch (error) {
		console.error('createPaymentIntent error:', error)
		return res.status(500).json({
			success: false,
			message: error instanceof Error ? error.message : 'To\'lov intent yaratilmadi',
		})
	}
}

/**
 * POST /api/payment/webhook
 * Stripe webhook: payment_intent.succeeded da Order.paymentStatus ni PAID qiladi.
 * Raw body kerak – server da express.raw() bilan ulash.
 */
export const stripeWebhook = async (req: Request, res: Response) => {
	const sig = req.headers['stripe-signature']
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
	if (!webhookSecret || !sig) {
		return res.status(400).send('Webhook secret yoki imzo yo\'q')
	}
	if (!stripe) {
		return res.status(503).send('Stripe sozlanmagan')
	}

	// req.body raw Buffer bo'lishi kerak (express.raw() bilan)
	const rawBody = req.body
	if (!(rawBody instanceof Buffer)) {
		return res.status(400).send('Raw body kerak')
	}

	let event: Stripe.Event
	try {
		event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Unknown'
		console.error('Stripe webhook signature error:', msg)
		return res.status(400).send(`Webhook Error: ${msg}`)
	}

	if (event.type !== 'payment_intent.succeeded') {
		return res.status(200).send('OK')
	}

	const paymentIntent = event.data.object as Stripe.PaymentIntent
	const paymentIntentId = paymentIntent.id

	try {
		const order = await prisma.order.findFirst({
			where: { payment_intent_id: paymentIntentId },
		})
		if (!order) {
			console.warn('Stripe webhook: order topilmadi, payment_intent_id=', paymentIntentId)
			return res.status(200).send('OK')
		}
		if (order.paymentStatus === 'PAID') {
			return res.status(200).send('OK')
		}

		await prisma.order.update({
			where: { id: order.id },
			data: { paymentStatus: 'PAID' },
		})
		return res.status(200).send('OK')
	} catch (error) {
		console.error('Stripe webhook order update error:', error)
		return res.status(500).send('Server error')
	}
}
