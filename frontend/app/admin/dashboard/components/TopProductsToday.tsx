// frontend/app/admin/dashboard/components/TopProductsToday.tsx

'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TodayTopProduct } from '../types/dashboard.types'
import { formatCurrency } from '../utils/dashboardHelpers'

interface TopProductsTodayProps {
	products: TodayTopProduct[]
	isLoading?: boolean
}

export const TopProductsToday: React.FC<TopProductsTodayProps> = ({ products, isLoading }) => {
	if (isLoading) {
		return (
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
				<h3 className='text-lg font-semibold text-gray-900 mb-4'>⭐ Bugungi Top Mahsulotlar</h3>
				<div className='space-y-3'>
					{[1, 2, 3, 4, 5].map(i => (
						<div key={i} className='flex items-center space-x-4 animate-pulse'>
							<div className='w-16 h-16 bg-gray-200 rounded-lg'></div>
							<div className='flex-1'>
								<div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
								<div className='h-3 bg-gray-200 rounded w-1/2'></div>
							</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	if (products.length === 0) {
		return (
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
				<h3 className='text-lg font-semibold text-gray-900 mb-4'>⭐ Bugungi Top Mahsulotlar</h3>
				<div className='text-center py-8'>
					<div className='text-gray-400 text-5xl mb-3'>🍕</div>
					<p className='text-gray-500'>Bugun hali mahsulot sotilmadi</p>
				</div>
			</div>
		)
	}

	return (
		<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
			{/* Header */}
			<div className='flex items-center justify-between mb-6'>
				<h3 className='text-lg font-semibold text-gray-900'>⭐ Bugungi Top Mahsulotlar</h3>
				<Link
					href='/admin/products'
					className='text-sm text-blue-600 hover:text-blue-700 font-medium'
				>
					Barchasini ko&apos;rish →
				</Link>
			</div>

			{/* Products List */}
			<div className='space-y-4'>
				{products.map((product, index) => (
					<Link
						key={product.id}
						href={`/admin/products?id=${product.id}`}
						className='flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group'
					>
						{/* Rank Badge */}
						<div
							className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
								index === 0
									? 'bg-yellow-100 text-yellow-700'
									: index === 1
										? 'bg-gray-100 text-gray-700'
										: index === 2
											? 'bg-orange-100 text-orange-700'
											: 'bg-blue-100 text-blue-700'
							}`}
						>
							{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
						</div>

						{/* Product Image */}
						<div className='flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100'>
							{product.image ? (
								<Image
									src={product.image}
									alt={product.name}
									width={64}
									height={64}
									className='w-full h-full object-cover group-hover:scale-110 transition-transform'
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center text-2xl'>🍕</div>
							)}
						</div>

						{/* Product Info */}
						<div className='flex-1 min-w-0'>
							<h4 className='text-sm font-semibold text-gray-900 mb-1'>{product.name}</h4>
							<p className='text-xs text-gray-500'>{product.category}</p>
						</div>

						{/* Stats */}
						<div className='flex-shrink-0 text-right'>
							<p className='text-sm font-bold text-gray-900 mb-1'>
								{formatCurrency(product.revenueToday)}
							</p>
							<p className='text-xs text-gray-500'>{product.soldToday} ta sotildi</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	)
}
