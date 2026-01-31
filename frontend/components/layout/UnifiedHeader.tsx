// =====================================
// 📁 FILE PATH: frontend/components/layout/UnifiedHeader.tsx
// 🎯 UNIFIED HEADER - Admin va User uchun bitta komponent
// =====================================

'use client'

import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/AuthContext'
import { useCartStore } from '@/store/cartStore'
import { CircleUser, Home, LogOut, Navigation, Settings, ShoppingCart, Truck, User } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'

interface UnifiedHeaderProps {
	variant?: 'user' | 'admin'
}

export function UnifiedHeader({ variant = 'user' }: UnifiedHeaderProps) {
	const { user, logout } = useAuth()
	const router = useRouter()
	const pathname = usePathname()
	const totalItems = useCartStore(state => state.getTotalItems())
	const [activeOrderId, setActiveOrderId] = useState<string | null>(null)

	// Admin yoki user ekanligini pathname'dan aniqlash
	const isAdmin = useMemo(() => {
		return variant === 'admin' || pathname.startsWith('/admin')
	}, [variant, pathname])

	// Active order tekshirish - faqat user uchun
	useEffect(() => {
		if (!user || isAdmin) return

		const checkActiveOrder = async () => {
			try {
				const token = await user.getIdToken()
				const response = await api.get('/api/orders/user/' + user.uid, {
					headers: { Authorization: `Bearer ${token}` }
				})
				
				if (response.data.success) {
					const activeOrder = response.data.data.find((order: any) => 
						['PREPARING', 'OUT_FOR_DELIVERY'].includes(order.status)
					)
					setActiveOrderId(activeOrder?.id || null)
				}
			} catch (error) {
				console.error('Active order check error:', error)
			}
		}

		checkActiveOrder()
		const interval = setInterval(checkActiveOrder, 30000)
		return () => clearInterval(interval)
	}, [user, isAdmin])

	const handleLogout = async () => {
		try {
			await logout()
			router.push('/login')
		} catch (error) {
			console.error('Logout error:', error)
		}
	}

	// Styling - variant bo'yicha
	const headerStyles = isAdmin
		? 'sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm'
		: 'sticky top-0 z-50 bg-orange-600 text-white shadow-md hover:shadow-xl transition-shadow duration-300'

	const logoStyles = isAdmin
		? 'text-xl font-bold text-gray-900'
		: 'text-2xl font-bold tracking-tight cursor-pointer hover:opacity-90 transition-opacity'

	const userButtonStyles = isAdmin
		? 'flex items-center space-x-2 h-9 px-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 [&_svg]:text-gray-700 [&_svg]:hover:text-gray-900 [&_span]:text-gray-700 [&_span]:hover:text-gray-900'
		: 'flex items-center space-x-2 h-9 px-3 text-white hover:text-white hover:bg-orange-700 [&_svg]:text-white [&_svg]:hover:text-white [&_span]:text-white [&_span]:hover:text-white'

	return (
		<header className={headerStyles}>
			<div className={`container mx-auto px-4 ${isAdmin ? 'h-16' : 'h-20'} flex items-center justify-between`}>
				{/* Left Side - Logo/Title */}
				<div className='flex items-center space-x-4'>
					<h1
						onClick={() => !isAdmin && router.push('/')}
						className={logoStyles}
					>
						{isAdmin ? '🍕 Admin Panel' : '🍕 Zor Pizza'}
					</h1>
				</div>

				{/* Right Side - Actions */}
				<div className='flex items-center gap-4'>
					{/* Cart Button - Faqat user uchun */}
					{!isAdmin && (
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
					)}

					{/* Track order – creative pill (faqat user + active order) */}
					{!isAdmin && activeOrderId && (
						<button
							onClick={() => router.push(`/tracking/${activeOrderId}`)}
							className='
								group relative flex items-center gap-2 pl-3 pr-4 py-2 rounded-full
								bg-gradient-to-r from-green-500 to-emerald-600 text-white
								shadow-lg shadow-green-500/30
								hover:from-green-600 hover:to-emerald-700
								hover:shadow-green-500/40 hover:scale-[1.02]
								active:scale-[0.98]
								transition-all duration-300 cursor-pointer
								ring-2 ring-white/20 hover:ring-white/40
							'
							title="Buyurtmani kuzatish"
						>
							<span className="relative flex h-8 w-8 items-center justify-center">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40 opacity-75" />
								<Truck className="relative h-5 w-5" />
							</span>
							<span className="hidden sm:inline font-semibold text-sm whitespace-nowrap">
								Yo&apos;lda
							</span>
							<Navigation className="h-4 w-4 opacity-90 group-hover:translate-x-0.5 transition-transform hidden xs:block" />
							<span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
								<span className="absolute inline-flex h-full w-full rounded-full bg-green-400 animate-ping opacity-80" />
								<span className="relative inline-flex h-4 w-4 rounded-full bg-green-300 border-2 border-white" />
							</span>
						</button>
					)}

					{/* Notifications - Hammasi uchun */}
					<NotificationDropdown />

					{/* User Menu */}
					{user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									className={userButtonStyles}
								>
									<CircleUser className='h-5 w-5' />
									<span className='hidden sm:block font-medium'>
										{user.email || (isAdmin ? 'Admin' : 'User')}
									</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end' className='w-56'>
								<DropdownMenuLabel>
									<div className='flex flex-col space-y-1'>
										<p className='text-sm font-medium'>{user.email}</p>
										<p className='text-xs text-gray-500'>
											{isAdmin ? 'Administrator' : 'Foydalanuvchi'}
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />

								{/* Admin menu items */}
								{isAdmin ? (
									<>
										<DropdownMenuItem
											className='cursor-pointer'
											onClick={() => router.push('/admin/users')}
										>
											<User className='mr-2 h-4 w-4' />
											<span>Profil</span>
										</DropdownMenuItem>
										<DropdownMenuItem
											className='cursor-pointer'
											onClick={() => router.push('/admin/settings')}
										>
											<Settings className='mr-2 h-4 w-4' />
											<span>Sozlamalar</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className='cursor-pointer'
											onClick={() => router.push('/')}
										>
											<Home className='mr-2 h-4 w-4' />
											<span>Saytga qaytish</span>
										</DropdownMenuItem>
									</>
								) : (
									<>
										{/* User menu items */}
										<DropdownMenuItem
											className='cursor-pointer'
											onClick={() => router.push('/orders')}
										>
											<User className='mr-2 h-4 w-4' />
											<span>Mening buyurtmalarim</span>
										</DropdownMenuItem>
										<DropdownMenuItem
											className='cursor-pointer'
											onClick={() => router.push('/profile')}
										>
											<Settings className='mr-2 h-4 w-4' />
											<span>Profil</span>
										</DropdownMenuItem>
									</>
								)}

								<DropdownMenuSeparator />
								<DropdownMenuItem
									className='cursor-pointer text-red-600 focus:text-red-600'
									onClick={handleLogout}
								>
									<LogOut className='mr-2 h-4 w-4' />
									<span>Chiqish</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						// Login/Register buttons - Faqat user uchun
						!isAdmin && (
							<>
								<Button
									variant='outline'
									onClick={() => router.push('/login')}
									className='bg-white text-orange-600 border-white/60 hover:bg-orange-50 hover:shadow-md active:scale-95 transition-all'
								>
									Kirish
								</Button>
								<Button
									onClick={() => router.push('/register')}
									className='bg-orange-700 hover:bg-orange-800 hover:shadow-lg active:scale-95 transition-all'
								>
									Ro&apos;yxatdan o&apos;tish
								</Button>
							</>
						)
					)}
				</div>
			</div>
		</header>
	)
}
