// backend/src/routes/products.routes.ts
// 🍕 PRODUCTS ROUTES

import {
	createProduct,
	deleteProduct,
	getAllProducts,
	getProductById,
	updateProduct,
	restoreProduct,
} from '@/controllers/products.controller'
import { Router } from 'express'

const router = Router()

// GET /api/products - Barcha mahsulotlar
router.get('/', getAllProducts)

// GET /api/products/:id - Bitta mahsulot
router.get('/:id', getProductById)

// POST /api/products - Yangi mahsulot (Admin)
router.post('/', createProduct)

// PUT /api/products/:id - Mahsulot yangilash (Admin)
router.put('/:id', updateProduct)

// DELETE /api/products/:id - Mahsulot yashirish / Soft delete (Admin)
router.delete('/:id', deleteProduct)

// PATCH /api/products/:id/restore - Mahsulotni qayta faollashtirish (Admin)
router.patch('/:id/restore', restoreProduct)

export default router
