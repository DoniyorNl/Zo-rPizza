// =====================================
// 📁 FILE PATH: frontend/lib/AuthContext.tsx
// 🔐 AUTH CONTEXT - FIXED VERSION
// 🎯 PURPOSE: Firebase authentication with localStorage persistence
// 📝 UPDATED: 2025-01-11
// =====================================

'use client'

import { api } from '@/lib/apiClient'
import { createContext, useContext, useEffect, useState } from 'react'
import {
	User,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase'

interface AuthContextType {
	user: User | null
	loading: boolean
	signup: (email: string, password: string) => Promise<void>
	login: (email: string, password: string) => Promise<void>
	logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
	return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	// Signup
	const signup = async (email: string, password: string) => {
		const userCredential = await createUserWithEmailAndPassword(auth, email, password)

		// ✅ YANGI: localStorage'ga saqlash
		localStorage.setItem(
			'firebaseUser',
			JSON.stringify({
				uid: userCredential.user.uid,
				email: userCredential.user.email,
			}),
		)

		// Backend'ga user ma'lumotlarini yuborish
		try {
			await api.post('/api/users', {
				firebaseUid: userCredential.user.uid,
				email: userCredential.user.email,
				name: email.split('@')[0], // Default name
			})
		} catch (error) {
			console.error('Error saving user to database:', error)
		}
	}

	// Login
	const login = async (email: string, password: string) => {
		const userCredential = await signInWithEmailAndPassword(auth, email, password)

		// ✅ YANGI: localStorage'ga saqlash
		localStorage.setItem(
			'firebaseUser',
			JSON.stringify({
				uid: userCredential.user.uid,
				email: userCredential.user.email,
			}),
		)

		console.log('✅ User logged in and saved to localStorage:', userCredential.user.uid)
	}

	// Logout
	const logout = async () => {
		await signOut(auth)

		// ✅ YANGI: localStorage'dan o'chirish
		localStorage.removeItem('firebaseUser')
		console.log('✅ User logged out and removed from localStorage')
	}

	// Listen to auth changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, currentUser => {
			setUser(currentUser)
			setLoading(false)

			// ✅ YANGI: Auth state o'zgarganda localStorage'ni yangilash
			if (currentUser) {
				localStorage.setItem(
					'firebaseUser',
					JSON.stringify({
						uid: currentUser.uid,
						email: currentUser.email,
					}),
				)
			} else {
				localStorage.removeItem('firebaseUser')
			}
		})

		return unsubscribe
	}, [])

	const value = {
		user,
		loading,
		signup,
		login,
		logout,
	}

	return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
