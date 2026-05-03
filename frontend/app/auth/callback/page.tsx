'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
	const router = useRouter()

	useEffect(() => {
		const checkSession = async () => {
			const { data } = await supabase.auth.getSession()
			if (data.session) {
				router.replace('/')
			} else {
				// Give Supabase a moment to exchange the OAuth code
				setTimeout(async () => {
					const { data: retryData } = await supabase.auth.getSession()
					router.replace(retryData.session ? '/' : '/login?error=auth_failed')
				}, 1000)
			}
		}
		checkSession()
	}, [router])

	return (
		<div className='flex items-center justify-center min-h-screen'>
			<div className='text-center'>
				<div className='animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4' />
				<p className='text-gray-600'>Tizimga kirilmoqda...</p>
			</div>
		</div>
	)
}
