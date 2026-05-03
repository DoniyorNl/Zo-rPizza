'use client'

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
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

	// Refs so that syncWithBackend never changes identity (prevents useEffect re-runs)
	const syncInFlight = useRef(false)
	const lastSyncedUserId = useRef<string | null>(null)

	// STABLE function — no state in deps, only refs and setters
	const syncWithBackend = useCallback(async (currentSession: Session) => {
		const userId = currentSession.user.id

		// Already synced this user and there's a dbUser loaded — skip
		if (lastSyncedUserId.current === userId) return
		// Another sync is already running — skip (it will set dbUser when done)
		if (syncInFlight.current) return

		syncInFlight.current = true
		try {
			const response = await api.post(
				'/api/auth/sync',
				{},
				{ headers: { Authorization: `Bearer ${currentSession.access_token}` } },
			)
			if (response.data?.data) {
				setDbUser(response.data.data)
				lastSyncedUserId.current = userId
			}
		} catch (error) {
			// Non-fatal: user is still authenticated via Supabase session
			console.warn('[AuthContext] Backend sync failed (non-fatal):', error)
		} finally {
			syncInFlight.current = false
		}
	}, []) // <-- EMPTY deps: function never recreated → useEffect runs only once

	const getAccessToken = useCallback(async (): Promise<string | null> => {
		const { data } = await supabase.auth.getSession()
		return data.session?.access_token ?? null
	}, [])

	const signOut = useCallback(async () => {
		await supabase.auth.signOut()
		setSession(null)
		setUser(null)
		setDbUser(null)
		lastSyncedUserId.current = null
	}, [])

	const refreshUser = useCallback(async () => {
		lastSyncedUserId.current = null // Force re-sync next time
		const { data } = await supabase.auth.getSession()
		if (data.session) {
			await syncWithBackend(data.session)
		}
	}, [syncWithBackend])

	useEffect(() => {
		// onAuthStateChange is the single source of truth.
		// INITIAL_SESSION fires immediately with the persisted session (or null).
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, newSession) => {
			setSession(newSession)
			setUser(newSession?.user ?? null)

			if (newSession && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
				await syncWithBackend(newSession)
			} else if (event === 'SIGNED_OUT') {
				setDbUser(null)
				lastSyncedUserId.current = null
			}

			setLoading(false)
		})

		return () => subscription.unsubscribe()
	}, [syncWithBackend]) // syncWithBackend is stable → this effect runs exactly once

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
