// backend/src/controllers/tracking.controller.ts
import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { AppError } from '../utils/errors'
import {
  calculateDistance,
  calculateETA,
  getLocationTimestamp,
  isNearDestination,
  isValidLocation,
} from '../utils/gps.utils'

export async function updateDriverLocation(req: Request, res: Response) {
  try {
    const userId = req.user?.id
    const { lat, lng } = req.body

    if (!userId) {
      throw new AppError(401, 'User not authenticated', 'UNAUTHORIZED')
    }

    if (!lat || !lng || !isValidLocation({ lat, lng })) {
      throw new AppError(400, 'Invalid location coordinates', 'INVALID_LOCATION')
    }

    const driver = await prisma.user.update({
      where: { id: userId },
      data: {
        currentLocation: {
          lat,
          lng,
          timestamp: getLocationTimestamp(),
        },
      },
    })

    const activeOrder = await prisma.order.findFirst({
      where: {
        driverId: userId,
        status: { in: ['OUT_FOR_DELIVERY', 'DELIVERING'] },
      },
    })

    if (activeOrder && activeOrder.deliveryLocation) {
      const deliveryLoc = activeOrder.deliveryLocation as any

      await prisma.order.update({
        where: { id: activeOrder.id },
        data: {
          driverLocation: {
            lat,
            lng,
            timestamp: getLocationTimestamp(),
          },
        },
      })

      const { emitOrderUpdate } = await import('../lib/socket')
      emitOrderUpdate(activeOrder.id, {
        driverLocation: { lat, lng, timestamp: getLocationTimestamp() },
      })

      const isNear = isNearDestination({ lat, lng }, deliveryLoc)
      if (isNear && activeOrder.status !== 'DELIVERED') {
        await prisma.notification.create({
          data: {
            userId: activeOrder.userId,
            title: 'Driver Nearby!',
            message: 'Your delivery driver is approaching your location',
            type: 'ORDER_UPDATE',
            orderId: activeOrder.id,
          },
        })
      }
    }

    res.json({
      success: true,
      message: 'Location updated',
      data: {
        location: { lat, lng },
        activeOrder: activeOrder?.id,
      },
    })
  } catch (error) {
    console.error('Update driver location error:', error)
    throw error
  }
}

export async function getOrderTracking(req: Request, res: Response) {
  try {
    const { orderId } = req.params
    const userId = req.user?.id

    const order = await prisma.order.findUnique({
      where: { id: String(orderId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    })

    if (!order) {
      throw new AppError(404, 'Order not found', 'ORDER_NOT_FOUND')
    }

    if (order.userId !== userId && req.user?.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to track this order', 'UNAUTHORIZED')
    }

    let driver = null
    if (order.driverId) {
      driver = await prisma.user.findUnique({
        where: { id: order.driverId },
        select: {
          id: true,
          name: true,
          phone: true,
          currentLocation: true,
          vehicleType: true,
        },
      })
    }

    let branch = null
    if (order.branchId) {
      const b = await prisma.branch.findUnique({
        where: { id: String(order.branchId) },
        select: { id: true, name: true, address: true, lat: true, lng: true },
      })
      if (b) branch = b
    }

    let tracking = null
    let deliveryLoc = order.deliveryLocation as { lat: number; lng: number } | null
    if (!deliveryLoc && order.deliveryLat != null && order.deliveryLng != null) {
      deliveryLoc = { lat: Number(order.deliveryLat), lng: Number(order.deliveryLng) }
    }
    const driverLoc = order.driverLocation as { lat: number; lng: number; timestamp?: string } | null

    if (deliveryLoc && typeof deliveryLoc.lat === 'number' && typeof deliveryLoc.lng === 'number') {
      if (driverLoc && typeof driverLoc.lat === 'number' && typeof driverLoc.lng === 'number') {
        const distance = calculateDistance(driverLoc, deliveryLoc)
        const eta = calculateETA(distance, {
          preparationTime: 0,
          vehicleType: (driver?.vehicleType as any) || 'bike',
        })
        tracking = {
          driverLocation: driverLoc,
          deliveryLocation: deliveryLoc,
          distance,
          eta,
          isNearby: isNearDestination(driverLoc, deliveryLoc),
          lastUpdate: driverLoc.timestamp ?? new Date().toISOString(),
        }
      } else {
        tracking = {
          driverLocation: null,
          deliveryLocation: deliveryLoc,
          distance: 0,
          eta: 0,
          isNearby: false,
          lastUpdate: new Date().toISOString(),
        }
      }
    }

    res.json({
      success: true,
      data: {
        order: {
          id: order.id,
          status: order.status,
          totalPrice: order.totalPrice,
          deliveryAddress: order.deliveryAddress,
          createdAt: order.createdAt,
          trackingStartedAt: order.trackingStartedAt,
          deliveryStartedAt: order.deliveryStartedAt,
          deliveryCompletedAt: order.deliveryCompletedAt,
          branchId: order.branchId ?? undefined,
        },
        branch: branch ?? undefined,
        tracking,
        driver,
      },
    })
  } catch (error) {
    console.error('Get order tracking error:', error)
    throw error
  }
}

export async function startDeliveryTracking(req: Request, res: Response) {
  try {
    const { orderId } = req.params
    const userId = req.user?.id
    const { deliveryLocation } = req.body

    if (!deliveryLocation || !isValidLocation(deliveryLocation)) {
      throw new AppError(400, 'Invalid delivery location', 'INVALID_LOCATION')
    }

    const order = await prisma.order.findUnique({
      where: { id: String(orderId) },
    })

    if (!order) {
      throw new AppError(404, 'Order not found', 'ORDER_NOT_FOUND')
    }

    if (order.driverId !== userId && req.user?.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized', 'UNAUTHORIZED')
    }

    const updatedOrder = await prisma.order.update({
      where: { id: String(orderId) },
      data: {
        deliveryLocation: deliveryLocation as any,
        trackingStartedAt: new Date(),
        deliveryStartedAt: new Date(),
        status: 'OUT_FOR_DELIVERY',
      },
    })

    const driver = await prisma.user.findUnique({
      where: { id: userId! },
      select: { currentLocation: true, vehicleType: true },
    })

    let eta = 30
    if (driver?.currentLocation) {
      const driverLoc = driver.currentLocation as any
      const distance = calculateDistance(driverLoc, deliveryLocation)
      eta = calculateETA(distance, {
        vehicleType: (driver.vehicleType as any) || 'bike',
      })
    }

    await prisma.order.update({
      where: { id: String(orderId) },
      data: {
        estimatedTime: eta,
      },
    })

    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: 'Delivery Started!',
        message: `Your order is on the way. Estimated arrival: ${eta} minutes`,
        type: 'ORDER_UPDATE',
        orderId: order.id,
      },
    })

    res.json({
      success: true,
      message: 'Delivery tracking started',
      data: {
        orderId,
        eta,
        trackingStartedAt: updatedOrder.trackingStartedAt,
      },
    })
  } catch (error) {
    console.error('Start delivery tracking error:', error)
    throw error
  }
}

