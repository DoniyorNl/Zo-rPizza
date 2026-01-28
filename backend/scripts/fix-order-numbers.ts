// backend/scripts/fix-order-numbers.ts
// Script to fix invalid order numbers in database

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixOrderNumbers() {
	try {
		console.log('🔍 Checking for invalid order numbers...')

		const orders = await prisma.order.findMany({
			orderBy: { createdAt: 'asc' },
		})

		console.log(`📦 Found ${orders.length} orders`)

		let fixedCount = 0
		let orderCounter = 1

		for (const order of orders) {
			const currentNumber = order.orderNumber
			const parsed = parseInt(currentNumber.replace(/\D/g, ''))

			if (isNaN(parsed) || currentNumber.includes('NaN')) {
				const newOrderNumber = `#${orderCounter.toString().padStart(4, '0')}`
				console.log(`🔧 Fixing: ${currentNumber} → ${newOrderNumber}`)

				await prisma.order.update({
					where: { id: order.id },
					data: { orderNumber: newOrderNumber },
				})

				fixedCount++
			} else {
				orderCounter = parsed
			}

			orderCounter++
		}

		console.log(`✅ Fixed ${fixedCount} invalid order numbers`)
		console.log(`📊 Total orders processed: ${orders.length}`)
	} catch (error) {
		console.error('❌ Error fixing order numbers:', error)
		throw error
	} finally {
		await prisma.$disconnect()
	}
}

fixOrderNumbers()
	.then(() => {
		console.log('✨ Done!')
		process.exit(0)
	})
	.catch(error => {
		console.error('Fatal error:', error)
		process.exit(1)
	})
