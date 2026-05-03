import {
	createAddress,
	deleteAddress,
	getAddresses,
	getProfile,
	getProfileStats,
	patchProfile,
	updateAddress,
	updateProfile,
} from '@/controllers/profile.controller'
import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticateToken, getProfile)
router.patch('/', authenticateToken, patchProfile)
router.get('/stats', authenticateToken, getProfileStats)
router.put('/', authenticateToken, updateProfile)

router.get('/addresses', authenticateToken, getAddresses)
router.post('/addresses', authenticateToken, createAddress)
router.put('/addresses/:id', authenticateToken, updateAddress)
router.delete('/addresses/:id', authenticateToken, deleteAddress)

export default router
