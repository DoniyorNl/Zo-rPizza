// backend/tests/unit/controllers/categories.controller.test.ts
// 🍕 CATEGORIES CONTROLLER TESTS

import { Request, Response } from 'express'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import prisma from '../../../src/lib/prisma'
import {
	getAllCategories,
	getCategoryById,
	createCategory,
	updateCategory,
	deleteCategory,
	restoreCategory,
} from '../../../src/controllers/categories.controller'

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

const generateMockCategory = (overrides = {}) => ({
	id: 'category-1',
	name: 'Pizza',
	description: 'Delicious pizzas',
	imageUrl: 'https://example.com/pizza.jpg',
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
// GET ALL CATEGORIES
// ==========================================
describe('Categories Controller - getAllCategories', () => {
	it('should return all active categories with product counts', async () => {
		const req = mockRequest()
		const res = mockResponse()

		const mockCategories = [
			{ ...generateMockCategory(), _count: { products: 5 } },
			{
				...generateMockCategory({
					id: 'category-2',
					name: 'Drinks',
				}),
				_count: { products: 3 },
			},
		]

		prismaMock.category.findMany.mockResolvedValue(mockCategories as any)

		await getAllCategories(req as Request, res as Response)

		expect(prismaMock.category.findMany).toHaveBeenCalledWith({
			where: { isActive: true },
			include: {
				_count: {
					select: { products: true },
				},
			},
			orderBy: { name: 'asc' },
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			count: 2,
			data: mockCategories,
		})
	})

	it('should return empty array if no categories found', async () => {
		const req = mockRequest()
		const res = mockResponse()

		prismaMock.category.findMany.mockResolvedValue([])

		await getAllCategories(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			count: 0,
			data: [],
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest()
		const res = mockResponse()

		prismaMock.category.findMany.mockRejectedValue(new Error('Database error'))

		await getAllCategories(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
			error: 'Database error',
		})
	})
})

// ==========================================
// GET CATEGORY BY ID
// ==========================================
describe('Categories Controller - getCategoryById', () => {
	it('should return category with products', async () => {
		const req = mockRequest({ params: { id: 'category-1' } })
		const res = mockResponse()

		const mockCategory = {
			...generateMockCategory(),
			products: [
				{
					id: 'product-1',
					name: 'Margherita',
					isActive: true,
				},
			],
		}

		prismaMock.category.findUnique.mockResolvedValue(mockCategory as any)

		await getCategoryById(req as Request, res as Response)

		expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
			where: { id: 'category-1' },
			include: {
				products: {
					where: { isActive: true },
				},
			},
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			data: mockCategory,
		})
	})

	it('should handle array id parameter', async () => {
		const req = mockRequest({ params: { id: ['category-1'] } })
		const res = mockResponse()

		const mockCategory = generateMockCategory()
		prismaMock.category.findUnique.mockResolvedValue(mockCategory as any)

		await getCategoryById(req as Request, res as Response)

		expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
			where: { id: 'category-1' },
			include: {
				products: {
					where: { isActive: true },
				},
			},
		})
	})

	it('should return 404 if category not found', async () => {
		const req = mockRequest({ params: { id: 'non-existent' } })
		const res = mockResponse()

		prismaMock.category.findUnique.mockResolvedValue(null)

		await getCategoryById(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Category not found',
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest({ params: { id: 'category-1' } })
		const res = mockResponse()

		prismaMock.category.findUnique.mockRejectedValue(new Error('Database error'))

		await getCategoryById(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
			error: 'Database error',
		})
	})
})

