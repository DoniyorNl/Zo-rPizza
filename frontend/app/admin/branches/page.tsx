'use client'

import { Button } from '@/components/ui/button'
import { buildApiUrl } from '@/lib/apiBaseUrl'
import { Plus, MapPin, Pencil, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { BranchModal, type Branch } from './components/BranchModal'
import { Toast } from '../products/components/Toast'

export default function AdminBranchesPage() {
	const [branches, setBranches] = useState<Branch[]>([])
	const [loading, setLoading] = useState(true)
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
	const [showAddModal, setShowAddModal] = useState(false)
	const [editingBranch, setEditingBranch] = useState<Branch | null>(null)

	const fetchBranches = useCallback(async () => {
		try {
			const token = typeof window !== 'undefined' ? localStorage.getItem('firebaseToken') : null
			if (!token) return
			const res = await fetch(buildApiUrl('/api/branches/admin/all'), {
				headers: { Authorization: `Bearer ${token}` },
			})
			const data = await res.json()
			if (data?.success && Array.isArray(data.data)) setBranches(data.data)
			else setBranches([])
		} catch {
			setBranches([])
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchBranches()
	}, [fetchBranches])

	const handleDelete = async (id: string, name: string) => {
		if (!confirm(`"${name}" filialini o'chirish (faolsizlantirish)?`)) return
		try {
			const token = localStorage.getItem('firebaseToken')
			const res = await fetch(buildApiUrl(`/api/branches/${id}`), {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			})
			if (!res.ok) throw new Error()
			setToast({ message: 'Filial faolsizlantirildi', type: 'success' })
			fetchBranches()
		} catch {
			setToast({ message: 'O\'chirishda xatolik', type: 'error' })
		}
	}

	return (
		<div className='p-6'>
			{toast && (
				<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
			)}

			<div className='flex items-center justify-between mb-6'>
				<div>
					<h1 className='text-3xl font-bold mb-2'>Filiallar</h1>
					<p className='text-gray-600'>
						Filial qo&apos;shing, joylashuvni Google Maps dan nusxalab qo&apos;llang. Mijozlar &quot;Olib ketish&quot; da shu ro&apos;yxatni ko&apos;radi.
					</p>
				</div>
				<Button
					onClick={() => setShowAddModal(true)}
					className='bg-orange-600 hover:bg-orange-700'
				>
					<Plus className='w-4 h-4 mr-2' />
					Yangi filial
				</Button>
			</div>

			{loading ? (
				<div className='text-center py-12 text-gray-500'>Yuklanmoqda...</div>
			) : branches.length === 0 ? (
				<div className='text-center py-12 bg-white rounded-xl border'>
					<MapPin className='w-12 h-12 text-gray-400 mx-auto mb-4' />
					<p className='text-gray-600 mb-4'>Hozircha filial yo&apos;q</p>
					<Button onClick={() => setShowAddModal(true)} className='bg-orange-600 hover:bg-orange-700'>
						Birinchi filialni qo&apos;shish
					</Button>
				</div>
			) : (
				<div className='bg-white rounded-xl border overflow-hidden'>
					<table className='w-full'>
						<thead className='bg-gray-50 border-b'>
							<tr>
								<th className='text-left py-3 px-4 font-semibold text-gray-700'>Nomi</th>
								<th className='text-left py-3 px-4 font-semibold text-gray-700'>Manzil</th>
								<th className='text-left py-3 px-4 font-semibold text-gray-700'>Koordinatalar</th>
								<th className='text-left py-3 px-4 font-semibold text-gray-700'>Holat</th>
								<th className='text-right py-3 px-4 font-semibold text-gray-700'>Amallar</th>
							</tr>
						</thead>
						<tbody>
							{branches.map((b) => (
								<tr key={b.id} className='border-b last:border-0 hover:bg-gray-50'>
									<td className='py-3 px-4 font-medium'>{b.name}</td>
									<td className='py-3 px-4 text-gray-600'>{b.address}</td>
									<td className='py-3 px-4 text-sm text-gray-500'>
										{b.lat.toFixed(4)}, {b.lng.toFixed(4)}
									</td>
									<td className='py-3 px-4'>
										<span
											className={`inline-block px-2 py-1 rounded text-xs font-medium ${
												b.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
											}`}
										>
											{b.isActive ? 'Faol' : 'Faol emas'}
										</span>
									</td>
									<td className='py-3 px-4 text-right'>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => setEditingBranch(b)}
											className='mr-2'
										>
											<Pencil className='w-4 h-4' />
										</Button>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => handleDelete(b.id, b.name)}
											className='text-red-600 hover:text-red-700'
										>
											<Trash2 className='w-4 h-4' />
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{(showAddModal || editingBranch) && (
				<BranchModal
					branch={editingBranch}
					onClose={() => {
						setShowAddModal(false)
						setEditingBranch(null)
					}}
					onSuccess={(msg) => {
						setToast({ message: msg, type: msg.startsWith('Filial') ? 'success' : 'error' })
						fetchBranches()
					}}
				/>
			)}
		</div>
	)
}
