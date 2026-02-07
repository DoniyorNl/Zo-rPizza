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

			const fs = require('fs')
			const backendDir = path.join(__dirname, '../..')

			// Check for multiple possible Firebase service account file names
			const p1 = path.join(backendDir, 'firebase-service-account.json')
			let serviceAccountPath = fs.existsSync(p1) ? p1 : null

			// If not found, search for any zo-rpizza-firebase-adminsdk-*.json file
			if (!serviceAccountPath) {
				const files = fs.readdirSync(backendDir)
				const firebaseFile = files.find(
					(f: string) => f.startsWith('zo-rpizza-firebase-adminsdk-') && f.endsWith('.json'),
				)
				if (firebaseFile) {
					serviceAccountPath = path.join(backendDir, firebaseFile)
				}
			}

			if (!serviceAccountPath) {
				throw new Error(
					'Firebase service account JSON not found. Add firebase-service-account.json or zo-rpizza-firebase-adminsdk-*.json to backend/',
				)
			}
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
				'Firebase configuration not found. Please set FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable or provide firebase-service-account.json file.',
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
