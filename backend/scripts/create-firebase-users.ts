/**
 * Firebase га test userlar yaratish
 * Usage: npx ts-node scripts/create-firebase-users.ts
 */

import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import * as path from 'path'

// Firebase Admin SDK init
const serviceAccount = require(
	path.join(__dirname, '../zo-rpizza-firebase-adminsdk-fbsvc-df7daa6e53.json'),
)

const app = initializeApp({
	credential: cert(serviceAccount),
})

const auth = getAuth(app)

const testUsers = [
	{
		email: 'admin@zorpizza.uz',
		password: 'admin123',
		displayName: 'Admin User',
		role: 'ADMIN',
	},
	{
		email: 'alisher@gmail.com',
		password: 'admin123',
		displayName: 'Alisher Karimov',
		role: 'CUSTOMER',
	},
	{
		email: 'dilnoza@gmail.com',
		password: 'admin123',
		displayName: 'Dilnoza Rahimova',
		role: 'CUSTOMER',
	},
	{
		email: 'bobur@gmail.com',
		password: 'admin123',
		displayName: 'Bobur Toshmatov',
		role: 'CUSTOMER',
	},
	{
		email: 'malika@gmail.com',
		password: 'admin123',
		displayName: 'Malika Alimova',
		role: 'CUSTOMER',
	},
]

async function createFirebaseUsers() {
	console.log('🔥 Firebase test userlarni yaratish boshlandi...\n')

	for (const user of testUsers) {
		try {
			// Check if user already exists
			try {
				const existingUser = await auth.getUserByEmail(user.email)
				console.log(`⚠️  ${user.email} - Allaqachon mavjud (UID: ${existingUser.uid})`)
				continue
			} catch (error: any) {
				if (error.code !== 'auth/user-not-found') {
					throw error
				}
			}

			// Create new user
			const createdUser = await auth.createUser({
				email: user.email,
				password: user.password,
				displayName: user.displayName,
				emailVerified: true, // Auto-verify for test users
			})

			// Set custom claims for role
			await auth.setCustomUserClaims(createdUser.uid, {
				role: user.role,
			})

			console.log(`✅ ${user.email} - Yaratildi (UID: ${createdUser.uid}, Role: ${user.role})`)
		} catch (error: any) {
			console.error(`❌ ${user.email} - Xatolik:`, error.message)
		}
	}

	console.log('\n🎉 Firebase userlar yaratish tugadi!')
	console.log('\n📝 Login qilish uchun:')
	console.log('   Email: admin@zorpizza.uz')
	console.log('   Parol: admin123')
	process.exit(0)
}

createFirebaseUsers().catch(error => {
	console.error('❌ Fatal error:', error)
	process.exit(1)
})