// ==========================================
// CREATE CATEGORY
// ==========================================
describe('Categories Controller - createCategory', () => {
	it('should create category with valid data', async () => {
		const req = mockRequest({
			body: {
				name: 'Burgers',
				description: 'Tasty burgers',
				imageUrl: 'https://example.com/burger.jpg',
			},
		})
		const res = mockResponse()

		const mockCategory = generateMockCategory({
			name: 'Burgers',
			description: 'Tasty burgers',
		})

		prismaMock.category.findUnique.mockResolvedValue(null)
		prismaMock.category.create.mockResolvedValue(mockCategory as any)

		await createCategory(req as Request, res as Response)

		expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
			where: { name: 'Burgers' },
		})
		expect(prismaMock.category.create).toHaveBeenCalledWith({
			data: {
				name: 'Burgers',
				description: 'Tasty burgers',
				imageUrl: 'https://example.com/burger.jpg',
			},
		})
		expect(res.status).toHaveBeenCalledWith(201)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Category created successfully',
			data: mockCategory,
		})
	})

	it('should return 400 if name is missing', async () => {
		const req = mockRequest({
			body: {
				description: 'No name provided',
			},
		})
		const res = mockResponse()

		await createCategory(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Name is required',
		})
	})

	it('should return 400 if category already exists', async () => {
		const req = mockRequest({
			body: {
				name: 'Pizza',
				description: 'Duplicate category',
			},
		})
		const res = mockResponse()

		const existingCategory = generateMockCategory()
		prismaMock.category.findUnique.mockResolvedValue(existingCategory as any)

		await createCategory(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Category already exists',
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest({
			body: {
				name: 'Test Category',
			},
		})
		const res = mockResponse()

		prismaMock.category.findUnique.mockResolvedValue(null)
		prismaMock.category.create.mockRejectedValue(new Error('Database error'))

		await createCategory(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
			error: 'Database error',
		})
	})
})

// ==========================================
// UPDATE CATEGORY
// ==========================================
describe('Categories Controller - updateCategory', () => {
	it('should update category with valid data', async () => {
		const req = mockRequest({
			params: { id: 'category-1' },
			body: {
				name: 'Updated Pizza',
				description: 'Updated description',
				imageUrl: 'https://example.com/updated.jpg',
				isActive: true,
			},
		})
		const res = mockResponse()

		const existingCategory = generateMockCategory()
		const updatedCategory = {
			...existingCategory,
			name: 'Updated Pizza',
			description: 'Updated description',
		}

		prismaMock.category.findUnique.mockResolvedValue(existingCategory as any)
		prismaMock.category.update.mockResolvedValue(updatedCategory as any)

		await updateCategory(req as Request, res as Response)

		expect(prismaMock.category.update).toHaveBeenCalledWith({
			where: { id: 'category-1' },
			data: {
				name: 'Updated Pizza',
				description: 'Updated description',
				imageUrl: 'https://example.com/updated.jpg',
				isActive: true,
			},
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Category updated successfully',
			data: updatedCategory,
		})
	})

	it('should handle array id parameter', async () => {
		const req = mockRequest({
			params: { id: ['category-1'] },
			body: { name: 'Updated' },
		})
		const res = mockResponse()

		const existingCategory = generateMockCategory()
		prismaMock.category.findUnique.mockResolvedValue(existingCategory as any)
		prismaMock.category.update.mockResolvedValue(existingCategory as any)

		await updateCategory(req as Request, res as Response)

		expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
			where: { id: 'category-1' },
		})
	})

	it('should return 404 if category not found', async () => {
		const req = mockRequest({
			params: { id: 'non-existent' },
			body: { name: 'Test' },
		})
		const res = mockResponse()

		prismaMock.category.findUnique.mockResolvedValue(null)

		await updateCategory(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Category not found',
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest({
			params: { id: 'category-1' },
			body: { name: 'Test' },
		})
		const res = mockResponse()

		prismaMock.category.findUnique.mockRejectedValue(new Error('Database error'))

		await updateCategory(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
			error: 'Database error',
		})
	})
})

