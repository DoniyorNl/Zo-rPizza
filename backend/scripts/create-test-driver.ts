import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env') })

const prisma = new PrismaClient()

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
	try {
		const email = 'testdriver@pizza.com'
		const password = '123456789'
		const displayName = 'Test Driver'

		console.log('🔧 Creating Supabase user...')

		let supabaseUserId: string

		// Check if user already exists in Supabase
		const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
		const existingUser = existingUsers?.users?.find(u => u.email === email)

		if (existingUser) {
			console.log('⚠️ Supabase user already exists:', existingUser.id)
			supabaseUserId = existingUser.id
		} else {
			const { data, error } = await supabaseAdmin.auth.admin.createUser({
				email,
				password,
				user_metadata: { name: displayName },
				email_confirm: true,
			})
			if (error) throw error
			supabaseUserId = data.user.id
			console.log('✅ Supabase user created:', supabaseUserId)
		}

		// Database ga yozish
		console.log('💾 Saving to database...')
		const dbUser = await prisma.user.upsert({
			where: { email },
			update: {
				supabaseId: supabaseUserId,
				role: 'DELIVERY',
				name: displayName,
				isDriver: true,
				driverStatus: 'available',
				vehicleType: 'car',
			},
			create: {
				supabaseId: supabaseUserId,
				email,
				name: displayName,
				role: 'DELIVERY',
				isDriver: true,
				driverStatus: 'available',
				vehicleType: 'car',
			},
		})

		console.log('\n✅ SUCCESS!')
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
		console.log('📧 Email:', email)
		console.log('🔑 Parol:', password)
		console.log('👤 Ism:', displayName)
		console.log('🚗 Role:', dbUser.role)
		console.log('🆔 Supabase UID:', supabaseUserId)
		console.log('💾 Database ID:', dbUser.id)
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
		console.log('\n🎯 LOGIN QILING:')
		console.log('   http://localhost:3000/login')
		console.log('   Email: ' + email)
		console.log('   Parol: ' + password)
	} catch (error) {
		console.error('❌ Error:', error)
	} finally {
		await prisma.$disconnect()
	}
}

main()
