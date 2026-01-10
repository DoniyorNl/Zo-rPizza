// frontend/app/(auth)/login/page.tsx
// 🔐 LOGIN PAGE

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
			await login(email, password)
			router.push('/')
		} catch (err: any) {
			setError(err.message || 'Login xatosi')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4'>
			<Card className='w-full max-w-md'>
				<CardHeader>
					<CardTitle className='text-3xl text-center'>🍕 Kirish</CardTitle>
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

						<Button type='submit' className='w-full' disabled={loading}>
							{loading ? 'Yuklanmoqda...' : 'Kirish'}
						</Button>

						<p className='text-center text-sm'>
							Akkaunt yo'qmi?{' '}
							<a href='/register' className='text-orange-600 hover:underline'>
								Ro'yxatdan o'tish
							</a>
						</p>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
