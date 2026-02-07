/**
 * Tracking System Type Definitions
 * Separate type definitions for better maintainability and reusability
 */

export interface Location {
	lat: number
	lng: number
	timestamp?: string
}

export interface TrackingData {
	driverLocation: Location | null
	deliveryLocation: Location
	distance: number
	eta: number
	isNearby: boolean
	lastUpdate: string
}

export interface OrderData {
	id: string
	orderNumber: string
	status: OrderStatus
	totalAmount: number
	deliveryAddress: string
	createdAt: string
	updatedAt?: string
}

export interface DriverData {
	id: string
	name: string
	phone: string
	vehicleType: string
	vehicleNumber?: string
}

export interface TrackingResponse {
	success: boolean
	data: {
		order: OrderData
		tracking: TrackingData | null
		driver: DriverData | null
	}
	message?: string
}

export type OrderStatus =
	| 'PENDING'
	| 'CONFIRMED'
	| 'PREPARING'
	| 'OUT_FOR_DELIVERY'
	| 'DELIVERING'
	| 'DELIVERED'
	| 'CANCELLED'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
	PENDING: 'Kutilmoqda',
	CONFIRMED: 'Tasdiqlandi',
	PREPARING: 'Tayyorlanmoqda',
	OUT_FOR_DELIVERY: 'Yetkazilmoqda',
	DELIVERING: 'Yetkazilmoqda',
	DELIVERED: 'Yetkazildi',
	CANCELLED: 'Bekor qilindi',
}
