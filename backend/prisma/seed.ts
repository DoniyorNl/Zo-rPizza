// backend/prisma/seed.ts
// 🍕 ZOR PIZZA - DATABASE SEED with Variations

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
	// 3. MAHSULOTLAR (PITSALAR) with VARIATIONS
	// ============================================

	// 1. Margarita
	const margarita = await prisma.product.upsert({
		where: { id: 'margarita-1' },
		update: {},
		create: {
			id: 'margarita-1',
			name: 'Margarita',
			description: 'Klassik italyan pitsasi - mozzarella, pomidor sousi, rayhon',
			basePrice: 45000, // ✅ NEW
			imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
			prepTime: 15,
			categoryId: pizzaCategory.id,
			isActive: true,
			ingredients: [
				{ name: 'Pizza xamiri', amount: '300g', icon: '🌾' },
				{ name: 'Mozzarella pishloq', amount: '200g', icon: '🧀' },
				{ name: 'Pomidor sousi', amount: '100ml', icon: '🍅' },
				{ name: 'Rayhon', amount: '10g', icon: '🌿' },
			],
			recipe: 'Klassik Margherita pitsasi - italyan oshpazligining ajoyib namunasi. Yumshoq xamir, yangi pomidor sousi va eruvchan mozzarella.',
			cookingTemp: 220,
			cookingTime: 15,
			cookingSteps: [
				{ step: 1, title: 'Xamirni yoyish', description: 'Pizza xamirini yumaloq shaklda yoying' },
				{ step: 2, title: 'Sous surish', description: 'Pomidor sousini xamir ustiga teng taqsimlang' },
				{ step: 3, title: 'Pishirish', description: '220°C da 15 daqiqa pishiring' },
			],
			calories: 320,
			protein: 18.5,
			carbs: 28.0,
			fat: 15.2,
			difficulty: 'Oson',
			servings: 2,
			allergens: ['Sut', 'Gluten'],
			images: [
				'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
				'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
			],
			// ✅ NEW: Variations
			variations: {
				create: [
					{ size: 'Small', price: 35000, diameter: 25, slices: 6, weight: 400 },
					{ size: 'Medium', price: 45000, diameter: 30, slices: 8, weight: 550 },
					{ size: 'Large', price: 55000, diameter: 35, slices: 10, weight: 700 },
					{ size: 'XL', price: 65000, diameter: 40, slices: 12, weight: 900 },
				],
			},
		},
	})

	// 2. Pepperoni
	const pepperoni = await prisma.product.upsert({
		where: { id: 'pepperoni-1' },
		update: {},
		create: {
			id: 'pepperoni-1',
			name: 'Pepperoni',
			description: 'Mazali pepperoni kolbasa va mozzarella pishloq',
			basePrice: 55000,
			imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
			prepTime: 18,
			categoryId: pizzaCategory.id,
			isActive: true,
			ingredients: [
				{ name: 'Pizza xamiri', amount: '300g', icon: '🌾' },
				{ name: 'Pomidor sousi', amount: '100ml', icon: '🍅' },
				{ name: 'Mozzarella pishloq', amount: '150g', icon: '🧀' },
				{ name: 'Pepperoni', amount: '100g', icon: '🍖' },
			],
			recipe: 'Amerika\'ning eng mashhur pitsasi. Achchiq pepperoni va eruvchan pishloq - ajoyib kombinatsiya!',
			cookingTemp: 220,
			cookingTime: 16,
			cookingSteps: [
				{
					step: 1,
					title: 'Xamir tayyorlash',
					description:
						'300 g un, 180 ml iliq suv, 5 g quruq droj, 1 ch.q. shakar, 1 ch.q. tuz va 1 osh.q. zaytun yog\'ini aralashtiring. 8-10 daqiqa yoğing, ustini yopib 45-60 daqiqa ko\'taring. So\'ng xamirni yumaloq qilib yoying.',
				},
				{ step: 2, title: 'Asosiy qatlamlar', description: 'Sous va pishloq qo\'shing' },
				{ step: 3, title: 'Pepperoni', description: 'Pepperoni bo\'laklarini joylashtiring' },
				{ step: 4, title: 'Pishirish', description: '220°C da 14-16 daqiqa' },
			],
			calories: 380,
			protein: 22.0,
			carbs: 32.0,
			fat: 18.5,
			difficulty: 'Oson',
			servings: 2,
			allergens: ['Sut', 'Gluten'],
			images: ['https://images.unsplash.com/photo-1628840042765-356cda07504e'],
			variations: {
				create: [
					{ size: 'Small', price: 45000, diameter: 25, slices: 6, weight: 450 },
					{ size: 'Medium', price: 55000, diameter: 30, slices: 8, weight: 600 },
					{ size: 'Large', price: 65000, diameter: 35, slices: 10, weight: 750 },
					{ size: 'XL', price: 75000, diameter: 40, slices: 12, weight: 950 },
				],
			},
		},
	})

	// 3. Vegetarian
	void (await prisma.product.upsert({
		where: { id: 'vegetarian-1' },
		update: {},
		create: {
			id: 'vegetarian-1',
			name: 'Vegetarian',
			description: "Sabzavotli pitsa - pomidor, zaytun, qo'ziqorin, qalampir",
			basePrice: 48000,
			imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47',
			prepTime: 16,
			categoryId: pizzaCategory.id,
			isActive: true,
			ingredients: [
				{ name: 'Pizza xamiri', amount: '300g', icon: '🌾' },
				{ name: 'Pomidor sousi', amount: '100ml', icon: '🍅' },
				{ name: 'Mozzarella', amount: '150g', icon: '🧀' },
				{ name: 'Pomidor', amount: '100g', icon: '🍅' },
				{ name: 'Zaytun', amount: '50g', icon: '🫒' },
				{ name: "Qo'ziqorin", amount: '80g', icon: '🍄' },
			],
			recipe: 'Sog\'lom va mazali vegetarian pitsa - faqat yangi sabzavotlar!',
			cookingTemp: 220,
			cookingTime: 15,
			calories: 280,
			protein: 14.0,
			carbs: 30.0,
			fat: 12.0,
			difficulty: 'Oson',
			servings: 2,
			allergens: ['Sut', 'Gluten'],
			variations: {
				create: [
					{ size: 'Small', price: 38000, diameter: 25, slices: 6 },
					{ size: 'Medium', price: 48000, diameter: 30, slices: 8 },
					{ size: 'Large', price: 58000, diameter: 35, slices: 10 },
					{ size: 'XL', price: 68000, diameter: 40, slices: 12 },
				],
			},
		},
	}))

	// 4. Four Cheese
	void (await prisma.product.upsert({
		where: { id: 'four-cheese-1' },
		update: {},
		create: {
			id: 'four-cheese-1',
			name: "To'rt xil pishloq",
			description: 'Mozzarella, parmesan, gorgonzola, ricotta',
			basePrice: 62000,
			imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
			prepTime: 17,
			categoryId: pizzaCategory.id,
			isActive: true,
			ingredients: [
				{ name: 'Pizza xamiri', amount: '300g', icon: '🌾' },
				{ name: 'Mozzarella pishloq', amount: '200g', icon: '🧀' },
				{ name: 'Parmesan', amount: '50g', icon: '🧀' },
				{ name: 'Gorgonzola', amount: '50g', icon: '🧀' },
				{ name: 'Ricotta', amount: '100g', icon: '🧀' },
			],
			recipe: 'Pizza xamirini yoyib, ustiga barcha pishloqlarni qo\'ying. 220°C da 15 daqiqa pishiring.',
			cookingTemp: 220,
			cookingTime: 15,
			cookingSteps: [
				{ step: 1, title: 'Xamirni yoyish', description: 'Pizza xamirini yumaloq shaklda yoying' },
				{ step: 2, title: 'Pishloqlarni qo\'shish', description: 'Barcha pishloqlarni teng taqsimlang' },
				{ step: 3, title: 'Pishirish', description: '220°C da 15 daqiqa pishiring' },
			],
			calories: 320,
			protein: 18.5,
			carbs: 28.0,
			fat: 15.2,
			difficulty: 'Oson',
			servings: 2,
			allergens: ['Sut', 'Gluten'],
			images: [
				'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
				'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
			],
			variations: {
				create: [
					{ size: 'Small', price: 52000, diameter: 25, slices: 6 },
					{ size: 'Medium', price: 62000, diameter: 30, slices: 8 },
					{ size: 'Large', price: 72000, diameter: 35, slices: 10 },
					{ size: 'XL', price: 82000, diameter: 40, slices: 12 },
				],
			},
		},
	}))

	// 5. BBQ Chicken
	void (await prisma.product.upsert({
		where: { id: 'bbq-chicken-1' },
		update: {},
		create: {
			id: 'bbq-chicken-1',
			name: 'BBQ Tovuq Pitsasi',
			description: 'BBQ sousi, pishgan tovuq, qizil piyoz, mozzarella pishloq',
			basePrice: 65000,
			imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3',
			prepTime: 20,
			categoryId: pizzaCategory.id,
			isActive: true,
			ingredients: [
				{ name: 'Pizza xamiri', amount: '300g', icon: '🌾' },
				{ name: 'BBQ sousi', amount: '100ml', icon: '🍖' },
				{ name: 'Pishgan tovuq', amount: '200g', icon: '🍗' },
				{ name: 'Mozzarella pishloq', amount: '150g', icon: '🧀' },
				{ name: 'Qizil piyoz', amount: '50g', icon: '🧅' },
				{ name: 'Rayhon', amount: '10g', icon: '🌿' },
			],
			recipe: 'Pizza xamirini yoyib, ustiga BBQ sousini surkang. Pishgan tovuq go\'shtini qo\'shib, ustiga mozzarella pishloq va qizil piyoz qo\'ying. 230°C da 18 daqiqa pishiring.',
			cookingTemp: 230,
			cookingTime: 18,
			cookingSteps: [
				{ step: 1, title: 'Xamir va sous', description: 'Xamirni yoyib, BBQ sousini surkang' },
				{ step: 2, title: 'Tovuq', description: 'Pishgan tovuqni qo\'shing' },
				{ step: 3, title: 'Pishloq va piyoz', description: 'Mozzarella va piyoz qo\'shing' },
				{ step: 4, title: 'Pishirish', description: '230°C da 18 daqiqa' },
			],
			calories: 380,
			protein: 22.0,
			carbs: 32.0,
			fat: 18.5,
			difficulty: 'O\'rtacha',
			servings: 2,
			allergens: ['Sut', 'Gluten'],
			images: [
				'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3',
				'https://images.unsplash.com/photo-1628840042765-356cda07504e',
			],
			variations: {
				create: [
					{ size: 'Small', price: 55000, diameter: 25, slices: 6 },
					{ size: 'Medium', price: 65000, diameter: 30, slices: 8 },
					{ size: 'Large', price: 75000, diameter: 35, slices: 10 },
					{ size: 'XL', price: 85000, diameter: 40, slices: 12 },
				],
			},
		},
	}))

	// 6. Hawaiian
	void (await prisma.product.upsert({
		where: { id: 'hawaiian-1' },
		update: {},
		create: {
			id: 'hawaiian-1',
			name: 'Gavayi Pitsasi',
			description: 'Ananas, vetchina, mozzarella pishloq - shirin va tuzli kombinatsiya',
			basePrice: 58000,
			imageUrl: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f',
			prepTime: 16,
			categoryId: pizzaCategory.id,
			isActive: true,
			ingredients: [
				{ name: 'Pizza xamiri', amount: '300g', icon: '🌾' },
				{ name: 'Pomidor sousi', amount: '100ml', icon: '🍅' },
				{ name: 'Vetchina', amount: '150g', icon: '🥓' },
				{ name: 'Ananas', amount: '100g', icon: '🍍' },
				{ name: 'Mozzarella pishloq', amount: '180g', icon: '🧀' },
				{ name: 'Qalampir', amount: '30g', icon: '🌶️' },
			],
			recipe: 'Pizza xamirini yoyib, pomidor sousini surkang. Vetchina va ananas bo\'laklarini qo\'shib, ustiga mozzarella pishloq qo\'ying. 220°C da 16 daqiqa pishiring.',
			cookingTemp: 220,
			cookingTime: 16,
			cookingSteps: [
				{ step: 1, title: 'Xamir va sous', description: 'Xamirni yoyib, pomidor sousini surkang' },
				{ step: 2, title: 'Vetchina va ananas', description: 'Vetchina va ananas qo\'shing' },
				{ step: 3, title: 'Pishloq', description: 'Mozzarella qo\'shing' },
				{ step: 4, title: 'Pishirish', description: '220°C da 16 daqiqa' },
			],
			calories: 350,
			protein: 16.0,
			carbs: 35.0,
			fat: 16.0,
			difficulty: 'Oson',
			servings: 2,
			allergens: ['Sut', 'Gluten'],
			images: [
				'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f',
				'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
			],
			variations: {
				create: [
					{ size: 'Small', price: 48000, diameter: 25, slices: 6 },
					{ size: 'Medium', price: 58000, diameter: 30, slices: 8 },
					{ size: 'Large', price: 68000, diameter: 35, slices: 10 },
					{ size: 'XL', price: 78000, diameter: 40, slices: 12 },
				],
			},
		},
	}))

	// 7. Meat Lovers
	void (await prisma.product.upsert({
		where: { id: 'meat-lovers-1' },
		update: {},
		create: {
			id: 'meat-lovers-1',
			name: 'Go\'shtli Pitsa',
			description: 'Pepperoni, vetchina, kolbasa, mol go\'shti, mozzarella - go\'sht sevuvchilar uchun',
			basePrice: 75000,
			imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
			prepTime: 22,
			categoryId: pizzaCategory.id,
			isActive: true,
			ingredients: [
				{ name: 'Pizza xamiri', amount: '350g', icon: '🌾' },
				{ name: 'Pomidor sousi', amount: '120ml', icon: '🍅' },
				{ name: 'Pepperoni', amount: '100g', icon: '🍖' },
				{ name: 'Vetchina', amount: '100g', icon: '🥓' },
				{ name: 'Kolbasa', amount: '100g', icon: '🌭' },
				{ name: 'Mol go\'shti', amount: '120g', icon: '🥩' },
				{ name: 'Mozzarella pishloq', amount: '200g', icon: '🧀' },
				{ name: 'Qalampir', amount: '20g', icon: '🌶️' },
			],
			recipe: 'Pizza xamirini yoyib, pomidor sousini surkang. Barcha go\'sht turlarini pitsa ustiga qo\'ying. Mozzarella pishloqni qo\'shib, 235°C da 20 daqiqa pishiring.',
			cookingTemp: 235,
			cookingTime: 20,
			cookingSteps: [
				{ step: 1, title: 'Xamir va sous', description: 'Xamirni yoyib, pomidor sousini surkang' },
				{ step: 2, title: 'Go\'shtlar', description: 'Barcha go\'shtlarni qo\'shing' },
				{ step: 3, title: 'Pishloq', description: 'Mozzarella qo\'shing' },
				{ step: 4, title: 'Pishirish', description: '235°C da 20 daqiqa' },
			],
			calories: 450,
			protein: 28.0,
			carbs: 30.0,
			fat: 24.0,
			difficulty: 'Qiyin',
			servings: 3,
			allergens: ['Sut', 'Gluten'],
			images: [
				'https://images.unsplash.com/photo-1513104890138-7c749659a591',
				'https://images.unsplash.com/photo-1628840042765-356cda07504e',
			],
			variations: {
				create: [
					{ size: 'Small', price: 65000, diameter: 25, slices: 6 },
					{ size: 'Medium', price: 75000, diameter: 30, slices: 8 },
					{ size: 'Large', price: 85000, diameter: 35, slices: 10 },
					{ size: 'XL', price: 95000, diameter: 40, slices: 12 },
				],
			},
		},
	}))

	console.log('✅ Mahsulotlar (variations bilan) yaratildi')

	// ============================================
	// 4. MAHSULOT-INGREDIENT BOG'LANISHI
	// ============================================

	await prisma.productIngredient.createMany({
		data: [
			// Margarita
			{ productId: margarita.id, ingredientId: ingredients[0].id, quantity: 0.3 },
			{ productId: margarita.id, ingredientId: ingredients[1].id, quantity: 0.2 },
			{ productId: margarita.id, ingredientId: ingredients[2].id, quantity: 0.1 },
			// Pepperoni
			{ productId: pepperoni.id, ingredientId: ingredients[0].id, quantity: 0.3 },
			{ productId: pepperoni.id, ingredientId: ingredients[1].id, quantity: 0.2 },
			{ productId: pepperoni.id, ingredientId: ingredients[2].id, quantity: 0.1 },
			{ productId: pepperoni.id, ingredientId: ingredients[3].id, quantity: 0.15 },
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
	console.log(`   - Mahsulotlar: 7 (har biri 4 ta size bilan)`)
	console.log(`   - Jami variations: 28`)
	console.log(`   - Admin: ${adminUser.email} / admin123`)
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