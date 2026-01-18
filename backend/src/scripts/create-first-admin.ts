// =====================================
// 📁 FILE PATH: backend/src/scripts/create-first-admin.ts
// 👑 FIRST ADMIN CREATOR SCRIPT
// 🎯 PURPOSE: Create the first admin user
// 📝 USAGE: npx tsx src/scripts/create-first-admin.ts your@email.com
// =====================================

import { auth } from '../config/firebase'
import prisma from '../lib/prisma'

async function createFirstAdmin() {
	// Email ni command line dan olish
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
		// 1. FIREBASE DAN USER TOPISH
		// ============================================
		console.log('1️⃣ Firebase dan user qidirilmoqda...')
		const firebaseUser = await auth.getUserByEmail(adminEmail)
		console.log(`✅ Topildi: ${firebaseUser.uid}`)

		// ============================================
		// 2. FIREBASE CUSTOM CLAIMS
		// ============================================
		console.log('\n2️⃣ Firebase custom claims sozlanmoqda...')
		await auth.setCustomUserClaims(firebaseUser.uid, {
			admin: true,
			role: 'admin',
		})
		console.log('✅ Custom claims sozlandi')

		// ============================================
		// 3. DATABASE UPSERT
		// ============================================
		console.log('\n3️⃣ Database yangilanmoqda...')

		const dbUser = await prisma.user.upsert({
			where: { id: firebaseUser.uid },
			update: {
				role: 'ADMIN',
				isBlocked: false,
			},
			create: {
				id: firebaseUser.uid,
				email: firebaseUser.email!,
				name: firebaseUser.displayName || 'Admin',
				password: null, // Firebase auth, password yo'q
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
		console.log('\n📊 User Ma\'lumotlari:')
		console.log('   ID (Firebase UID):', dbUser.id)
		console.log('   Email:', dbUser.email)
		console.log('   Name:', dbUser.name)
		console.log('   Role:', dbUser.role)
		console.log('   Is Blocked:', dbUser.isBlocked)
		console.log('\n💡 Endi', adminEmail, 'bilan admin panel ga kirishingiz mumkin!')
		console.log('   Admin Panel:', 'http://localhost:3000/admin\n')
	} catch (error: any) {
		console.error('\n❌ XATOLIK:', error.message)

		if (error.code === 'auth/user-not-found') {
			console.log('\n💡 Bu email bilan user topilmadi.')
			console.log('   Avval saytda ro\'yxatdan o\'ting: http://localhost:3000/register')
		}

		process.exit(1)
	} finally {
		await prisma.$disconnect()
	}
}

// Script ni ishga tushirish
createFirstAdmin()