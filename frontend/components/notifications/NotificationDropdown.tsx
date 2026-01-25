// =====================================
// 📁 FILE PATH: frontend/components/NotificationDropdown.tsx
// 🔔 NOTIFICATION DROPDOWN
// =====================================

'use client'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/lib/AuthContext'
import { Bell, CheckCheck, X } from 'lucide-react'
import { useState } from 'react'

export function NotificationDropdown() {
	const { user } = useAuth()
	const { notifications, unreadCount, loading, markAllAsRead, markAsRead, deleteNotification } =
		useNotifications()

	const [isOpen, setIsOpen] = useState(false)

	// Don't render if user is not authenticated
	if (!user) {
		return null
	}

	// Barcha notificationlarni o'qilgan qilish
	const handleMarkAllRead = async () => {
		const success = await markAllAsRead()
		if (success) {
			console.log("✅ Barcha notificationlar o'qilgan qilindi")
		}
	}

	// Bitta notificationni o'chirish
	const handleDelete = async (id: number, e: React.MouseEvent) => {
		e.stopPropagation() // Prevent dropdown close
		const success = await deleteNotification(id)
		if (success) {
			console.log("✅ Notification o'chirildi")
		}
	}

	// Notification type bo'yicha rang
	const getNotificationColor = (type: string) => {
		switch (type) {
			case 'SUCCESS':
				return 'text-green-600 bg-green-50'
			case 'WARNING':
				return 'text-yellow-600 bg-yellow-50'
			case 'ERROR':
				return 'text-red-600 bg-red-50'
			case 'ORDER':
				return 'text-blue-600 bg-blue-50'
			default:
				return 'text-gray-600 bg-gray-50'
		}
	}

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' size='icon' className='relative'>
					<Bell className='h-5 w-5' />
					{unreadCount > 0 && (
						<span className='absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold'>
							{unreadCount > 9 ? '9+' : unreadCount}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align='end' className='w-96 max-h-[600px] overflow-hidden flex flex-col'>
				{/* Header */}
				<div className='px-4 py-3 border-b flex items-center justify-between'>
					<div>
						<h3 className='font-semibold text-base'>Ogohlantirishlar</h3>
						{unreadCount > 0 && (
							<p className='text-sm text-gray-500'>{unreadCount} ta o&apos;qilmagan</p>
						)}
					</div>

					{unreadCount > 0 && (
						<Button
							variant='ghost'
							size='sm'
							onClick={handleMarkAllRead}
							className='text-blue-600 hover:text-blue-700'
						>
							<CheckCheck className='h-4 w-4 mr-1' />
							Barchasini o&apos;qilgan qilish
						</Button>
					)}
				</div>

				{/* Notifications List */}
				<div className='overflow-y-auto flex-1'>
					{loading ? (
						<div className='p-8 text-center text-gray-500'>Yuklanmoqda...</div>
					) : notifications.length === 0 ? (
						<div className='p-8 text-center text-gray-500'>
							<Bell className='h-12 w-12 mx-auto mb-2 text-gray-300' />
							<p>Hech qanday ogohantirish yo&apos;q</p>
						</div>
					) : (
						notifications.map(notification => (
							<div
								key={notification.id}
								className={`
									px-4 py-3 border-b hover:bg-gray-50 cursor-pointer relative group
									${!notification.isRead ? 'bg-blue-50/50' : ''}
								`}
								onClick={() => !notification.isRead && markAsRead(notification.id)}
							>
								{/* Close Button */}
								<button
									onClick={e => handleDelete(notification.id, e)}
									className='absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity'
									aria-label="O'chirish"
								>
									<X className='h-4 w-4 text-gray-500' />
								</button>

								{/* Notification Content */}
								<div className='flex items-start gap-3 pr-6'>
									{/* Type Icon */}
									<div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
										<Bell className='h-4 w-4' />
									</div>

									{/* Text Content */}
									<div className='flex-1 min-w-0'>
										<p className='font-semibold text-sm'>{notification.title}</p>
										<p className='text-sm text-gray-600 line-clamp-2'>{notification.message}</p>
										<p className='text-xs text-gray-400 mt-1'>
											{new Date(notification.createdAt).toLocaleString('uz-UZ', {
												day: 'numeric',
												month: 'short',
												hour: '2-digit',
												minute: '2-digit',
											})}
										</p>
									</div>

									{/* Unread Indicator */}
									{!notification.isRead && (
										<div className='w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2' />
									)}
								</div>
							</div>
						))
					)}
				</div>

				{/* Footer */}
				{notifications.length > 0 && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem className='justify-center text-blue-600 hover:text-blue-700 cursor-pointer'>
							Barchasini ko&apos;rish
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
