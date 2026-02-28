// backend/src/services/push.service.ts
// 🔔 PUSH NOTIFICATION SERVICE - Web Push API

import webPush from 'web-push'

// ============================================================================
// WEB PUSH CONFIGURATION
// ============================================================================

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@zorpizza.com'

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
	console.warn('⚠️  VAPID keys not found. Push notifications will be simulated.')
	console.warn('   Generate keys: npx web-push generate-vapid-keys')
} else {
	webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
	console.log('✅ [PUSH] Web Push configured')
}

// ============================================================================
// TYPES
// ============================================================================

export interface PushSubscription {
	endpoint: string
	keys: {
		p256dh: string
		auth: string
	}
}

export interface PushPayload {
	title: string
	body: string
	icon?: string
	badge?: string
	data?: Record<string, any>
	actions?: Array<{
		action: string
		title: string
		icon?: string
	}>
}

// ============================================================================
// PUSH NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Send push notification to a single subscription
 */
export const sendPushNotification = async (
	subscription: PushSubscription,
	payload: PushPayload,
): Promise<boolean> => {
	try {
		if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
			console.log('🔔 [PUSH SIMULATION]', payload.title)
			return true
		}

		const notificationPayload = JSON.stringify({
			title: payload.title,
			body: payload.body,
			icon: payload.icon || '/icons/icon-192.png',
			badge: payload.badge || '/icons/icon-192.png',
			data: payload.data,
			actions: payload.actions,
		})

		await webPush.sendNotification(subscription, notificationPayload)

		console.log('✅ [PUSH SENT]', payload.title)
		return true
	} catch (error: any) {
		// Check if subscription is invalid (expired or unsubscribed)
		if (error.statusCode === 410 || error.statusCode === 404) {
			console.log('⚠️  [PUSH] Subscription expired:', subscription.endpoint)
			// TODO: Remove this subscription from database
			return false
		}

		console.error('❌ [PUSH ERROR]', error)
		return false
	}
}

/**
 * Send push notification to multiple subscriptions
 */
export const sendPushToMultiple = async (
	subscriptions: PushSubscription[],
	payload: PushPayload,
): Promise<{ success: number; failed: number }> => {
	const results = await Promise.allSettled(
		subscriptions.map(sub => sendPushNotification(sub, payload)),
	)

	const success = results.filter(r => r.status === 'fulfilled' && r.value === true).length
	const failed = results.length - success

	console.log(`📊 [PUSH] Sent ${success}/${results.length} notifications`)

	return { success, failed }
}

// ============================================================================
// ORDER-SPECIFIC PUSH NOTIFICATIONS
// ============================================================================

/**
 * Send order confirmation push
 */
export const sendOrderConfirmationPush = async (
	subscription: PushSubscription,
	orderData: {
		orderNumber: string
		orderId: string
		totalPrice: number
	},
): Promise<boolean> => {
	return sendPushNotification(subscription, {
		title: '✅ Buyurtma tasdiqlandi',
		body: `Buyurtma ${orderData.orderNumber} qabul qilindi. Tayyorlanmoqda...`,
		icon: '/icons/icon-192.png',
		data: {
			type: 'order_confirmed',
			orderId: orderData.orderId,
			url: `/tracking/${orderData.orderId}`,
		},
		actions: [
			{
				action: 'track',
				title: 'Kuzatish',
			},
		],
	})
}

/**
 * Send order status update push
 */
export const sendOrderStatusPush = async (
	subscription: PushSubscription,
	orderData: {
		orderNumber: string
		orderId: string
		status: string
		statusText: string
		message: string
	},
): Promise<boolean> => {
	const statusEmojis: Record<string, string> = {
		CONFIRMED: '✅',
		PREPARING: '👨‍🍳',
		OUT_FOR_DELIVERY: '🚗',
		DELIVERED: '🎉',
		CANCELLED: '❌',
	}

	const emoji = statusEmojis[orderData.status] || '📦'

	return sendPushNotification(subscription, {
		title: `${emoji} ${orderData.statusText}`,
		body: orderData.message,
		icon: '/icons/icon-192.png',
		data: {
			type: 'order_status_update',
			orderId: orderData.orderId,
			status: orderData.status,
			url: `/tracking/${orderData.orderId}`,
		},
		actions: [
			{
				action: 'track',
				title: 'Kuzatish',
			},
		],
	})
}

