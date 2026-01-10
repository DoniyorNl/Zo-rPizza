// frontend/app/admin/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
	const router = useRouter()

	useEffect(() => {
		router.replace('/admin/orders')
	}, [router])

	return <div className='text-center py-12'>Yo'naltirilmoqda...</div>
}
