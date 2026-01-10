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
				{
					step: 1,
					title: 'Xamirni yoyish',
					description: 'Pizza xamirini yumaloq shaklda yoying',
				},
				{
					step: 2,
					title: 'Pishloqlarni qo\'shish',
					description: 'Barcha pishloqlarni teng taqsimlang',
				},
				{
					step: 3,
					title: 'Pishirish',
					description: '220°C da 15 daqiqa pishiring',
				},
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
		},
	}))

	// BBQ Chicken Pizza
	void (await prisma.product.upsert({
		where: { id: 'bbq-chicken-1' },
		update: {},
		create: {
			id: 'bbq-chicken-1',
			name: 'BBQ Tovuq Pitsasi',
			description: 'BBQ sousi, pishgan tovuq, qizil piyoz, mozzarella pishloq',
			price: 65000,
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
			recipe: 'Pizza xamirini yoyib, ustiga BBQ sousini surkang. Pishgan tovuq go\'shtini qo\'shib, ustiga mozzarella pishloq va qizil piyoz qo\'ying. 230°C da 18 daqiqa pishiring. Tayyor bo\'lganda rayhon bilan bezang.',
			cookingTemp: 230,
			cookingTime: 18,
			cookingSteps: [
				{
					step: 1,
					title: 'Xamirni yoyish va sous surish',
					description: 'Pizza xamirini yoyib, ustiga BBQ sousini teng taqsimlang',
				},
				{
					step: 2,
					title: 'Tovuq go\'shtini qo\'shish',
					description: 'Pishgan tovuq go\'shtini kichik bo\'laklarga bo\'lib, pitsa ustiga qo\'ying',
				},
				{
					step: 3,
					title: 'Pishloq va piyoz',
					description: 'Mozzarella pishloq va qizil piyozni qo\'shing',
				},
				{
					step: 4,
					title: 'Pishirish',
					description: '230°C da 18 daqiqa pishiring. Tayyor bo\'lganda rayhon bilan bezang',
				},
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
		},
	}))

	// Hawaiian Pizza
	void (await prisma.product.upsert({
		where: { id: 'hawaiian-1' },
		update: {},
		create: {
			id: 'hawaiian-1',
			name: 'Gavayi Pitsasi',
			description: 'Ananas, vetchina, mozzarella pishloq - shirin va tuzli kombinatsiya',
			price: 58000,
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
			recipe: 'Pizza xamirini yoyib, pomidor sousini surkang. Vetchina va ananas bo\'laklarini qo\'shib, ustiga mozzarella pishloq qo\'ying. 220°C da 16 daqiqa pishiring. Qalampir bilan bezang.',
			cookingTemp: 220,
			cookingTime: 16,
			cookingSteps: [
				{
					step: 1,
					title: 'Xamirni yoyish',
					description: 'Pizza xamirini yumaloq shaklda yoying va pomidor sousini surkang',
				},
				{
					step: 2,
					title: 'Vetchina va ananas',
					description: 'Vetchina va ananas bo\'laklarini pitsa ustiga teng taqsimlang',
				},
				{
					step: 3,
					title: 'Pishloq qo\'shish',
					description: 'Mozzarella pishloqni ustiga qo\'ying',
				},
				{
					step: 4,
					title: 'Pishirish va bezash',
					description: '220°C da 16 daqiqa pishiring. Tayyor bo\'lganda qalampir bilan bezang',
				},
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
		},
	}))

	// Meat Lovers Pizza
	void (await prisma.product.upsert({
		where: { id: 'meat-lovers-1' },
		update: {},
		create: {
			id: 'meat-lovers-1',
			name: 'Go\'shtli Pitsa',
			description: 'Pepperoni, vetchina, kolbasa, mol go\'shti, mozzarella - go\'sht sevuvchilar uchun',
			price: 75000,
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
			recipe: 'Pizza xamirini yoyib, pomidor sousini surkang. Barcha go\'sht turlarini (pepperoni, vetchina, kolbasa, mol go\'shti) pitsa ustiga qo\'ying. Mozzarella pishloqni qo\'shib, 235°C da 20 daqiqa pishiring. Qalampir bilan bezang.',
			cookingTemp: 235,
			cookingTime: 20,
			cookingSteps: [
				{
					step: 1,
					title: 'Xamirni yoyish va sous',
					description: 'Pizza xamirini yoyib, pomidor sousini teng taqsimlang',
				},
				{
					step: 2,
					title: 'Go\'shtlarni qo\'shish',
					description: 'Pepperoni, vetchina, kolbasa va mol go\'shtini pitsa ustiga teng taqsimlang',
				},
				{
					step: 3,
					title: 'Pishloq qo\'shish',
					description: 'Mozzarella pishloqni barcha go\'shtlar ustiga qo\'ying',
				},
				{
					step: 4,
					title: 'Pishirish',
					description: '235°C da 20 daqiqa pishiring. Qalampir bilan bezang',
				},
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
	console.log(`   - Mahsulotlar: 7`)
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
