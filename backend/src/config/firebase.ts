// backend/src/config/firebase.ts
import admin from 'firebase-admin'
import path from 'path'

// Service account kalitini yuklash
const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json')

// Firebase Admin SDK ni ishga tushirish
if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccountPath),
		// Agar Storage ishlatmoqchi bo'lsangiz (lekin siz Cloudinary ishlatasiz):
		// storageBucket: 'zor-pizza.appspot.com'
	})
}

export const auth = admin.auth()
export const firestore = admin.firestore() // Agar kerak bo'lsa
export default admin