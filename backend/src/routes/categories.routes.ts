// backend/src/routes/products.routes.ts
// 🍕 PRODUCTS ROUTES

import { Router } from 'express'
import {
	getAllCategories,
	getCategoryById,
	createCategory,
	updateCategory,
	deleteCategory,
} from '../controllers/categories.controller'
const router = Router()

// GET /api/categories - Barcha kategoriyalar
router.get('/', getAllCategories)

// GET /api/categories/:id - Bitta kategoriya
router.get('/:id', getCategoryById)

// POST /api/categories - Yangi kategoriya
router.post('/', createCategory)

// PUT /api/categories/:id - Kategoriya yangilash
router.put('/:id', updateCategory)

// DELETE /api/categories/:id - Kategoriya o'chirish
router.delete('/:id', deleteCategory)

export default router
