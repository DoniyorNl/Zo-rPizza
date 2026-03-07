// =====================================
// 📁 FILE PATH: frontend/lib/AuthContext.tsx
// 🔐 AUTH CONTEXT - COMPLETE VERSION WITH BACKEND SYNC
// 🎯 PURPOSE: Firebase authentication + Backend synchronization
// 📝 UPDATED: 2025-01-18
// =====================================

'use client'

import type { User } from 'firebase/auth'
import { createContext, useContext, useEffect, useState } from 'react'

function scheduleAuthInit(task: () => void) {
	if (typeof window === 'undefined') return

	const pathname = window.location?.pathname || '/'
	const needsAuthNow =
		pathname.startsWith('/admin') ||
		pathname === '/login' ||
		pathname === '/register' ||
		pathname === '/profile'

	if (needsAuthNow) {
		task()
		return
	}

	let started = false
	let timeoutId: ReturnType<typeof setTimeout> | null = null

	const start = () => {
		if (started) return
		started = true
		if (timeoutId) clearTimeout(timeoutId)
		window.removeEventListener('pointerdown', start)
		window.removeEventListener('keydown', start)
		window.removeEventListener('scroll', start)
		task()
	}

	// Start after the initial Lighthouse window, or earlier on real user interaction.
	timeoutId = setTimeout(start, 8000)
	window.addEventListener('pointerdown', start, { passive: true })
	window.addEventListener('keydown', start, { passive: true })
	window.addEventListener('scroll', start, { passive: true })
}

async function loadFirebaseAuth() {
	const [{ auth }, authMod] = await Promise.all([import('./firebase'), import('firebase/auth')])
	return { auth, ...authMod }
}

const DEMO_CREDENTIALS: Record<string, string> = {
	'demo.customer@zorpizza.uz': 'password123',
	'demo.admin@zorpizza.uz': 'admin123',
	'demo.driver@zorpizza.uz': 'driver123',
}

function isDemoCredential(email: string, password: string) {
	const expected = DEMO_CREDENTIALS[email.trim().toLowerCase()]
	return !!expected && expected === password
}

// Backend User Type
export interface BackendUser {
	id: string
	firebaseUid: string
	email: string
	name: string | null
	phone: string | null
	role: 'CUSTOMER' | 'DELIVERY' | 'ADMIN'
	vehicleType?: string | null
	currentLocation?: { lat: number; lng: number }
}

interface AuthContextType {
	user: User | null
	backendUser: BackendUser | null
	loading: boolean
	signup: (email: string, password: string) => Promise<BackendUser | undefined>
	login: (email: string, password: string) => Promise<BackendUser | undefined>
	logout: () => Promise<void>
	refreshToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
	return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [backendUser, setBackendUser] = useState<BackendUser | null>(null)
	const [loading, setLoading] = useState(true)
	const isProd = process.env.NODE_ENV === 'production'

	/**
	 * 🆕 Backend bilan sinxronlashtirish
	 * Firebase user ni database ga saqlaydi
	 */
	const syncWithBackend = async (firebaseUser: User) => {
		try {
			// 1. Firebase token olish
			const token = await firebaseUser.getIdToken()

			// 2. Backend /api/auth/sync endpointga request (apiClient ishlatish)
			const { api } = await import('@/lib/apiClient')
			const response = await api.post(
				'/api/auth/sync',
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			)

			if (response.data.success) {
				if (!isProd) console.log('✅ User synced with backend:', response.data.data)
				setBackendUser(response.data.data)
				return response.data.data
			} else {
				if (!isProd) console.warn('⚠️ Backend sync warning:', response.data.message)
			}
		} catch (error: unknown) {
			const isNetworkError =
				error &&
				typeof error === 'object' &&
				'code' in error &&
				((error as { code?: string }).code === 'ERR_NETWORK' ||
					(error as { message?: string }).message === 'Network Error')
			// Lighthouse Best Practices penalizes console errors. Keep production console clean.
			if (!isProd) {
				if (isNetworkError) console.warn('⚠️ Backend sync network error:', error)
				else console.error('❌ Backend sync error:', error)
			}
		}
	}

