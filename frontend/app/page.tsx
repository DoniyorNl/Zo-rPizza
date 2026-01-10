// app/page.tsx
// 🍕 ZOR PIZZA - HOME PAGE

'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { ProductCard } from '@/components/products/ProductCard'
import { Header } from '@/components/layout/Header'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'

interface Product {
	id: string
	name: string
	description: string
	price: number
	imageUrl: string
	prepTime: number
	category: {
		name: string
	}
}

export default function Home() {
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const addItem = useCartStore(state => state.addItem)
	const router = useRouter()

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
				setProducts(response.data.data)
			} catch (err) {
				setError("Mahsulotlarni yuklab bo'lmadi")
				console.error(err)
			} finally {
				setLoading(false)
			}
		}

		fetchProducts()
	}, [])

	const handleAddToCart = (id: string) => {
		const product = products.find(p => p.id === id)
		if (product) {
			addItem({
				id: product.id,
				name: product.name,
				price: product.price,
				imageUrl: product.imageUrl,
			})
			// Cart page'ga yo'naltirish (ixtiyoriy)
			// router.push('/cart');
		}
	}

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-2xl'>Yuklanmoqda...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-2xl text-red-500'>{error}</div>
			</div>
		)
	}

	return (
		<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
			{/* Header */}
			<Header />

			{/* Products */}
			<div className='container mx-auto px-4 py-12'>
				<h2 className='text-4xl font-bold mb-8'>Bizning Menyu</h2>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
					{products.map(product => (
						<ProductCard
							key={product.id}
							id={product.id}
							name={product.name}
							description={product.description}
							price={product.price}
							imageUrl={product.imageUrl}
							prepTime={product.prepTime}
							categoryName={product.category.name}
							onAddToCart={handleAddToCart}
						/>
					))}
				</div>

				{products.length === 0 && (
					<div className='text-center py-12'>
						<p className='text-2xl text-gray-500'>Hozircha mahsulot yo'q</p>
					</div>
				)}
			</div>
		</main>
	)
}
