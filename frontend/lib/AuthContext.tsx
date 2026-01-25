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
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
} from 'firebase/auth'
import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from './firebase'

interface AuthContextType {
	user: User | null
	loading: boolean
	signup: (email: string, password: string) => Promise<void>
	login: (email: string, password: string) => Promise<void>
	logout: () => Promise<void>
	refreshToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
	return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

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
				console.log('✅ User synced with backend:', response.data.data)
				return response.data.data
			} else {
				console.warn('⚠️ Backend sync warning:', response.data.message)
			}
		} catch (error) {
			console.error('❌ Backend sync error:', error)
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

			// 3. Backend bilan sinxronlashtirish
			await syncWithBackend(firebaseUser)
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

			// 3. Backend bilan sinxronlashtirish
			await syncWithBackend(firebaseUser)
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
	 */
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async currentUser => {
			setUser(currentUser)
			setLoading(false)

			if (currentUser) {
				// User tizimga kirgan
				try {
					// Token olish va saqlash
					const token = await currentUser.getIdToken()
					localStorage.setItem('firebaseToken', token)
					localStorage.setItem(
						'firebaseUser',
						JSON.stringify({
							uid: currentUser.uid,
							email: currentUser.email,
						}),
					)

					// Backend bilan sinxronlashtirish
					await syncWithBackend(currentUser)
				} catch (error) {
					console.error('❌ Auth state change error:', error)
				}
			} else {
				// User chiqdi
				localStorage.removeItem('firebaseUser')
				localStorage.removeItem('firebaseToken')
			}
		})

		return unsubscribe
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
	}, [user])

	const value = {
		user,
		loading,
		signup,
		login,
		logout,
		refreshToken,
	}

	return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
