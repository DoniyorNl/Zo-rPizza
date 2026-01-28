// =====================================
// 📁 FILE PATH: backend/src/routes/profile.routes.ts
// 🎯 PURPOSE: Profile routes with statistics and address management
// =====================================

import {
	createAddress,
	deleteAddress,
	getAddresses,
	getProfileStats,
	updateAddress,
	updateProfile,
} from '@/controllers/profile.controller'
import { Router } from 'express'
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware'

const router = Router()

// ==========================================
// PROFILE ROUTES (all require authentication)
// ==========================================

/**
 * GET /api/profile/stats
 * Get user profile with statistics
 */
router.get('/stats', authenticateFirebaseToken, getProfileStats)

/**
 * PUT /api/profile
 * Update user profile
 */
router.put('/', authenticateFirebaseToken, updateProfile)

// ==========================================
// ADDRESS ROUTES
// ==========================================

/**
 * GET /api/profile/addresses
 * Get all user addresses
 */
router.get('/addresses', authenticateFirebaseToken, getAddresses)

/**
 * POST /api/profile/addresses
 * Create new address
 */
router.post('/addresses', authenticateFirebaseToken, createAddress)

/**
 * PUT /api/profile/addresses/:id
 * Update address
 */
router.put('/addresses/:id', authenticateFirebaseToken, updateAddress)

/**
 * DELETE /api/profile/addresses/:id
 * Delete address
 */
router.delete('/addresses/:id', authenticateFirebaseToken, deleteAddress)

export default router
