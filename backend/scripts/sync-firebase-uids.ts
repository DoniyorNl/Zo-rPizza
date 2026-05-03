/**
 * Database userlarni Supabase UID bilan yangilash
 * Usage: npx ts-node scripts/sync-firebase-uids.ts
 */

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

async function syncSupabaseIds() {
	console.log('🔄 Database userlarni Supabase UID bilan sinxronlash...\n')

	try {
		const dbUsers = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				supabaseId: true,
			},
		})

		console.log(`📊 Database da ${dbUsers.length} ta user topildi\n`)

		let updated = 0
		let skipped = 0

		for (const dbUser of dbUsers) {
			try {
				if (dbUser.supabaseId) {
					console.log(`⏭️  ${dbUser.email} - Allaqachon UID bor: ${dbUser.supabaseId}`)
					skipped++
					continue
				}

				// Get Supabase user by email
				const { data, error } = await supabaseAdmin.auth.admin.listUsers()
				if (error) throw error

				const supabaseUser = data?.users?.find(u => u.email === dbUser.email)
				if (!supabaseUser) {
					console.log(`⚠️  ${dbUser.email} - Supabase da topilmadi`)
					continue
				}

				await prisma.user.update({
					where: { id: dbUser.id },
					data: { supabaseId: supabaseUser.id },
				})

				console.log(`✅ ${dbUser.email} - UID yangilandi: ${supabaseUser.id}`)
				updated++
			} catch (error: any) {
				console.error(`❌ ${dbUser.email} - Xatolik:`, error.message)
			}
		}

		console.log('\n📈 Natija:')
		console.log(`   ✅ Yangilandi: ${updated}`)
		console.log(`   ⏭️  O'tkazildi: ${skipped}`)
		console.log(`   ⚠️  Xatolik: ${dbUsers.length - updated - skipped}`)
		console.log('\n🎉 Sinxronlash tugadi!')
	} catch (error) {
		console.error('❌ Fatal error:', error)
		throw error
	} finally {
		await prisma.$disconnect()
		process.exit(0)
	}
}

syncSupabaseIds().catch(error => {
	console.error('❌ Fatal error:', error)
	process.exit(1)
})
