// =====================================
// 📁 FILE PATH: e2e/order-flow.spec.ts
// 🎭 E2E TEST: Order Flow
// =====================================

import { test, expect } from '@playwright/test'

test.describe('Order Flow E2E', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('should complete full order flow', async ({ page }) => {
		// 1. Home page yuklanishi
		await expect(page.locator('h1')).toContainText('Zor Pizza')

		// 2. Product'ni tanlash
		const firstProduct = page.locator('[data-testid="product-card"]').first()
		await firstProduct.waitFor({ state: 'visible' })
		await firstProduct.click()

		// 3. Product details page
		await expect(page).toHaveURL(/\/products\//)
		await page.waitForSelector('[data-testid="add-to-cart"]')

		// 4. Size tanlash (agar variations bo'lsa)
		const sizeButton = page.locator('[data-testid="size-option"]').first()
		if (await sizeButton.isVisible()) {
			await sizeButton.click()
		}

		// 5. Cart'ga qo'shish
		await page.click('[data-testid="add-to-cart"]')
		await expect(page.locator('[data-testid="cart-count"]')).toBeVisible()

		// 6. Cart page'ga o'tish
		await page.click('[data-testid="cart-button"]')
		await expect(page).toHaveURL('/cart')

		// 7. Checkout button
		await page.click('[data-testid="checkout-button"]')

		// 8. Login qilish (agar user bo'lmasa)
		if (await page.locator('text=Kirish').isVisible()) {
			await page.click('text=Kirish')
			await page.fill('[data-testid="email-input"]', 'test@example.com')
			await page.fill('[data-testid="password-input"]', 'testpassword')
			await page.click('[data-testid="login-button"]')
		}

		// 9. Checkout page - address kiritish
		await expect(page).toHaveURL('/checkout')
		await page.fill('[data-testid="delivery-address"]', 'Toshkent, Test ko\'chasi 123')
		await page.fill('[data-testid="delivery-phone"]', '+998901234567')

		// 10. Order berish
		await page.click('[data-testid="place-order-button"]')

		// 11. Success message
		await expect(page.locator('text=Buyurtma qabul qilindi')).toBeVisible({ timeout: 10000 })

		// 12. Orders page'ga redirect
		await expect(page).toHaveURL(/\/orders/)
	})

	test('should show empty cart message', async ({ page }) => {
		await page.goto('/cart')
		await expect(page.locator('text=Savatingiz bo\'sh')).toBeVisible()
	})

	test('should add multiple products to cart', async ({ page }) => {
		// Product 1
		await page.locator('[data-testid="product-card"]').first().click()
		await page.click('[data-testid="add-to-cart"]')
		await page.goBack()

		// Product 2
		await page.locator('[data-testid="product-card"]').nth(1).click()
		await page.click('[data-testid="add-to-cart"]')

		// Check cart count
		const cartCount = page.locator('[data-testid="cart-count"]')
		await expect(cartCount).toHaveText('2')
	})
})

test.describe('Product Variations', () => {
	test('should select different sizes', async ({ page }) => {
		await page.goto('/')

		// Product'ni tanlash
		await page.locator('[data-testid="product-card"]').first().click()

		// Size variantlarini ko'rish
		const sizeOptions = page.locator('[data-testid="size-option"]')
		const count = await sizeOptions.count()

		if (count > 0) {
			// Har bir size'ni tanlash va narx o'zgarishini tekshirish
			for (let i = 0; i < count; i++) {
				await sizeOptions.nth(i).click()
				await expect(page.locator('[data-testid="selected-price"]')).toBeVisible()
			}
		}
	})
})
