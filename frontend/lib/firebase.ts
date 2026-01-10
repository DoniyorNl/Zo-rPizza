// frontend/lib/firebase.ts
// 🔥 FIREBASE CONFIGURATION

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase config (Firebase Console'dan copy qiling)
const firebaseConfig = {
  apiKey: "AIzaSyAORKxH7v1P_AyPpwUHlEjR-lp5jMIPny8",
  authDomain: "zo-rpizza.firebaseapp.com",
  projectId: "zo-rpizza",
  storageBucket: "zo-rpizza.firebasestorage.app",
  messagingSenderId: "412359563114",
  appId: "1:412359563114:web:b702dca3c1ec30c8ba7713"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);