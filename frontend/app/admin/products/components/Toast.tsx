import { useEffect } from 'react'
import { ToastType } from '../types/product.types'

interface ToastProps {
	message: string
	type?: ToastType
	onClose: () => void
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
	useEffect(() => {
		const timer = setTimeout(onClose, 2000)
		return () => clearTimeout(timer)
	}, [onClose])

	return (
		<div className='fixed top-4 right-4 z-50 animate-in slide-in-from-top-2'>
			<div
				className={`px-6 py-4 rounded-lg shadow-lg ${
					type === 'success' ? 'bg-green-500' : 'bg-red-500'
				} text-white flex items-center gap-3`}
			>
				<span className='text-2xl'>{type === 'success' ? '✓' : '✕'}</span>
				<span className='font-medium'>{message}</span>
			</div>
		</div>
	)
}
