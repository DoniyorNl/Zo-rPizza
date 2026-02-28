// =====================================
// 📁 FILE PATH: frontend/lib/AuthContext.tsx
// 🔐 AUTH CONTEXT - COMPLETE VERSION WITH BACKEND SYNC
// 🎯 PURPOSE: Firebase authentication + Backend synchronization
// 📝 UPDATED: 2025-01-18
// =====================================

'use client'

import {
	User,
	createUserWithEmailAndPassword,
	getRedirectResult,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
} from 'firebase/auth'
import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from './firebase'

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

	/**
	 * 🆕 Backend bilan sinxronlashtirish
	 * Firebase user ni database ga saqlaydi
	 */
	const syncWithBackend = async (firebaseUser: User) => {
		const { getApiBaseUrl } = await import('@/lib/apiBaseUrl')
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
				console.log('✅ User synced with backend:', response.data.data)
				setBackendUser(response.data.data)
				return response.data.data
			} else {
				console.warn('⚠️ Backend sync warning:', response.data.message)
			}
		} catch (error: unknown) {
			const isNetworkError =
				error &&
				typeof error === 'object' &&
				'code' in error &&
				((error as { code?: string }).code === 'ERR_NETWORK' ||
					(error as { message?: string }).message === 'Network Error')
			if (isNetworkError && typeof window !== 'undefined') {
				const baseUrl = getApiBaseUrl()
				console.warn(
					'⚠️ Backend unreachable at',
					baseUrl,
					'— is the server running? Auth will work with Firebase only until sync succeeds.',
				)
			} else {
				console.error('❌ Backend sync error:', error)
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
				console.log('✅ Token refreshed')
				return token
			}
			return null
		} catch (error) {
			console.error('❌ Token refresh error:', error)
			return null
		}
	}

	/**
	 * Ro'yxatdan o'tish
	 */
	const signup = async (email: string, password: string) => {
		try {
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

			console.log('✅ Firebase signup successful:', firebaseUser.uid)

			// 3. Backend bilan sinxronlashtirish va user qaytarish
			const backendUser = await syncWithBackend(firebaseUser)
			return backendUser
		} catch (error) {
			console.error('❌ Signup error:', error)
			throw error
		}
	}

	/**
	 * Tizimga kirish
	 */
	const login = async (email: string, password: string) => {
		try {
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

			console.log('✅ Firebase login successful:', firebaseUser.uid)

			// 3. Backend bilan sinxronlashtirish va user qaytarish
			const backendUser = await syncWithBackend(firebaseUser)
			return backendUser
		} catch (error) {
			console.error('❌ Login error:', error)
			throw error
		}
	}

	/**
	 * Chiqish
	 */
	const logout = async () => {
		try {
			await signOut(auth)

			// localStorage tozalash
			localStorage.removeItem('firebaseUser')
			localStorage.removeItem('firebaseToken')

			console.log('✅ User logged out')
		} catch (error) {
			console.error('❌ Logout error:', error)
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
					console.log('✅ [REDIRECT AUTH] Logged in:', result.user.email)
				}
			} catch (err) {
				if (isSubscribed) console.error('❌ [REDIRECT AUTH] Error:', err)
			}

			// 2. KEYIN: Auth state listener o'rnatish
			unsubscribe = onAuthStateChanged(auth, async currentUser => {
				if (!isSubscribed) return

				setUser(currentUser)

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
						await syncWithBackend(currentUser)
					} catch (error) {
						console.error('❌ Auth state change error:', error)
					} finally {
						if (isSubscribed) setLoading(false)
					}
				} else {
					setBackendUser(null)
					localStorage.removeItem('firebaseUser')
					localStorage.removeItem('firebaseToken')
					if (isSubscribed) setLoading(false)
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
					console.warn('⚠️ E2E bypass user parse failed:', error)
				}
			}
			if (isSubscribed) setLoading(false)
		} else {
			initAuth()
		}

		return () => {
			isSubscribed = false
			unsubscribe?.()
		}
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

	return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
