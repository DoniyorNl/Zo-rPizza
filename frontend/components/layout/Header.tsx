// frontend/components/layout/Header.tsx
// 🍕 HEADER COMPONENT

'use client'

import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export function Header() {
	const { user, logout } = useAuth()
	const router = useRouter()
	const totalItems = useCartStore(state => state.getTotalItems())

	const handleLogout = async () => {
		try {
			await logout()
			router.push('/login')
		} catch (error) {
			console.error('Logout error:', error)
		}
	}

	return (
		<header className='sticky top-0 z-50 bg-orange-600 text-white shadow-md hover:shadow-xl transition-shadow duration-300'>
			<div className='container mx-auto px-4 h-20 flex items-center justify-between'>
				{/* Logo */}
				<h1
					onClick={() => router.push('/')}
					className='text-2xl font-bold tracking-tight cursor-pointer hover:opacity-90 transition-opacity'
				>
					🍕 Zor Pizza
				</h1>

				{/* Actions */}
				<div className='flex items-center gap-5'>
					{/* Cart */}
					<button
						onClick={() => router.push('/cart')}
						className='relative flex items-center justify-center w-10 h-10 rounded-full
					bg-orange-500 hover:bg-orange-700
					transition-all duration-200
					hover:shadow-lg active:scale-95 cursor-pointer'
					>
						<ShoppingCart className='w-5 h-5' />
						{totalItems > 0 && (
							<Badge className='absolute -top-1.5 -right-1.5 bg-orange-900 text-white px-1.5 py-0.5 text-xs shadow'>
								{totalItems}
							</Badge>
						)}
					</button>

					{user ? (
						<>
							{/* User */}
							<span className='hidden sm:block text-sm font-medium opacity-90'>{user.email}</span>

							<Button
								variant='outline'
								onClick={handleLogout}
								className='
							bg-white text-orange-600
							border-white/60
							hover:bg-white
							hover:shadow-md
							active:scale-95
							transition-all
							cursor-pointer
						'
							>
								Chiqish
							</Button>
						</>
					) : (
						<>
							<Button
								variant='outline'
								onClick={() => router.push('/login')}
								className='
							bg-white text-orange-600
							border-white/60
							hover:bg-orange-50
							hover:shadow-md
							active:scale-95
							transition-all
						'
							>
								Kirish
							</Button>

							<Button
								onClick={() => router.push('/register')}
								className='
							bg-orange-700
							hover:bg-orange-800
							hover:shadow-lg
							active:scale-95
							transition-all
						'
							>
								Ro'yxatdan o'tish
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	)
}
