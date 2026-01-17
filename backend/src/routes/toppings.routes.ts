// backend/src/routes/toppings.routes.ts
// 🍕 TOPPINGS ROUTES

import { createTopping, deleteTopping, getAllToppings, updateTopping } from '@/controllers/toppings.controller'
import { Router } from 'express'

const router = Router()

router.get('/', getAllToppings)
router.post('/', createTopping)
router.put('/:id', updateTopping)
router.delete('/:id', deleteTopping)

export default router
