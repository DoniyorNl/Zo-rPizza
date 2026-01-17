// backend/src/routes/deals.routes.ts
// 🍕 DEALS ROUTES

import {
	createDeal,
	deleteDeal,
	getAllDeals,
	getDealById,
	updateDeal,
} from '@/controllers/deals.controller'
import { Router } from 'express'

const router = Router()

router.get('/', getAllDeals)
router.get('/:id', getDealById)
router.post('/', createDeal)
router.put('/:id', updateDeal)
router.delete('/:id', deleteDeal)

export default router
