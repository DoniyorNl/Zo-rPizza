// =====================================
// 📁 FILE PATH: frontend/app/(shop)/profile/page.tsx
// 🎯 PURPOSE: Professional User Profile Page
// =====================================

'use client'

import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
	User,
	Settings,
	MapPin,
	Package,
	Award,
	Calendar,
	Phone,
	Mail,
	Edit2,
	Save,
	X,
	Plus,
	Trash2,
	ShoppingBag,
	TrendingUp,
	Clock,
	Heart,
	Bell,
} from 'lucide-react'
import { UnifiedHeader } from '@/components/layout/UnifiedHeader'

interface ProfileData {
	user: {
		id: string
		email: string
		name: string | null
		phone: string | null
		avatar: string | null
		dateOfBirth: string | null
		gender: string | null
		loyaltyPoints: number
		totalSpent: number
		memberSince: string
		dietaryPrefs: string[]
		allergyInfo: string[]
		loyaltyTier: string
		emailNotificationsEnabled?: boolean
	}
	statistics: {
		totalOrders: number
		totalSpent: number
		avgOrderValue: number
		loyaltyPoints: number
		memberSince: string
		statusBreakdown: Array<{ status: string; count: number }>
	}
	recentOrders: Array<{
		id: string
		orderNumber: string
		status: string
		totalPrice: number
		createdAt: string
		items: Array<{
			quantity: number
			product: {
				name: string
				imageUrl: string | null
			}
		}>
	}>
	favoriteProducts: Array<{
		id: string
		name: string
		imageUrl: string | null
		basePrice: number
		orderCount: number
	}>
}

interface Address {
	id: string
	label: string
	street: string
	building: string | null
	apartment: string | null
	floor: string | null
	entrance: string | null
	landmark: string | null
	isDefault: boolean
}

