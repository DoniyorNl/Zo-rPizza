'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildApiUrl } from '@/lib/apiBaseUrl'
import { normalizeDecimal, parseLocationInput } from '@/lib/parseLocation'
import { MapPin } from 'lucide-react'
import { useState } from 'react'

export interface BranchFormData {
	name: string
	address: string
	lat: number
	lng: number
	phone: string
	isActive: boolean
}

export interface Branch {
	id: string
	name: string
	address: string
	lat: number
	lng: number
	phone: string | null
	isActive: boolean
}

interface BranchModalProps {
	branch: Branch | null
	onClose: () => void
	onSuccess: (message: string) => void
}

export function BranchModal({ branch, onClose, onSuccess }: BranchModalProps) {
	const [loading, setLoading] = useState(false)
	const [resolvingLocation, setResolvingLocation] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [locationPaste, setLocationPaste] = useState('')
	const [formData, setFormData] = useState<BranchFormData>({
		name: branch?.name ?? '',
		address: branch?.address ?? '',
		lat: branch?.lat ?? 41.2995,
		lng: branch?.lng ?? 69.2401,
		phone: branch?.phone ?? '',
		isActive: branch?.isActive ?? true,
	})

	const handleApplyLocation = async () => {
		const raw = locationPaste.trim()
		if (!raw) return
		let toParse = raw
		setResolvingLocation(true)
		try {
			// Qisqa link bo'lsa: backend linkni ochadi va URL dan lat/lng ajratadi (xuddi shu joy – masalan Leerdam – to'g'ri chiqadi)
			let parsed: { lat: number; lng: number } | null = null
			if (/^(https?:\/\/)?(www\.)?(maps\.app\.)?goo\.gl\/\S+$/i.test(raw)) {
				try {
					const url = buildApiUrl('/api/branches/resolve-map-url?url=' + encodeURIComponent(raw))
					const res = await fetch(url)
					const data = await res.json()
					if (data?.lat != null && data?.lng != null) {
						parsed = { lat: Number(data.lat), lng: Number(data.lng) }
					} else if (data?.url) {
						toParse = data.url
					}
				} catch {
					// resolve xato – keyin toParse ni frontend da parse qilamiz
				}
			}
			if (!parsed) parsed = parseLocationInput(toParse)
			if (parsed) {
				// Faqat lat/lng ni to‘ldiramiz. Manzilni admin Google dan ko‘rib qo‘lda kiritadi –
				// Nominatim boshqa formatda yoki xato manzil qaytarishi mumkin.
				setFormData((prev) => ({
					...prev,
					lat: parsed!.lat,
					lng: parsed!.lng,
				}))
				setLocationPaste('')
			}
		} finally {
			setResolvingLocation(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)
		try {
			const token = typeof window !== 'undefined' ? localStorage.getItem('firebaseToken') : null
			if (!token) {
				setError('Kirish talab qilinadi')
				setLoading(false)
				return
			}
			if (branch) {
				const res = await fetch(buildApiUrl(`/api/branches/${branch.id}`), {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						name: formData.name.trim(),
						address: formData.address.trim(),
						lat: normalizeDecimal(String(formData.lat)),
						lng: normalizeDecimal(String(formData.lng)),
						phone: formData.phone.trim() || null,
						isActive: formData.isActive,
					}),
				})
				if (!res.ok) throw new Error((await res.json()).message || 'Xatolik')
				onSuccess('Filial yangilandi')
				onClose()
			} else {
				const res = await fetch(buildApiUrl('/api/branches'), {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						name: formData.name.trim(),
						address: formData.address.trim(),
						lat: normalizeDecimal(String(formData.lat)),
						lng: normalizeDecimal(String(formData.lng)),
						phone: formData.phone.trim() || null,
					}),
				})
				if (!res.ok) throw new Error((await res.json()).message || 'Xatolik')
				onSuccess("Filial qo'shildi")
				onClose()
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
			<Card className='w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
				<CardHeader>
					<CardTitle>
						{branch ? 'Filialni tahrirlash' : "Yangi filial qo'shish"}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{error && (
						<div className='mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm'>{error}</div>
					)}
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<label className='block text-sm font-medium mb-2'>Nomi *</label>
							<input
								type='text'
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
								placeholder='Filial 1, Chilonzor filiali...'
								required
							/>
						</div>
						<div>
							<label className='block text-sm font-medium mb-2'>Manzil *</label>
							<input
								type='text'
								value={formData.address}
								onChange={(e) => setFormData({ ...formData, address: e.target.value })}
								className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
								placeholder="Toshkent, Amir Temur ko'chasi 1"
								required
							/>
						</div>

						{/* Joylashuv: Google Maps link yoki koordinatalar */}
						<div className='rounded-lg border-2 border-orange-200 bg-orange-50/50 p-4'>
							<label className='block text-sm font-medium mb-2 flex items-center gap-2'>
								<MapPin className='w-4 h-4 text-orange-600' />
								Joylashuv (xaritada filial qayerda ko‘rinishi — Google Maps dan)
							</label>
							<div className='text-xs text-gray-600 mb-2 space-y-1'>
								<p className='font-medium text-gray-700'>Qayerdan olinadi:</p>
								<ol className='list-decimal list-inside space-y-0.5 ml-1'>
									<li>Google Maps da joyni qidiring (masalan manzil yoki joy nomi).</li>
									<li>Xaritada nuqtani bosing → <strong>Ulashish</strong> → <strong>&quot;Koordinatalarni nusxalash&quot;</strong> yoki linkni nusxalang.</li>
									<li>Nusxalangan matn yoki linkni pastdagi qutiga yopishtiring va <strong>Qo&apos;llash</strong> ni bosing — Lat va Lng avtomatik to‘ladi.</li>
									<li><strong>Manzil</strong> maydoniga yuqorida ko‘rgan joy nomi/ko‘cha manzilini qo‘lda kiriting (Google dan nusxalab bo‘ladi).</li>
								</ol>
								<p className='mt-1'>Yoki qo‘lda kiriting: <code className='bg-white px-1 rounded'>41.2995, 69.2401</code> (Toshkent)</p>
							</div>
							<div className='flex gap-2'>
								<input
									type='text'
									value={locationPaste}
									onChange={(e) => setLocationPaste(e.target.value)}
									className='flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
									placeholder='51.894, 5.097 yoki https://www.google.com/maps?q=51.894,5.097'
								/>
								<Button type='button' variant='outline' onClick={handleApplyLocation} disabled={resolvingLocation}>
									{resolvingLocation ? 'Ochilmoqda...' : "Qo'llash"}
								</Button>
							</div>
							<div className='grid grid-cols-2 gap-2 mt-2'>
								<div>
									<label className='block text-xs text-gray-500'>Lat (Qo&apos;llash dan keyin to‘ladi yoki qo‘lda, masalan 51.894)</label>
									<input
										type='text'
										inputMode='decimal'
										value={formData.lat}
										onChange={(e) => setFormData({ ...formData, lat: normalizeDecimal(e.target.value) || 0 })}
										className='w-full px-3 py-2 border rounded-lg text-sm'
										placeholder='51.894'
									/>
								</div>
								<div>
									<label className='block text-xs text-gray-500'>Lng (Qo&apos;llash dan keyin to‘ladi yoki qo‘lda, masalan 5.097)</label>
									<input
										type='text'
										inputMode='decimal'
										value={formData.lng}
										onChange={(e) => setFormData({ ...formData, lng: normalizeDecimal(e.target.value) || 0 })}
										className='w-full px-3 py-2 border rounded-lg text-sm'
										placeholder='5.097'
									/>
								</div>
							</div>
						</div>

						<div>
							<label className='block text-sm font-medium mb-2'>Telefon</label>
							<input
								type='tel'
								value={formData.phone}
								onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
								className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
								placeholder='+998712000000'
							/>
						</div>

						{branch && (
							<div className='flex items-center gap-2'>
								<input
									type='checkbox'
									id='isActive'
									checked={formData.isActive}
									onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
									className='w-4 h-4'
								/>
								<label htmlFor='isActive' className='text-sm font-medium'>Filial faol</label>
							</div>
						)}

						<div className='flex gap-4 pt-4'>
							<Button
								type='submit'
								disabled={loading}
								className='flex-1 bg-orange-600 hover:bg-orange-700'
							>
								{loading ? 'Saqlanmoqda...' : branch ? 'Yangilash' : "Qo'shish"}
							</Button>
							<Button type='button' variant='outline' onClick={onClose} className='flex-1'>
								Bekor qilish
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
