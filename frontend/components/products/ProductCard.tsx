// 🍕 PRODUCT CARD KOMPONENTI

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import Image from 'next/image'

interface ProductCardProps {
	id: string
	name: string
	description: string
	price: number
	imageUrl: string
	prepTime: number
	categoryName: string
	onAddToCart?: (id: string) => void
}

export function ProductCard({
	id,
	name,
	description,
	price,
	imageUrl,
	prepTime,
	categoryName,
	onAddToCart,
}: ProductCardProps) {
	return (
		<Card className='overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105'>
			<CardHeader className='p-0'>
				<div className='relative h-64 w-full'>
					<Image
						src={imageUrl}
						alt={name}
						fill
						className='object-cover'
						sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
						priority
					/>
				</div>
			</CardHeader>

			<CardContent className='p-6'>
				<Badge className='mb-3'>{categoryName}</Badge>

				<h3 className='text-2xl font-bold mb-2'>{name}</h3>

				<p className='text-gray-600 mb-4'>{description}</p>

				<div className='flex items-center text-gray-500'>
					<Clock className='w-5 h-5 mr-2' />
					<span>{prepTime} daqiqa</span>
				</div>
			</CardContent>

			<CardFooter className='p-6 pt-0 flex items-center justify-between'>
				<span className='text-3xl font-bold text-orange-600'>{price.toLocaleString()} so'm</span>
				<Button size='lg' onClick={() => onAddToCart?.(id)}>
					Buyurtma
				</Button>
			</CardFooter>
		</Card>
	)
}
