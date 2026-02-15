// =====================================
// 📁 FILE PATH: e2e/admin-operations.spec.ts
// 🎭 E2E TEST: Admin Operations
// =====================================

import { test, expect } from '@playwright/test'

test.describe('Admin Operations E2E', () => {
	test.beforeEach(async ({ page }) => {
		// Login as admin
		await page.goto('/login')
		await page.fill('[data-testid="login-email"]', 'admin@zorpizza.uz')
		await page.fill('[data-testid="login-password"]', 'adminpassword')
		await page.click('[data-testid="login-submit"]')

		// Wait for redirect
		await page.waitForURL('/')

		// Go to admin panel
		await page.goto('/admin')
	})

	test('should access admin dashboard', async ({ page }) => {
		await expect(page).toHaveURL('/admin')
		await expect(page.locator('text=Dashboard')).toBeVisible()
		await expect(page.locator('text=Bugun')).toBeVisible()
	})

	test('should create new product', async ({ page }) => {
		// Products page'ga o'tish
		await page.click('text=Mahsulotlar')
		await expect(page).toHaveURL('/admin/products')

		// Create button
		await page.click('[data-testid="create-product-button"]')

		// Form to'ldirish
		await page.fill('[data-testid="product-name"]', 'Test Pizza E2E')
		await page.fill('[data-testid="product-description"]', 'E2E test product')
		await page.fill('[data-testid="product-price"]', '75000')
		await page.fill('[data-testid="product-preptime"]', '25')
		await page.selectOption('[data-testid="product-category"]', { index: 0 })

		// Save
		await page.click('[data-testid="save-product-button"]')

		// Success message
		await expect(page.locator('text=Mahsulot yaratildi')).toBeVisible({ timeout: 5000 })

		// Table'da ko'rinishi
		await expect(page.locator('text=Test Pizza E2E')).toBeVisible()
	})

	test('should update order status', async ({ page }) => {
		// Orders page
		await page.click('text=Buyurtmalar')
		await expect(page).toHaveURL('/admin/orders')

		// Order'ni tanlash
		const firstOrder = page.locator('[data-testid="order-row"]').first()
		if (await firstOrder.isVisible()) {
			// Status o'zgartirish
			const statusSelect = firstOrder.locator('[data-testid="order-status-select"]')
			await statusSelect.selectOption('CONFIRMED')

			// Success message
			await expect(page.locator('text=Status o\'zgartirildi')).toBeVisible({ timeout: 5000 })
		}
	})

	test('should view analytics', async ({ page }) => {
		await page.click('text=Statistika')
		await expect(page).toHaveURL('/admin/analytics')

		// Charts yuklanishi
		await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible({ timeout: 10000 })
		await expect(page.locator('[data-testid="orders-chart"]')).toBeVisible()
	})

	test('should manage users', async ({ page }) => {
		await page.click('text=Foydalanuvchilar')
		await expect(page).toHaveURL('/admin/users')

		// Users table
		await expect(page.locator('[data-testid="users-table"]')).toBeVisible()

		// Filter by role
		await page.selectOption('[data-testid="role-filter"]', 'CUSTOMER')
		await page.waitForTimeout(500)

		// Search
		await page.fill('[data-testid="search-input"]', 'test')
		await page.waitForTimeout(500)
	})

	test('should manage categories', async ({ page }) => {
		await page.click('text=Kategoriyalar')
		await expect(page).toHaveURL('/admin/categories')

		// Create category
		await page.click('[data-testid="create-category-button"]')
		await page.fill('[data-testid="category-name"]', 'Test Category E2E')
		await page.fill('[data-testid="category-description"]', 'E2E test category')
		await page.click('[data-testid="save-category-button"]')

		await expect(page.locator('text=Kategoriya yaratildi')).toBeVisible({ timeout: 5000 })
	})
})
