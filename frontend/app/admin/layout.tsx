// frontend/app/admin/layout.tsx
'use client'

import { useAuth } from '@/lib/AuthContext'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const { user } = useAuth()
	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		if (!user) {
			router.push('/login')
		}
	}, [user, router])

	if (!user) {
		return null
	}

	// Active link checker
	const isActive = (path: string) => {
		if (path === '/admin') {
			return pathname === '/admin'
		}
		return pathname.startsWith(path)
	}

	return (
		<div className='min-h-screen bg-gray-100'>
			<div className='flex'>
				{/* Sidebar */}
				<aside className='w-64 bg-gray-900 text-white min-h-screen p-6 fixed'>
					<h2 className='text-2xl font-bold mb-8'>🍕 Admin Panel</h2>

					<nav className='space-y-2'>
						{/* Dashboard - Main Admin Page */}
						<Link
							href='/admin'
							className={`block py-2 px-4 rounded transition ${isActive('/admin') && pathname === '/admin'
								? 'bg-orange-600'
								: 'hover:bg-gray-800'
								}`}
						>
							📊 Dashboard
						</Link>

						{/* Products */}
						<Link
							href='/admin/products'
							className={`block py-2 px-4 rounded transition ${isActive('/admin/products') ? 'bg-orange-600' : 'hover:bg-gray-800'
								}`}
						>
							🍕 Mahsulotlar
						</Link>

						{/* Orders */}
						<Link
							href='/admin/orders'
							className={`block py-2 px-4 rounded transition ${isActive('/admin/orders') ? 'bg-orange-600' : 'hover:bg-gray-800'
								}`}
						>
							📦 Buyurtmalar
						</Link>

						{/* Deals */}
						<Link
							href='/admin/deals'
							className={`block py-2 px-4 rounded transition ${isActive('/admin/deals') ? 'bg-orange-600' : 'hover:bg-gray-800'
								}`}
						>
							🎯 Deals
						</Link>

						{/* Coupons */}
						<Link
							href='/admin/coupons'
							className={`block py-2 px-4 rounded transition ${isActive('/admin/coupons') ? 'bg-orange-600' : 'hover:bg-gray-800'
								}`}
						>
							🏷️ Kuponlar
						</Link>

						{/* Toppings */}
						<Link
							href='/admin/toppings'
							className={`block py-2 px-4 rounded transition ${isActive('/admin/toppings') ? 'bg-orange-600' : 'hover:bg-gray-800'
								}`}
						>
							🧀 Toppinglar
						</Link>

						{/* Categories */}
						<Link
							href='/admin/categories'
							className={`block py-2 px-4 rounded transition ${isActive('/admin/categories') ? 'bg-orange-600' : 'hover:bg-gray-800'
								}`}
						>
							📁 Kategoriyalar
						</Link>

						{/* Users/Customers */}
						<Link
							href='/admin/users'
							className={`block py-2 px-4 rounded transition ${isActive('/admin/users') ? 'bg-orange-600' : 'hover:bg-gray-800'
								}`}
						>
							👥 Foydalanuvchilar
						</Link>

						{/* Analytics */}
						<Link
							href='/admin/analytics'
							className={`block py-2 px-4 rounded transition ${isActive('/admin/analytics') ? 'bg-orange-600' : 'hover:bg-gray-800'
								}`}
						>
							📈 Statistika
						</Link>

						{/* Back to Site */}
						<Link
							href='/'
							className='block py-2 px-4 rounded hover:bg-gray-800 transition mt-8 border-t border-gray-700 pt-4'
						>
							← Saytga qaytish
						</Link>
					</nav>
				</aside>

				{/* Main Content */}
				<main className='flex-1 ml-64 p-8'>{children}</main>
			</div>
		</div>
	)
}
