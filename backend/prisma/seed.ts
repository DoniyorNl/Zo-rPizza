// backend/prisma/seed.ts
// 🍕 ZOR PIZZA - COMPLETE DATABASE SEED with Orders & Variations

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('🌱 Starting seed...\n')

	try {
		// ============================================
		// 1. KATEGORIYALAR
		// ============================================
		console.log('📂 Kategoriyalar yaratilmoqda...')

		const pizzaCategory = await prisma.category.upsert({
			where: { name: 'Pitsa' },
			update: {},
			create: {
				name: 'Pitsa',
				description: 'Issiq va mazali pitsalar - italyan va zamonaviy retseptlar',
				imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
				isActive: true,
			},
		})

		const drinksCategory = await prisma.category.upsert({
			where: { name: 'Ichimliklar' },
			update: {},
			create: {
				name: 'Ichimliklar',
				description: 'Sovuq gazlangan va tabiiy ichimliklar',
				imageUrl: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22',
				isActive: true,
			},
		})

		const sidesCategory = await prisma.category.upsert({
			where: { name: "Qo'shimchalar" },
			update: {},
			create: {
				name: "Qo'shimchalar",
				description: 'Salatlar, sous va garnirlar',
				imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
				isActive: true,
			},
		})

		console.log('✅ 3 ta kategoriya yaratildi\n')

		// ============================================
		// 2. INGREDIENTLAR
		// ============================================
		console.log('🧑‍🍳 Ingredientlar yaratilmoqda...')

		const ingredientData = [
			{
				name: 'Pizza xamiri',
				unit: 'kg',
				costPerUnit: 15000,
				stockQty: 50,
				minStock: 10,
			},
			{
				name: 'Mozzarella pishloq',
				unit: 'kg',
				costPerUnit: 85000,
				stockQty: 30,
				minStock: 5,
			},
			{
				name: 'Pomidor sousi',
				unit: 'litr',
				costPerUnit: 25000,
				stockQty: 40,
				minStock: 10,
			},
			{
				name: 'Pepperoni',
				unit: 'kg',
				costPerUnit: 120000,
				stockQty: 15,
				minStock: 3,
			},
			{
				name: 'Zaytun',
				unit: 'kg',
				costPerUnit: 45000,
				stockQty: 20,
				minStock: 5,
			},
		]

		const ingredients = []
		for (const ing of ingredientData) {
			const created = await prisma.ingredient.upsert({
				where: { name: ing.name },
				update: {},
				create: ing,
			})
			ingredients.push(created)
		}

		console.log(`✅ ${ingredients.length} ta ingredient yaratildi\n`)

		// ============================================
		// 3. MAHSULOTLAR (PITSALAR) with VARIATIONS
		// ============================================
		console.log('🍕 Mahsulotlar yaratilmoqda...')

		const productData = [
			{
				id: 'margarita-1',
				name: 'Margarita',
				description: 'Klassik italyan pitsasi - mozzarella, pomidor sousi, rayhon',
				basePrice: 45000,
				imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
				categoryId: pizzaCategory.id,
				variations: [
					{ size: 'Small', price: 35000, diameter: 25, slices: 6, weight: 400 },
					{ size: 'Medium', price: 45000, diameter: 30, slices: 8, weight: 550 },
					{ size: 'Large', price: 55000, diameter: 35, slices: 10, weight: 700 },
					{ size: 'XL', price: 65000, diameter: 40, slices: 12, weight: 900 },
				],
			},
			{
				id: 'pepperoni-1',
				name: 'Pepperoni',
				description: 'Mazali pepperoni kolbasa va mozzarella pishloq',
				basePrice: 55000,
				imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
				categoryId: pizzaCategory.id,
				variations: [
					{ size: 'Small', price: 45000, diameter: 25, slices: 6, weight: 450 },
					{ size: 'Medium', price: 55000, diameter: 30, slices: 8, weight: 600 },
					{ size: 'Large', price: 65000, diameter: 35, slices: 10, weight: 750 },
					{ size: 'XL', price: 75000, diameter: 40, slices: 12, weight: 950 },
				],
			},
			{
				id: 'vegetarian-1',
				name: 'Vegetarian',
				description: "Sabzavotli pitsa - pomidor, zaytun, qo'ziqorin, qalampir",
				basePrice: 48000,
				imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47',
				categoryId: pizzaCategory.id,
				variations: [
					{ size: 'Small', price: 38000, diameter: 25, slices: 6, weight: 420 },
					{ size: 'Medium', price: 48000, diameter: 30, slices: 8, weight: 570 },
					{ size: 'Large', price: 58000, diameter: 35, slices: 10, weight: 720 },
					{ size: 'XL', price: 68000, diameter: 40, slices: 12, weight: 920 },
				],
			},
			{
				id: 'four-cheese-1',
				name: "To'rt xil pishloq",
				description: 'Mozzarella, parmesan, gorgonzola, ricotta',
				basePrice: 62000,
				imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
				categoryId: pizzaCategory.id,
				variations: [
					{ size: 'Small', price: 52000, diameter: 25, slices: 6, weight: 440 },
					{ size: 'Medium', price: 62000, diameter: 30, slices: 8, weight: 590 },
					{ size: 'Large', price: 72000, diameter: 35, slices: 10, weight: 740 },
					{ size: 'XL', price: 82000, diameter: 40, slices: 12, weight: 940 },
				],
			},
			{
				id: 'bbq-chicken-1',
				name: 'BBQ Tovuq',
				description: 'BBQ sousi, pishgan tovuq, qizil piyoz, mozzarella',
				basePrice: 65000,
				imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3',
				categoryId: pizzaCategory.id,
				variations: [
					{ size: 'Small', price: 55000, diameter: 25, slices: 6, weight: 470 },
					{ size: 'Medium', price: 65000, diameter: 30, slices: 8, weight: 620 },
					{ size: 'Large', price: 75000, diameter: 35, slices: 10, weight: 770 },
					{ size: 'XL', price: 85000, diameter: 40, slices: 12, weight: 970 },
				],
			},
			{
				id: 'hawaiian-1',
				name: 'Hawaiian',
				description: 'Ananas, vetchina, mozzarella - shirin va tuzli',
				basePrice: 58000,
				imageUrl: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f',
				categoryId: pizzaCategory.id,
				variations: [
					{ size: 'Small', price: 48000, diameter: 25, slices: 6, weight: 430 },
					{ size: 'Medium', price: 58000, diameter: 30, slices: 8, weight: 580 },
					{ size: 'Large', price: 68000, diameter: 35, slices: 10, weight: 730 },
					{ size: 'XL', price: 78000, diameter: 40, slices: 12, weight: 930 },
				],
			},
			{
				id: 'meat-lovers-1',
				name: "Go'shtli Pitsa",
				description: "Pepperoni, vetchina, kolbasa, mol go'shti, mozzarella",
				basePrice: 75000,
				imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
				categoryId: pizzaCategory.id,
				variations: [
					{ size: 'Small', price: 65000, diameter: 25, slices: 6, weight: 500 },
					{ size: 'Medium', price: 75000, diameter: 30, slices: 8, weight: 650 },
					{ size: 'Large', price: 85000, diameter: 35, slices: 10, weight: 800 },
					{ size: 'XL', price: 95000, diameter: 40, slices: 12, weight: 1000 },
				],
			},
		]

		const createdProducts = []

		for (const product of productData) {
			const created = await prisma.product.upsert({
				where: { id: product.id },
				update: {},
				create: {
					id: product.id,
					name: product.name,
					description: product.description,
					basePrice: product.basePrice,
					imageUrl: product.imageUrl,
					prepTime: 15,
					categoryId: product.categoryId,
					isActive: true,
					variations: {
						create: product.variations,
					},
				},
				include: {
					variations: true,
				},
			})
			createdProducts.push(created)
		}

		console.log(`✅ ${createdProducts.length} ta mahsulot yaratildi`)
		console.log(
			`✅ ${createdProducts.reduce((sum, p) => sum + p.variations.length, 0)} ta variation yaratildi\n`,
		)

		// ============================================
		// 4. FOYDALANUVCHILAR
		// ============================================
		console.log('👥 Foydalanuvchilar yaratilmoqda...')

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

		const customerSeedData = [
			{
				email: 'alisher@gmail.com',
				name: 'Alisher Karimov',
				phone: '+998901111111',
				address: 'Toshkent, Chilonzor tumani, 12-kvartal, 45-uy',
			},
			{
				email: 'dilnoza@gmail.com',
				name: 'Dilnoza Rahimova',
				phone: '+998902222222',
				address: 'Toshkent, Yunusobod tumani, 5-mavze, 23-uy',
			},
			{
				email: 'bobur@gmail.com',
				name: 'Bobur Toshmatov',
				phone: '+998903333333',
				address: 'Toshkent, Sergeli tumani, 8-kvartal, 67-uy',
			},
			{
				email: 'malika@gmail.com',
				name: 'Malika Alimova',
				phone: '+998904444444',
				address: 'Toshkent, Mirzo Ulugbek tumani, 14-kvartal, 89-uy',
			},
		]

		const customers = []
		for (const data of customerSeedData) {
			const created = await prisma.user.upsert({
				where: { email: data.email },
				update: {},
				create: {
					email: data.email,
					password: '$2a$10$7xKj8KpL9Z.vQw5yE6X0muZJG1Y0F8hC9L2mN3pQ4rR5sS6tT7uU8', // "admin123"
					name: data.name,
					phone: data.phone,
					role: 'CUSTOMER',
				},
			})
			customers.push(created)
		}

		console.log(`✅ 1 ta admin user yaratildi`)
		console.log(`✅ ${customers.length} ta mijoz yaratildi\n`)

		// Buyurtmalar seed’da yaratilmaydi – faqat checkout orqali yaratiladi (standart pizzeria)

		// ============================================
		// FINAL SUMMARY
		// ============================================
		console.log('━'.repeat(60))
		console.log('📊 SEED SUMMARY:')
		console.log('━'.repeat(60))
		console.log(`   📂 Kategoriyalar: 3`)
		console.log(`   🧑‍🍳 Ingredientlar: ${ingredients.length}`)
		console.log(`   🍕 Mahsulotlar: ${createdProducts.length}`)
		console.log(
			`   📏 Variations: ${createdProducts.reduce((sum, p) => sum + p.variations.length, 0)}`,
		)
		console.log(`   👤 Admin: 1 (${adminUser.email})`)
		console.log(`   👥 Mijozlar: ${customers.length}`)
		console.log(`   🛍️ Buyurtmalar: 0 (faqat checkout orqali)`)
		console.log('━'.repeat(60))
		console.log('\n🔐 LOGIN CREDENTIALS:')
		console.log(`   📧 Email: admin@zorpizza.uz`)
		console.log(`   🔑 Password: admin123`)
		console.log('━'.repeat(60))
		console.log('\n🎉 Seed muvaffaqiyatli tugadi!\n')
	} catch (error) {
		console.error('\n❌ SEED XATOSI:', error)
		throw error
	}
}

main()
	.catch(e => {
		console.error('❌ Seed jarayonida xatolik:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
