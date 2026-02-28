// =====================================
// 📁 FILE PATH: frontend/app/(auth)/register/page.tsx
// 🔐 REGISTER PAGE - FINAL VERSION
// 🎯 PURPOSE: Complete signup with Firebase + Backend sync
// 📝 UPDATED: 2025-01-18
// ✨ FEATURES: Error handling, Loading states, Validation, Professional UI
// =====================================

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/AuthContext'
import { getFirebaseErrorMessage } from '@/lib/errorMessages'
import { trackSignup } from '@/lib/analytics'
import { signInWithGoogle, getSocialAuthErrorMessage } from '@/lib/socialAuth'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)
	const [socialLoading, setSocialLoading] = useState(false)

	const { signup } = useAuth()
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setSuccess(false)

		// ============================================
		// VALIDATION
		// ============================================

		if (!email || !password || !confirmPassword) {
			setError("Barcha maydonlarni to'ldiring")
			return
		}

		if (password !== confirmPassword) {
			setError('Parollar mos kelmadi')
			return
		}

		if (password.length < 6) {
			setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
			return
		}

		// Email format tekshirish
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			setError("Email manzil noto'g'ri formatda")
			return
		}

		setLoading(true)

		try {
			// ============================================
			// FIREBASE SIGNUP + BACKEND SYNC
			// ============================================
			const backendUser = await signup(email, password)

			// 📊 Track signup
			trackSignup('email')

			console.log('✅ Signup successful')
			setSuccess(true)

			// Success message ko'rsatish va role bo'yicha redirect
			setTimeout(() => {
				if (backendUser?.role === 'ADMIN') {
					router.push('/admin')
				} else if (backendUser?.role === 'DELIVERY') {
					router.push('/driver/dashboard')
				} else {
					router.push('/')
				}
				router.refresh()
			}, 1500)
		} catch (err: unknown) {
			console.error('❌ Signup error:', err)
			const errorMessage =
				getFirebaseErrorMessage(err) || "Ro'yxatdan o'tishda xatolik. Qaytadan urinib ko'ring."
			setError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	// ============================================
	// GOOGLE SIGN IN HANDLER
	// ============================================
	const handleGoogleSignIn = async () => {
		setError('')
		setSocialLoading(true)

		try {
			const result = await signInWithGoogle()
			if (result?.user) {
				// Popup muvaffaqiyatli
				console.log('✅ Google signup successful')
				setSuccess(true)
				setTimeout(() => {
					router.push('/')
					router.refresh()
				}, 1500)
			}
			// Redirect bo'lsa: sahifa o'zgaradi
		} catch (err: unknown) {
			console.error('❌ Google signup error:', err)
			const errorMessage = getSocialAuthErrorMessage(err)
			setError(errorMessage)
		} finally {
			setSocialLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4'>
			<Card className='w-full max-w-md shadow-2xl border-0'>
				<CardHeader className='space-y-3 pb-6'>
					{/* Logo */}
					<div className='flex justify-center mb-2'>
						<div className='w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform'>
							<span className='text-4xl'>🍕</span>
						</div>
					</div>

					{/* Title */}
					<CardTitle className='text-3xl text-center font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'>
						Ro&apos;yxatdan O&apos;tish
					</CardTitle>

					{/* Description */}
					<CardDescription className='text-center text-base'>
						Zor Pizza da akkaunt yarating va buyurtma bering
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form data-testid="register-form" onSubmit={handleSubmit} className='space-y-5'>
						{/* ============================================ */}
						{/* SUCCESS MESSAGE */}
						{/* ============================================ */}
						{success && (
							<div className='bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2'>
								<CheckCircle2 className='w-5 h-5 flex-shrink-0 mt-0.5' />
								<div>
									<p className='font-semibold'>Muvaffaqiyatli ro&apos;yxatdan o&apos;tdingiz!</p>
									<p className='text-sm mt-1'>Bosh sahifaga yonaltirilmoqda...</p>
								</div>
							</div>
						)}

						{/* ============================================ */}
						{/* ERROR MESSAGE */}
						{/* ============================================ */}
						{error && (
							<div data-testid="register-error" className='bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2'>
								<AlertCircle className='w-5 h-5 flex-shrink-0 mt-0.5' />
								<p className='text-sm'>{error}</p>
							</div>
						)}

						{/* ============================================ */}
						{/* EMAIL INPUT */}
						{/* ============================================ */}
						<div className='space-y-2'>
							<Label htmlFor='email' className='text-sm font-semibold'>
								Email Manzil
							</Label>
							<Input
								data-testid="register-email"
								id='email'
								type='email'
								placeholder='example@email.com'
								value={email}
								onChange={e => setEmail(e.target.value)}
								required
								disabled={loading || success}
								className='h-11 text-base'
								autoComplete='email'
							/>
						</div>

						{/* ============================================ */}
						{/* PASSWORD INPUT */}
						{/* ============================================ */}
						<div className='space-y-2'>
							<Label htmlFor='password' className='text-sm font-semibold'>
								Parol
							</Label>
							<Input
								data-testid="register-password"
								id='password'
								type='password'
								placeholder='Kamida 6 ta belgi'
								value={password}
								onChange={e => setPassword(e.target.value)}
								required
								disabled={loading || success}
								className='h-11 text-base'
								autoComplete='new-password'
							/>
							<p className='text-xs text-gray-500'>Kamida 6 ta belgi, raqam va harf ishlating</p>
						</div>

						{/* ============================================ */}
						{/* CONFIRM PASSWORD INPUT */}
						{/* ============================================ */}
						<div className='space-y-2'>
							<Label htmlFor='confirmPassword' className='text-sm font-semibold'>
								Parolni Tasdiqlash
							</Label>
							<Input
								data-testid="register-confirm-password"
								id='confirmPassword'
								type='password'
								placeholder='Parolni qayta kiriting'
								value={confirmPassword}
								onChange={e => setConfirmPassword(e.target.value)}
								required
								disabled={loading || success}
								className='h-11 text-base'
								autoComplete='new-password'
							/>
						</div>

						{/* ============================================ */}
						{/* SUBMIT BUTTON */}
						{/* ============================================ */}
						<Button
							data-testid="register-submit"
							type='submit'
							className='w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all'
							disabled={loading || success}
						>
							{loading ? (
								<>
									<Loader2 className='mr-2 h-5 w-5 animate-spin' />
									Ro&apos;yxatdan o&apos;tilmoqda...
								</>
							) : success ? (
								<>
									<CheckCircle2 className='mr-2 h-5 w-5' />
									Muvaffaqiyatli!
								</>
							) : (
								"Ro'yxatdan O'tish"
							)}
						</Button>

						{/* ============================================ */}
						{/* DIVIDER */}
						{/* ============================================ */}
						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<span className='w-full border-t border-gray-200' />
							</div>
							<div className='relative flex justify-center text-xs uppercase'>
								<span className='bg-white px-2 text-gray-500 font-medium'>Yoki</span>
							</div>
						</div>

						{/* ============================================ */}
						{/* GOOGLE SIGN IN BUTTON */}
						{/* ============================================ */}
						<Button
							type='button'
							variant='outline'
							onClick={handleGoogleSignIn}
							disabled={loading || socialLoading || success}
							className='w-full h-12 text-base font-semibold border-2 hover:bg-gray-50'
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
									Google bilan ro&apos;yxatdan o&apos;tish
								</>
							)}
						</Button>

						{/* ============================================ */}
						{/* LOGIN LINK */}
						{/* ============================================ */}
						<div className='text-center space-y-2'>
							<p className='text-sm text-gray-600'>
								Allaqachon akkauntingiz bormi?{' '}
								<Link
									href='/login'
									className='font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors'
								>
									Kirish
								</Link>
							</p>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
