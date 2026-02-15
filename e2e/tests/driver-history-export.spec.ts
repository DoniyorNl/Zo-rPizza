// @ts-nocheck
// =====================================
// 📁 FILE PATH: e2e/tests/driver-history-export.spec.ts
// 🎭 E2E TEST: Driver History Export
// =====================================

import { expect, test } from '@playwright/test'

declare global {
	interface Window {
		__pdfExported?: boolean
		__restoreOpen?: () => void
	}
}

test.describe('Driver History Export', () => {
	const driverEmail = process.env.E2E_DRIVER_EMAIL ?? 'testdriver@pizza.com'

	const mockOrders = [
		{
			id: 'order-1',
			orderNumber: 'D-1001',
			status: 'DELIVERED',
			totalPrice: 45000,
			deliveryAddress: 'Toshkent, Chilonzor',
			deliveryInstructions: 'Eski dom, 2-qavat',
			createdAt: '2026-02-07T10:00:00Z',
			updatedAt: '2026-02-08T11:00:00Z',
			user: {
				name: 'Ali',
				phone: '+998901112233',
			},
		},
	]

	test.beforeEach(async ({ page }) => {
		await page.addInitScript(
			data => {
				const host = window as Window
				host.__pdfExported = false
				localStorage.setItem('firebaseToken', 'e2e-token')
				localStorage.setItem(
					'firebaseUser',
					JSON.stringify({ uid: 'e2e-driver', email: data.driverEmail }),
				)
				localStorage.setItem('e2eBackendUser', JSON.stringify(data.backendUser))
				const originalOpen = window.open
				window.open = () => {
					const popup = {
						document: {
							open: () => undefined,
							write: () => undefined,
							close: () => undefined,
						},
						focus: () => undefined,
						print: () => {
							host.__pdfExported = true
						},
					}
					return popup as unknown as Window
				}
				host.__restoreOpen = () => {
					window.open = originalOpen
				}
			},
			{
				driverEmail,
				backendUser: {
					id: 'driver-1',
					firebaseUid: 'fake-uid',
					email: driverEmail,
					name: 'Test Driver',
					phone: '+998901112233',
					role: 'DELIVERY',
					vehicleType: 'car',
				},
			},
		)

		await page.route('**/api/orders/driver', async route => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ success: true, data: mockOrders }),
			})
		})
	})

	test.skip('should export PDF and CSV from history page', async ({ page }) => {
		await page.goto('/driver/history')
		await expect(page.locator('h1')).toContainText('Buyurtmalar Tarixi')
		await expect(page.locator('text=PDF Export')).toBeVisible()
		await expect(page.locator('text=Excel (CSV)')).toBeVisible()

		const downloadPromise = page.waitForEvent('download')
		await page.click('text=Excel (CSV)')
		const download = await downloadPromise
		expect(download.suggestedFilename()).toContain('driver-history')

		await page.click('text=PDF Export')
		const pdfExported = await page.evaluate(() => window.__pdfExported)
		expect(pdfExported).toBe(true)
	})
})