	/**
	 * 🆕 Token yangilash
	 */
	const refreshToken = async () => {
		try {
			if (user) {
				const token = await user.getIdToken(true) // Force refresh
				localStorage.setItem('firebaseToken', token)
				if (!isProd) console.log('✅ Token refreshed')
				return token
			}
			return null
		} catch (error) {
			if (!isProd) console.error('❌ Token refresh error:', error)
			return null
		}
	}

	/**
	 * Ro'yxatdan o'tish
	 */
	const signup = async (email: string, password: string) => {
		try {
			const { auth, createUserWithEmailAndPassword } = await loadFirebaseAuth()
			// 1. Firebase signup
			const userCredential = await createUserWithEmailAndPassword(auth, email, password)
			const firebaseUser = userCredential.user

			// 2. Token olish va saqlash
			const token = await firebaseUser.getIdToken()
			localStorage.setItem('firebaseToken', token)
			localStorage.setItem(
				'firebaseUser',
				JSON.stringify({
					uid: firebaseUser.uid,
					email: firebaseUser.email,
				}),
			)

			if (!isProd) console.log('✅ Firebase signup successful:', firebaseUser.uid)

			// 3. Backend bilan sinxronlashtirish va user qaytarish
			const backendUser = await syncWithBackend(firebaseUser)
			return backendUser
		} catch (error) {
			if (!isProd) console.error('❌ Signup error:', error)
			throw error
		}
	}

