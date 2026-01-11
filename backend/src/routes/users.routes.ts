// =====================================
// 📁 FILE PATH: backend/src/routes/users.routes.ts
// 🎯 PURPOSE: Users routes with CORRECT ORDER
// 📝 UPDATED: 2025-01-11 - FIXED ORDER
// =====================================

import { Router } from 'express'
import {
	createUser,
	getUserById,
	updateUser,
	getAllUsers,
	updateUserRole,
	updateUserStatus,
	getCurrentUser,
	updateCurrentUser,
} from '@/controllers/users.controller'
import { adminOnly, authRequired } from '@/middleware/admin.middleware'

const router = Router()

// ==========================================
// PUBLIC ROUTES (no auth required)
// ==========================================

/**
 * POST /api/users
 * Create user from Firebase
 */
router.post('/', createUser)

// ==========================================
// AUTHENTICATED ROUTES - SPECIFIC FIRST! ✅
// ==========================================

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get('/me', authRequired, getCurrentUser)

/**
 * PUT /api/users/me
 * Update current user profile
 */
router.put('/me', authRequired, updateCurrentUser)

// ==========================================
// ADMIN ROUTES - SPECIFIC BEFORE GENERIC! ✅
// ==========================================

/**
 * GET /api/users
 * Get all users with pagination and filters
 * ✅ MUST BE BEFORE /:id route!
 */
router.get('/', adminOnly, getAllUsers)

/**
 * PUT /api/users/:id/role
 * Update user role
 */
router.put('/:id/role', adminOnly, updateUserRole)

/**
 * PUT /api/users/:id/status
 * Block/unblock user
 */
router.put('/:id/status', adminOnly, updateUserStatus)

// ==========================================
// GENERIC ROUTES - LAST! ✅
// ==========================================

/**
 * GET /api/users/:id
 * Get user by ID
 * ✅ MUST BE AFTER / route!
 */
router.get('/:id', authRequired, getUserById)

/**
 * PUT /api/users/:id
 * Update user by ID
 */
router.put('/:id', authRequired, updateUser)

export default router

/**
 * ⚠️ CRITICAL: ROUTE ORDER MATTERS!
 *
 * ✅ CORRECT ORDER:
 * 1. POST /           (create)
 * 2. GET  /me         (specific)
 * 3. PUT  /me         (specific)
 * 4. GET  /           (get all - specific query)
 * 5. PUT  /:id/role   (specific param route)
 * 6. PUT  /:id/status (specific param route)
 * 7. GET  /:id        (generic - LAST!)
 * 8. PUT  /:id        (generic - LAST!)
 *
 * ❌ WRONG ORDER:
 * - GET /:id before GET / → Express thinks "/" is an ID!
 * - GET /:id before GET /me → Express thinks "me" is an ID!
 */
