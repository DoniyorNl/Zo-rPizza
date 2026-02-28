// backend/src/controllers/orders.controller.ts
// 🍕 ORDERS CONTROLLER

import { Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/firebase-auth.middleware'
import {
	sendOrderConfirmationEmail,
	sendOrderStatusUpdateEmail,
	getStatusText,
	getStatusMessage,
} from '../services/email.service'

const getQueryString = (value: unknown): string | undefined => {
	if (typeof value === 'string') return value
	if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
	return undefined
}

const getParamString = (value: unknown): string | undefined => {
	if (typeof value === 'string') return value
	if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
	return undefined
}

// GET /api/orders - Barcha buyurtmalar (Admin)
export const getAllOrders = async (req: Request, res: Response) => {
	try {
		const status = getQueryString(req.query.status)
		const paymentStatus = getQueryString(req.query.paymentStatus)

		const orders = await prisma.order.findMany({
			where: {
				...(status && { status: status as any }),
				...(paymentStatus && { paymentStatus: paymentStatus as any }),
			},
			include: {
				user: {
					select: { name: true, email: true, phone: true },
				},
				items: {
					include: {
						product: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		res.status(200).json({
			success: true,
			count: orders.length,
			data: orders,
		})
	} catch (error) {
		console.error('Error fetching orders:', error)
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// GET /api/orders/user/:userId - User buyurtmalari (Firebase UID orqali; faqat o‘zi yaratgan buyurtmalar)
export const getUserOrders = async (req: Request, res: Response) => {
	const authReq = req as AuthRequest
	const firebaseUid = authReq.userId ?? getParamString((req.params as any).userId)
	if (!firebaseUid) {
		return res.status(400).json({ success: false, message: 'Invalid userId' })
	}
	if (authReq.userId && authReq.userId !== firebaseUid) {
		return res.status(403).json({ success: false, message: 'Forbidden' })
	}

	try {
		const dbUser = await prisma.user.findFirst({
			where: { firebaseUid },
		})
		if (!dbUser) {
			return res.status(200).json({ success: true, count: 0, data: [] })
		}

		const orders = await prisma.order.findMany({
			where: { userId: dbUser.id },
			include: {
				items: {
					include: {
						product: {
							select: {
								id: true,
								name: true,
								imageUrl: true,
								images: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		return res.status(200).json({
			success: true,
			count: orders.length,
			data: orders,
		})
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error))
		console.error('[getUserOrders]', err.message, err.stack)
		// Frontend (UnifiedHeader) uzilmasin: xato bo‘lsa ham bo‘sh ro‘yxat qaytaramiz
		return res.status(200).json({
			success: true,
			count: 0,
			data: [],
		})
	}
}

// GET /api/orders/:id - Bitta buyurtma
export const getOrderById = async (req: Request, res: Response) => {
	try {
		const id = getParamString((req.params as any).id)
		if (!id) {
			return res.status(400).json({ success: false, message: 'Invalid id' })
		}

		const order = await prisma.order.findUnique({
			where: { id },
			include: {
				user: {
					select: { name: true, email: true, phone: true },
				},
				items: {
					include: {
						product: {
							include: {
								category: true,
							},
						},
						toppings: {
							include: {
								topping: true,
							},
						},
						halfHalf: {
							include: {
								leftProduct: true,
								rightProduct: true,
							},
						},
					},
				},
				reviews: true,
			},
		})

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found',
			})
		}

		return res.status(200).json({
			success: true,
			data: order,
		})
	} catch (error) {
		console.error('Error fetching order:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// POST /api/orders - Yangi buyurtma (promo + loyalty qo'llab-quvvatlanadi)
export const createOrder = async (req: Request, res: Response) => {
	try {
		let {
			userId,
			items,
			paymentMethod,
			deliveryAddress,
			deliveryPhone,
			deliveryLat,
			deliveryLng,
			deliveryType, // 'delivery' | 'pickup'
			branchId,     // Olib ketish uchun filial id
			couponCode,
			loyaltyPointsToUse,
		} = req.body

		if (typeof items === 'string') {
			items = JSON.parse(items)
		}

		const isPickup = deliveryType === 'pickup'
		if (isPickup && branchId) {
			const branch = await prisma.branch.findFirst({
				where: { id: String(branchId), isActive: true },
			})
			if (branch) {
				deliveryAddress = branch.address
				deliveryLat = branch.lat
				deliveryLng = branch.lng
			}
		}

		if (!userId || !items || !items.length || !deliveryAddress || !deliveryPhone) {
			return res.status(400).json({
				success: false,
				message: 'Missing required fields',
			})
		}

		// User mavjudligini tekshirish (firebaseUid bilan)
		let user = await prisma.user.findUnique({
			where: { firebaseUid: userId },
		})

		if (!user) {
			// Email bilan ham tekshirish (agar email mavjud bo'lsa, firebaseUid ni update qilish)
			const email = req.body.email?.trim().toLowerCase() || ''
			
			// Email validation: must be valid format
			const isValidEmail = email && email.includes('@') && email.includes('.')
			
			if (!isValidEmail) {
				return res.status(400).json({
					success: false,
					message: 'Valid email address is required for new users',
				})
			}

			const existingUser = await prisma.user.findUnique({ where: { email } })

			if (existingUser) {
				// Mavjud user'ga firebaseUid qo'shish
				user = await prisma.user.update({
					where: { id: existingUser.id },
					data: {
						firebaseUid: userId,
						name: req.body.name || existingUser.name,
						phone: deliveryPhone || existingUser.phone,
					},
				})
			} else {
				// Agar user database'da yo'q bo'lsa, avtomatik yaratish
				user = await prisma.user.create({
					data: {
						firebaseUid: userId,
						email,
						name: req.body.name || 'User',
						phone: deliveryPhone,
						password: null,
						role: 'CUSTOMER',
						isBlocked: false,
					},
				})
			}
		} else {
			// User mavjud - faqat name va phone'ni yangilash (email unique bo'lgani uchun yangilanmaydi)
			const nameFromRequest = req.body.name?.trim()
			
			const updateData: any = {}
			if (nameFromRequest && nameFromRequest !== user.name) {
				updateData.name = nameFromRequest
			}
			if (deliveryPhone && deliveryPhone !== user.phone) {
				updateData.phone = deliveryPhone
			}
			
			// Agar yangilanish kerak bo'lsa
			if (Object.keys(updateData).length > 0) {
				user = await prisma.user.update({
					where: { id: user.id },
					data: updateData,
				})
			}
		}

		// Mahsulotlar narxlarini hisoblash
		let totalPrice = 0
		const orderItems = []

		for (const item of items) {
			const product = await prisma.product.findUnique({
				where: { id: item.productId },
			})

			if (!product) {
				return res.status(404).json({
					success: false,
					message: `Product ${item.productId} not found`,
				})
			}

			if (!product.isActive) {
				return res.status(400).json({
					success: false,
					message: `Product ${product.name} is not available`,
				})
			}

			let variationPrice = product.basePrice
			let variationId: string | null = null
			let size: string | null = null

			if (item.variationId) {
				const variation = await prisma.productVariation.findFirst({
					where: {
						id: item.variationId,
						productId: product.id,
					},
				})

				if (!variation) {
					return res.status(400).json({
						success: false,
						message: `Invalid variation for product ${product.name}`,
					})
				}

				variationPrice = variation.price
				variationId = variation.id
				size = variation.size
			} else if (item.size) {
				const variationBySize = await prisma.productVariation.findFirst({
					where: {
						productId: product.id,
						size: item.size,
					},
				})

				if (variationBySize) {
					variationPrice = variationBySize.price
					variationId = variationBySize.id
					size = variationBySize.size
				} else {
					size = item.size
				}
			}

			let halfProductId: string | null = null
			let halfPrice = 0
			if (item.halfProductId) {
				const halfProduct = await prisma.product.findUnique({
					where: { id: item.halfProductId },
				})
				if (!halfProduct) {
					return res.status(404).json({
						success: false,
						message: `Half product ${item.halfProductId} not found`,
					})
				}
				halfProductId = halfProduct.id

				if (variationId) {
					const halfVariation = await prisma.productVariation.findFirst({
						where: {
							productId: halfProduct.id,
							size: size || undefined,
						},
					})
					if (halfVariation) {
						halfPrice = halfVariation.price
					} else {
						halfPrice = halfProduct.basePrice
					}
				} else {
					halfPrice = halfProduct.basePrice
				}
			}

			const addedToppingIds: string[] = Array.isArray(item.addedToppingIds)
				? item.addedToppingIds
				: []
			const removedToppingIds: string[] = Array.isArray(item.removedToppingIds)
				? item.removedToppingIds
				: []

			let toppingsPrice = 0
			if (addedToppingIds.length > 0) {
				const toppings = await prisma.topping.findMany({
					where: {
						id: { in: addedToppingIds },
						isActive: true,
					},
				})
				toppingsPrice = toppings.reduce((sum, topping) => sum + topping.price, 0)
			}

			const baseItemPrice = Math.max(variationPrice, halfPrice)
			const finalItemPrice = baseItemPrice + toppingsPrice

			const itemTotal = finalItemPrice * item.quantity
			totalPrice += itemTotal

			orderItems.push({
				productId: item.productId,
				variationId,
				size,
				quantity: item.quantity,
				price: finalItemPrice,
				toppings: {
					create: [
						...addedToppingIds.map((toppingId: string) => ({
							toppingId,
							isRemoved: false,
						})),
						...removedToppingIds.map((toppingId: string) => ({
							toppingId,
							isRemoved: true,
						})),
					],
				},
				...(halfProductId
					? {
							halfHalf: {
								create: {
									leftProductId: product.id,
									rightProductId: halfProductId,
								},
							},
						}
					: {}),
			})
		}

		// Order number yaratish (unikal)
		const lastOrder = await prisma.order.findFirst({
			orderBy: { createdAt: 'desc' },
		})

		let orderNumber = '#0001'
		if (lastOrder && lastOrder.orderNumber) {
			const lastNumber = parseInt(lastOrder.orderNumber.replace(/\D/g, ''))
			if (!isNaN(lastNumber)) {
				orderNumber = `#${(lastNumber + 1).toString().padStart(4, '0')}`
			}
		}

		// deliveryLocation: deliveryLat/Lng bo'lsa, tracking uchun JSON saqlash
		const lat = deliveryLat ? parseFloat(deliveryLat) : null
		const lng = deliveryLng ? parseFloat(deliveryLng) : null
		const deliveryLocationJson =
			lat != null && lng != null && !isNaN(lat) && !isNaN(lng)
				? ({ lat, lng } as object)
				: undefined

		// Promo code (coupon) qo'llash
		let discountAmount = 0
		let couponId: string | null = null
		if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
			const coupon = await prisma.coupon.findFirst({
				where: { code: couponCode.trim().toUpperCase(), isActive: true },
			})
			if (coupon) {
				const now = new Date()
				const valid =
					(!coupon.startsAt || now >= coupon.startsAt) &&
					(!coupon.endsAt || now <= coupon.endsAt) &&
					(coupon.minOrderTotal == null || totalPrice >= coupon.minOrderTotal)
				if (valid) {
					const usageCount = await prisma.couponUsage.count({
						where: { couponId: coupon.id },
					})
					const userUsageCount = await prisma.couponUsage.count({
						where: { userId: user.id, couponId: coupon.id },
					})
					const underLimit =
						(coupon.usageLimit == null || usageCount < coupon.usageLimit) &&
						(coupon.perUserLimit == null || userUsageCount < coupon.perUserLimit)
					if (underLimit) {
						discountAmount =
							coupon.discountType === 'PERCENT'
								? (totalPrice * coupon.discountValue) / 100
								: Math.min(coupon.discountValue, totalPrice)
						couponId = coupon.id
					}
				}
			}
		}

		let loyaltyPointsUsed = 0
		const { REDEEM_POINTS_PER_CURRENCY, POINTS_PER_CURRENCY } = await import(
			'../constants/loyalty'
		)
		const pointsToUse = Math.min(
			Math.floor(Number(loyaltyPointsToUse) || 0),
			user.loyaltyPoints ?? 0,
		)
		const redeemDiscount =
			pointsToUse > 0
				? Math.min(
						pointsToUse / REDEEM_POINTS_PER_CURRENCY,
						totalPrice - discountAmount,
					)
				: 0
		if (redeemDiscount > 0) {
			loyaltyPointsUsed = Math.floor(redeemDiscount * REDEEM_POINTS_PER_CURRENCY)
		}

		const finalTotal = Math.max(0, totalPrice - discountAmount - redeemDiscount)

		const orderData: any = {
			orderNumber,
			userId: user.id,
			totalPrice: finalTotal,
			...(discountAmount > 0 && { discountAmount, couponId }),
			...(loyaltyPointsUsed > 0 && { loyaltyPointsUsed }),
			paymentMethod: paymentMethod || 'CASH',
			deliveryAddress,
			deliveryPhone,
			deliveryLat: lat,
			deliveryLng: lng,
			...(deliveryLocationJson && { deliveryLocation: deliveryLocationJson }),
			items: { create: orderItems },
		}
		if (isPickup && branchId) orderData.branchId = String(branchId)

		const order = await prisma.order.create({
			data: orderData,
			include: {
				items: {
					include: {
						product: true,
					},
				},
			},
		})

		// CouponUsage va Loyalty ixtiyoriy (jadval bo'lmasa buyurtma baribir muvaffaqiyatli)
		try {
			if (couponId) {
				await prisma.couponUsage.create({
					data: { userId: user.id, couponId, orderId: order.id },
				})
			}
			const earnPoints = Math.floor(finalTotal * POINTS_PER_CURRENCY)
			if (loyaltyPointsUsed > 0) {
				await prisma.loyaltyTransaction.create({
					data: {
						userId: user.id,
						type: 'REDEEM',
						points: -loyaltyPointsUsed,
						orderId: order.id,
						description: `Redeemed for order ${order.orderNumber}`,
					},
				})
			}
			if (earnPoints > 0) {
				await prisma.loyaltyTransaction.create({
					data: {
						userId: user.id,
						type: 'EARN',
						points: earnPoints,
						orderId: order.id,
						description: `Earned from order ${order.orderNumber}`,
					},
				})
			}
			const newPoints =
				(user.loyaltyPoints ?? 0) - loyaltyPointsUsed + earnPoints
			await prisma.user.update({
				where: { id: user.id },
				data: {
					loyaltyPoints: Math.max(0, newPoints),
					totalSpent: { increment: finalTotal },
				},
			})
		} catch (loyaltyErr) {
			console.warn('Coupon/Loyalty yozish amalga oshmadi (jadval yo\'q bo\'lishi mumkin), buyurtma saqlandi:', loyaltyErr)
		}

		// ============================================================================
		// 📧 SEND ORDER CONFIRMATION EMAIL
		// ============================================================================
		try {
			// Email'ni user object'dan yoki request'dan olish
			const emailToUse = req.body.email?.trim().toLowerCase() || user.email
			
			const emailData = {
				customerName: user.name || req.body.name || 'Mijoz',
				customerEmail: emailToUse,
				orderNumber: order.orderNumber,
				orderId: order.id,
				items: order.items.map(item => ({
					name: item.product?.name || 'Mahsulot',
					quantity: item.quantity,
					size: item.size || undefined,
					price: item.price,
				})),
				totalPrice: finalTotal,
				deliveryAddress,
				paymentMethod: paymentMethod === 'CASH' ? 'Naqd pul' : paymentMethod === 'CARD' ? 'Karta' : paymentMethod,
				estimatedDelivery: '30-40 daqiqa',
			}

			// Async email sending (non-blocking)
			sendOrderConfirmationEmail(emailData).catch(err => {
				console.error('Failed to send order confirmation email:', err)
			})
		} catch (emailError) {
			// Email yuborilmasa ham buyurtma yaratilgan, shuning uchun xatolikni log qilamiz
			console.error('Error preparing order confirmation email:', emailError)
		}

		return res.status(201).json({
			success: true,
			message: 'Order created successfully',
			data: order,
		})
	} catch (error) {
		console.error('Error creating order:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// PATCH /api/orders/:id/status - Status yangilash (driverId, deliveryLocation qo'llab-quvvatlash)
export const updateOrderStatus = async (req: Request, res: Response) => {
	try {
		const id = getParamString((req.params as any).id)
		if (!id) {
			return res.status(400).json({ success: false, message: 'Invalid id' })
		}
		const { status, paymentStatus, driverId, deliveryLat, deliveryLng } = req.body

		// Buyurtma mavjudligini tekshirish
		const existing = await prisma.order.findUnique({
			where: { id },
		})

		if (!existing) {
			return res.status(404).json({
				success: false,
				message: 'Order not found',
			})
		}

		const updateData: Record<string, unknown> = {
			...(status && { status }),
			...(paymentStatus && { paymentStatus }),
			...(driverId != null && { driverId: String(driverId) }),
		}

		// OUT_FOR_DELIVERY ga o'tganda: deliveryLocation yo'q bo'lsa, deliveryLat/Lng yoki default dan to'ldirish
		if (status === 'OUT_FOR_DELIVERY') {
			let deliveryLocation = existing.deliveryLocation as { lat: number; lng: number } | null
			if (!deliveryLocation) {
				const lat = deliveryLat != null ? parseFloat(deliveryLat) : existing.deliveryLat
				const lng = deliveryLng != null ? parseFloat(deliveryLng) : existing.deliveryLng
				if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
					deliveryLocation = { lat, lng }
					updateData.deliveryLocation = deliveryLocation
				} else {
					const defLat = parseFloat(process.env.RESTAURANT_LAT || '41.2995')
					const defLng = parseFloat(process.env.RESTAURANT_LNG || '69.2401')
					updateData.deliveryLocation = { lat: defLat, lng: defLng }
				}
			}
			updateData.trackingStartedAt = new Date()
			updateData.deliveryStartedAt = new Date()
		}

		const order = await prisma.order.update({
			where: { id },
			data: updateData as object,
			include: {
				items: {
					include: {
						product: true,
					},
				},
				user: {
					select: { name: true, email: true },
				},
			},
		})

		// Live tracking: Socket.io
		const { emitOrderUpdate } = await import('../lib/socket')
		emitOrderUpdate(id, {
			status: order.status,
			estimatedTime: order.estimatedTime ?? undefined,
		})

		// ============================================================================
		// 📧 SEND ORDER STATUS UPDATE EMAIL
		// ============================================================================
		try {
			// Only send email for important status changes
			const emailStatuses = ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
			if (status && emailStatuses.includes(status) && order.user?.email) {
				const emailData = {
					customerName: order.user.name || 'Mijoz',
					customerEmail: order.user.email,
					orderNumber: order.orderNumber,
					orderId: order.id,
					status: status,
					statusText: getStatusText(status),
					message: getStatusMessage(status),
				}

				// Async email sending (non-blocking)
				sendOrderStatusUpdateEmail(emailData).catch(err => {
					console.error('Failed to send order status update email:', err)
				})
			}
		} catch (emailError) {
			console.error('Error preparing order status update email:', emailError)
		}

		return res.status(200).json({
			success: true,
			message: 'Order status updated',
			data: order,
		})
	} catch (error) {
		console.error('Error updating order status:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// DELETE /api/orders/:id - Buyurtma o'chirish (faqat egasi, faqat PENDING)
export const deleteOrder = async (req: Request, res: Response) => {
	try {
		const id = getParamString((req.params as any).id)
		if (!id) {
			return res.status(400).json({ success: false, message: 'Invalid id' })
		}

		const authReq = req as AuthRequest
		const firebaseUid = authReq.userId
		if (!firebaseUid) {
			return res.status(401).json({ success: false, message: 'Unauthorized' })
		}

		const dbUser = await prisma.user.findFirst({
			where: { firebaseUid },
		})
		if (!dbUser) {
			return res.status(403).json({ success: false, message: 'Forbidden' })
		}

		const existing = await prisma.order.findUnique({
			where: { id },
		})

		if (!existing) {
			return res.status(404).json({
				success: false,
				message: 'Order not found',
			})
		}

		// Faqat buyurtma egasi o'chira oladi (admin boshqa route orqali)
		if (existing.userId !== dbUser.id) {
			return res.status(403).json({
				success: false,
				message: 'You can only delete your own orders',
			})
		}

		if (existing.status !== 'PENDING') {
			return res.status(400).json({
				success: false,
				message: 'Can only delete pending orders',
			})
		}

		await prisma.order.delete({
			where: { id },
		})

		return res.status(200).json({
			success: true,
			message: 'Order deleted successfully',
		})
	} catch (error) {
		console.error('Error deleting order:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// POST /api/orders/:id/reorder - Xuddi shu buyurtmani qayta berish
export const reorder = async (req: Request, res: Response) => {
	try {
		const id = getParamString((req.params as any).id)
		const authReq = req as AuthRequest
		const firebaseUid = authReq.userId
		if (!id || !firebaseUid) {
			return res.status(400).json({ success: false, message: 'Order id and auth required' })
		}
		const dbUser = await prisma.user.findFirst({ where: { firebaseUid } })
		if (!dbUser) {
			return res.status(403).json({ success: false, message: 'Forbidden' })
		}
		const existing = await prisma.order.findUnique({
			where: { id },
			include: {
				items: {
					include: {
						product: true,
						toppings: { include: { topping: true } },
						halfHalf: true,
					},
				},
			},
		})
		if (!existing) {
			return res.status(404).json({ success: false, message: 'Order not found' })
		}
		if (existing.userId !== dbUser.id) {
			return res.status(403).json({ success: false, message: 'Not your order' })
		}

		const orderItems = existing.items.map((item) => {
			const addedToppingIds = item.toppings
				.filter((t) => !t.isRemoved)
				.map((t) => t.toppingId)
			const removedToppingIds = item.toppings
				.filter((t) => t.isRemoved)
				.map((t) => t.toppingId)
			const halfProductId =
				item.halfHalf != null
					? item.productId === item.halfHalf.leftProductId
						? item.halfHalf.rightProductId
						: item.halfHalf.leftProductId
					: undefined
			return {
				productId: item.productId!,
				quantity: item.quantity,
				variationId: item.variationId ?? undefined,
				size: item.size ?? undefined,
				addedToppingIds,
				removedToppingIds,
				...(halfProductId && { halfProductId }),
			}
		})

		const lastOrder = await prisma.order.findFirst({
			orderBy: { createdAt: 'desc' },
		})
		let orderNumber = '#0001'
		if (lastOrder?.orderNumber) {
			const lastNumber = parseInt(lastOrder.orderNumber.replace(/\D/g, ''), 10)
			if (!isNaN(lastNumber)) {
				orderNumber = `#${(lastNumber + 1).toString().padStart(4, '0')}`
			}
		}

		const newOrder = await prisma.order.create({
			data: {
				orderNumber,
				userId: dbUser.id,
				totalPrice: existing.totalPrice,
				paymentMethod: existing.paymentMethod,
				deliveryAddress: existing.deliveryAddress,
				deliveryPhone: existing.deliveryPhone,
				deliveryLat: existing.deliveryLat,
				deliveryLng: existing.deliveryLng,
				deliveryLocation:
					existing.deliveryLocation === null
						? Prisma.JsonNull
						: (existing.deliveryLocation as Prisma.InputJsonValue),
				items: {
					create: existing.items.map((item) => ({
						productId: item.productId,
						quantity: item.quantity,
						price: item.price,
						size: item.size,
						variationId: item.variationId,
						toppings: {
							create: item.toppings.map((t) => ({
								toppingId: t.toppingId,
								isRemoved: t.isRemoved,
							})),
						},
						...(item.halfHalf && {
							halfHalf: {
								create: {
									leftProductId: item.halfHalf.leftProductId,
									rightProductId: item.halfHalf.rightProductId,
								},
							},
						}),
					})),
				},
			},
			include: {
				items: { include: { product: true } },
			},
		})

		return res.status(201).json({
			success: true,
			message: 'Reorder created successfully',
			data: newOrder,
		})
	} catch (error) {
		console.error('Reorder error:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// GET /api/orders/driver - Driver buyurtmalari
export const getDriverOrders = async (req: Request, res: Response) => {
	try {
		const authReq = req as AuthRequest
		const firebaseUid = authReq.userId

		if (!firebaseUid) {
			return res.status(401).json({ success: false, message: 'Unauthorized' })
		}

		// Find driver in database
		const driver = await prisma.user.findFirst({
			where: {
				firebaseUid,
				role: 'DELIVERY',
			},
		})

		if (!driver) {
			return res.status(403).json({
				success: false,
				message: 'Not a driver or driver not found',
			})
		}

		// Get driver's orders
		const orders = await prisma.order.findMany({
			where: {
				driverId: driver.id,
				status: {
					in: ['CONFIRMED', 'OUT_FOR_DELIVERY', 'PREPARING', 'DELIVERED'],
				},
			},
			include: {
				user: {
					select: {
						name: true,
						email: true,
						phone: true,
					},
				},
				items: {
					include: {
						product: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		return res.status(200).json({
			success: true,
			count: orders.length,
			data: orders,
		})
	} catch (error) {
		console.error('Error fetching driver orders:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}
