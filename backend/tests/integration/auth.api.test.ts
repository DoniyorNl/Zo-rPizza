// =====================================
// 📁 FILE PATH: backend/tests/integration/auth.api.test.ts
// 🧪 AUTH API INTEGRATION TESTS (Controller-level)
// =====================================

import { Request, Response } from 'express'
import { createUser, getUserById } from '../../src/controllers/users.controller'
import { prismaMock, generateMockUser } from '../setup'
import { auth } from '../../src/config/firebase'

describe('Auth API Integration Tests (Controller-level)', () => {
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
			headers: {},
		}
		mockRes = {
			status: mockStatus,
			json: mockJson,
		}
	})

	describe('User Creation Flow', () => {
		it('should sync Firebase user to database', async () => {
			const mockFirebaseUser = {
				uid: 'firebase-123',
				email: 'new@example.com',
				displayName: 'New User',
			}

			mockReq.body = {
				firebaseUid: mockFirebaseUser.uid,
				email: mockFirebaseUser.email,
				name: mockFirebaseUser.displayName,
			}

			prismaMock.user.findUnique.mockResolvedValue(null)
			prismaMock.user.create.mockResolvedValue(generateMockUser(mockFirebaseUser) as any)

			await createUser(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(201)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
				}),
			)
			expect(prismaMock.user.create).toHaveBeenCalled()
		})

		it('should return existing user if already in database', async () => {
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
					message: expect.stringContaining('already exists'),
				}),
			)
		})
	})

	describe('User Retrieval', () => {
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

		it('should return 404 if user not in database', async () => {
			mockReq.params = { id: 'non-existent' }

			prismaMock.user.findUnique.mockResolvedValue(null)

			await getUserById(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(404)
		})
	})

	describe('Firebase Token Verification (Unit)', () => {
		it('should verify valid Firebase token', async () => {
			const mockToken = 'valid-firebase-token'
			const mockDecodedToken = {
				uid: 'user-123',
				email: 'test@example.com',
			}

			;(auth.verifyIdToken as jest.Mock).mockResolvedValue(mockDecodedToken)

			const result = await auth.verifyIdToken(mockToken)

			expect(result.uid).toBe('user-123')
			expect(result.email).toBe('test@example.com')
		})

		it('should reject invalid token', async () => {
			;(auth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Invalid token'))

			await expect(auth.verifyIdToken('invalid-token')).rejects.toThrow('Invalid token')
		})
	})
})
