// backend/src/routes/products.routes.ts
// 🍕 PRODUCTS ROUTES

import {
	createProduct,
	deleteProduct,
	getAllProducts,
	getProductById,
	updateProduct,
} from '@/controllers/products.controller'
import { Router } from 'express'

const router = Router()

// GET /api/products - Barcha mahsulotlar
router.get('/', getAllProducts)

// GET /api/products/:id - Bitta mahsulot
router.get('/:id', getProductById)

// POST /api/products - Yangi mahsulot
router.post('/', createProduct)

// PUT /api/products/:id - Mahsulot yangilash
router.put('/:id', updateProduct)

// DELETE /api/products/:id - Mahsulot o'chirish
router.delete('/:id', deleteProduct)

export default router