/**
 * Send driver near notification
 */
export const sendDriverNearPush = async (
	subscription: PushSubscription,
	orderData: {
		orderNumber: string
		orderId: string
		estimatedMinutes: number
	},
): Promise<boolean> => {
	return sendPushNotification(subscription, {
		title: '🚗 Haydovchi yaqinlashdi',
		body: `Buyurtmangiz ${orderData.estimatedMinutes} daqiqada yetib keladi!`,
		icon: '/icons/icon-192.png',
		data: {
			type: 'driver_near',
			orderId: orderData.orderId,
			url: `/tracking/${orderData.orderId}`,
		},
		actions: [
			{
				action: 'track',
				title: 'Xaritada ko\'rish',
			},
		],
	})
}

/**
 * Send order delivered notification
 */
export const sendOrderDeliveredPush = async (
	subscription: PushSubscription,
	orderData: {
		orderNumber: string
		orderId: string
	},
): Promise<boolean> => {
	return sendPushNotification(subscription, {
		title: '🎉 Buyurtma yetkazildi',
		body: 'Ishtahangiz ochsin! Bizni tanlaganingiz uchun rahmat.',
		icon: '/icons/icon-192.png',
		data: {
			type: 'order_delivered',
			orderId: orderData.orderId,
			url: `/orders/${orderData.orderId}`,
		},
		actions: [
			{
				action: 'rate',
				title: 'Baho berish',
			},
		],
	})
}

/**
 * Send new deal notification
 */
export const sendNewDealPush = async (
	subscriptions: PushSubscription[],
	dealData: {
		title: string
		discount: number
		dealId: string
	},
): Promise<void> => {
	await sendPushToMultiple(subscriptions, {
		title: '🎁 Yangi chegirma!',
		body: `${dealData.title} - ${dealData.discount}% chegirma`,
		icon: '/icons/icon-192.png',
		data: {
			type: 'new_deal',
			dealId: dealData.dealId,
			url: `/deals`,
		},
		actions: [
			{
				action: 'view',
				title: 'Ko\'rish',
			},
		],
	})
}

// ============================================================================
// HELPER: Get Status Message in Uzbek
// ============================================================================
export const getStatusMessage = (status: string): string => {
	const messageMap: Record<string, string> = {
		CONFIRMED: "Buyurtmangiz tasdiqlandi! Oshxonamiz pizza'ngizni tayyorlashni boshladi.",
		PREPARING: 'Buyurtmangiz tayyorlanmoqda. Tez orada haydovchimiz yo\'lga chiqadi.',
		OUT_FOR_DELIVERY: "Buyurtmangiz yo'lda! Haydovchimiz sizga yetkazib bermoqda.",
		DELIVERED: 'Buyurtmangiz yetkazildi! Ishtahangiz ochsin! Bizni tanlaganingiz uchun rahmat.',
		CANCELLED: "Buyurtmangiz bekor qilindi. Agar bu xato bo'lsa, iltimos biz bilan bog'laning.",
	}
	return messageMap[status] || 'Buyurtma holati yangilandi.'
}

export const getStatusText = (status: string): string => {
	const statusMap: Record<string, string> = {
		PENDING: 'Kutilmoqda',
		CONFIRMED: 'Tasdiqlandi',
		PREPARING: 'Tayyorlanmoqda',
		OUT_FOR_DELIVERY: "Yo'lda",
		DELIVERED: 'Yetkazildi',
		CANCELLED: 'Bekor qilindi',
	}
	return statusMap[status] || status
}
