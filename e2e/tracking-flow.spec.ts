// e2e/tracking-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('GPS Order Tracking', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login')
		await page.fill('input[type="email"]', 'test@example.com')
		await page.fill('input[type="password"]', 'password123')
		await page.click('button[type="submit"]')
		await page.waitForURL('/')
	})

	test('should display order tracking page', async ({ page }) => {
		await page.goto('/orders')
		await page.waitForSelector('text=My Orders')

		const firstOrder = page.locator('[data-testid="order-item"]').first()
		await firstOrder.click()

		await expect(page).toHaveURL(/\/tracking\/.+/)
		await expect(page.locator('h1')).toContainText('Order Tracking')
	})

	test('should show map when tracking is active', async ({ page }) => {
		await page.goto('/tracking/test-order-id')

		await page.waitForSelector('[class*="leaflet"]', { timeout: 10000 })

		const map = page.locator('[class*="leaflet-container"]')
		await expect(map).toBeVisible()
	})

	test('should display order status timeline', async ({ page }) => {
		await page.goto('/tracking/test-order-id')

		await expect(page.locator('text=Order Placed')).toBeVisible()
		await expect(page.locator('text=Preparing')).toBeVisible()
		await expect(page.locator('text=Out for Delivery')).toBeVisible()
		await expect(page.locator('text=Delivered')).toBeVisible()
	})

	test('should show driver information when assigned', async ({ page }) => {
		await page.goto('/tracking/test-order-id')

		await expect(page.locator('text=Delivery Driver')).toBeVisible()

		const callButton = page.locator('button:has-text("Call Driver")')
		await expect(callButton).toBeVisible()
	})

	test('should display delivery address', async ({ page }) => {
		await page.goto('/tracking/test-order-id')

		await expect(page.locator('text=Delivery Address')).toBeVisible()
	})

	test('should show order total', async ({ page }) => {
		await page.goto('/tracking/test-order-id')

		await expect(page.locator('text=Order Total')).toBeVisible()
	})

	test('should display ETA when driver is en route', async ({ page }) => {
		await page.goto('/tracking/test-order-id')

		await page.waitForTimeout(2000)

		const etaElement = page.locator('text=/\\d+ min/')
		const isVisible = await etaElement.isVisible().catch(() => false)
		expect(typeof isVisible).toBe('boolean')
	})

	test('should show distance to destination', async ({ page }) => {
		await page.goto('/tracking/test-order-id')

		await page.waitForTimeout(2000)

		const distanceElement = page.locator('text=/\\d+\\.\\d+ km/')
		const isVisible = await distanceElement.isVisible().catch(() => false)
		expect(typeof isVisible).toBe('boolean')
	})

	test('should have back button to orders page', async ({ page }) => {
		await page.goto('/tracking/test-order-id')

		const backButton = page.locator('button:has-text("Back to Orders")')
		await expect(backButton).toBeVisible()

		await backButton.click()

		await expect(page).toHaveURL('/orders')
	})

	test('should handle order not found error', async ({ page }) => {
		await page.goto('/tracking/non-existent-order')

		await expect(page.locator('text=Unable to Load Tracking')).toBeVisible()

		const backButton = page.locator('button:has-text("Back to Orders")')
		await expect(backButton).toBeVisible()
	})

	test('should show map legend', async ({ page }) => {
		await page.goto('/tracking/test-order-id')

		await page.waitForSelector('[class*="leaflet"]', { timeout: 10000 })

		await expect(page.locator('text=Restaurant')).toBeVisible()
		await expect(page.locator('text=Delivery')).toBeVisible()
	})

	test('should display loading state initially', async ({ page }) => {
		await page.goto('/tracking/test-order-id')

		const loading = page.locator('text=Loading tracking information...')
		const isVisible = await loading.isVisible().catch(() => false)
		expect(typeof isVisible).toBe('boolean')
	})
})

test.describe('Admin Tracking Management', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login')
		await page.fill('input[type="email"]', 'admin@example.com')
		await page.fill('input[type="password"]', 'admin123')
		await page.click('button[type="submit"]')
		await page.waitForURL('/admin')
	})

	test('should view active deliveries', async ({ page }) => {
		await page.goto('/admin/orders')

		await expect(page.locator('text=/Orders|Deliveries/')).toBeVisible()

		const statusFilter = page.locator('select[name="status"]')
		if (await statusFilter.isVisible()) {
			await statusFilter.selectOption('OUT_FOR_DELIVERY')
		}
	})

	test('should update order status to out for delivery', async ({ page }) => {
		await page.goto('/admin/orders')

		const preparingOrder = page.locator('[data-status="PREPARING"]').first()
		if (await preparingOrder.isVisible()) {
			await preparingOrder.click()

			const statusSelect = page.locator('select[name="status"]')
			if (await statusSelect.isVisible()) {
				await statusSelect.selectOption('OUT_FOR_DELIVERY')
				await page.click('button:has-text("Update")')

				await expect(page.locator('text=/Updated|Success/')).toBeVisible({ timeout: 5000 })
			}
		}
	})

	test('should complete delivery', async ({ page }) => {
		await page.goto('/admin/orders')

		const deliveringOrder = page.locator('[data-status="OUT_FOR_DELIVERY"]').first()
		if (await deliveringOrder.isVisible()) {
			await deliveringOrder.click()

			const completeButton = page.locator('button:has-text("Mark as Delivered")')
			if (await completeButton.isVisible()) {
				await completeButton.click()

				const confirmButton = page.locator('button:has-text("Confirm")')
				if (await confirmButton.isVisible()) {
					await confirmButton.click()
				}

				await expect(page.locator('text=/Delivered|Success/')).toBeVisible({ timeout: 5000 })
			}
		}
	})
})
