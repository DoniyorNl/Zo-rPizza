// 🍕 ZOR PIZZA - DATABASE SEED
// Bu fayl test ma'lumotlarni database'ga qo'shadi

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('🌱 Starting seed...')

	// ============================================
	// 1. KATEGORIYALAR
	// ============================================

	const pizzaCategory = await prisma.category.upsert({
		where: { name: 'Pitsa' },
		update: {},
		create: {
			name: 'Pitsa',
			description: 'Issiq va mazali pitsalar',
			imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
			isActive: true,
		},
	})

	void (await prisma.category.upsert({
		where: { name: 'Ichimliklar' },
		update: {},
		create: {
			name: 'Ichimliklar',
			description: 'Sovuq ichimliklar',
			imageUrl: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22',
			isActive: true,
		},
	}))

	console.log('✅ Kategoriyalar yaratildi')

	// ============================================
	// 2. INGREDIENTLAR
	// ============================================

	const ingredients = await Promise.all([
		prisma.ingredient.upsert({
			where: { name: 'Pizza xamiri' },
			update: {},
			create: {
				name: 'Pizza xamiri',
				unit: 'kg',
				costPerUnit: 15000,
				stockQty: 50,
				minStock: 10,
			},
		}),
		prisma.ingredient.upsert({
			where: { name: 'Mozzarella pishloq' },
			update: {},
			create: {
				name: 'Mozzarella pishloq',
				unit: 'kg',
				costPerUnit: 85000,
				stockQty: 30,
				minStock: 5,
			},
		}),
		prisma.ingredient.upsert({
			where: { name: 'Pomidor sousi' },
			update: {},
			create: {
				name: 'Pomidor sousi',
				unit: 'litr',
				costPerUnit: 25000,
				stockQty: 40,
				minStock: 10,
			},
		}),
		prisma.ingredient.upsert({
			where: { name: 'Pepperoni' },
			update: {},
			create: {
				name: 'Pepperoni',
				unit: 'kg',
				costPerUnit: 120000,
				stockQty: 15,
				minStock: 3,
			},
		}),
		prisma.ingredient.upsert({
			where: { name: 'Zaytun' },
			update: {},
			create: {
				name: 'Zaytun',
				unit: 'kg',
				costPerUnit: 45000,
				stockQty: 20,
				minStock: 5,
			},
		}),
	])

	console.log('✅ Ingredientlar yaratildi')

	// ============================================
	// 3. MAHSULOTLAR (PITSALAR)
	// ============================================

	const margarita = await prisma.product.upsert({
		where: { id: 'margarita-1' },
		update: {},
		create: {
			id: 'margarita-1',
			name: 'Margarita',
			description: 'Klassik italyan pitsasi - mozzarella, pomidor sousi, rayhon',
			price: 45000,
			imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
			prepTime: 15,
			categoryId: pizzaCategory.id,
			isActive: true,
		},
	})

	const pepperoni = await prisma.product.upsert({
		where: { id: 'pepperoni-1' },
		update: {},
		create: {
			id: 'pepperoni-1',
			name: 'Pepperoni',
			description: 'Mazali pepperoni kolbasa va mozzarella pishloq',
			price: 55000,
			imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
			prepTime: 18,
			categoryId: pizzaCategory.id,
			isActive: true,
		},
	})

	void (await prisma.product.upsert({
		where: { id: 'vegetarian-1' },
		update: {},
		create: {
			id: 'vegetarian-1',
			name: 'Vegetarian',
			description: "Sabzavotli pitsa - pomidor, zaytun, qo'ziqorin, qalampir",
			price: 48000,
			imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47',
			prepTime: 16,
			categoryId: pizzaCategory.id,
			isActive: true,
		},
	}))

	void (await prisma.product.upsert({
		where: { id: 'four-cheese-1' },
		update: {},
		create: {
			id: 'four-cheese-1',
			name: "To'rt xil pishloq",
			description: 'Mozzarella, parmesan, gorgonzola, ricotta',
			price: 62000,
			imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
			prepTime: 17,
			categoryId: pizzaCategory.id,
			isActive: true,
		},
	}))

	console.log('✅ Mahsulotlar yaratildi')

	// ============================================
	// 4. MAHSULOT-INGREDIENT BOG'LANISHI
	// ============================================

	// Margarita ingredientlari
	await prisma.productIngredient.createMany({
		data: [
			{ productId: margarita.id, ingredientId: ingredients[0].id, quantity: 0.3 }, // Xamir
			{ productId: margarita.id, ingredientId: ingredients[1].id, quantity: 0.2 }, // Mozzarella
			{ productId: margarita.id, ingredientId: ingredients[2].id, quantity: 0.1 }, // Sous
		],
		skipDuplicates: true,
	})

	// Pepperoni ingredientlari
	await prisma.productIngredient.createMany({
		data: [
			{ productId: pepperoni.id, ingredientId: ingredients[0].id, quantity: 0.3 }, // Xamir
			{ productId: pepperoni.id, ingredientId: ingredients[1].id, quantity: 0.2 }, // Mozzarella
			{ productId: pepperoni.id, ingredientId: ingredients[2].id, quantity: 0.1 }, // Sous
			{ productId: pepperoni.id, ingredientId: ingredients[3].id, quantity: 0.15 }, // Pepperoni
		],
		skipDuplicates: true,
	})

	console.log("✅ Ingredientlar mahsulotlarga bog'landi")

	// ============================================
	// 5. TEST USER (Admin)
	// ============================================

	const adminUser = await prisma.user.upsert({
		where: { email: 'admin@zorpizza.uz' },
		update: {},
		create: {
			email: 'admin@zorpizza.uz',
			password: '$2a$10$7xKj8KpL9Z.vQw5yE6X0muZJG1Y0F8hC9L2mN3pQ4rR5sS6tT7uU8', // "admin123"
			name: 'Admin',
			phone: '+998901234567',
			role: 'ADMIN',
		},
	})

	console.log('✅ Admin user yaratildi')
	console.log('\n📊 SEED SUMMARY:')
	console.log(`   - Kategoriyalar: 2`)
	console.log(`   - Ingredientlar: ${ingredients.length}`)
	console.log(`   - Mahsulotlar: 4`)
	console.log(`   - Admin: ${adminUser.email}`)
	console.log('\n🎉 Seed muvaffaqiyatli tugadi!\n')
}

main()
	.catch(e => {
		console.error('❌ Seed xatosi:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
