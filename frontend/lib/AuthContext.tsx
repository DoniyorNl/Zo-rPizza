'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { api } from './apiClient'

export interface DbUser {
	id: string
	email: string
	name: string
	phone?: string | null
	role: 'CUSTOMER' | 'ADMIN' | 'DELIVERY'
	isBlocked: boolean
	avatar?: string | null
	loyaltyPoints?: number
	totalSpent?: number
	favoriteProducts?: string[]
	emailNotificationsEnabled?: boolean
	vehicleType?: string | null
}

interface AuthContextType {
	session: Session | null
	user: User | null
	dbUser: DbUser | null
	loading: boolean
	signOut: () => Promise<void>
	refreshUser: () => Promise<void>
	getAccessToken: () => Promise<string | null>
	isAdmin: boolean
	isDriver: boolean
}

const AuthContext = createContext<AuthContextType>({
	session: null,
	user: null,
	dbUser: null,
	loading: true,
	signOut: async () => {},
	refreshUser: async () => {},
	getAccessToken: async () => null,
	isAdmin: false,
	isDriver: false,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [session, setSession] = useState<Session | null>(null)
	const [user, setUser] = useState<User | null>(null)
	const [dbUser, setDbUser] = useState<DbUser | null>(null)
	const [loading, setLoading] = useState(true)
	const syncInProgress = useRef(false)

	const syncWithBackend = useCallback(async (currentSession: Session) => {
		if (syncInProgress.current) return
		syncInProgress.current = true
		try {
			const token = currentSession.access_token
			const response = await api.post(
				'/api/auth/sync',
				{},
				{ headers: { Authorization: `Bearer ${token}` } },
			)
			if (response.data?.data) {
				setDbUser(response.data.data)
			}
		} catch (error) {
			console.error('[AuthContext] Backend sync error:', error)
		} finally {
			syncInProgress.current = false
		}
	}, [])

	const getAccessToken = useCallback(async (): Promise<string | null> => {
		const { data } = await supabase.auth.getSession()
		return data.session?.access_token ?? null
	}, [])

	const signOut = useCallback(async () => {
		await supabase.auth.signOut()
		setSession(null)
		setUser(null)
		setDbUser(null)
	}, [])

	const refreshUser = useCallback(async () => {
		const { data } = await supabase.auth.getSession()
		if (data.session) {
			await syncWithBackend(data.session)
		}
	}, [syncWithBackend])

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
			setSession(initialSession)
			setUser(initialSession?.user ?? null)
			if (initialSession) {
				syncWithBackend(initialSession).finally(() => setLoading(false))
			} else {
				setLoading(false)
			}
		})

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, newSession) => {
			setSession(newSession)
			setUser(newSession?.user ?? null)

			if (event === 'SIGNED_IN' && newSession) {
				await syncWithBackend(newSession)
			} else if (event === 'SIGNED_OUT') {
				setDbUser(null)
			}
			setLoading(false)
		})

		return () => subscription.unsubscribe()
	}, [syncWithBackend])

	const isAdmin = dbUser?.role === 'ADMIN'
	const isDriver = dbUser?.role === 'DELIVERY'

	return (
		<AuthContext.Provider
			value={{
				session,
				user,
				dbUser,
				loading,
				signOut,
				refreshUser,
				getAccessToken,
				isAdmin,
				isDriver,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}

export default AuthContext
