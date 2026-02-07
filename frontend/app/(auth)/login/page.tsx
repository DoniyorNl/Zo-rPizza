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
import { AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const { login } = useAuth()
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			// Firebase login + backend sync
			const backendUser = await login(email, password)

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
					<form onSubmit={handleSubmit} className='space-y-5'>
						{/* Error Message */}
						{error && (
							<div className='bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3'>
								<AlertCircle className='w-5 h-5 flex-shrink-0 mt-0.5' />
								<p className='text-sm'>{error}</p>
							</div>
						)}

						{/* Email Input */}
						<div className='space-y-2'>
							<Label htmlFor='email'>Email Manzil</Label>
							<Input
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
