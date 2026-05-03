import { Router } from 'express'
import {
	getBalance,
	getRedeemOptions,
	getTransactions,
} from '../controllers/loyalty.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()

router.use(authenticateToken)

router.get('/balance', getBalance)
router.get('/redeem-options', getRedeemOptions)
router.get('/transactions', getTransactions)

export default router
