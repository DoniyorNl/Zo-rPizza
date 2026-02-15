// backend/src/routes/branches.routes.ts
import { Router } from 'express'
import {
	createBranch,
	deleteBranch,
	getAllBranches,
	getAllBranchesAdmin,
	getBranchById,
	getNearestBranch,
	resolveMapUrl,
	updateBranch,
} from '../controllers/branches.controller'
import { adminOnly } from '../middleware/admin.middleware'
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware'

const router = Router()

router.get('/', getAllBranches)
router.get('/nearest', getNearestBranch)
router.get('/resolve-map-url', resolveMapUrl)
router.get('/admin/all', authenticateFirebaseToken, adminOnly, getAllBranchesAdmin)
router.get('/:id', getBranchById)

// Admin: filial qo'shish / tahrirlash / o'chirish
router.post('/', authenticateFirebaseToken, adminOnly, createBranch)
router.patch('/:id', authenticateFirebaseToken, adminOnly, updateBranch)
router.delete('/:id', authenticateFirebaseToken, adminOnly, deleteBranch)

export default router
