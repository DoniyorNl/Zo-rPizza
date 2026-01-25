// backend/tests/unit/controllers/toppings.controller.test.ts
// 🍕 TOPPINGS CONTROLLER TESTS

import { Request, Response } from 'express'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import prisma from '../../../src/lib/prisma'
import {
	getAllToppings,
	createTopping,
	updateTopping,
	deleteTopping,
} from '../../../src/controllers/toppings.controller'

// Mock Prisma
jest.mock('../../../src/lib/prisma', () => ({
	__esModule: true,
	default: mockDeep<typeof prisma>(),
}))

const prismaMock = prisma as unknown as DeepMockProxy<typeof prisma>

// Helper Functions
const mockRequest = (overrides = {}): Partial<Request> => ({
	params: {},
	body: {},
	...overrides,
})

const mockResponse = (): Partial<Response> => {
	const res: Partial<Response> = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
	}
	return res
}

const generateMockTopping = (overrides = {}) => ({
	id: 'topping-1',
	name: 'Extra Cheese',
	price: 5000,
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

// Reset mocks before each test
beforeEach(() => {
	mockReset(prismaMock)
})

// ==========================================
// GET ALL TOPPINGS
// ==========================================
describe('Toppings Controller - getAllToppings', () => {
	it('should return all toppings ordered by creation date', async () => {
		const req = mockRequest()
		const res = mockResponse()

		const mockToppings = [
			generateMockTopping(),
			generateMockTopping({
				id: 'topping-2',
				name: 'Pepperoni',
				price: 8000,
			}),
		]

		prismaMock.topping.findMany.mockResolvedValue(mockToppings as any)

		await getAllToppings(req as Request, res as Response)

		expect(prismaMock.topping.findMany).toHaveBeenCalledWith({
			orderBy: { createdAt: 'desc' },
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			data: mockToppings,
		})
	})

	it('should return empty array if no toppings found', async () => {
		const req = mockRequest()
		const res = mockResponse()

		prismaMock.topping.findMany.mockResolvedValue([])

		await getAllToppings(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			data: [],
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest()
		const res = mockResponse()

		prismaMock.topping.findMany.mockRejectedValue(new Error('Database error'))

		await getAllToppings(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
		})
	})
})

// ==========================================
// CREATE TOPPING
// ==========================================
describe('Toppings Controller - createTopping', () => {
	it('should create topping with valid data', async () => {
		const req = mockRequest({
			body: {
				name: 'Mushrooms',
				price: 6000,
				isActive: true,
			},
		})
		const res = mockResponse()

		const mockTopping = generateMockTopping({
			name: 'Mushrooms',
			price: 6000,
		})

		prismaMock.topping.create.mockResolvedValue(mockTopping as any)

		await createTopping(req as Request, res as Response)

		expect(prismaMock.topping.create).toHaveBeenCalledWith({
			data: {
				name: 'Mushrooms',
				price: 6000,
				isActive: true,
			},
		})
		expect(res.status).toHaveBeenCalledWith(201)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Topping created successfully',
			data: mockTopping,
		})
	})

	it('should return 400 if validation fails', async () => {
		const req = mockRequest({
			body: {
				// Missing required name field
				price: 5000,
			},
		})
		const res = mockResponse()

		await createTopping(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: 'Validation error',
			})
		)
	})

	it('should return 400 for negative price', async () => {
		const req = mockRequest({
			body: {
				name: 'Invalid Topping',
				price: -500,
			},
		})
		const res = mockResponse()

		await createTopping(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: 'Validation error',
			})
		)
	})

	it('should handle database errors', async () => {
		const req = mockRequest({
			body: {
				name: 'Test Topping',
				price: 5000,
			},
		})
		const res = mockResponse()

		prismaMock.topping.create.mockRejectedValue(new Error('Database error'))

		await createTopping(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
		})
	})
})

