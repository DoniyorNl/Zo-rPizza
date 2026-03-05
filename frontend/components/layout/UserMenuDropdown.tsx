'use client'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from 'firebase/auth'
import { CircleUser, Heart, Home, LogOut, Settings, User as UserIcon } from 'lucide-react'

export function UserMenuDropdown({
	user,
	isAdmin,
	userButtonStyles,
	onNavigate,
	onLogout,
}: {
	user: User
	isAdmin: boolean
	userButtonStyles: string
	onNavigate: (path: string) => void
	onLogout: () => void
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' className={userButtonStyles}>
					<CircleUser className='h-5 w-5' />
					<span className='hidden sm:block font-medium'>{user.email || (isAdmin ? 'Admin' : 'User')}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-56'>
				<DropdownMenuLabel>
					<div className='flex flex-col space-y-1'>
						<p className='text-sm font-medium'>{user.email}</p>
						<p className='text-xs text-gray-500'>{isAdmin ? 'Administrator' : 'Foydalanuvchi'}</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{isAdmin ? (
					<>
						<DropdownMenuItem className='cursor-pointer' onClick={() => onNavigate('/admin/users')}>
							<UserIcon className='mr-2 h-4 w-4' />
							<span>Profil</span>
						</DropdownMenuItem>
						<DropdownMenuItem className='cursor-pointer' onClick={() => onNavigate('/admin/settings')}>
							<Settings className='mr-2 h-4 w-4' />
							<span>Sozlamalar</span>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className='cursor-pointer' onClick={() => onNavigate('/')}>
							<Home className='mr-2 h-4 w-4' />
							<span>Saytga qaytish</span>
						</DropdownMenuItem>
					</>
				) : (
					<>
						<DropdownMenuItem className='cursor-pointer' onClick={() => onNavigate('/orders')}>
							<UserIcon className='mr-2 h-4 w-4' />
							<span>Mening buyurtmalarim</span>
						</DropdownMenuItem>
						<DropdownMenuItem className='cursor-pointer' onClick={() => onNavigate('/favorites')}>
							<Heart className='mr-2 h-4 w-4' />
							<span>Sevimli mahsulotlar</span>
						</DropdownMenuItem>
						<DropdownMenuItem className='cursor-pointer' onClick={() => onNavigate('/profile')}>
							<Settings className='mr-2 h-4 w-4' />
							<span>Profil</span>
						</DropdownMenuItem>
					</>
				)}

				<DropdownMenuSeparator />
				<DropdownMenuItem className='cursor-pointer text-red-600 focus:text-red-600' onClick={onLogout}>
					<LogOut className='mr-2 h-4 w-4' />
					<span>Chiqish</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

