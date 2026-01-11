// frontend/app/admin/layout.tsx
'use client'

import { useAuth } from '@/lib/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const { user } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!user) {
			router.push('/login')
		}
	}, [user, router])

	if (!user) {
		return null
	}

	return (
		<div className='min-h-screen bg-gray-100'>
			<div className='flex'>
				{/* Sidebar */}
				<aside className='w-64 bg-gray-900 text-white min-h-screen p-6 fixed'>
					<h2 className='text-2xl font-bold mb-8'>🍕 Admin Panel</h2>

					<nav className='space-y-2'>
						<Link href='/admin' className='block py-2 px-4 rounded hover:bg-gray-800 transition'>
							📊 Dashboard
						</Link>
						<Link
							href='/admin/products'
							className='block py-2 px-4 rounded hover:bg-gray-800 transition'
						>
							🍕 Mahsulotlar
						</Link>
						<Link
							href='/admin/orders'
							className='block py-2 px-4 rounded hover:bg-gray-800 transition'
						>
							📦 Buyurtmalar
						</Link>
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
