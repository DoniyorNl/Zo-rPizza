// =====================================
// 📁 FILE PATH: backend/src/scripts/create-first-admin.ts
// 👑 FIRST ADMIN CREATOR SCRIPT
// 🎯 PURPOSE: Create the first admin user
// 📝 USAGE: npx tsx src/scripts/create-first-admin.ts your@email.com
// =====================================

import 'dotenv/config'
import { supabaseAdmin } from '../config/supabase'
import prisma from '../lib/prisma'

async function createFirstAdmin() {
	const adminEmail = process.argv[2]

	if (!adminEmail) {
		console.error('❌ Email kiritilmadi!')
		console.log('💡 Ishlatish: npx tsx src/scripts/create-first-admin.ts your@email.com')
		process.exit(1)
	}

	console.log('\n👑 Birinchi Admin Yaratish\n')
	console.log('📧 Email:', adminEmail)
	console.log('⏳ Kutilmoqda...\n')

	try {
		// ============================================
		// 1. SUPABASE DAN USER TOPISH
		// ============================================
		console.log('1️⃣ Supabase dan user qidirilmoqda...')
		const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
		const supabaseUser = listData?.users?.find(u => u.email === adminEmail)
		if (!supabaseUser) {
			throw Object.assign(new Error(`User not found: ${adminEmail}`), { code: 'auth/user-not-found' })
		}
		console.log(`✅ Topildi: ${supabaseUser.id}`)

		// ============================================
		// 2. SUPABASE APP METADATA
		// ============================================
		console.log('\n2️⃣ Supabase app_metadata sozlanmoqda...')
		await supabaseAdmin.auth.admin.updateUserById(supabaseUser.id, {
			app_metadata: { role: 'admin' },
		})
		console.log('✅ app_metadata sozlandi')

		// ============================================
		// 3. DATABASE UPSERT
		// ============================================
		console.log('\n3️⃣ Database yangilanmoqda...')

		const dbUser = await prisma.user.upsert({
			where: { supabaseId: supabaseUser.id },
			update: {
				role: 'ADMIN',
				isBlocked: false,
			},
			create: {
				supabaseId: supabaseUser.id,
				email: supabaseUser.email!,
				name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || 'Admin',
				password: null,
				role: 'ADMIN',
				isBlocked: false,
			},
		})

		console.log('✅ Database yangilandi')

		// ============================================
		// 4. SUCCESS MESSAGE
		// ============================================
		console.log('\n' + '='.repeat(60))
		console.log('🎉 MUVAFFAQIYATLI!')
		console.log('='.repeat(60))
		console.log("\n📊 User Ma'lumotlari:")
		console.log('   ID:', dbUser.id)
		console.log('   Supabase UID:', dbUser.supabaseId)
		console.log('   Email:', dbUser.email)
		console.log('   Name:', dbUser.name)
		console.log('   Role:', dbUser.role)
		console.log('   Is Blocked:', dbUser.isBlocked)
		console.log('\n💡 Endi', adminEmail, 'bilan admin panel ga kirishingiz mumkin!')
		console.log('   Admin Panel:', 'http://localhost:3000/admin\n')
	} catch (error: any) {
		console.error('\n❌ XATOLIK:', error.message)

		if (error.code === 'auth/user-not-found') {
			console.log("\n💡 Bu email bilan user topilmadi.")
			console.log("   Avval saytda ro'yxatdan o'ting: http://localhost:3000/register")
		}

		process.exit(1)
	} finally {
		await prisma.$disconnect()
	}
}

createFirstAdmin()