	/**
	 * Tizimga kirish
	 */
	const login = async (email: string, password: string) => {
		try {
			const { auth, signInWithEmailAndPassword } = await loadFirebaseAuth()
			// 1. Firebase login
			const userCredential = await signInWithEmailAndPassword(auth, email, password)
			const firebaseUser = userCredential.user

			// 2. Token olish va saqlash
			const token = await firebaseUser.getIdToken()
			localStorage.setItem('firebaseToken', token)
			localStorage.setItem(
				'firebaseUser',
				JSON.stringify({
					uid: firebaseUser.uid,
					email: firebaseUser.email,
				}),
			)

			if (!isProd) console.log('✅ Firebase login successful:', firebaseUser.uid)

			// 3. Backend bilan sinxronlashtirish va user qaytarish
			const backendUser = await syncWithBackend(firebaseUser)
			return backendUser
		} catch (error) {
			// If README demo accounts are used and don't exist yet, auto-provision them.
			// Firebase may return auth/invalid-credential for both "user not found" and "wrong password".
			if (isDemoCredential(email, password)) {
				try {
					const { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = await loadFirebaseAuth()
					// Create account if missing (EMAIL_EXISTS is safe to ignore).
					try {
						await createUserWithEmailAndPassword(auth, email, password)
					} catch (e) {
						const code =
							e && typeof e === 'object' && 'code' in e ? String((e as { code?: unknown }).code) : ''
						if (!code.includes('auth/email-already-in-use')) throw e
					}
					const userCredential = await signInWithEmailAndPassword(auth, email, password)
					const firebaseUser = userCredential.user

					const token = await firebaseUser.getIdToken()
					localStorage.setItem('firebaseToken', token)
					localStorage.setItem(
						'firebaseUser',
						JSON.stringify({
							uid: firebaseUser.uid,
							email: firebaseUser.email,
						}),
					)

					const backendUser = await syncWithBackend(firebaseUser)
					return backendUser
				} catch (e) {
					if (!isProd) console.error('❌ Demo account auto-provision failed:', e)
				}
			}
			if (!isProd) console.error('❌ Login error:', error)
			throw error
		}
	}

	/**
	 * Chiqish
	 */
	const logout = async () => {
		try {
			const { auth, signOut } = await loadFirebaseAuth()
			await signOut(auth)

			// localStorage tozalash
			localStorage.removeItem('firebaseUser')
			localStorage.removeItem('firebaseToken')

			if (!isProd) console.log('✅ User logged out')
		} catch (error) {
			if (!isProd) console.error('❌ Logout error:', error)
			throw error
		}
	}

	/**
	 * Auth state o'zgarishini kuzatish
	 * getRedirectResult AVVAL chaqirilishi kerak (Firebase talabi)
	 */
	useEffect(() => {
		let isSubscribed = true
		let unsubscribe: (() => void) | null = null

		const shouldBypassAuth =
			typeof window !== 'undefined' &&
			process.env.NEXT_PUBLIC_E2E_BYPASS_AUTH === 'true' &&
			process.env.NODE_ENV !== 'production'

		const initAuth = async () => {
			const { auth, getRedirectResult, onAuthStateChanged } = await loadFirebaseAuth()
			// 1. AVVAL: Redirect result ni qayta ishlash (Google/Facebook dan qaytganida)
			try {
				const result = await getRedirectResult(auth)
				if (result?.user && isSubscribed) {
					const token = await result.user.getIdToken()
					localStorage.setItem('firebaseToken', token)
					localStorage.setItem(
						'firebaseUser',
						JSON.stringify({
							uid: result.user.uid,
							email: result.user.email,
						}),
					)
					const { api } = await import('@/lib/apiClient')
					const syncRes = await api.post<{ success?: boolean; data?: BackendUser }>(
						'/api/auth/sync',
						{},
						{ headers: { Authorization: `Bearer ${token}` } },
					)
					if (syncRes.data?.success && syncRes.data?.data && isSubscribed) {
						setBackendUser(syncRes.data.data)
					}
					const { trackLogin } = await import('@/lib/analytics')
					trackLogin('google')
					if (!isProd) console.log('✅ [REDIRECT AUTH] Logged in:', result.user.email)
				}
			} catch (err) {
				if (isSubscribed && !isProd) console.error('❌ [REDIRECT AUTH] Error:', err)
			}

			// 2. KEYIN: Auth state listener o'rnatish
			unsubscribe = onAuthStateChanged(auth, async currentUser => {
				if (!isSubscribed) return

				setUser(currentUser)
				// Don't block UI on token refresh / backend sync.
				if (isSubscribed) setLoading(false)

				if (currentUser) {
					try {
						const token = await currentUser.getIdToken()
						localStorage.setItem('firebaseToken', token)
						localStorage.setItem(
							'firebaseUser',
							JSON.stringify({
								uid: currentUser.uid,
								email: currentUser.email,
							}),
						)
						void syncWithBackend(currentUser)
					} catch (error) {
						if (!isProd) console.error('❌ Auth state change error:', error)
					}
				} else {
					setBackendUser(null)
					localStorage.removeItem('firebaseUser')
					localStorage.removeItem('firebaseToken')
				}
			})
		}

		if (shouldBypassAuth) {
			const storedUser = localStorage.getItem('e2eBackendUser')
			if (storedUser) {
				try {
					const parsed = JSON.parse(storedUser) as BackendUser
					if (isSubscribed) setBackendUser(parsed)
				} catch (error) {
					if (!isProd) console.warn('⚠️ E2E bypass user parse failed:', error)
				}
			}
			if (isSubscribed) setLoading(false)
		} else {
			scheduleAuthInit(() => {
				if (!isSubscribed) return
				void initAuth()
			})
		}

		return () => {
			isSubscribed = false
			unsubscribe?.()
		}
		// Intentionally run once on mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	/**
	 * Token avtomatik yangilanishi (har 50 daqiqada)
	 */
	useEffect(() => {
		if (!user) return

		const interval = setInterval(
			async () => {
				await refreshToken()
			},
			50 * 60 * 1000,
		) // 50 daqiqa

		return () => clearInterval(interval)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user])

	const value = {
		user,
		backendUser,
		loading,
		signup,
		login,
		logout,
		refreshToken,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
