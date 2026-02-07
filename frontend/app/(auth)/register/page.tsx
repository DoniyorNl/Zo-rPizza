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
					<form onSubmit={handleSubmit} className='space-y-5'>
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
							<div className='bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2'>
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
