import { PrismaClient } from '@prisma/client'
import * as admin from 'firebase-admin'
import '../src/config/firebase' // Firebase Admin SDK initialized

const prisma = new PrismaClient()

async function main() {
	try {
		const email = 'testdriver@pizza.com'
		const password = '123456789'
		const displayName = 'Test Driver'

		console.log('🔧 Creating Firebase user...')

		// Firebase user yaratish
		let firebaseUser
		try {
			firebaseUser = await admin.auth().createUser({
				email,
				password,
				displayName,
				emailVerified: true,
			})
			console.log('✅ Firebase user created:', firebaseUser.uid)
		} catch (error: any) {
			if (error.code === 'auth/email-already-exists') {
				console.log('⚠️ Firebase user already exists, fetching...')
				firebaseUser = await admin.auth().getUserByEmail(email)
				console.log('✅ Firebase user found:', firebaseUser.uid)
			} else {
				throw error
			}
		}

		// Database ga yozish
		console.log('💾 Saving to database...')
		const dbUser = await prisma.user.upsert({
			where: { email },
			update: {
				firebaseUid: firebaseUser.uid,
				role: 'DELIVERY',
				name: displayName,
				isDriver: true,
				driverStatus: 'available',
				vehicleType: 'car',
			},
			create: {
				firebaseUid: firebaseUser.uid,
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
		console.log('🆔 Firebase UID:', firebaseUser.uid)
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
