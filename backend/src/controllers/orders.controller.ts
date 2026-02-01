// backend/src/controllers/orders.controller.ts
// 🍕 ORDERS CONTROLLER

import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/firebase-auth.middleware'

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
	try {
		const authReq = req as AuthRequest
		const firebaseUid = authReq.userId ?? getParamString((req.params as any).userId)
		if (!firebaseUid) {
			return res.status(400).json({ success: false, message: 'Invalid userId' })
		}
		// Faqat o‘z buyurtmalarini ko‘rishi: token’dagi uid bilan URL’dagi userId mos bo‘lishi kerak
		if (authReq.userId && authReq.userId !== firebaseUid) {
			return res.status(403).json({ success: false, message: 'Forbidden' })
		}

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
		console.error('Error fetching user orders:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
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

// POST /api/orders - Yangi buyurtma
export const createOrder = async (req: Request, res: Response) => {
	try {
		let {
			userId,
			items, // [{ productId, quantity, variationId?, size?, addedToppingIds?, removedToppingIds?, halfProductId? }]
			paymentMethod,
			deliveryAddress,
			deliveryPhone,
			deliveryLat,
			deliveryLng,
		} = req.body

		if (typeof items === 'string') {
			items = JSON.parse(items)
		}
		console.log('Received items:', items)
		console.log('First item:', items[0])
		// Validation
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
			const email = req.body.email || ''
			const existingUser = email ? await prisma.user.findUnique({ where: { email } }) : null

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
				console.log(` Creating user in database: ${userId}`)
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

		// Buyurtma yaratish
		const order = await prisma.order.create({
			data: {
				orderNumber,
				userId: user.id,
				totalPrice,
				paymentMethod: paymentMethod || 'CASH',
				deliveryAddress,
				deliveryPhone,
				deliveryLat: lat,
				deliveryLng: lng,
				...(deliveryLocationJson && { deliveryLocation: deliveryLocationJson }),
				items: {
					create: orderItems,
				},
			},
			include: {
				items: {
					include: {
						product: true,
					},
				},
			},
		})

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
			},
		})

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
