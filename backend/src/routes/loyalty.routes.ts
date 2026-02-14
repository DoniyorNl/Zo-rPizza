// backend/src/routes/loyalty.routes.ts
import { Router } from 'express'
import {
	getBalance,
	getRedeemOptions,
	getTransactions,
} from '../controllers/loyalty.controller'
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware'

const router = Router()

router.use(authenticateFirebaseToken)

router.get('/balance', getBalance)
router.get('/redeem-options', getRedeemOptions)
router.get('/transactions', getTransactions)

export default router
