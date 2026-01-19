// =====================================
// 📁 FILE PATH: backend/src/routes/notifications.routes.ts
// 🔔 NOTIFICATION ROUTES
// =====================================

import { Router } from 'express'
import { notificationController } from '../controllers/notifications.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()

// ============================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ============================================

// Barcha notificationlar
router.get('/', authenticateToken, notificationController.getAllNotifications)

// Barcha notificationlarni o'qilgan qilish
router.patch('/mark-all-read', authenticateToken, notificationController.markAllAsRead)

// Bitta notificationni o'qilgan qilish
router.patch('/:id/read', authenticateToken, notificationController.markAsRead)

// Bitta notificationni o'chirish
router.delete('/:id', authenticateToken, notificationController.deleteNotification)

// Barcha notificationlarni o'chirish
router.delete('/clear-all', authenticateToken, notificationController.clearAll)

export default router