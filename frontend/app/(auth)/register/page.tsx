// frontend/app/(auth)/register/page.tsx
// 📝 REGISTER PAGE

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const { signup } = useAuth()
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		// Validation
		if (password !== confirmPassword) {
			return setError('Parollar mos kelmadi')
		}

		if (password.length < 6) {
			return setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
		}

		setLoading(true)

		try {
			await signup(email, password)
			router.push('/')
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message || "Ro'yxatdan o'tishda xato")
			} else {
				setError("Ro'yxatdan o'tishda xato")
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4'>
			<Card className='w-full max-w-md'>
				<CardHeader>
					<CardTitle className='text-3xl text-center'>🍕 Ro&apos;yxatdan o&apos;tish</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						{error && <div className='bg-red-50 text-red-600 p-3 rounded'>{error}</div>}

						<div>
							<label className='block text-sm font-medium mb-2'>Email</label>
							<input
								type='email'
								value={email}
								onChange={e => setEmail(e.target.value)}
								className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
								required
							/>
						</div>

						<div>
							<label className='block text-sm font-medium mb-2'>Parol</label>
							<input
								type='password'
								value={password}
								onChange={e => setPassword(e.target.value)}
								className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
								required
							/>
						</div>

						<div>
							<label className='block text-sm font-medium mb-2'>Parolni tasdiqlang</label>
							<input
								type='password'
								value={confirmPassword}
								onChange={e => setConfirmPassword(e.target.value)}
								className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
								required
							/>
						</div>

						<Button type='submit' className='w-full' disabled={loading}>
							{loading ? 'Yuklanmoqda...' : "Ro'yxatdan o'tish"}
						</Button>

						<p className='text-center text-sm'>
							Akkauntingiz bormi?{' '}
							<a href='/login' className='text-orange-600 hover:underline'>
								Kirish
							</a>
						</p>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