// ==========================================
// DELETE CATEGORY (SOFT DELETE)
// ==========================================
describe('Categories Controller - deleteCategory', () => {
	it('should soft delete category without products', async () => {
		const req = mockRequest({ params: { id: 'category-1' } })
		const res = mockResponse()

		const existingCategory = {
			...generateMockCategory(),
			_count: { products: 0 },
		}

		const deletedCategory = {
			...generateMockCategory(),
			isActive: false,
		}

		prismaMock.category.findUnique.mockResolvedValue(existingCategory as any)
		prismaMock.category.update.mockResolvedValue(deletedCategory as any)

		await deleteCategory(req as Request, res as Response)

		expect(prismaMock.category.update).toHaveBeenCalledWith({
			where: { id: 'category-1' },
			data: {
				isActive: false,
				updatedAt: expect.any(Date),
			},
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Category deactivated successfully',
			data: deletedCategory,
		})
	})

	it('should soft delete category with products', async () => {
		const req = mockRequest({ params: { id: 'category-1' } })
		const res = mockResponse()

		const existingCategory = {
			...generateMockCategory(),
			_count: { products: 5 },
		}

		const deletedCategory = {
			...generateMockCategory(),
			isActive: false,
		}

		prismaMock.category.findUnique.mockResolvedValue(existingCategory as any)
		prismaMock.category.update.mockResolvedValue(deletedCategory as any)

		await deleteCategory(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Category deactivated (contains 5 products)',
			data: deletedCategory,
		})
	})

	it('should handle array id parameter', async () => {
		const req = mockRequest({ params: { id: ['category-1'] } })
		const res = mockResponse()

		const existingCategory = {
			...generateMockCategory(),
			_count: { products: 0 },
		}

		prismaMock.category.findUnique.mockResolvedValue(existingCategory as any)
		prismaMock.category.update.mockResolvedValue(existingCategory as any)

		await deleteCategory(req as Request, res as Response)

		expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
			where: { id: 'category-1' },
			include: {
				_count: {
					select: { products: true },
				},
			},
		})
	})

	it('should return 404 if category not found', async () => {
		const req = mockRequest({ params: { id: 'non-existent' } })
		const res = mockResponse()

		prismaMock.category.findUnique.mockResolvedValue(null)

		await deleteCategory(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Category not found',
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest({ params: { id: 'category-1' } })
		const res = mockResponse()

		prismaMock.category.findUnique.mockRejectedValue(new Error('Database error'))

		await deleteCategory(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
			error: 'Database error',
		})
	})
})

// ==========================================
// RESTORE CATEGORY
// ==========================================
describe('Categories Controller - restoreCategory', () => {
	it('should restore inactive category', async () => {
		const req = mockRequest({ params: { id: 'category-1' } })
		const res = mockResponse()

		const existingCategory = {
			...generateMockCategory(),
			isActive: false,
		}

		const restoredCategory = {
			...generateMockCategory(),
			isActive: true,
		}

		prismaMock.category.findUnique.mockResolvedValue(existingCategory as any)
		prismaMock.category.update.mockResolvedValue(restoredCategory as any)

		await restoreCategory(req as Request, res as Response)

		expect(prismaMock.category.update).toHaveBeenCalledWith({
			where: { id: 'category-1' },
			data: {
				isActive: true,
				updatedAt: expect.any(Date),
			},
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Category restored successfully',
			data: restoredCategory,
		})
	})

	it('should handle array id parameter', async () => {
		const req = mockRequest({ params: { id: ['category-1'] } })
		const res = mockResponse()

		const existingCategory = {
			...generateMockCategory(),
			isActive: false,
		}

		prismaMock.category.findUnique.mockResolvedValue(existingCategory as any)
		prismaMock.category.update.mockResolvedValue(existingCategory as any)

		await restoreCategory(req as Request, res as Response)

		expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
			where: { id: 'category-1' },
		})
	})

	it('should return 404 if category not found', async () => {
		const req = mockRequest({ params: { id: 'non-existent' } })
		const res = mockResponse()

		prismaMock.category.findUnique.mockResolvedValue(null)

		await restoreCategory(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Category not found',
		})
	})

	it('should return 400 if category is already active', async () => {
		const req = mockRequest({ params: { id: 'category-1' } })
		const res = mockResponse()

		const existingCategory = {
			...generateMockCategory(),
			isActive: true,
		}

		prismaMock.category.findUnique.mockResolvedValue(existingCategory as any)

		await restoreCategory(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Category is already active',
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest({ params: { id: 'category-1' } })
		const res = mockResponse()

		prismaMock.category.findUnique.mockRejectedValue(new Error('Database error'))

		await restoreCategory(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
			error: 'Database error',
		})
	})
})
