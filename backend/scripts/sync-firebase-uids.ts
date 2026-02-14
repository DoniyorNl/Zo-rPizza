/**
 * Database userlarni Firebase UID bilan yangilash
 * Usage: npx ts-node scripts/sync-firebase-uids.ts
 */

import { PrismaClient } from '@prisma/client'
import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import * as path from 'path'

const prisma = new PrismaClient()

// Firebase Admin SDK init
const serviceAccount = require(
	path.join(__dirname, '../zo-rpizza-firebase-adminsdk-fbsvc-df7daa6e53.json'),
)

const app = initializeApp({
	credential: cert(serviceAccount),
})

const auth = getAuth(app)

async function syncFirebaseUids() {
	console.log('🔄 Database userlarni Firebase UID bilan sinxronlash...\n')

	try {
		// Get all users from database
		const dbUsers = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				firebaseUid: true,
			},
		})

		console.log(`📊 Database da ${dbUsers.length} ta user topildi\n`)

		let updated = 0
		let skipped = 0

		for (const dbUser of dbUsers) {
			try {
				// Check if already has firebaseUid
				if (dbUser.firebaseUid) {
					console.log(`⏭️  ${dbUser.email} - Allaqachon UID bor: ${dbUser.firebaseUid}`)
					skipped++
					continue
				}

				// Get Firebase user by email
				const firebaseUser = await auth.getUserByEmail(dbUser.email)

				// Update database with Firebase UID
				await prisma.user.update({
					where: { id: dbUser.id },
					data: { firebaseUid: firebaseUser.uid },
				})

				console.log(`✅ ${dbUser.email} - UID yangilandi: ${firebaseUser.uid}`)
				updated++
			} catch (error: any) {
				if (error.code === 'auth/user-not-found') {
					console.log(`⚠️  ${dbUser.email} - Firebase da topilmadi`)
				} else {
					console.error(`❌ ${dbUser.email} - Xatolik:`, error.message)
				}
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

syncFirebaseUids().catch(error => {
	console.error('❌ Fatal error:', error)
	process.exit(1)
})
