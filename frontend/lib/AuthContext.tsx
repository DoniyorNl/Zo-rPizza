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

	// Prevent concurrent syncs — use a promise so concurrent callers share the same result
	const syncPromise = useRef<Promise<void> | null>(null)
	// Track last synced user to avoid re-syncing the same user
	const lastSyncedUserId = useRef<string | null>(null)

	const syncWithBackend = useCallback(async (currentSession: Session) => {
		const userId = currentSession.user.id

		// Already syncing or already synced this user
		if (syncPromise.current) return syncPromise.current
		if (lastSyncedUserId.current === userId && dbUser) return

		syncPromise.current = (async () => {
			try {
				const response = await api.post(
					'/api/auth/sync',
					{},
					{
						headers: { Authorization: `Bearer ${currentSession.access_token}` },
						// Prevent the global 401 interceptor from redirecting during sync
						_skipAuthRedirect: true,
					} as never,
				)
				if (response.data?.data) {
					setDbUser(response.data.data)
					lastSyncedUserId.current = userId
				}
			} catch (error) {
				// Sync failure is non-fatal — user is still authenticated via Supabase.
				// Don't reset dbUser or redirect; just log and continue.
				console.warn('[AuthContext] Backend sync failed (non-fatal):', error)
			} finally {
				syncPromise.current = null
			}
		})()

		return syncPromise.current
	}, [dbUser])

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
		const { data } = await supabase.auth.getSession()
		if (data.session) {
			lastSyncedUserId.current = null // Force re-sync
			await syncWithBackend(data.session)
		}
	}, [syncWithBackend])

	useEffect(() => {
		// Use onAuthStateChange as the single source of truth.
		// INITIAL_SESSION fires immediately with the persisted session (or null).
		// No need for a separate getSession() call — that creates race conditions.
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, newSession) => {
			setSession(newSession)
			setUser(newSession?.user ?? null)

			if (newSession && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
				// Sync with backend — failure is non-fatal
				await syncWithBackend(newSession)
			} else if (event === 'SIGNED_OUT') {
				setDbUser(null)
				lastSyncedUserId.current = null
			}

			// Mark loading done after the first event (INITIAL_SESSION)
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
