// backend/src/controllers/push.controller.ts
// 🔔 PUSH NOTIFICATION CONTROLLER

import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/firebase-auth.middleware'

// ============================================================================
// SUBSCRIBE TO PUSH NOTIFICATIONS
// ============================================================================

/**
 * POST /api/push/subscribe
 * Subscribe to push notifications
 */
export const subscribeToPush = async (req: Request, res: Response) => {
	try {
		const { endpoint, keys, userAgent } = req.body
		const authReq = req as AuthRequest
		const userId = authReq.userId

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'Unauthorized',
			})
		}

		if (!endpoint || !keys?.p256dh || !keys?.auth) {
			return res.status(400).json({
				success: false,
				message: 'Invalid subscription data',
			})
		}

		// Check if subscription already exists
		const existing = await prisma.pushSubscription.findUnique({
			where: { endpoint },
		})

		if (existing) {
			// Update existing subscription
			const updated = await prisma.pushSubscription.update({
				where: { endpoint },
				data: {
					userId,
					p256dh: keys.p256dh,
					auth: keys.auth,
					userAgent,
					isActive: true,
					lastUsedAt: new Date(),
				},
			})

			console.log('✅ [PUSH] Subscription updated:', userId)

			return res.status(200).json({
				success: true,
				message: 'Subscription updated',
				data: { id: updated.id },
			})
		}

		// Create new subscription
		const subscription = await prisma.pushSubscription.create({
			data: {
				userId,
				endpoint,
				p256dh: keys.p256dh,
				auth: keys.auth,
				userAgent,
			},
		})

		console.log('✅ [PUSH] New subscription:', userId)

		return res.status(201).json({
			success: true,
			message: 'Subscription created',
			data: { id: subscription.id },
		})
	} catch (error) {
		console.error('❌ [PUSH] Subscribe error:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
		})
	}
}

// ============================================================================
// UNSUBSCRIBE FROM PUSH NOTIFICATIONS
// ============================================================================

/**
 * POST /api/push/unsubscribe
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPush = async (req: Request, res: Response) => {
	try {
		const { endpoint } = req.body
		const authReq = req as AuthRequest
		const userId = authReq.userId

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'Unauthorized',
			})
		}

		if (!endpoint) {
			return res.status(400).json({
				success: false,
				message: 'Endpoint required',
			})
		}

		// Mark subscription as inactive
		await prisma.pushSubscription.updateMany({
			where: {
				endpoint,
				userId,
			},
			data: {
				isActive: false,
			},
		})

		console.log('✅ [PUSH] Unsubscribed:', userId)

		return res.status(200).json({
			success: true,
			message: 'Unsubscribed',
		})
	} catch (error) {
		console.error('❌ [PUSH] Unsubscribe error:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
		})
	}
}

// ============================================================================
// GET USER'S SUBSCRIPTIONS
// ============================================================================

/**
 * GET /api/push/subscriptions
 * Get current user's push subscriptions
 */
export const getUserSubscriptions = async (req: Request, res: Response) => {
	try {
		const authReq = req as AuthRequest
		const userId = authReq.userId

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'Unauthorized',
			})
		}

		const subscriptions = await prisma.pushSubscription.findMany({
			where: {
				userId,
				isActive: true,
			},
			select: {
				id: true,
				endpoint: true,
				userAgent: true,
				createdAt: true,
				lastUsedAt: true,
			},
			orderBy: {
				lastUsedAt: 'desc',
			},
		})

		return res.status(200).json({
			success: true,
			data: subscriptions,
		})
	} catch (error) {
		console.error('❌ [PUSH] Get subscriptions error:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
		})
	}
}

// ============================================================================
// GET VAPID PUBLIC KEY
// ============================================================================

/**
 * GET /api/push/vapid-public-key
 * Get VAPID public key for frontend
 */
export const getVapidPublicKey = async (req: Request, res: Response) => {
	try {
		const publicKey = process.env.VAPID_PUBLIC_KEY

		if (!publicKey) {
			return res.status(503).json({
				success: false,
				message: 'Push notifications not configured',
			})
		}

		return res.status(200).json({
			success: true,
			data: { publicKey },
		})
	} catch (error) {
		console.error('❌ [PUSH] Get VAPID key error:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
		})
	}
}

// ============================================================================
// ADMIN: SEND TEST NOTIFICATION
// ============================================================================

/**
 * POST /api/push/test
 * Send test notification (admin only)
 */
export const sendTestNotification = async (req: Request, res: Response) => {
	try {
		const authReq = req as AuthRequest
		const userId = authReq.userId

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'Unauthorized',
			})
		}

		// Get user's active subscriptions
		const subscriptions = await prisma.pushSubscription.findMany({
			where: {
				userId,
				isActive: true,
			},
		})

		if (subscriptions.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'No active subscriptions found',
			})
		}

		// Send test notification
		const { sendPushNotification } = await import('../services/push.service')

		const results = await Promise.allSettled(
			subscriptions.map(sub =>
				sendPushNotification(
					{
						endpoint: sub.endpoint,
						keys: {
							p256dh: sub.p256dh,
							auth: sub.auth,
						},
					},
					{
						title: '🍕 Test Notification',
						body: 'Push notifications are working!',
						icon: '/icons/icon-192.png',
						data: {
							type: 'test',
							url: '/',
						},
					},
				),
			),
		)

		const successCount = results.filter(r => r.status === 'fulfilled').length

		return res.status(200).json({
			success: true,
			message: `Sent ${successCount}/${subscriptions.length} notifications`,
		})
	} catch (error) {
		console.error('❌ [PUSH] Test notification error:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
		})
	}
}
