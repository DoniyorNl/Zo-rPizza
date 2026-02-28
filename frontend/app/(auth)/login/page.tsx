// =====================================
// 📁 FILE PATH: frontend/app/(auth)/login/page.tsx
// 🔐 LOGIN PAGE - COMPLETE VERSION
// 🎯 PURPOSE: Login with Firebase + Backend sync
// 📝 UPDATED: 2025-01-18
// =====================================

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/AuthContext'
import { getFirebaseErrorMessage } from '@/lib/errorMessages'
import { trackLogin } from '@/lib/analytics'
import { signInWithGoogle, getSocialAuthErrorMessage } from '@/lib/socialAuth'
import { AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [socialLoading, setSocialLoading] = useState(false)

	const { login, user, backendUser, loading: authLoading } = useAuth()
	const router = useRouter()

	// Google redirect dan qaytganda user allaqachon kirgan bo'lsa, bosh sahifaga yo'naltirish
	useEffect(() => {
		if (!authLoading && user) {
			if (backendUser?.role === 'ADMIN') router.replace('/admin')
			else if (backendUser?.role === 'DELIVERY') router.replace('/driver/dashboard')
			else router.replace('/')
		}
	}, [user, backendUser, authLoading, router])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			// Firebase login + backend sync
			const backendUser = await login(email, password)

			// 📊 Track login
			trackLogin('email')

			console.log('✅ Login successful, redirecting...', backendUser)

			// Role bo'yicha redirect
			if (backendUser?.role === 'ADMIN') {
				router.push('/admin')
			} else if (backendUser?.role === 'DELIVERY') {
				router.push('/driver/dashboard')
			} else {
				router.push('/')
			}
			router.refresh() // Force refresh
		} catch (err: unknown) {
			console.error('❌ Login error:', err)
			const errorMessage = getFirebaseErrorMessage(err) || "Kirish xatosi. Qaytadan urinib ko'ring."
			setError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	// ============================================
	// GOOGLE LOGIN HANDLER
	// ============================================
	const handleGoogleLogin = async () => {
		setError('')
		setSocialLoading(true)

		try {
			const result = await signInWithGoogle()
			if (result?.user) {
				// Popup muvaffaqiyatli - redirect
				console.log('✅ Google login successful')
				router.push('/')
				router.refresh()
			}
			// Redirect bo'lsa: sahifa o'zgaradi, hech narsa qilmaymiz
		} catch (err: unknown) {
			console.error('❌ Google login error:', err)
			const errorMessage = getSocialAuthErrorMessage(err)
			setError(errorMessage)
		} finally {
			setSocialLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4'>
			<Card className='w-full max-w-md shadow-2xl'>
				<CardHeader className='space-y-2'>
					<div className='flex justify-center mb-4'>
						<div className='w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg'>
							<span className='text-4xl'>🍕</span>
						</div>
					</div>
					<CardTitle className='text-3xl text-center font-bold'>Xush kelibsiz!</CardTitle>
					<CardDescription className='text-center'>
						Zor Pizza ga kirish uchun login qiling
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form data-testid="login-form" onSubmit={handleSubmit} className='space-y-5'>
						{/* Error Message */}
						{error && (
							<div data-testid="login-error" className='bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3'>
								<AlertCircle className='w-5 h-5 flex-shrink-0 mt-0.5' />
								<p className='text-sm'>{error}</p>
							</div>
						)}

						{/* Email Input */}
						<div className='space-y-2'>
							<Label htmlFor='email'>Email Manzil</Label>
							<Input
								data-testid="login-email"
								id='email'
								type='email'
								placeholder='example@email.com'
								value={email}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
								required
								disabled={loading}
								className='h-11'
							/>
						</div>

						{/* Password Input */}
						<div className='space-y-2'>
							<div className='flex justify-between items-center'>
								<Label htmlFor='password'>Parol</Label>
								<Link
									href='/forgot-password'
									className='text-sm text-orange-600 hover:text-orange-700 hover:underline'
								>
									Parolni unutdingizmi?
								</Link>
							</div>
							<Input
								data-testid="login-password"
								id='password'
								type='password'
								placeholder='••••••••'
								value={password}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
								required
								disabled={loading}
								className='h-11'
							/>
						</div>

						{/* Submit Button */}
						<Button
							data-testid="login-submit"
							type='submit'
							className='w-full h-11 text-base font-semibold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader2 className='mr-2 h-5 w-5 animate-spin' />
									Yuklanmoqda...
								</>
							) : (
								'Kirish'
							)}
						</Button>

						{/* Divider */}
						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<span className='w-full border-t' />
							</div>
							<div className='relative flex justify-center text-xs uppercase'>
								<span className='bg-white px-2 text-muted-foreground'>Yoki</span>
							</div>
						</div>

						{/* ============================================ */}
						{/* GOOGLE LOGIN BUTTON */}
						{/* ============================================ */}
						<Button
							type='button'
							variant='outline'
							onClick={handleGoogleLogin}
							disabled={loading || socialLoading}
							className='w-full h-11 text-base font-semibold border-2 hover:bg-gray-50'
						>
							{socialLoading ? (
								<>
									<Loader2 className='mr-2 h-5 w-5 animate-spin' />
									Yuklanmoqda...
								</>
							) : (
								<>
									<svg className='mr-2 h-5 w-5' viewBox='0 0 24 24'>
										<path
											fill='#4285F4'
											d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
										/>
										<path
											fill='#34A853'
											d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
										/>
										<path
											fill='#FBBC05'
											d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
										/>
										<path
											fill='#EA4335'
											d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
										/>
									</svg>
									Google bilan kirish
								</>
							)}
						</Button>

						{/* Register Link */}
						<div className='text-center'>
							<p className='text-sm text-gray-600'>
								Akkauntingiz yo&apos;qmi?{' '}
								<Link
									href='/register'
									className='font-semibold text-orange-600 hover:text-orange-700 hover:underline'
								>
									Ro&apos;yxatdan o&apos;tish
								</Link>
							</p>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
