// =====================================
// 📁 FILE PATH: backend/src/config/firebase.ts
// 🔥 FIREBASE ADMIN SDK - ENVIRONMENT VARIABLE VERSION
// 🎯 PURPOSE: Initialize Firebase Admin from environment variable
// 📝 UPDATED: 2025-01-18
// =====================================

import admin from 'firebase-admin'
import path from 'path'

// ============================================
// FIREBASE ADMIN INITIALIZATION
// ============================================

if (!admin.apps.length) {
	try {
		// ============================================
		// OPTION 1: Environment Variable (PRODUCTION)
		// ============================================
		if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
			console.log('🔥 Initializing Firebase Admin from environment variable...')

			// Base64 string ni decode qilish
			const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
			const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8')
			const serviceAccount = JSON.parse(serviceAccountJson)

			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
			})

			console.log('✅ Firebase Admin SDK initialized from environment variable')
		}
		// ============================================
		// OPTION 2: Local File (DEVELOPMENT)
		// ============================================
		else if (process.env.NODE_ENV === 'development') {
			console.log('🔥 Initializing Firebase Admin from local file...')

			const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json')
			const serviceAccount = require(serviceAccountPath)

			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
			})

			console.log('✅ Firebase Admin SDK initialized from local file')
		}
		// ============================================
		// ERROR: No Configuration
		// ============================================
		else {
			throw new Error(
				'Firebase configuration not found. Please set FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable or provide firebase-service-account.json file.'
			)
		}
	} catch (error: any) {
		console.error('❌ Firebase Admin initialization error:')
		console.error('   Message:', error.message)

		if (error.code === 'MODULE_NOT_FOUND') {
			console.error('   File not found: firebase-service-account.json')
			console.error('   Please set FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable')
		}

		throw error
	}
}

// ============================================
// EXPORTS
// ============================================

export const auth = admin.auth()
export const firestore = admin.firestore()
export default admin