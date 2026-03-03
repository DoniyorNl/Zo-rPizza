'use client'

import { ProductCard } from '@/components/products/ProductCard'
import { UnifiedHeader } from '@/components/layout/UnifiedHeader'
import { ProductCardSkeletonGrid } from '@/components/skeletons'
import { useCategories } from '@/hooks/useCategories'
import { api } from '@/lib/apiClient'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Pizza } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface ProductVariation {
	id: string
	size: string
	price: number
	diameter?: number
	slices?: number
	weight?: number
}

interface Product {
	id: string
	name: string
	description: string
	basePrice?: number
	price?: number
	imageUrl: string
	prepTime: number
	difficulty?: string
	calories?: number
	isActive?: boolean
	categoryId?: string
	categoryName?: string
	variations?: ProductVariation[]
}

const getCategoryIcon = (name: string): string => {
	const n = name.toLowerCase()
	if (n.includes('pizza') || n.includes('pitsa')) return '🍕'
	if (n.includes('deal') || n.includes('aksiya')) return '🎁'
	if (n.includes('side') || n.includes("qo'shimcha")) return '🍟'
	if (n.includes('dessert') || n.includes('shirinlik')) return '🍰'
	if (n.includes('drink') || n.includes('ichimlik')) return '🥤'
	if (n.includes('salad') || n.includes('salat')) return '🥗'
	return '📦'
}

