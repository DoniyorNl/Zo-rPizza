'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`,
			})

			if (resetError) throw resetError

			setSuccess(true)
		} catch (err: unknown) {
			const msg =
				err && typeof err === 'object' && 'message' in err
					? String((err as { message?: unknown }).message)
					: ''
			setError(msg || "Xatolik yuz berdi. Qayta urinib ko'ring.")
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
							<span className='text-4xl'>🔐</span>
						</div>
					</div>
					<CardTitle className='text-2xl text-center font-bold'>Parolni tiklash</CardTitle>
					<CardDescription className='text-center'>
						Email manzilingizni kiriting — tiklash havolasini yuboramiz
					</CardDescription>
				</CardHeader>

				<CardContent>
					{success ? (
						<div className='text-center space-y-4'>
							<div className='flex justify-center'>
								<CheckCircle2 className='w-16 h-16 text-green-500' />
							</div>
							<p className='text-gray-700 font-medium'>Xat yuborildi!</p>
							<p className='text-gray-500 text-sm'>
								<strong>{email}</strong> manziliga parolni tiklash havolasi yuborildi.
								Pochtangizni tekshiring (spam papkasini ham).
							</p>
							<Link href='/login'>
								<Button className='w-full mt-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'>
									Kirish sahifasiga qaytish
								</Button>
							</Link>
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
								<Label htmlFor='email'>Email manzil</Label>
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

							<Button
								type='submit'
								className='w-full h-11 text-base font-semibold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
								disabled={loading}
							>
								{loading ? (
									<>
										<Loader2 className='mr-2 h-5 w-5 animate-spin' />
										Yuborilmoqda...
									</>
								) : (
									'Tiklash havolasini yuborish'
								)}
							</Button>

							<Link
								href='/login'
								className='flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700'
							>
								<ArrowLeft className='w-4 h-4' />
								Kirish sahifasiga qaytish
							</Link>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
