'use client'

import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

function CallbackHandler() {
	const router = useRouter()
	const searchParams = useSearchParams()

	useEffect(() => {
		const handleCallback = async () => {
			const code = searchParams.get('code')
			const next = searchParams.get('next') ?? '/'
			const errorParam = searchParams.get('error')

			if (errorParam) {
				console.error('[auth/callback] OAuth error:', errorParam, searchParams.get('error_description'))
				router.replace('/login?error=oauth_error')
				return
			}

			if (code) {
				// PKCE flow: exchange authorization code for session
				const { error } = await supabase.auth.exchangeCodeForSession(code)
				if (error) {
					console.error('[auth/callback] Code exchange error:', error.message)
					router.replace('/login?error=auth_failed')
					return
				}
			}

			// Verify session is established
			const { data } = await supabase.auth.getSession()
			if (data.session) {
				router.replace(next)
			} else {
				// Hash-based implicit flow — give browser a moment
				await new Promise(resolve => setTimeout(resolve, 1000))
				const { data: retryData } = await supabase.auth.getSession()
				router.replace(retryData.session ? next : '/login?error=no_session')
			}
		}

		handleCallback()
	}, [router, searchParams])

	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-50'>
			<div className='text-center'>
				<div className='animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4' />
				<p className='text-gray-600 text-sm'>Tizimga kirilmoqda...</p>
			</div>
		</div>
	)
}

export default function AuthCallbackPage() {
	return (
		<Suspense
			fallback={
				<div className='flex items-center justify-center min-h-screen bg-gray-50'>
					<div className='animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500' />
				</div>
			}
		>
			<CallbackHandler />
		</Suspense>
	)
}
