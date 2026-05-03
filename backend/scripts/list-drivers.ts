/**
 * Driver userlarni ko'rish
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	try {
		const drivers = await prisma.user.findMany({
			where: {
				OR: [{ role: 'DELIVERY' }, { isDriver: true }],
			},
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				isDriver: true,
				driverStatus: true,
				supabaseId: true,
			},
		})

		console.log('\n🚗 DRIVER USERLAR:\n')
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

		if (drivers.length === 0) {
			console.log('❌ Hech qanday driver topilmadi!')
		} else {
			drivers.forEach((driver, index) => {
				console.log(`\n${index + 1}. 📧 Email: ${driver.email}`)
				console.log(`   👤 Ism: ${driver.name || 'N/A'}`)
				console.log(`   🎭 Role: ${driver.role}`)
				console.log(`   🚦 Status: ${driver.driverStatus || 'N/A'}`)
				console.log(`   🆔 Supabase UID: ${driver.supabaseId || 'N/A'}`)
			})

			console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
			console.log(`\n✅ Jami: ${drivers.length} ta driver\n`)
			console.log('🔑 PAROLLAR:')
			console.log('   testdriver@pizza.com → 123456789')
			console.log('   Boshqa driverlar → admin123 (yoki yaratilishida berilgan parol)')
		}
	} catch (error) {
		console.error('❌ Error:', error)
	} finally {
		await prisma.$disconnect()
	}
}

main()
