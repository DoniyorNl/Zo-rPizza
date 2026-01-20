// =====================================
// 📁 FILE PATH: backend/tests/unit/controllers/products.controller.test.ts
// 🧪 PRODUCTS CONTROLLER UNIT TESTS
// =====================================

import { Request, Response } from 'express'
import { getAllProducts, getProductById, createProduct } from '../../../src/controllers/products.controller'
import { prismaMock, generateMockProduct } from '../../setup'

describe('Products Controller', () => {
	let mockReq: Partial<Request>
	let mockRes: Partial<Response>
	let mockJson: jest.Mock
	let mockStatus: jest.Mock

	beforeEach(() => {
		mockJson = jest.fn()
		mockStatus = jest.fn().mockReturnValue({ json: mockJson })
		mockReq = {
			query: {},
			body: {},
			params: {},
		}
		mockRes = {
			status: mockStatus,
			json: mockJson,
		}
	})

	describe('getAllProducts', () => {
		it('should return all products successfully', async () => {
			const mockProducts = [
				generateMockProduct({ id: '1', name: 'Pizza 1' }),
				generateMockProduct({ id: '2', name: 'Pizza 2' }),
			]

			prismaMock.product.findMany.mockResolvedValue(mockProducts as any)

			await getAllProducts(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				count: 2,
				data: mockProducts,
			})
		})

		it('should filter products by categoryId', async () => {
			mockReq.query = { categoryId: 'category-1' }
			const mockProducts = [generateMockProduct({ categoryId: 'category-1' })]

			prismaMock.product.findMany.mockResolvedValue(mockProducts as any)

			await getAllProducts(mockReq as Request, mockRes as Response)

			expect(prismaMock.product.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({ categoryId: 'category-1' }),
				}),
			)
			expect(mockStatus).toHaveBeenCalledWith(200)
		})

		it('should handle errors gracefully', async () => {
			prismaMock.product.findMany.mockRejectedValue(new Error('Database error'))

			await getAllProducts(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(500)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: 'Server error',
				}),
			)
		})
	})

	describe('getProductById', () => {
		it('should return product by id', async () => {
			const mockProduct = generateMockProduct({ id: 'test-id' })
			mockReq.params = { id: 'test-id' }

			prismaMock.product.findUnique.mockResolvedValue(mockProduct as any)

			await getProductById(mockReq as Request, mockRes as Response)

			expect(prismaMock.product.findUnique).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: 'test-id' },
				}),
			)
			expect(mockStatus).toHaveBeenCalledWith(200)
		})

		it('should return 404 if product not found', async () => {
			mockReq.params = { id: 'non-existent' }

			prismaMock.product.findUnique.mockResolvedValue(null)

			await getProductById(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(404)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: 'Product not found',
				}),
			)
		})
	})

	describe('createProduct', () => {
		it('should create product with valid data', async () => {
			const productData = {
				name: 'New Pizza',
				description: 'Delicious pizza',
				basePrice: 50000,
				prepTime: 30,
				categoryId: 'category-1',
				variations: [
					{ size: 'Medium', price: 50000, diameter: 30, slices: 8 },
				],
			}

			mockReq.body = productData

			const mockCategory = { id: 'category-1', name: 'Pizza' }
			const mockProduct = generateMockProduct(productData)

			prismaMock.category.findUnique.mockResolvedValue(mockCategory as any)
			prismaMock.product.create.mockResolvedValue(mockProduct as any)

			await createProduct(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(201)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({ name: 'New Pizza' }),
				}),
			)
		})

		it('should return 400 for invalid data', async () => {
			mockReq.body = { name: '' } // Invalid: missing required fields

			await createProduct(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(400)
		})

		it('should return 404 if category not found', async () => {
			mockReq.body = {
				name: 'Pizza',
				description: 'Test',
				basePrice: 50000,
				prepTime: 30,
				categoryId: 'non-existent',
			}

			prismaMock.category.findUnique.mockResolvedValue(null)

			await createProduct(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(404)
		})
	})
})