// ==========================================
// UPDATE TOPPING
// ==========================================
describe('Toppings Controller - updateTopping', () => {
	it('should update topping with valid data', async () => {
		const req = mockRequest({
			params: { id: 'topping-1' },
			body: {
				name: 'Updated Cheese',
				price: 6000,
				isActive: true,
			},
		})
		const res = mockResponse()

		const existingTopping = generateMockTopping()
		const updatedTopping = {
			...existingTopping,
			name: 'Updated Cheese',
			price: 6000,
		}

		prismaMock.topping.findUnique.mockResolvedValue(existingTopping as any)
		prismaMock.topping.update.mockResolvedValue(updatedTopping as any)

		await updateTopping(req as Request, res as Response)

		expect(prismaMock.topping.update).toHaveBeenCalledWith({
			where: { id: 'topping-1' },
			data: {
				name: 'Updated Cheese',
				price: 6000,
				isActive: true,
			},
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Topping updated successfully',
			data: updatedTopping,
		})
	})

	it('should handle array id parameter', async () => {
		const req = mockRequest({
			params: { id: ['topping-1'] },
			body: { name: 'Updated' },
		})
		const res = mockResponse()

		const existingTopping = generateMockTopping()
		prismaMock.topping.findUnique.mockResolvedValue(existingTopping as any)
		prismaMock.topping.update.mockResolvedValue(existingTopping as any)

		await updateTopping(req as Request, res as Response)

		expect(prismaMock.topping.findUnique).toHaveBeenCalledWith({
			where: { id: 'topping-1' },
		})
	})

	it('should return 400 for invalid id', async () => {
		const req = mockRequest({
			params: { id: null },
			body: { name: 'Test' },
		})
		const res = mockResponse()

		await updateTopping(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Invalid id',
		})
	})

	it('should return 400 if validation fails', async () => {
		const req = mockRequest({
			params: { id: 'topping-1' },
			body: {
				price: -100, // Negative price
			},
		})
		const res = mockResponse()

		await updateTopping(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: 'Validation error',
			})
		)
	})

	it('should return 404 if topping not found', async () => {
		const req = mockRequest({
			params: { id: 'non-existent' },
			body: { name: 'Test' },
		})
		const res = mockResponse()

		prismaMock.topping.findUnique.mockResolvedValue(null)

		await updateTopping(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Topping not found',
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest({
			params: { id: 'topping-1' },
			body: { name: 'Test' },
		})
		const res = mockResponse()

		prismaMock.topping.findUnique.mockRejectedValue(new Error('Database error'))

		await updateTopping(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
		})
	})
})

// ==========================================
// DELETE TOPPING
// ==========================================
describe('Toppings Controller - deleteTopping', () => {
	it('should delete topping successfully', async () => {
		const req = mockRequest({ params: { id: 'topping-1' } })
		const res = mockResponse()

		const existingTopping = generateMockTopping()

		prismaMock.topping.findUnique.mockResolvedValue(existingTopping as any)
		prismaMock.topping.delete.mockResolvedValue(existingTopping as any)

		await deleteTopping(req as Request, res as Response)

		expect(prismaMock.topping.delete).toHaveBeenCalledWith({
			where: { id: 'topping-1' },
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Topping deleted successfully',
		})
	})

	it('should handle array id parameter', async () => {
		const req = mockRequest({ params: { id: ['topping-1'] } })
		const res = mockResponse()

		const existingTopping = generateMockTopping()

		prismaMock.topping.findUnique.mockResolvedValue(existingTopping as any)
		prismaMock.topping.delete.mockResolvedValue(existingTopping as any)

		await deleteTopping(req as Request, res as Response)

		expect(prismaMock.topping.findUnique).toHaveBeenCalledWith({
			where: { id: 'topping-1' },
		})
	})

	it('should return 400 for invalid id', async () => {
		const req = mockRequest({ params: { id: null } })
		const res = mockResponse()

		await deleteTopping(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Invalid id',
		})
	})

	it('should return 404 if topping not found', async () => {
		const req = mockRequest({ params: { id: 'non-existent' } })
		const res = mockResponse()

		prismaMock.topping.findUnique.mockResolvedValue(null)

		await deleteTopping(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Topping not found',
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest({ params: { id: 'topping-1' } })
		const res = mockResponse()

		prismaMock.topping.findUnique.mockRejectedValue(new Error('Database error'))

		await deleteTopping(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
		})
	})
})
