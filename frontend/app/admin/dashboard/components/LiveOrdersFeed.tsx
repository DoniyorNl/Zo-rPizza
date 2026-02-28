// frontend/app/admin/dashboard/components/LiveOrdersFeed.tsx

'use client'

import React from 'react'
import Link from 'next/link'
import { LiveOrder } from '../types/dashboard.types'
import {
	getOrderStatusColor,
	getOrderStatusLabel,
	getOrderStatusEmoji,
	timeAgo,
	formatCurrency,
	truncateText,
} from '../utils/dashboardHelpers'

interface LiveOrdersFeedProps {
	orders: LiveOrder[]
	isLoading?: boolean
}

export const LiveOrdersFeed: React.FC<LiveOrdersFeedProps> = ({ orders, isLoading }) => {
	if (isLoading) {
		return (
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
				<h3 className='text-lg font-semibold text-gray-900 mb-4'>🔴 Jonli Buyurtmalar</h3>
				<div className='space-y-3'>
					{[1, 2, 3, 4, 5].map(i => (
						<div key={i} className='border border-gray-200 rounded-lg p-4 animate-pulse'>
							<div className='h-4 bg-gray-200 rounded w-1/4 mb-2'></div>
							<div className='h-3 bg-gray-200 rounded w-3/4 mb-2'></div>
							<div className='h-3 bg-gray-200 rounded w-1/2'></div>
						</div>
					))}
				</div>
			</div>
		)
	}

	if (orders.length === 0) {
		return (
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
				<h3 className='text-lg font-semibold text-gray-900 mb-4'>🔴 Jonli Buyurtmalar</h3>
				<div className='text-center py-8'>
					<div className='text-gray-400 text-5xl mb-3'>📦</div>
					<p className='text-gray-500'>Hozirda faol buyurtmalar yo&apos;q</p>
				</div>
			</div>
		)
	}

	return (
		<div className='bg-white rounded-lg shadow-sm border border-gray-200'>
			{/* Header */}
			<div className='flex items-center justify-between p-6 border-b border-gray-200'>
				<h3 className='text-lg font-semibold text-gray-900'>🔴 Jonli Buyurtmalar</h3>
				<Link
					href='/admin/orders'
					className='text-sm text-blue-600 hover:text-blue-700 font-medium'
				>
					Barchasini ko&apos;rish →
				</Link>
			</div>

			{/* Orders List */}
			<div className='divide-y divide-gray-200 max-h-96 overflow-y-auto'>
				{orders.map(order => (
					<Link
						key={order.id}
						href={`/admin/orders/${order.id}`}
						className='block p-4 hover:bg-gray-50 transition-colors'
					>
						<div className='flex items-center justify-between mb-2'>
							{/* Order Number & Customer */}
							<div className='flex items-center space-x-3'>
								<span className='text-sm font-bold text-gray-900'>#{order.orderNumber}</span>
								<span className='text-sm text-gray-600'>{order.customerName}</span>
							</div>

							{/* Status Badge */}
							<span
								className={`px-3 py-1 rounded-full text-xs font-medium border ${getOrderStatusColor(
									order.status,
								)}`}
							>
								{getOrderStatusEmoji(order.status)} {getOrderStatusLabel(order.status)}
							</span>
						</div>

						{/* Items */}
						<div className='mb-2'>
							<p className='text-sm text-gray-600'>{truncateText(order.items.join(', '), 60)}</p>
						</div>

						{/* Footer */}
						<div className='flex items-center justify-between text-xs text-gray-500'>
							<span>{timeAgo(order.createdAt)}</span>
							<span className='font-semibold text-gray-900'>{formatCurrency(order.total)}</span>
						</div>

						{/* Estimated Delivery */}
						{order.estimatedDelivery && order.status === 'delivering' && (
							<div className='mt-2 text-xs text-blue-600 font-medium'>
								📍 Taxminiy yetkazish:{' '}
								{new Date(order.estimatedDelivery).toLocaleTimeString('uz-UZ', {
									hour: '2-digit',
									minute: '2-digit',
								})}
							</div>
						)}
					</Link>
				))}
			</div>
		</div>
	)
}
