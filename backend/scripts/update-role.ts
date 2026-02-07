import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	const email = 'driver@test.com'

	const user = await prisma.user.update({
		where: { email },
		data: { role: 'DELIVERY' },
	})

	console.log('✅ Role updated:')
	console.log(`Email: ${user.email}`)
	console.log(`Role: ${user.role}`)
	console.log(`Name: ${user.name}`)
}

main()
	.catch(e => {
		console.error('❌ Error:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
