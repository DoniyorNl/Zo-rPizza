// backend/src/routes/delivery.routes.ts
import { Router } from 'express'
import { estimateDeliveryTime } from '../controllers/delivery.controller'

const router = Router()

router.post('/estimate', estimateDeliveryTime)
router.get('/estimate', estimateDeliveryTime)

export default router