export default function MenuClient({ highlightProductId }: { highlightProductId: string | null }) {
	const productIdFromUrl = highlightProductId

	const categoryOptions = useMemo(
		() => ({ isActive: true, hasProducts: true, sortBy: 'displayOrder' as const }),
		[],
	)
	const { categories, loading: categoriesLoading } = useCategories(categoryOptions)

	const [products, setProducts] = useState<Product[]>([])
	const [loadingProducts, setLoadingProducts] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
	const productRefsMap = useRef<Record<string, HTMLDivElement | null>>({})
	const hasScrolledToProduct = useRef(false)
	const isProd = process.env.NODE_ENV === 'production'

	const fetchProducts = useCallback(async () => {
		try {
			setError(null)
			const res = await api.get('/api/products')
			const list = Array.isArray(res.data?.data) ? res.data.data : []
			setProducts(list)
		} catch (err) {
			if (!isProd) console.error('Menu: products fetch error', err)
			setError('Mahsulotlar yuklanmadi. Keyinroq urinib ko‘ring.')
		} finally {
			setLoadingProducts(false)
		}
	}, [isProd])

	useEffect(() => {
		fetchProducts()
	}, [fetchProducts])

	const filteredProducts = useMemo(() => {
		if (!selectedCategoryId) return products
		return products.filter(p => p.categoryId === selectedCategoryId)
	}, [products, selectedCategoryId])

	const visibleProducts = useMemo(() => filteredProducts.filter(p => p.isActive !== false), [filteredProducts])

	useEffect(() => {
		if (!productIdFromUrl || visibleProducts.length === 0 || hasScrolledToProduct.current) return

		const el = productRefsMap.current[productIdFromUrl]
		if (el) {
			hasScrolledToProduct.current = true
			setTimeout(() => {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' })
			}, 300)
		}
	}, [productIdFromUrl, visibleProducts])

	const handleCategoryClick = (categoryId: string) => {
		setSelectedCategoryId(prev => (prev === categoryId ? null : categoryId))
	}

	const scrollNav = (direction: 'left' | 'right') => {
		const el = document.getElementById('menu-category-nav')
		if (!el) return
		const step = 280
		el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' })
	}

	if (error) {
		return (
			<>
				<UnifiedHeader variant='user' />
				<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
					<div className='container mx-auto px-4 py-12'>
						<div className='text-center max-w-md mx-auto'>
							<p className='text-red-600 mb-4'>{error}</p>
							<button
								onClick={() => fetchProducts()}
								className='px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700'
							>
								Qayta yuklash
							</button>
						</div>
					</div>
				</main>
			</>
		)
	}

	const loading = categoriesLoading || loadingProducts

	return (
		<>
			<UnifiedHeader variant='user' />
			<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
				<section className='bg-gradient-to-r from-orange-500 to-orange-600 text-white py-10 px-4'>
					<div className='container mx-auto text-center'>
						<h1 className='text-3xl md:text-4xl font-bold mb-2'>Menyu</h1>
						<p className='text-orange-100'>Barcha kategoriyalar va mazali taomlar</p>
					</div>
				</section>

				<section className='sticky top-0 z-30 bg-white/95 backdrop-blur border-b shadow-sm'>
					<div className='container mx-auto px-4 py-3'>
						<div className='flex items-center gap-2'>
							<button
								type='button'
								onClick={() => scrollNav('left')}
								aria-label='Chapga'
								className='p-2 rounded-full border bg-white hover:bg-gray-50 shrink-0 hidden sm:block'
							>
								<ChevronLeft className='w-5 h-5 text-gray-600' />
							</button>
							<div
								id='menu-category-nav'
								className='flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide py-1 flex-1'
								style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
							>
								{loading ? (
									<div className='flex gap-2'>
										{[1, 2, 3, 4, 5].map(i => (
											<div key={i} className='h-11 w-28 bg-gray-200 rounded-full animate-pulse shrink-0' />
										))}
									</div>
								) : (
									<>
										<button
											type='button'
											onClick={() => setSelectedCategoryId(null)}
											className={cn(
												'shrink-0 px-4 py-2 rounded-full font-medium transition-colors',
												!selectedCategoryId
													? 'bg-orange-600 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
											)}
										>
											Barchasi
										</button>
										{categories.map(cat => (
											<button
												key={cat.id}
												type='button'
												onClick={() => handleCategoryClick(cat.id)}
												className={cn(
													'shrink-0 px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2',
													selectedCategoryId === cat.id
														? 'bg-orange-600 text-white'
														: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
												)}
											>
												<span>{getCategoryIcon(cat.name)}</span>
												<span>{cat.name}</span>
											</button>
										))}
									</>
								)}
							</div>
							<button
								type='button'
								onClick={() => scrollNav('right')}
								aria-label='O‘ngga'
								className='p-2 rounded-full border bg-white hover:bg-gray-50 shrink-0 hidden sm:block'
							>
								<ChevronRight className='w-5 h-5 text-gray-600' />
							</button>
						</div>
					</div>
				</section>

				<section className='container mx-auto px-4 py-8'>
					{loading ? (
						<>
							<div className='h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-32 mb-6' />
							<ProductCardSkeletonGrid count={8} />
						</>
					) : visibleProducts.length === 0 ? (
						<div className='text-center py-16'>
							<Pizza className='w-16 h-16 text-gray-300 mx-auto mb-4' />
							<p className='text-xl text-gray-600'>
								{selectedCategoryId ? 'Bu kategoriyada mahsulot topilmadi' : 'Hozircha mahsulotlar yo‘q'}
							</p>
							{selectedCategoryId && (
								<button
									type='button'
									onClick={() => setSelectedCategoryId(null)}
									className='mt-4 text-orange-600 font-medium hover:underline'
								>
									Barcha mahsulotlar
								</button>
							)}
						</div>
					) : (
						<>
							<p className='text-gray-600 mb-6'>{visibleProducts.length} ta mahsulot</p>
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
								{visibleProducts.map(product => {
									const isHighlight = productIdFromUrl === product.id
									return (
										<div
											key={product.id}
											ref={el => {
												productRefsMap.current[product.id] = el
											}}
											className={cn(
												'transition-all duration-500',
												isHighlight && 'ring-4 ring-orange-400 ring-offset-4 shadow-xl rounded-2xl',
											)}
										>
											<ProductCard
												product={{
													id: product.id,
													name: product.name,
													description: product.description ?? '',
													basePrice: product.basePrice ?? product.price ?? 0,
													imageUrl: product.imageUrl,
													prepTime: product.prepTime,
													difficulty: product.difficulty,
													calories: product.calories,
													categoryName: product.categoryName,
													variations: product.variations,
												}}
											/>
										</div>
									)
								})}
							</div>
						</>
					)}
				</section>
			</main>
		</>
	)
}

