// frontend/lib/socialAuth.ts
// 🔐 SOCIAL AUTHENTICATION - Google & Facebook Login
// Popup + Redirect ikkalasi: popup tezroq, redirect COOP xatosiz

import { auth } from './firebase'
import {
	GoogleAuthProvider,
	FacebookAuthProvider,
	signInWithPopup,
	signInWithRedirect,
} from 'firebase/auth'

// ============================================================================
// GOOGLE SIGN IN (Popup - tez, ba'zi brauzerlarda COOP ogohlantirishi bo'lishi mumkin)
// ============================================================================

/**
 * Sign in with Google - Popup flow
 * Agar popup bloklansa, signInWithRedirect ishlatiladi
 */
export const signInWithGoogle = async (): Promise<{ user: import('firebase/auth').User } | void> => {
	const provider = new GoogleAuthProvider()
	provider.addScope('email')
	provider.addScope('profile')

	try {
		const result = await signInWithPopup(auth, provider)
		return { user: result.user }
	} catch (err: unknown) {
		const code = (err && typeof err === 'object' && 'code' in err)
			? (err as { code?: string }).code
			: ''
		// Popup bloklangan bo'lsa, redirect ga o'tish
		if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
			await signInWithRedirect(auth, provider)
			return
		}
		throw err
	}
}

// ============================================================================
// FACEBOOK SIGN IN
// ============================================================================

/**
 * Sign in with Facebook - Popup flow
 */
export const signInWithFacebook = async (): Promise<{ user: import('firebase/auth').User } | void> => {
	const provider = new FacebookAuthProvider()
	provider.addScope('email')
	provider.addScope('public_profile')

	try {
		const result = await signInWithPopup(auth, provider)
		return { user: result.user }
	} catch (err: unknown) {
		const code = (err && typeof err === 'object' && 'code' in err)
			? (err as { code?: string }).code
			: ''
		if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
			await signInWithRedirect(auth, provider)
			return
		}
		throw err
	}
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export const getSocialAuthErrorMessage = (error: unknown): string => {
	const code = (error && typeof error === 'object' && 'code' in error) 
		? (error as { code?: string }).code 
		: ''

	const errorMessages: Record<string, string> = {
		'auth/account-exists-with-different-credential': 
			'Bu email boshqa metod bilan ro\'yxatdan o\'tgan',
		'auth/popup-closed-by-user': 
			'Login bekor qilindi',
		'auth/popup-blocked': 
			'Brauzer sozlamalarini tekshiring',
		'auth/cancelled-popup-request': 
			'Login bekor qilindi',
		'auth/redirect-cancelled-by-user': 
			'Login bekor qilindi',
		'auth/network-request-failed': 
			'Internet aloqasi yo\'q',
	}

	return (code && errorMessages[code]) || 'Login xatosi. Qaytadan urinib ko\'ring'
}
