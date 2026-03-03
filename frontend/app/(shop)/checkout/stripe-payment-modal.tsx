'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useMemo, useState } from 'react'

type CardStep = {
	orderId: string
	orderNumber: string
	clientSecret: string
	totalAmount: number
}

function CardPaymentForm({
	orderId,
	orderNumber,
	totalAmount,
	onClose,
	onSuccess,
}: {
	orderId: string
	orderNumber: string
	totalAmount: number
	onClose: () => void
	onSuccess: () => void
}) {
	const stripe = useStripe()
	const elements = useElements()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const handlePay = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!stripe || !elements) return
		setError('')
		setLoading(true)

		try {
			const origin = typeof window !== 'undefined' ? window.location.origin : ''
			const returnUrl = `${origin}/checkout/success?orderId=${orderId}&orderNumber=${encodeURIComponent(orderNumber)}&paid=1`
			const { error: confirmError } = await stripe.confirmPayment({
				elements,
				confirmParams: { return_url: returnUrl },
			})
			if (confirmError) {
				setError(confirmError.message ?? "To'lov amalga oshmadi")
				setLoading(false)
				return
			}
			onSuccess()
		} catch {
			setError("To'lov amalga oshmadi")
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handlePay} className='space-y-6 pb-2'>
			<div className='rounded-lg bg-orange-50 border border-orange-200 p-3'>
				<p className='text-sm text-orange-800'>
					Buyurtma: <span className='font-semibold'>{orderNumber || orderId}</span>
				</p>
				<p className='text-sm text-orange-800'>
					Jami: <span className='font-semibold'>{totalAmount.toLocaleString()} so&apos;m</span>
				</p>
			</div>
			<p className='text-sm text-gray-600'>
				Qo&apos;llab-quvvatlanadigan qurilmalarda Google Pay avtomatik ko&apos;rinadi. Aks holda karta raqami orqali to&apos;lang.
			</p>
			<PaymentElement />
			{error && <div className='bg-red-50 text-red-600 p-3 rounded text-sm'>{error}</div>}
			<div className='flex gap-3 sticky bottom-0 bg-white pt-2'>
				<Button type='button' variant='outline' onClick={onClose} disabled={loading}>
					Yopish
				</Button>
				<Button type='submit' disabled={!stripe || loading}>
					{loading ? "To'lanmoqda..." : "To'lash"}
				</Button>
			</div>
		</form>
	)
}

export default function StripePaymentModal({
	publishableKey,
	cardStep,
	onRequestClose,
	onSuccess,
}: {
	publishableKey: string
	cardStep: CardStep
	onRequestClose: () => void
	onSuccess: () => void
}) {
	const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey])

	return (
		<div
			className='fixed inset-0 z-50 bg-black/60 p-2 sm:p-4 flex items-end sm:items-center justify-center'
			onClick={() => {
				if (window.confirm("To'lov modalini yopmoqchimisiz?")) onRequestClose()
			}}
		>
			<Card
				className='w-full max-w-2xl h-[92vh] sm:h-auto sm:max-h-[92vh] overflow-hidden flex flex-col rounded-2xl'
				onClick={e => e.stopPropagation()}
			>
				<CardHeader className='border-b shrink-0'>
					<div className='flex items-center justify-between gap-2'>
						<div>
							<CardTitle>Karta orqali to&apos;lash</CardTitle>
							<p className='text-xs text-gray-500 mt-1'>Xavfsiz Stripe checkout</p>
						</div>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								if (window.confirm("To'lov modalini yopmoqchimisiz?")) onRequestClose()
							}}
						>
							✕
						</Button>
					</div>
				</CardHeader>

				<CardContent className='space-y-4 pt-5 overflow-y-auto'>
					<Elements
						stripe={stripePromise}
						options={{
							clientSecret: cardStep.clientSecret,
							appearance: {
								theme: 'stripe',
								variables: { colorPrimary: '#ea580c' },
							},
						}}
					>
						<CardPaymentForm
							orderId={cardStep.orderId}
							orderNumber={cardStep.orderNumber}
							totalAmount={cardStep.totalAmount}
							onClose={onRequestClose}
							onSuccess={onSuccess}
						/>
					</Elements>
				</CardContent>
			</Card>
		</div>
	)
}

