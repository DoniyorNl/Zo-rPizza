/**
 * 🚗 DRIVER SETTINGS PAGE
 * Driver sozlamalari
 * - Profile info edit
 * - Vehicle type
 * - Availability status
 * - Notification settings
 */

'use client'

import { buildApiUrl } from '@/lib/apiBaseUrl'
import { useAuth } from '@/lib/AuthContext'
import {
	AlertCircle,
	Bell,
	CheckCircle,
	Mail,
	MapPin,
	Phone,
	Save,
	Settings as SettingsIcon,
	Truck,
	User,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function DriverSettingsPage() {
	const { backendUser } = useAuth()
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Form state
	const [name, setName] = useState('')
	const [phone, setPhone] = useState('')
	const [vehicleType, setVehicleType] = useState<'car' | 'bike' | 'scooter'>('bike')
	const [driverStatus, setDriverStatus] = useState<'available' | 'busy' | 'offline'>('available')

	// Initialize form with user data
	useEffect(() => {
		if (backendUser) {
			setName(backendUser.name || '')
			setPhone(backendUser.phone || '')
			setVehicleType((backendUser.vehicleType as any) || 'bike')
			// Assuming driverStatus is available in backendUser
			// setDriverStatus(backendUser.driverStatus || 'available')
		}
	}, [backendUser])

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError(null)
		setSuccess(false)

		try {
			const token = localStorage.getItem('firebaseToken')
			if (!token) throw new Error('Token topilmadi')

			const response = await fetch(buildApiUrl(`/api/users/${backendUser?.id}`), {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					name,
					phone,
					vehicleType,
					// driverStatus,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.message || 'Xatolik yuz berdi')
			}

			setSuccess(true)
			setTimeout(() => setSuccess(false), 3000)
		} catch (err) {
			console.error('Update error:', err)
			setError(err instanceof Error ? err.message : 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold mb-2'>Sozlamalar</h1>
						<p className='text-indigo-100'>Profilingizni va sozlamalaringizni boshqaring</p>
					</div>
					<SettingsIcon className='w-16 h-16 opacity-50' />
				</div>
			</div>

			{/* Success/Error Messages */}
			{success && (
				<div className='bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3'>
					<CheckCircle className='w-6 h-6 text-green-600' />
					<p className='text-green-800 font-medium'>Sozlamalar muvaffaqiyatli saqlandi!</p>
				</div>
			)}

			{error && (
				<div className='bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3'>
					<AlertCircle className='w-6 h-6 text-red-600' />
					<p className='text-red-800 font-medium'>{error}</p>
				</div>
			)}

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Main Settings Form */}
				<div className='lg:col-span-2'>
					<form onSubmit={handleSubmit} className='bg-white rounded-2xl shadow-lg p-8 space-y-6'>
						<h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center'>
							<User className='w-6 h-6 text-indigo-600 mr-3' />
							Profil ma&apos;lumotlari
						</h2>

						{/* Name */}
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								<User className='w-4 h-4 inline mr-2' />
								Ism
							</label>
							<input
								type='text'
								value={name}
								onChange={e => setName(e.target.value)}
								required
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
								placeholder='Ismingizni kiriting'
							/>
						</div>

						{/* Phone */}
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								<Phone className='w-4 h-4 inline mr-2' />
								Telefon raqam
							</label>
							<input
								type='tel'
								value={phone}
								onChange={e => setPhone(e.target.value)}
								required
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
								placeholder='+998 90 123 45 67'
							/>
						</div>

						{/* Email (read-only) */}
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								<Mail className='w-4 h-4 inline mr-2' />
								Email
							</label>
							<input
								type='email'
								value={backendUser?.email || ''}
								disabled
								className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500'
							/>
							<p className='text-xs text-gray-500 mt-1'>Email ni o&apos;zgartirib bo&apos;lmaydi</p>
						</div>

						{/* Vehicle Type */}
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-3'>
								<Truck className='w-4 h-4 inline mr-2' />
								Transport turi
							</label>
							<div className='grid grid-cols-3 gap-3'>
								<VehicleOption
									value='bike'
									label='Mototsikl'
									icon='🏍️'
									selected={vehicleType === 'bike'}
									onClick={() => setVehicleType('bike')}
								/>
								<VehicleOption
									value='scooter'
									label='Skuter'
									icon='🛵'
									selected={vehicleType === 'scooter'}
									onClick={() => setVehicleType('scooter')}
								/>
								<VehicleOption
									value='car'
									label='Mashina'
									icon='🚗'
									selected={vehicleType === 'car'}
									onClick={() => setVehicleType('car')}
								/>
							</div>
						</div>

						{/* Status (future feature) */}
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-3'>
								<MapPin className='w-4 h-4 inline mr-2' />
								Holat
							</label>
							<div className='grid grid-cols-3 gap-3'>
								<StatusOption
									value='available'
									label='Faol'
									color='green'
									selected={driverStatus === 'available'}
									onClick={() => setDriverStatus('available')}
								/>
								<StatusOption
									value='busy'
									label='Band'
									color='orange'
									selected={driverStatus === 'busy'}
									onClick={() => setDriverStatus('busy')}
								/>
								<StatusOption
									value='offline'
									label='Offline'
									color='gray'
									selected={driverStatus === 'offline'}
									onClick={() => setDriverStatus('offline')}
								/>
							</div>
							<p className='text-xs text-gray-500 mt-2'>
								Holatingiz avtomatik tizim tomonidan yangilanadi
							</p>
						</div>

						{/* Submit Button */}
						<button
							type='submit'
							disabled={loading}
							className='w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{loading ? (
								<>
									<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
									<span>Saqlanmoqda...</span>
								</>
							) : (
								<>
									<Save className='w-5 h-5' />
									<span>O&apos;zgarishlarni saqlash</span>
								</>
							)}
						</button>
					</form>
				</div>

				{/* Sidebar Info */}
				<div className='space-y-6'>
					{/* Account Info */}
					<div className='bg-white rounded-2xl shadow-lg p-6'>
						<h3 className='text-lg font-bold text-gray-900 mb-4'>Hisob ma&apos;lumotlari</h3>
						<div className='space-y-3 text-sm'>
							<div className='flex items-center justify-between py-2 border-b border-gray-100'>
								<span className='text-gray-600'>Role:</span>
								<span className='bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium'>
									DRIVER
								</span>
							</div>
							<div className='flex items-center justify-between py-2 border-b border-gray-100'>
								<span className='text-gray-600'>Status:</span>
								<span className='bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium'>
									Aktiv
								</span>
							</div>
							<div className='flex items-center justify-between py-2'>
								<span className='text-gray-600'>ID:</span>
								<span className='text-gray-900 font-mono text-xs'>
									{backendUser?.id.slice(0, 8)}...
								</span>
							</div>
						</div>
					</div>

					{/* Notifications */}
					<div className='bg-white rounded-2xl shadow-lg p-6'>
						<h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
							<Bell className='w-5 h-5 text-indigo-600 mr-2' />
							Bildirishnomalar
						</h3>
						<div className='space-y-3'>
							<label className='flex items-center justify-between cursor-pointer'>
								<span className='text-sm text-gray-700'>Yangi buyurtmalar</span>
								<input
									type='checkbox'
									defaultChecked
									className='w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500'
								/>
							</label>
							<label className='flex items-center justify-between cursor-pointer'>
								<span className='text-sm text-gray-700'>SMS bildirishnomalar</span>
								<input
									type='checkbox'
									defaultChecked
									className='w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500'
								/>
							</label>
							<label className='flex items-center justify-between cursor-pointer'>
								<span className='text-sm text-gray-700'>Email bildirishnomalar</span>
								<input
									type='checkbox'
									className='w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500'
								/>
							</label>
						</div>
					</div>

					{/* Help */}
					<div className='bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100'>
						<h3 className='text-lg font-bold text-gray-900 mb-2'>Yordam kerakmi?</h3>
						<p className='text-sm text-gray-600 mb-4'>
							Muammo yuzaga kelsa yoki savol bo&apos;lsa, biz bilan bog&apos;laning.
						</p>
						<button className='w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium'>
							Yordam markaziga murojaat
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

/**
 * Vehicle Option Component
 */
interface VehicleOptionProps {
	value: string
	label: string
	icon: string
	selected: boolean
	onClick: () => void
}

function VehicleOption({ label, icon, selected, onClick }: VehicleOptionProps) {
	return (
		<button
			type='button'
			onClick={onClick}
			className={`p-4 rounded-lg border-2 transition-all ${selected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'}`}
		>
			<div className='text-3xl mb-2'>{icon}</div>
			<p className={`text-sm font-medium ${selected ? 'text-indigo-600' : 'text-gray-700'}`}>
				{label}
			</p>
		</button>
	)
}

/**
 * Status Option Component
 */
interface StatusOptionProps {
	value: string
	label: string
	color: 'green' | 'orange' | 'gray'
	selected: boolean
	onClick: () => void
}

function StatusOption({ label, color, selected, onClick }: StatusOptionProps) {
	const colorClasses = {
		green: selected
			? 'border-green-600 bg-green-50 text-green-700'
			: 'border-gray-200 hover:border-green-300 hover:bg-green-50',
		orange: selected
			? 'border-orange-600 bg-orange-50 text-orange-700'
			: 'border-gray-200 hover:border-orange-300 hover:bg-orange-50',
		gray: selected
			? 'border-gray-600 bg-gray-50 text-gray-700'
			: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
	}

	return (
		<button
			type='button'
			onClick={onClick}
			className={`p-4 rounded-lg border-2 transition-all ${colorClasses[color]}`}
		>
			<div className='flex items-center justify-center mb-2'>
				<div
					className={`w-3 h-3 rounded-full ${color === 'green' ? 'bg-green-500' : color === 'orange' ? 'bg-orange-500' : 'bg-gray-500'}`}
				></div>
			</div>
			<p className='text-sm font-medium'>{label}</p>
		</button>
	)
}
