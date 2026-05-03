'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ResetPasswordPage() {
	const router = useRouter()
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)
	const [error, setError] = useState('')
	const [sessionReady, setSessionReady] = useState(false)

	useEffect(() => {
		// Supabase automatically handles the session from the URL hash
		supabase.auth.onAuthStateChange((event) => {
			if (event === 'PASSWORD_RECOVERY') {
				setSessionReady(true)
			}
		})

		supabase.auth.getSession().then(({ data }) => {
			if (data.session) setSessionReady(true)
		})
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		if (password !== confirmPassword) {
			setError('Parollar mos kelmadi')
			return
		}
		if (password.length < 6) {
			setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
			return
		}

		setLoading(true)
		try {
			const { error: updateError } = await supabase.auth.updateUser({ password })
			if (updateError) throw updateError

			setSuccess(true)
			setTimeout(() => router.replace('/login'), 2500)
		} catch (err: unknown) {
			const msg =
				err && typeof err === 'object' && 'message' in err
					? String((err as { message?: unknown }).message)
					: ''
			setError(msg || "Parolni yangilashda xatolik yuz berdi.")
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
							<span className='text-4xl'>🔑</span>
						</div>
					</div>
					<CardTitle className='text-2xl text-center font-bold'>Yangi parol</CardTitle>
					<CardDescription className='text-center'>
						Yangi parolingizni kiriting
					</CardDescription>
				</CardHeader>

				<CardContent>
					{success ? (
						<div className='text-center space-y-4'>
							<div className='flex justify-center'>
								<CheckCircle2 className='w-16 h-16 text-green-500' />
							</div>
							<p className='text-gray-700 font-medium'>Parol muvaffaqiyatli yangilandi!</p>
							<p className='text-gray-500 text-sm'>Kirish sahifasiga yo'naltirilmoqda...</p>
						</div>
					) : (
						<form onSubmit={handleSubmit} className='space-y-5'>
							{error && (
								<div className='bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3'>
									<AlertCircle className='w-5 h-5 flex-shrink-0 mt-0.5' />
									<p className='text-sm'>{error}</p>
								</div>
							)}

							<div className='space-y-2'>
								<Label htmlFor='password'>Yangi parol</Label>
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

							<div className='space-y-2'>
								<Label htmlFor='confirmPassword'>Parolni tasdiqlang</Label>
								<Input
									id='confirmPassword'
									type='password'
									placeholder='••••••••'
									value={confirmPassword}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
									required
									disabled={loading}
									className='h-11'
								/>
							</div>

							<Button
								type='submit'
								disabled={loading || !sessionReady}
								className='w-full h-11 text-base font-semibold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
							>
								{loading ? (
									<>
										<Loader2 className='mr-2 h-5 w-5 animate-spin' />
										Saqlanmoqda...
									</>
								) : (
									'Parolni saqlash'
								)}
							</Button>

							<Link
								href='/login'
								className='block text-center text-sm text-gray-500 hover:text-gray-700'
							>
								Kirish sahifasiga qaytish
							</Link>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
