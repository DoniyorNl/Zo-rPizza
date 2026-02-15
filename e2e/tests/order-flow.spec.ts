// =====================================
// 📁 FILE PATH: e2e/order-flow.spec.ts
// 🎭 E2E TEST: Order Flow
// =====================================

import { test, expect } from '@playwright/test'

test.describe('Order Flow E2E', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test.skip('should complete full order flow', async ({ page }) => {
		// 1. Home page yuklanishi
		await expect(page.getByText(/Zor Pizza/)).toBeVisible()

		// 2. Product'ni tanlash
		const firstProduct = page.getByTestId('product-card').first()
		await firstProduct.waitFor({ state: 'visible', timeout: 10000 })
		await firstProduct.click()

		// 3. Product details page
		await expect(page).toHaveURL(/\/products\//)
		const addToCart = page.getByTestId('add-to-cart')
		await addToCart.waitFor({ state: 'visible', timeout: 5000 })

		// 4. Size tanlash (variations bo'lsa majburiy)
		const sizeButton = page.getByTestId('size-option').first()
		if (await sizeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
			await sizeButton.click()
		}

		// 5. Cart'ga qo'shish
		await addToCart.click()
		await expect(page.getByTestId('cart-count')).toBeVisible({ timeout: 5000 })

		// 6. Cart page'ga o'tish
		await page.getByTestId('cart-button').click()
		await expect(page).toHaveURL('/cart')

		// 7. Checkout tugmasi
		await page.getByTestId('cart-checkout').click()

		// 8. Login qilish (user bo'lmasa)
		if (await page.locator('text=Kirish').isVisible({ timeout: 3000 }).catch(() => false)) {
			await page.goto('/login')
			await page.getByTestId('login-email').fill('test@example.com')
			await page.getByTestId('login-password').fill('testpassword')
			await page.getByTestId('login-submit').click()
			await page.waitForURL(/\/(checkout|$)/, { timeout: 10000 })
			await page.goto('/cart')
			await page.getByTestId('cart-checkout').click()
		}

		// 9. Checkout page - address kiritish
		await expect(page).toHaveURL('/checkout')
		const addressInput = page.getByTestId('checkout-address')
		if (await addressInput.isVisible()) {
			await addressInput.fill('Toshkent, Test ko\'chasi 123')
		}
		await page.getByTestId('checkout-phone').fill('+998901234567')

		// 10. Order berish
		await page.getByTestId('checkout-submit').click()

		// 11. Success message
		await expect(page.getByText(/Buyurtma.*qabul qilindi/)).toBeVisible({ timeout: 15000 })
	})

	test('should show empty cart message', async ({ page }) => {
		await page.goto('/cart')
		await expect(page.getByText(/Savatcha bo'sh/i)).toBeVisible()
	})

	test.skip('should add multiple products to cart', async ({ page }) => {
		// Product 1
		await page.getByTestId('product-card').first().click()
		const size1 = page.getByTestId('size-option').first()
		if (await size1.isVisible({ timeout: 2000 }).catch(() => false)) await size1.click()
		await page.getByTestId('add-to-cart').click()
		await page.goBack()

		// Product 2
		await page.getByTestId('product-card').nth(1).click()
		const size2 = page.getByTestId('size-option').first()
		if (await size2.isVisible({ timeout: 2000 }).catch(() => false)) await size2.click()
		await page.getByTestId('add-to-cart').click()

		// Check cart count (jami quantity)
		await expect(page.getByTestId('cart-count')).toHaveText('2')
	})
})

test.describe('Product Variations', () => {
	test.skip('should select different sizes', async ({ page }) => {
		await page.goto('/')

		await page.getByTestId('product-card').first().click()

		const sizeOptions = page.getByTestId('size-option')
		const count = await sizeOptions.count()

		if (count > 0) {
			// Birinchi size tanlash – narx ko'rinishi
			await sizeOptions.first().click()
			await expect(page.getByTestId('add-to-cart')).toBeEnabled()
		}
	})
})
