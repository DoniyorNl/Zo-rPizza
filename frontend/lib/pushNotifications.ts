// frontend/lib/pushNotifications.ts
// 🔔 PUSH NOTIFICATIONS - Web Push API Client

import { api } from './apiClient'

// ============================================================================
// CONFIGURATION
// ============================================================================

let vapidPublicKey: string | null = null

/**
 * Check if push notifications are supported
 */
export const isPushSupported = (): boolean => {
	return (
		typeof window !== 'undefined' &&
		'serviceWorker' in navigator &&
		'PushManager' in window &&
		'Notification' in window
	)
}

/**
 * Check notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
	if (!isPushSupported()) return 'denied'
	return Notification.permission
}

// ============================================================================
// VAPID PUBLIC KEY
// ============================================================================

/**
 * Get VAPID public key from backend
 */
const getVapidPublicKey = async (): Promise<string> => {
	if (vapidPublicKey) return vapidPublicKey

	try {
		const response = await api.get('/api/push/vapid-public-key')
		if (response.data.success) {
			const key = response.data.data?.publicKey
			if (typeof key === 'string') {
				vapidPublicKey = key
				return key
			}
		}
		throw new Error('Failed to get VAPID key')
	} catch (error) {
		console.error('❌ [PUSH] Failed to get VAPID key:', error)
		throw error
	}
}

// ============================================================================
// SERVICE WORKER REGISTRATION
// ============================================================================

/**
 * Register service worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
	if (!isPushSupported()) {
		console.warn('⚠️  [PUSH] Push notifications not supported')
		return null
	}

	try {
		const registration = await navigator.serviceWorker.register('/sw.js', {
			scope: '/',
		})

		console.log('✅ [PUSH] Service worker registered')
		return registration
	} catch (error) {
		console.error('❌ [PUSH] Service worker registration failed:', error)
		return null
	}
}

// ============================================================================
// PUSH SUBSCRIPTION
// ============================================================================

/**
 * Convert base64 URL-safe string to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

	const rawData = window.atob(base64)
	const outputArray = new Uint8Array(rawData.length)

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i)
	}
	return outputArray
}

/**
 * Subscribe to push notifications
 */
export const subscribeToPush = async (): Promise<boolean> => {
	if (!isPushSupported()) {
		console.warn('⚠️  [PUSH] Push notifications not supported')
		return false
	}

	try {
		// 1. Request notification permission
		const permission = await Notification.requestPermission()
		
		if (permission !== 'granted') {
			console.log('⚠️  [PUSH] Permission denied')
			return false
		}

		// 2. Get service worker registration
		let registration = await navigator.serviceWorker.getRegistration('/')
		
		if (!registration) {
			registration = (await registerServiceWorker()) ?? undefined
		}

		if (!registration) {
			throw new Error('Service worker not available')
		}

		// 3. Get VAPID public key
		const vapidKey = await getVapidPublicKey()

		// 4. Subscribe to push
		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
		})

		// 5. Send subscription to backend
		const subscriptionJson = subscription.toJSON()
		
		await api.post('/api/push/subscribe', {
			endpoint: subscription.endpoint,
			keys: {
				p256dh: subscriptionJson.keys?.p256dh,
				auth: subscriptionJson.keys?.auth,
			},
			userAgent: navigator.userAgent,
		})

		console.log('✅ [PUSH] Subscribed successfully')
		
		// Store in localStorage for UI state
		localStorage.setItem('push_notifications_enabled', 'true')
		
		return true
	} catch (error) {
		console.error('❌ [PUSH] Subscription failed:', error)
		return false
	}
}

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPush = async (): Promise<boolean> => {
	if (!isPushSupported()) return false

	try {
		const registration = await navigator.serviceWorker.getRegistration('/')
		
		if (!registration) return false

		const subscription = await registration.pushManager.getSubscription()
		
		if (!subscription) return true // Already unsubscribed

		// Unsubscribe from push manager
		await subscription.unsubscribe()

		// Notify backend
		try {
			await api.post('/api/push/unsubscribe', {
				endpoint: subscription.endpoint,
			})
		} catch (err) {
			console.error('Failed to notify backend:', err)
		}

		console.log('✅ [PUSH] Unsubscribed successfully')
		
		// Remove from localStorage
		localStorage.removeItem('push_notifications_enabled')
		
		return true
	} catch (error) {
		console.error('❌ [PUSH] Unsubscribe failed:', error)
		return false
	}
}

/**
 * Check if user is subscribed
 */
export const isSubscribed = async (): Promise<boolean> => {
	if (!isPushSupported()) return false

	try {
		const registration = await navigator.serviceWorker.getRegistration('/')
		
		if (!registration) return false

		const subscription = await registration.pushManager.getSubscription()
		
		return subscription !== null
	} catch (error) {
		console.error('❌ [PUSH] Check subscription failed:', error)
		return false
	}
}

/**
 * Test push notification
 */
export const testPushNotification = async (): Promise<boolean> => {
	try {
		const response = await api.post('/api/push/test')
		return response.data.success
	} catch (error) {
		console.error('❌ [PUSH] Test failed:', error)
		return false
	}
}

// ============================================================================
// AUTO-SUBSCRIBE ON LOGIN (HELPER)
// ============================================================================

/**
 * Auto-subscribe to push notifications if user previously enabled them
 */
export const autoSubscribeIfEnabled = async (): Promise<void> => {
	if (!isPushSupported()) return

	const wasEnabled = localStorage.getItem('push_notifications_enabled') === 'true'
	const permission = getNotificationPermission()

	if (wasEnabled && permission === 'granted') {
		const subscribed = await isSubscribed()
		
		if (!subscribed) {
			console.log('🔔 [PUSH] Auto-resubscribing...')
			await subscribeToPush()
		}
	}
}
