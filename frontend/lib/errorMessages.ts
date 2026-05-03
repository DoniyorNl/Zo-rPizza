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
export function getAxiosErrorMessage(error: unknown): string {
	// Try to get error code from response
	const err = error as { response?: { data?: { code?: string; message?: string }; status?: number }; code?: string; message?: string }
	if (err?.response?.data?.code) {
		return getErrorMessage(err.response.data.code, err.response.data.message)
	}

	// Try to get message from response
	if (err?.response?.data?.message) {
		return err.response.data.message
	}

	// Network error
	if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network')) {
		return ERROR_MESSAGES.NETWORK_ERROR
	}

	// Timeout error
	if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
		return ERROR_MESSAGES.TIMEOUT
	}

	// HTTP status based errors
	if (err?.response?.status === 401) {
		return ERROR_MESSAGES.UNAUTHORIZED
	}
	if (err?.response?.status === 403) {
		return ERROR_MESSAGES.FORBIDDEN
	}
	if (err?.response?.status === 404) {
		return ERROR_MESSAGES.NOT_FOUND
	}
	if (err?.response?.status === 429) {
		return ERROR_MESSAGES.RATE_LIMIT
	}
	if ((err?.response?.status ?? 0) >= 500) {
		return ERROR_MESSAGES.SERVER_ERROR
	}

	// Default
	return err?.message || ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * Supabase auth error messages (mapped from error message strings)
 */
export function getAuthErrorMessage(error: unknown): string {
	const msg = (error as { message?: string })?.message ?? ''
	if (msg.includes('Invalid login credentials')) return "Email yoki parol noto'g'ri"
	if (msg.includes('Email not confirmed')) return 'Emailingizni tasdiqlang. Pochtangizni tekshiring.'
	if (msg.includes('Too many requests')) return "Juda ko'p urinish. Keyinroq qaytadan urinib ko'ring"
	if (msg.includes('User already registered')) return "Bu email allaqachon ro'yxatdan o'tgan"
	if (msg.includes('Password should be at least')) return "Parol kamida 6 ta belgidan iborat bo'lishi kerak"
	if (msg.includes('Unable to validate email')) return "Email manzil noto'g'ri formatda"
	if (msg.includes('network')) return 'Internet ulanishini tekshiring'
	return msg || "Kirish xatosi. Qaytadan urinib ko'ring"
}