export async function completeDelivery(req: Request, res: Response) {
  try {
    const { orderId } = req.params
    const userId = req.user?.id

    const order = await prisma.order.findUnique({
      where: { id: String(orderId) },
    })

    if (!order) {
      throw new AppError(404, 'Order not found', 'ORDER_NOT_FOUND')
    }

    if (order.driverId !== userId && req.user?.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized', 'UNAUTHORIZED')
    }

    await prisma.order.update({
      where: { id: String(orderId) },
      data: {
        status: 'DELIVERED',
        deliveryCompletedAt: new Date(),
      },
    })

    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: 'Delivery Completed!',
        message: 'Your order has been delivered. Enjoy your meal!',
        type: 'ORDER_UPDATE',
        orderId: order.id,
      },
    })

    res.json({
      success: true,
      message: 'Delivery completed',
    })
  } catch (error) {
    console.error('Complete delivery error:', error)
    throw error
  }
}

export async function getActiveDeliveries(req: Request, res: Response) {
  try {
    const activeOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ['OUT_FOR_DELIVERY', 'PREPARING'],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const ordersWithTracking = await Promise.all(
      activeOrders.map(async (order) => {
        let driver = null
        if (order.driverId) {
          driver = await prisma.user.findUnique({
            where: { id: order.driverId },
            select: {
              id: true,
              name: true,
              phone: true,
              currentLocation: true,
              vehicleType: true,
            },
          })
        }

        let tracking = null
        if (order.driverLocation && order.deliveryLocation) {
          const driverLoc = order.driverLocation as any
          const deliveryLoc = order.deliveryLocation as any
          const distance = calculateDistance(driverLoc, deliveryLoc)
          const eta = calculateETA(distance, {
            preparationTime: 0,
            vehicleType: (driver?.vehicleType as any) || 'bike',
          })

          tracking = {
            distance,
            eta,
            isNearby: isNearDestination(driverLoc, deliveryLoc),
          }
        }

        return {
          ...order,
          driver,
          tracking,
        }
      })
    )

    res.json({
      success: true,
      data: ordersWithTracking,
      count: ordersWithTracking.length,
    })
  } catch (error) {
    console.error('Get active deliveries error:', error)
    throw error
  }
}

/**
 * Admin: Haydovchi joyini simulyatsiya qilish (test uchun)
 * POST /api/tracking/admin/simulate-location
 * Body: { orderId, lat, lng }
 */
export async function adminSimulateDriverLocation(req: Request, res: Response) {
  try {
    const { orderId, lat, lng } = req.body

    if (!orderId || !lat || !lng || !isValidLocation({ lat, lng })) {
      throw new AppError(400, 'Invalid orderId or coordinates', 'INVALID_INPUT')
    }

    const order = await prisma.order.findUnique({
      where: { id: String(orderId) },
    })

    if (!order) {
      throw new AppError(404, 'Order not found', 'ORDER_NOT_FOUND')
    }

    if (!['OUT_FOR_DELIVERY', 'DELIVERING'].includes(order.status)) {
      throw new AppError(400, 'Order must be OUT_FOR_DELIVERY or DELIVERING', 'INVALID_STATUS')
    }

    if (!order.deliveryLocation) {
      throw new AppError(400, 'Order has no delivery location', 'NO_DELIVERY_LOCATION')
    }

    await prisma.order.update({
      where: { id: String(orderId) },
      data: {
        driverLocation: {
          lat,
          lng,
          timestamp: getLocationTimestamp(),
        },
      },
    })

    res.json({
      success: true,
      message: 'Driver location simulated',
      data: { orderId, lat, lng },
    })
  } catch (error) {
    console.error('Admin simulate location error:', error)
    throw error
  }
}