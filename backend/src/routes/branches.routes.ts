// backend/src/routes/branches.routes.ts
import { Router } from 'express'
import { getAllBranches, getBranchById, getNearestBranch } from '../controllers/branches.controller'

const router = Router()

router.get('/', getAllBranches)
router.get('/nearest', getNearestBranch)
router.get('/:id', getBranchById)

export default router
