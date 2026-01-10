// backend/src/routes/users.routes.ts
// 👤 USERS ROUTES

import { Router } from 'express'
import { createUser, getUserById, updateUser } from '@/controllers/users.controller'

const router = Router()

// POST /api/users - Firebase'dan kelgan user'ni database'ga qo'shish
router.post('/', createUser)

// GET /api/users/:id - User ma'lumotlari
router.get('/:id', getUserById)

// PUT /api/users/:id - User yangilash
router.put('/:id', updateUser)

export default router
