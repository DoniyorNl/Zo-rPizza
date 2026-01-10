// frontend/lib/AuthContext.tsx
// 🔐 AUTH CONTEXT

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
	User,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase'
import axios from 'axios'

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

		// Backend'ga user ma'lumotlarini yuborish
		try {
			await axios.post('http://localhost:5001/api/users', {
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
		await signInWithEmailAndPassword(auth, email, password)
	}

	// Logout
	const logout = async () => {
		await signOut(auth)
	}

	// Listen to auth changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, user => {
			setUser(user)
			setLoading(false)
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
