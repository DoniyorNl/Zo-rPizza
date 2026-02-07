import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	const driver = await prisma.user.findUnique({
		where: { email: 'driver@test.com' },
	})

	if (!driver) {
		console.log('❌ Driver topilmadi')
		return
	}

	const orders = await prisma.order.findMany({
		where: {
			driverId: driver.id,
			status: { in: ['CONFIRMED', 'OUT_FOR_DELIVERY', 'PREPARING'] },
		},
		include: { user: true },
		orderBy: { createdAt: 'desc' },
		take: 5,
	})

	console.log('🚗 Driver:', driver.email)
	console.log('🆔 Driver ID:', driver.id)
	console.log('📦 Aktiv buyurtmalar:', orders.length)

	if (orders.length === 0) {
		console.log("\n⚠️ Hozircha aktiv buyurtmalar yo'q")
		console.log('💡 Test order yaratish kerak!')
	} else {
		orders.forEach((o, i) => {
			console.log(`\n${i + 1}. Order #${o.orderNumber}`)
			console.log(`   Status: ${o.status}`)
			console.log(`   Price: ${o.totalPrice} so'm`)
			console.log(`   Address: ${o.deliveryAddress || 'N/A'}`)
			console.log(`   Customer: ${o.user.name}`)
		})
	}
}

main()
	.catch(e => console.error(e))
	.finally(() => prisma.$disconnect())
