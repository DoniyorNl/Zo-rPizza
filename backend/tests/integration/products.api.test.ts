// =====================================
// 📁 FILE PATH: backend/tests/integration/products.api.test.ts
// 🧪 PRODUCTS API INTEGRATION TESTS (Controller-level)
// =====================================

import { Request, Response } from 'express'
import { getAllProducts, getProductById, createProduct } from '../../src/controllers/products.controller'
import { prismaMock, generateMockProduct } from '../setup'

describe('Products API Integration Tests (Controller-level)', () => {
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

	describe('GET /api/products', () => {
		it('should return 200 and list of products', async () => {
			const mockProducts = [
				generateMockProduct({ id: '1', name: 'Margherita' }),
				generateMockProduct({ id: '2', name: 'Pepperoni' }),
			]

			prismaMock.product.findMany.mockResolvedValue(mockProducts as any)

			await getAllProducts(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: mockProducts,
				}),
			)
		})

		it('should filter by categoryId query param', async () => {
			mockReq.query = { categoryId: 'cat-1' }
			const mockProducts = [generateMockProduct({ categoryId: 'cat-1' })]

			prismaMock.product.findMany.mockResolvedValue(mockProducts as any)

			await getAllProducts(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(prismaMock.product.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({ categoryId: 'cat-1' }),
				}),
			)
		})

		it('should handle database errors', async () => {
			prismaMock.product.findMany.mockRejectedValue(new Error('DB Connection failed'))

			await getAllProducts(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(500)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
				}),
			)
		})
	})

	describe('GET /api/products/:id', () => {
		it('should return product by id', async () => {
			const mockProduct = generateMockProduct({ id: 'product-123' })
			mockReq.params = { id: 'product-123' }

			prismaMock.product.findUnique.mockResolvedValue(mockProduct as any)

			await getProductById(mockReq as Request, mockRes as Response)

			expect(prismaMock.product.findUnique).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: 'product-123' },
				}),
			)
			expect(mockStatus).toHaveBeenCalledWith(200)
		})

		it('should return 404 for non-existent product', async () => {
			mockReq.params = { id: 'non-existent' }

			prismaMock.product.findUnique.mockResolvedValue(null)

			await getProductById(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(404)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
				}),
			)
		})
	})

	describe('POST /api/products', () => {
		it('should create product with valid data', async () => {
			const newProduct = {
				name: 'New Pizza',
				description: 'Test Description',
				basePrice: 50000,
				prepTime: 30,
				categoryId: 'cat-1',
			}

			mockReq.body = newProduct

			const mockCategory = { id: 'cat-1', name: 'Pizza' }
			const mockCreatedProduct = generateMockProduct(newProduct)

			prismaMock.category.findUnique.mockResolvedValue(mockCategory as any)
			prismaMock.product.create.mockResolvedValue(mockCreatedProduct as any)

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
			mockReq.body = { name: '' } // Missing required fields

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
