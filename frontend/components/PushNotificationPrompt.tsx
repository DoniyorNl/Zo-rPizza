// frontend/components/PushNotificationPrompt.tsx
// 🔔 PUSH NOTIFICATION PERMISSION PROMPT

'use client'

import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { X, Bell } from 'lucide-react'
import { subscribeToPush, isPushSupported, getNotificationPermission } from '@/lib/pushNotifications'

export function PushNotificationPrompt() {
	const [show, setShow] = useState(false)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		// Check if we should show the prompt
		const checkShouldShow = () => {
			if (!isPushSupported()) return false

			const permission = getNotificationPermission()
			if (permission !== 'default') return false // Already granted or denied

			const dismissed = localStorage.getItem('push_prompt_dismissed')
			if (dismissed) return false

			const dontShowAgain = localStorage.getItem('push_prompt_dont_show')
			if (dontShowAgain) return false

			return true
		}

		// Show after 10 seconds delay
		const timer = setTimeout(() => {
			if (checkShouldShow()) {
				setShow(true)
			}
		}, 10000)

		return () => clearTimeout(timer)
	}, [])

	const handleAllow = async () => {
		setLoading(true)
		const success = await subscribeToPush()
		setLoading(false)

		if (success) {
			setShow(false)
			localStorage.removeItem('push_prompt_dismissed')
		}
	}

	const handleDismiss = () => {
		setShow(false)
		localStorage.setItem('push_prompt_dismissed', 'true')

		// Remove dismissed flag after 24 hours
		setTimeout(() => {
			localStorage.removeItem('push_prompt_dismissed')
		}, 24 * 60 * 60 * 1000)
	}

	const handleDontShowAgain = () => {
		setShow(false)
		localStorage.setItem('push_prompt_dont_show', 'true')
	}

	if (!show) return null

	return (
		<div className='fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5'>
			<Card className='w-80 shadow-2xl border-2 border-orange-200'>
				<CardContent className='p-4'>
					<button
						onClick={handleDismiss}
						className='absolute top-2 right-2 text-gray-400 hover:text-gray-600'
					>
						<X className='w-4 h-4' />
					</button>

					<div className='flex items-start gap-3'>
						<div className='flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center'>
							<Bell className='w-5 h-5 text-orange-600' />
						</div>

						<div className='flex-1'>
							<h3 className='font-semibold text-gray-900 mb-1'>Xabarnomalarni yoqing</h3>
							<p className='text-sm text-gray-600 mb-3'>
								Buyurtma holati haqida darhol xabar oling
							</p>

							<div className='flex gap-2'>
								<Button size='sm' onClick={handleAllow} disabled={loading} className='flex-1'>
									{loading ? 'Yuklanmoqda...' : 'Yoqish'}
								</Button>
								<Button size='sm' variant='outline' onClick={handleDismiss}>
									Keyinroq
								</Button>
							</div>

							<button
								onClick={handleDontShowAgain}
								className='text-xs text-gray-500 hover:text-gray-700 mt-2'
							>
								Boshqa ko&apos;rsatma
							</button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
