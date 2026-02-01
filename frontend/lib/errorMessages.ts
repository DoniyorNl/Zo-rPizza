// =====================================
// 📁 FILE PATH: frontend/lib/errorMessages.ts
// 💬 USER-FRIENDLY ERROR MESSAGES
// =====================================

/**
 * Error code to user-friendly message mapping
 * I18n ready - faqat uz tilda, lekin structure i18n uchun tayyor
 */
export const ERROR_MESSAGES: Record<string, string> = {
	// Authentication errors
	AUTH_REQUIRED: 'Tizimga kirish talab qilinadi',
	UNAUTHORIZED: 'Ruxsat yo\'q. Iltimos, tizimga kiring',
	FORBIDDEN: 'Bu amalni bajarish uchun ruxsatingiz yo\'q',
	TOKEN_EXPIRED: 'Sessiya muddati tugagan. Qaytadan kirish kerak',
	INVALID_TOKEN: 'Yaroqsiz token. Qaytadan kirish kerak',
	USER_NOT_FOUND: 'Foydalanuvchi topilmadi',
	USER_BLOCKED: 'Hisobingiz bloklangan. Administrator bilan bog\'laning',

	// Validation errors
	VALIDATION_ERROR: 'Ma\'lumotlar noto\'g\'ri formatda',
	INVALID_EMAIL: 'Email manzil noto\'g\'ri formatda',
	INVALID_PHONE: 'Telefon raqami noto\'g\'ri formatda',
	REQUIRED_FIELD: 'Bu maydon to\'ldirilishi shart',
	INVALID_PASSWORD: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',

	// Resource errors
	NOT_FOUND: 'Ma\'lumot topilmadi',
	PRODUCT_NOT_FOUND: 'Mahsulot topilmadi',
	ORDER_NOT_FOUND: 'Buyurtma topilmadi',
	CATEGORY_NOT_FOUND: 'Kategoriya topilmadi',
	COUPON_NOT_FOUND: 'Kupon topilmadi',
	DEAL_NOT_FOUND: 'Aksiya topilmadi',

	// Conflict errors
	EMAIL_EXISTS: 'Bu email allaqachon ro\'yxatdan o\'tgan',
	DUPLICATE_ENTRY: 'Bunday ma\'lumot allaqachon mavjud',

	// Business logic errors
	INSUFFICIENT_STOCK: 'Mahsulot yetarli miqdorda yo\'q',
	ORDER_CANCELLED: 'Buyurtma bekor qilingan',
	COUPON_EXPIRED: 'Kupon muddati tugagan',
	COUPON_LIMIT_REACHED: 'Kupon limitiga yetildi',
	INVALID_COUPON: 'Kupon yaroqsiz yoki faol emas',
	MIN_ORDER_AMOUNT: 'Minimal buyurtma miqdoriga yetilmagan',
	
	// System errors
	RATE_LIMIT: 'Juda ko\'p so\'rov yuborildi. Iltimos, bir oz kuting',
	NETWORK_ERROR: 'Internetga ulanishda xatolik',
	SERVER_ERROR: 'Server xatosi. Keyinroq urinib ko\'ring',
	DATABASE_ERROR: 'Ma\'lumotlar bazasida xatolik',
	TIMEOUT: 'So\'rov vaqti tugadi. Qaytadan urinib ko\'ring',

	// Payment errors
	PAYMENT_FAILED: 'To\'lov amalga oshmadi',
	PAYMENT_PENDING: 'To\'lov kutilmoqda',
	PAYMENT_CANCELLED: 'To\'lov bekor qilindi',

	// Default
	UNKNOWN_ERROR: 'Noma\'lum xatolik yuz berdi',
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(code: string, defaultMessage?: string): string {
	return ERROR_MESSAGES[code] || defaultMessage || ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * Get error message from axios error
 */
export function getAxiosErrorMessage(error: any): string {
	// Try to get error code from response
	if (error?.response?.data?.code) {
		return getErrorMessage(error.response.data.code, error.response.data.message)
	}

	// Try to get message from response
	if (error?.response?.data?.message) {
		return error.response.data.message
	}

	// Network error
	if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network')) {
		return ERROR_MESSAGES.NETWORK_ERROR
	}

	// Timeout error
	if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
		return ERROR_MESSAGES.TIMEOUT
	}

	// HTTP status based errors
	if (error?.response?.status === 401) {
		return ERROR_MESSAGES.UNAUTHORIZED
	}
	if (error?.response?.status === 403) {
		return ERROR_MESSAGES.FORBIDDEN
	}
	if (error?.response?.status === 404) {
		return ERROR_MESSAGES.NOT_FOUND
	}
	if (error?.response?.status === 429) {
		return ERROR_MESSAGES.RATE_LIMIT
	}
	if (error?.response?.status >= 500) {
		return ERROR_MESSAGES.SERVER_ERROR
	}

	// Default
	return error?.message || ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * Firebase error messages
 */
export const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
	'auth/user-not-found': 'Bu email bilan foydalanuvchi topilmadi',
	'auth/wrong-password': 'Parol noto\'g\'ri',
	'auth/invalid-email': 'Email manzil noto\'g\'ri formatda',
	'auth/user-disabled': 'Bu hisob bloklangan',
	'auth/too-many-requests': 'Juda ko\'p urinish. Keyinroq qaytadan urinib ko\'ring',
	'auth/email-already-in-use': 'Bu email allaqachon ro\'yxatdan o\'tgan',
	'auth/weak-password': 'Parol juda oddiy. Kamida 6 ta belgidan iborat bo\'lishi kerak',
	'auth/operation-not-allowed': 'Bu amal ta\'qiqlangan',
	'auth/invalid-credential': 'Email yoki parol noto\'g\'ri',
	'auth/network-request-failed': 'Internet ulanishini tekshiring.',
}

export function getFirebaseErrorMessage(error: any): string {
	const code = error?.code || error?.message
	return FIREBASE_ERROR_MESSAGES[code] || 'Autentifikatsiya xatosi'
}
