// =====================================
// 📁 FILE PATH: backend/tests/unit/controllers/users.controller.test.ts
// 🧪 USERS CONTROLLER UNIT TESTS
// =====================================

import { Request, Response } from 'express'
import { createUser, getUserById, getAllUsers } from '../../../src/controllers/users.controller'
import { prismaMock, generateMockUser } from '../../setup'

describe('Users Controller', () => {
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

	describe('createUser', () => {
		it('should create user successfully', async () => {
			const userData = {
				firebaseUid: 'firebase-uid-123',
				email: 'test@example.com',
				name: 'Test User',
				phone: '+998901234567',
			}

			mockReq.body = userData

			prismaMock.user.findUnique.mockResolvedValue(null) // User doesn't exist
			prismaMock.user.create.mockResolvedValue(generateMockUser(userData) as any)

			await createUser(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(201)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({ email: userData.email }),
				}),
			)
		})

		it('should return 400 for missing firebaseUid', async () => {
			mockReq.body = { email: 'test@example.com' }

			await createUser(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(400)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: expect.stringContaining('required'),
				}),
			)
		})

		it('should return 400 for invalid email format', async () => {
			mockReq.body = {
				firebaseUid: 'uid-123',
				email: 'invalid-email',
			}

			await createUser(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(400)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: expect.stringContaining('email'),
				}),
			)
		})

		it('should return 200 if user already exists', async () => {
			const existingUser = generateMockUser()
			mockReq.body = {
				firebaseUid: existingUser.id,
				email: existingUser.email,
			}

			prismaMock.user.findUnique.mockResolvedValue(existingUser as any)

			await createUser(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: 'User already exists',
				}),
			)
		})
	})

	describe('getUserById', () => {
		it('should return user by id', async () => {
			const mockUser = generateMockUser()
			mockReq.params = { id: mockUser.id }

			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)

			await getUserById(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({ id: mockUser.id }),
				}),
			)
		})

		it('should return 404 if user not found', async () => {
			mockReq.params = { id: 'non-existent' }

			prismaMock.user.findUnique.mockResolvedValue(null)

			await getUserById(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(404)
		})
	})

	describe('getAllUsers', () => {
		it('should return paginated users', async () => {
			const mockUsers = [generateMockUser(), generateMockUser({ id: 'user-2' })]
			mockReq.query = { page: '1', limit: '10' }

			prismaMock.user.findMany.mockResolvedValue(mockUsers as any)
			prismaMock.user.count.mockResolvedValue(2)

			await getAllUsers(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({
						users: mockUsers,
						pagination: expect.objectContaining({ total: 2 }),
					}),
				}),
			)
		})

		it('should filter by role', async () => {
			mockReq.query = { role: 'ADMIN' }

			prismaMock.user.findMany.mockResolvedValue([])
			prismaMock.user.count.mockResolvedValue(0)

			await getAllUsers(mockReq as Request, mockRes as Response)

			expect(prismaMock.user.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({ role: 'ADMIN' }),
				}),
			)
		})
	})
})