export default function ProfilePage() {
	const { user } = useAuth()
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [profileData, setProfileData] = useState<ProfileData | null>(null)
	const [addresses, setAddresses] = useState<Address[]>([])
	const [editMode, setEditMode] = useState(false)
	const [editedProfile, setEditedProfile] = useState({
		name: '',
		phone: '',
		dateOfBirth: '',
		gender: '',
	})
	const [showAddressForm, setShowAddressForm] = useState(false)
	const [emailNotifications, setEmailNotifications] = useState(true)
	const [notificationUpdating, setNotificationUpdating] = useState(false)
	const [newAddress, setNewAddress] = useState({
		label: 'Uy',
		street: '',
		building: '',
		apartment: '',
		floor: '',
		entrance: '',
		landmark: '',
		isDefault: false,
	})

	useEffect(() => {
		if (!user) {
			router.push('/login')
			return
		}

		fetchProfileData()
		fetchAddresses()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, router])

	const fetchProfileData = async () => {
		try {
			const token = await user?.getIdToken()
			const response = await api.get('/api/profile/stats', {
				headers: { Authorization: `Bearer ${token}` },
			})
			setProfileData(response.data.data)
			setEmailNotifications(response.data.data?.user?.emailNotificationsEnabled !== false)
			setEditedProfile({
				name: response.data.data.user.name || '',
				phone: response.data.data.user.phone || '',
				dateOfBirth: response.data.data.user.dateOfBirth
					? new Date(response.data.data.user.dateOfBirth).toISOString().split('T')[0]
					: '',
				gender: response.data.data.user.gender || '',
			})
		} catch (error) {
			console.error('Error fetching profile:', error)
		} finally {
			setLoading(false)
		}
	}

	const fetchAddresses = async () => {
		try {
			const token = await user?.getIdToken()
			const response = await api.get('/api/profile/addresses', {
				headers: { Authorization: `Bearer ${token}` },
			})
			setAddresses(response.data.data)
		} catch (error) {
			console.error('Error fetching addresses:', error)
		}
	}

	const handleUpdateProfile = async () => {
		try {
			const token = await user?.getIdToken()
			await api.put('/api/profile', editedProfile, {
				headers: { Authorization: `Bearer ${token}` },
			})
			await fetchProfileData()
			setEditMode(false)
		} catch (error) {
			console.error('Error updating profile:', error)
			alert('Profilni yangilashda xatolik yuz berdi')
		}
	}

	const handleAddAddress = async () => {
		try {
			const token = await user?.getIdToken()
			await api.post('/api/profile/addresses', newAddress, {
				headers: { Authorization: `Bearer ${token}` },
			})
			await fetchAddresses()
			setShowAddressForm(false)
			setNewAddress({
				label: 'Uy',
				street: '',
				building: '',
				apartment: '',
				floor: '',
				entrance: '',
				landmark: '',
				isDefault: false,
			})
		} catch (error) {
			console.error('Error adding address:', error)
			alert('Manzil qo\'shishda xatolik yuz berdi')
		}
	}

	const handleToggleEmailNotifications = async (enabled: boolean) => {
		setNotificationUpdating(true)
		try {
			const token = await user?.getIdToken()
			await api.patch('/api/profile', { emailNotificationsEnabled: enabled }, {
				headers: { Authorization: `Bearer ${token}` },
			})
			setEmailNotifications(enabled)
			setProfileData(prev => prev ? {
				...prev,
				user: { ...prev.user, emailNotificationsEnabled: enabled },
			} : null)
		} catch (error) {
			console.error('Error updating notification preference:', error)
			alert('Sozlamani yangilashda xatolik yuz berdi')
		} finally {
			setNotificationUpdating(false)
		}
	}

	const handleDeleteAddress = async (id: string) => {
		if (!confirm('Manzilni o\'chirmoqchimisiz?')) return

		try {
			const token = await user?.getIdToken()
			await api.delete(`/api/profile/addresses/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			await fetchAddresses()
		} catch (error) {
			console.error('Error deleting address:', error)
			alert('Manzilni o\'chirishda xatolik yuz berdi')
		}
	}

	const getLoyaltyTierColor = (tier: string) => {
		switch (tier) {
			case 'PLATINUM':
				return 'bg-purple-100 text-purple-800 border-purple-300'
			case 'GOLD':
				return 'bg-yellow-100 text-yellow-800 border-yellow-300'
			case 'SILVER':
				return 'bg-gray-100 text-gray-800 border-gray-300'
			default:
				return 'bg-orange-100 text-orange-800 border-orange-300'
		}
	}

	const getStatusBadgeColor = (status: string) => {
		const colors: Record<string, string> = {
			PENDING: 'bg-yellow-100 text-yellow-800',
			CONFIRMED: 'bg-blue-100 text-blue-800',
			PREPARING: 'bg-purple-100 text-purple-800',
			OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
			DELIVERED: 'bg-green-100 text-green-800',
			CANCELLED: 'bg-red-100 text-red-800',
		}
		return colors[status] || 'bg-gray-100 text-gray-800'
	}

	if (loading) {
		return (
			<>
				<UnifiedHeader variant='user' />
				<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto'></div>
						<p className='mt-4 text-gray-600'>Yuklanmoqda...</p>
					</div>
				</div>
			</>
		)
	}

	if (!profileData) {
		return (
			<>
				<UnifiedHeader variant='user' />
				<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
					<div className='text-center'>
						<p className='text-red-600'>Profil ma&apos;lumotlarini yuklashda xatolik</p>
						<Button onClick={() => router.push('/')} className='mt-4'>
							Bosh sahifaga qaytish
						</Button>
					</div>
				</div>
			</>
		)
	}

	return (
		<>
			<UnifiedHeader variant='user' />
			<div className='min-h-screen bg-gradient-to-br from-gray-50 to-orange-50'>
				<div className='container mx-auto px-4 py-8'>
					{/* Header Section */}
					<div className='mb-8'>
						<div className='flex items-center justify-between'>
							<div>
								<h1 className='text-3xl font-bold text-gray-900'>Mening Profilim</h1>
								<p className='text-gray-600 mt-1'>
									Shaxsiy ma&apos;lumotlar va buyurtmalar tarixi
								</p>
							</div>
							<Badge className={`px-4 py-2 text-lg border-2 ${getLoyaltyTierColor(profileData.user.loyaltyTier)}`}>
								<Award className='w-5 h-5 mr-2' />
								{profileData.user.loyaltyTier}
							</Badge>
						</div>
					</div>

					{/* Stats Cards */}
					<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
						<Card className='bg-gradient-to-br from-orange-500 to-orange-600 text-white'>
							<CardContent className='p-6'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-orange-100 text-sm'>Jami buyurtmalar</p>
										<p className='text-3xl font-bold mt-1'>{profileData.statistics.totalOrders}</p>
									</div>
									<ShoppingBag className='w-12 h-12 text-orange-200' />
								</div>
							</CardContent>
						</Card>

						<Card className='bg-gradient-to-br from-green-500 to-green-600 text-white'>
							<CardContent className='p-6'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-green-100 text-sm'>Jami xarajat</p>
										<p className='text-3xl font-bold mt-1'>
											{profileData.statistics.totalSpent.toLocaleString()} so&apos;m
										</p>
									</div>
									<TrendingUp className='w-12 h-12 text-green-200' />
								</div>
							</CardContent>
						</Card>

						<Card className='bg-gradient-to-br from-purple-500 to-purple-600 text-white'>
							<CardContent className='p-6'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-purple-100 text-sm'>Loyalty ballar</p>
										<p className='text-3xl font-bold mt-1'>{profileData.user.loyaltyPoints}</p>
									</div>
									<Award className='w-12 h-12 text-purple-200' />
								</div>
							</CardContent>
						</Card>

						<Card className='bg-gradient-to-br from-blue-500 to-blue-600 text-white'>
							<CardContent className='p-6'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-blue-100 text-sm'>O&apos;rtacha buyurtma</p>
										<p className='text-3xl font-bold mt-1'>
											{profileData.statistics.avgOrderValue.toLocaleString()} so&apos;m
										</p>
									</div>
									<Package className='w-12 h-12 text-blue-200' />
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Main Content Tabs */}
					<Tabs defaultValue='overview' className='space-y-6'>
						<TabsList className='grid w-full grid-cols-4 lg:w-auto'>
							<TabsTrigger value='overview'>
								<User className='w-4 h-4 mr-2' />
								Umumiy
							</TabsTrigger>
							<TabsTrigger value='orders'>
								<Package className='w-4 h-4 mr-2' />
								Buyurtmalar
							</TabsTrigger>
							<TabsTrigger value='addresses'>
								<MapPin className='w-4 h-4 mr-2' />
								Manzillar
							</TabsTrigger>
							<TabsTrigger value='settings'>
								<Settings className='w-4 h-4 mr-2' />
								Sozlamalar
							</TabsTrigger>
						</TabsList>

						{/* Overview Tab */}
						<TabsContent value='overview' className='space-y-6'>
							<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
								{/* Profile Info Card */}
								<Card>
									<CardHeader>
										<div className='flex items-center justify-between'>
											<CardTitle className='flex items-center'>
												<User className='w-5 h-5 mr-2 text-orange-600' />
												Shaxsiy ma&apos;lumotlar
											</CardTitle>
											{!editMode ? (
												<Button
													variant='outline'
													size='sm'
													onClick={() => setEditMode(true)}
												>
													<Edit2 className='w-4 h-4 mr-2' />
													Tahrirlash
												</Button>
											) : (
												<div className='flex gap-2'>
													<Button
														variant='outline'
														size='sm'
														onClick={() => setEditMode(false)}
													>
														<X className='w-4 h-4' />
													</Button>
													<Button
														size='sm'
														onClick={handleUpdateProfile}
														className='bg-orange-600 hover:bg-orange-700'
													>
														<Save className='w-4 h-4 mr-2' />
														Saqlash
													</Button>
												</div>
											)}
										</div>
									</CardHeader>
									<CardContent className='space-y-4'>
										{editMode ? (
											<>
												<div>
													<Label>Ism</Label>
													<Input
														value={editedProfile.name}
														onChange={e =>
															setEditedProfile({ ...editedProfile, name: e.target.value })
														}
														placeholder='Ismingizni kiriting'
													/>
												</div>
												<div>
													<Label>Telefon</Label>
													<Input
														value={editedProfile.phone}
														onChange={e =>
															setEditedProfile({ ...editedProfile, phone: e.target.value })
														}
														placeholder='+998901234567'
													/>
												</div>
												<div>
													<Label>Tug&apos;ilgan kun</Label>
													<Input
														type='date'
														value={editedProfile.dateOfBirth}
														onChange={e =>
															setEditedProfile({
																...editedProfile,
																dateOfBirth: e.target.value,
															})
														}
													/>
												</div>
												<div>
													<Label>Jins</Label>
													<select
														value={editedProfile.gender}
														onChange={e =>
															setEditedProfile({ ...editedProfile, gender: e.target.value })
														}
														className='w-full px-3 py-2 border rounded-md'
													>
														<option value=''>Tanlang</option>
														<option value='male'>Erkak</option>
														<option value='female'>Ayol</option>
														<option value='other'>Boshqa</option>
													</select>
												</div>
											</>
										) : (
											<>
												<div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
													<Mail className='w-5 h-5 text-gray-500' />
													<div>
														<p className='text-sm text-gray-600'>Email</p>
														<p className='font-medium'>{profileData.user.email}</p>
													</div>
												</div>
												<div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
													<User className='w-5 h-5 text-gray-500' />
													<div>
														<p className='text-sm text-gray-600'>Ism</p>
														<p className='font-medium'>
															{profileData.user.name || 'Kiritilmagan'}
														</p>
													</div>
												</div>
												<div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
													<Phone className='w-5 h-5 text-gray-500' />
													<div>
														<p className='text-sm text-gray-600'>Telefon</p>
														<p className='font-medium'>
															{profileData.user.phone || 'Kiritilmagan'}
														</p>
													</div>
												</div>
												<div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
													<Calendar className='w-5 h-5 text-gray-500' />
													<div>
														<p className='text-sm text-gray-600'>A&apos;zo bo&apos;lgan sana</p>
														<p className='font-medium'>
															{new Date(profileData.user.memberSince).toLocaleDateString('uz-UZ')}
														</p>
													</div>
												</div>
											</>
										)}
									</CardContent>
								</Card>

								{/* Favorite Products */}
								<Card>
									<CardHeader>
										<CardTitle className='flex items-center'>
											<Heart className='w-5 h-5 mr-2 text-red-600' />
											Sevimli mahsulotlar
										</CardTitle>
									</CardHeader>
									<CardContent>
										{profileData.favoriteProducts.length === 0 ? (
											<p className='text-center text-gray-500 py-8'>
												Hali sevimli mahsulotlar yo&apos;q
											</p>
										) : (
											<div className='space-y-3'>
												{profileData.favoriteProducts.map(product => (
													<div
														key={product.id}
														className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'
														onClick={() => router.push(`/menu?product=${product.id}`)}
													>
														{product.imageUrl && (
															// eslint-disable-next-line @next/next/no-img-element
															<img
																src={product.imageUrl}
																alt={product.name}
																className='w-12 h-12 rounded-lg object-cover'
															/>
														)}
														<div className='flex-1'>
															<p className='font-medium'>{product.name}</p>
															<p className='text-sm text-gray-600'>
																{product.basePrice.toLocaleString()} so&apos;m
															</p>
														</div>
														<Badge variant='secondary'>
															{product.orderCount}x buyurtma
														</Badge>
													</div>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							</div>

							{/* Recent Orders */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center'>
										<Clock className='w-5 h-5 mr-2 text-blue-600' />
										So&apos;nggi buyurtmalar
									</CardTitle>
								</CardHeader>
								<CardContent>
									{profileData.recentOrders.length === 0 ? (
										<p className='text-center text-gray-500 py-8'>
											Hali buyurtmalar yo&apos;q
										</p>
									) : (
										<div className='space-y-3'>
											{profileData.recentOrders.map(order => (
												<div
													key={order.id}
													role='button'
													tabIndex={0}
													aria-label={`Buyurtma ${order.orderNumber} - batafsil`}
													className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'
													onClick={() => router.push(`/orders/${order.id}`)}
													onKeyDown={e => {
														if (e.key === 'Enter' || e.key === ' ') {
															e.preventDefault()
															router.push(`/orders/${order.id}`)
														}
													}}
												>
													<div className='flex items-center space-x-4'>
														<div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
															<Package className='w-6 h-6 text-orange-600' />
														</div>
														<div>
															<p className='font-medium'>#{order.orderNumber}</p>
															<p className='text-sm text-gray-600'>
																{new Date(order.createdAt).toLocaleDateString('uz-UZ')}
															</p>
														</div>
													</div>
													<div className='text-right'>
														<p className='font-medium'>
															{order.totalPrice.toLocaleString()} so&apos;m
														</p>
														<Badge className={getStatusBadgeColor(order.status)}>
															{order.status}
														</Badge>
													</div>
												</div>
											))}
										</div>
									)}
									<Button
										variant='outline'
										className='w-full mt-4'
										onClick={() => router.push('/orders')}
									>
										Barcha buyurtmalarni ko&apos;rish
									</Button>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Orders Tab */}
						<TabsContent value='orders'>
							<Card>
								<CardHeader>
									<CardTitle>Buyurtmalar statistikasi</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
										{profileData.statistics.statusBreakdown.map(item => (
											<div key={item.status} className='text-center p-4 bg-gray-50 rounded-lg'>
												<p className='text-2xl font-bold text-gray-900'>{item.count}</p>
												<p className='text-sm text-gray-600 mt-1'>{item.status}</p>
											</div>
										))}
									</div>
									<Button
										className='w-full bg-orange-600 hover:bg-orange-700'
										onClick={() => router.push('/orders')}
									>
										Barcha buyurtmalarni ko&apos;rish
									</Button>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Addresses Tab */}
						<TabsContent value='addresses'>
							<Card>
								<CardHeader>
									<div className='flex items-center justify-between'>
										<CardTitle>Yetkazib berish manzillari</CardTitle>
										<Button
											onClick={() => setShowAddressForm(!showAddressForm)}
											className='bg-orange-600 hover:bg-orange-700'
										>
											<Plus className='w-4 h-4 mr-2' />
											Yangi manzil
										</Button>
									</div>
								</CardHeader>
								<CardContent className='space-y-4'>
									{showAddressForm && (
										<div className='p-4 border-2 border-orange-200 rounded-lg bg-orange-50 space-y-3'>
											<h3 className='font-semibold text-lg'>Yangi manzil qo&apos;shish</h3>
											<div className='grid grid-cols-2 gap-3'>
												<div>
													<Label>Manzil turi</Label>
													<select
														value={newAddress.label}
														onChange={e =>
															setNewAddress({ ...newAddress, label: e.target.value })
														}
														className='w-full px-3 py-2 border rounded-md'
													>
														<option value='Uy'>Uy</option>
														<option value='Ish'>Ish</option>
														<option value='Boshqa'>Boshqa</option>
													</select>
												</div>
												<div>
													<Label>Ko&apos;cha</Label>
													<Input
														value={newAddress.street}
														onChange={e =>
															setNewAddress({ ...newAddress, street: e.target.value })
														}
														placeholder='Ko&apos;cha nomi'
													/>
												</div>
												<div>
													<Label>Bino</Label>
													<Input
														value={newAddress.building}
														onChange={e =>
															setNewAddress({ ...newAddress, building: e.target.value })
														}
														placeholder='Bino raqami'
													/>
												</div>
												<div>
													<Label>Kvartira</Label>
													<Input
														value={newAddress.apartment}
														onChange={e =>
															setNewAddress({ ...newAddress, apartment: e.target.value })
														}
														placeholder='Kvartira'
													/>
												</div>
												<div>
													<Label>Qavat</Label>
													<Input
														value={newAddress.floor}
														onChange={e =>
															setNewAddress({ ...newAddress, floor: e.target.value })
														}
														placeholder='Qavat'
													/>
												</div>
												<div>
													<Label>Kirish</Label>
													<Input
														value={newAddress.entrance}
														onChange={e =>
															setNewAddress({ ...newAddress, entrance: e.target.value })
														}
														placeholder='Kirish'
													/>
												</div>
												<div className='col-span-2'>
													<Label>Mo&apos;ljal</Label>
													<Input
														value={newAddress.landmark}
														onChange={e =>
															setNewAddress({ ...newAddress, landmark: e.target.value })
														}
														placeholder='Mo&apos;ljal (masalan: metro yaqinida)'
													/>
												</div>
											</div>
											<div className='flex items-center space-x-2'>
												<input
													type='checkbox'
													checked={newAddress.isDefault}
													onChange={e =>
														setNewAddress({ ...newAddress, isDefault: e.target.checked })
													}
													className='w-4 h-4'
												/>
												<Label>Asosiy manzil sifatida belgilash</Label>
											</div>
											<div className='flex gap-2'>
												<Button
													onClick={handleAddAddress}
													className='flex-1 bg-orange-600 hover:bg-orange-700'
												>
													Saqlash
												</Button>
												<Button
													variant='outline'
													onClick={() => setShowAddressForm(false)}
													className='flex-1'
												>
													Bekor qilish
												</Button>
											</div>
										</div>
									)}

									{addresses.length === 0 ? (
										<p className='text-center text-gray-500 py-8'>
											Hali manzillar qo&apos;shilmagan
										</p>
									) : (
										<div className='space-y-3'>
											{addresses.map(address => (
												<div
													key={address.id}
													className={`p-4 rounded-lg border-2 ${
														address.isDefault
															? 'border-orange-500 bg-orange-50'
															: 'border-gray-200 bg-gray-50'
													}`}
												>
													<div className='flex items-start justify-between'>
														<div className='flex-1'>
															<div className='flex items-center gap-2 mb-2'>
																<Badge
																	variant={address.isDefault ? 'default' : 'secondary'}
																	className={
																		address.isDefault
																			? 'bg-orange-600'
																			: ''
																	}
																>
																	{address.label}
																</Badge>
																{address.isDefault && (
																	<Badge variant='outline' className='text-orange-600'>
																		Asosiy
																	</Badge>
																)}
															</div>
															<p className='font-medium text-gray-900'>
																{address.street}
																{address.building && `, ${address.building}`}
																{address.apartment && `, kv. ${address.apartment}`}
															</p>
															{(address.floor || address.entrance || address.landmark) && (
																<p className='text-sm text-gray-600 mt-1'>
																	{address.floor && `${address.floor}-qavat`}
																	{address.entrance && `, ${address.entrance}-kirish`}
																	{address.landmark && ` • ${address.landmark}`}
																</p>
															)}
														</div>
														<Button
															variant='ghost'
															size='sm'
															onClick={() => handleDeleteAddress(address.id)}
															className='text-red-600 hover:text-red-700 hover:bg-red-50'
														>
															<Trash2 className='w-4 h-4' />
														</Button>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						{/* Settings Tab */}
						<TabsContent value='settings'>
							<Card>
								<CardHeader>
									<CardTitle>Sozlamalar</CardTitle>
								</CardHeader>
								<CardContent className='space-y-6'>
									<div>
										<h3 className='font-semibold mb-3'>Xavfsizlik</h3>
										<Button variant='outline' className='w-full justify-start'>
											<Settings className='w-4 h-4 mr-2' />
											Parolni o&apos;zgartirish
										</Button>
									</div>
									<div>
										<h3 className='font-semibold mb-3 flex items-center gap-2'>
											<Bell className='w-5 h-5 text-orange-600' />
											Bildirishnomalar
										</h3>
										<div className='space-y-2'>
											<div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200'>
												<div>
													<p className='font-medium'>Buyurtma tasdiq xabarlari (Email)</p>
													<p className='text-sm text-gray-600 mt-0.5'>
														Buyurtma qabul qilinganda va status o&apos;zgarganda Gmail ga xabar yuboriladi
													</p>
												</div>
												<button
													type='button'
													role='switch'
													aria-checked={emailNotifications}
													disabled={notificationUpdating}
													onClick={() => handleToggleEmailNotifications(!emailNotifications)}
													className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 ${
														emailNotifications ? 'bg-orange-600' : 'bg-gray-300'
													}`}
												>
													<span
														className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
															emailNotifications ? 'translate-x-6' : 'translate-x-1'
														}`}
													/>
												</button>
											</div>
										</div>
									</div>
									<div>
										<h3 className='font-semibold mb-3 text-red-600'>Xavfli zona</h3>
										<Button variant='outline' className='w-full justify-start text-red-600 border-red-300 hover:bg-red-50'>
											Akkauntni o&apos;chirish
										</Button>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</>
	)
}
