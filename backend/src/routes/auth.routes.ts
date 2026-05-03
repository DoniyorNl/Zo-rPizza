import { Router } from 'express'
import { supabaseAuthController } from '../controllers/supabase-auth.controller'
import { adminOnly } from '../middleware/admin.middleware'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()

router.get('/status', (_req, res) => {
  res.status(200).json({ success: true, message: 'Auth is ready', timestamp: new Date().toISOString() })
})

router.get('/verify-token', authenticateToken, supabaseAuthController.verifyToken)
router.get('/me', authenticateToken, supabaseAuthController.getCurrentUser)
router.post('/sync', authenticateToken, supabaseAuthController.syncUser)

router.post('/set-admin', authenticateToken, adminOnly, supabaseAuthController.setAdminRole)
router.post('/remove-admin', authenticateToken, adminOnly, supabaseAuthController.removeAdminRole)
router.get('/users', authenticateToken, adminOnly, supabaseAuthController.getAllUsers)

export default router
