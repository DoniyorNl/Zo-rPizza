// backend/scripts/clear-orders.ts
// Barcha buyurtmalarni o‘chirish (seed demo buyurtmalarini tozalash uchun bir marta ishlatish mumkin)

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearOrders() {
	try {
		const count = await prisma.order.count()
		console.log(`📦 Jami buyurtmalar: ${count}`)

		await prisma.order.deleteMany({})
		console.log('✅ Barcha buyurtmalar o‘chirildi (OrderItem lar cascade bo‘yicha o‘chadi).')
	} catch (error) {
		console.error('❌ Xato:', error)
		throw error
	} finally {
		await prisma.$disconnect()
	}
}

clearOrders()
	.then(() => process.exit(0))
	.catch(() => process.exit(1))
