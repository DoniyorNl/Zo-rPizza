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
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()

router.get('/', getAllBranches)
router.get('/nearest', getNearestBranch)
router.get('/resolve-map-url', resolveMapUrl)
router.get('/admin/all', authenticateToken, adminOnly, getAllBranchesAdmin)
router.get('/:id', getBranchById)

router.post('/', authenticateToken, adminOnly, createBranch)
router.patch('/:id', authenticateToken, adminOnly, updateBranch)
router.delete('/:id', authenticateToken, adminOnly, deleteBranch)

export default router
