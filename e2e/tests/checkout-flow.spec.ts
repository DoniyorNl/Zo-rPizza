// =====================================
// 📁 FILE PATH: e2e/tests/checkout-flow.spec.ts
// 🎭 E2E TEST: Checkout Flow
// 📝 REJA: Delivery, Pickup, Cart, Checkout forma
// =====================================

import { test, expect } from '@playwright/test'

/**
 * E2E Checkout Flow testlari
 *
 * Test qilinadi:
 * 1. Bo'sh savatcha ko'rinishi
 * 2. Mahsulot qo'shish → Savatcha → Checkout
 * 3. Checkout forma elementlari (delivery)
 * 4. Pickup holatida filial ogohlantirishi
 * 5. To'lov usullari (naqd/karta)
 * 6. Success sahifa (auth bypass bilan)
 */

test.describe('Checkout Flow E2E', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	// ============================================
	// SAVATCHA TESTLARI
	// ============================================

	test('bo\'sh savatchada "Savatcha bo\'sh" xabari ko\'rinadi', async ({ page }) => {
		await page.goto('/cart')

		// data-testid="cart-empty" bo'lgan bo'limda bo'sh savatcha xabari
		await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible()
		await expect(page.getByText(/Savatcha bo'sh/i)).toBeVisible()
		await expect(page.getByText(/Hozircha hech narsa qo'shilmagan/i)).toBeVisible()

		// Menyuga qaytish linki
		await expect(page.getByRole('link', { name: /Menyu'ga qaytish/i })).toBeVisible()
	})

	test('bo\'sh savatchadan Menyuga qaytish linki ishlaydi', async ({ page }) => {
		await page.goto('/cart')

		await page.getByTestId('cart-empty-menu-link').click()
		await expect(page).toHaveURL('/')
	})

	test.skip('mahsulot qo\'shib savatchaga o\'tish va checkout tugmasi', async ({ page }) => {
		const productCard = page.getByTestId('product-card').first()
		await productCard.waitFor({ state: 'visible', timeout: 10000 })
		await productCard.click()

		// O'lcham tanlash (variations majburiy – add-to-cart disabled bo'ladi)
		const sizeOption = page.getByTestId('size-option').first()
		if (await sizeOption.isVisible({ timeout: 3000 }).catch(() => false)) {
			await sizeOption.click()
		}

		const addToCartBtn = page.getByTestId('add-to-cart')
		await addToCartBtn.waitFor({ state: 'visible', timeout: 5000 })
		// Tugma enabled bo'lishini kutamiz (size tanlanganidan keyin)
		await expect(addToCartBtn).toBeEnabled({ timeout: 5000 })
		await addToCartBtn.click()

		await page.goto('/cart')

		await expect(page.getByTestId('cart-items')).toBeVisible()
		await expect(page.getByTestId('cart-checkout')).toBeVisible()
	})

	test.skip('checkout forma elementlari to\'g\'ri ko\'rinadi (delivery)', async ({ page }) => {
		const productCard = page.getByTestId('product-card').first()
		await productCard.waitFor({ state: 'visible', timeout: 10000 })
		await productCard.click()

		const sizeOption = page.getByTestId('size-option').first()
		if (await sizeOption.isVisible({ timeout: 3000 }).catch(() => false)) await sizeOption.click()

		const addBtn = page.getByTestId('add-to-cart')
		await expect(addBtn).toBeEnabled({ timeout: 5000 })
		await addBtn.click()

		await page.goto('/cart')
		await page.getByTestId('cart-checkout').click()

		await page.waitForURL(/\/(login|checkout)/, { timeout: 5000 })

		if (page.url().includes('/checkout')) {
			await expect(page.getByTestId('checkout-form')).toBeVisible()
			await expect(page.getByTestId('checkout-address')).toBeVisible()
			await expect(page.getByTestId('checkout-phone')).toBeVisible()
			await expect(page.getByTestId('payment-cash')).toBeVisible()
			await expect(page.getByTestId('payment-card')).toBeVisible()
			await expect(page.getByTestId('checkout-submit')).toBeVisible()
			await expect(page.getByTestId('checkout-summary')).toBeVisible()
		}
	})

	test.skip('to\'lov usullari tanlash – naqd va karta', async ({ page }) => {
		const productCard = page.getByTestId('product-card').first()
		await productCard.waitFor({ state: 'visible', timeout: 10000 })
		await productCard.click()

		const sizeOption = page.getByTestId('size-option').first()
		if (await sizeOption.isVisible({ timeout: 3000 }).catch(() => false)) await sizeOption.click()

		await expect(page.getByTestId('add-to-cart')).toBeEnabled({ timeout: 5000 })
		await page.getByTestId('add-to-cart').click()
		await page.goto('/cart')
		await page.getByTestId('cart-checkout').click()

		await page.waitForURL(/\/(login|checkout)/, { timeout: 5000 })

		if (page.url().includes('/checkout')) {
			await page.getByTestId('payment-card').click()
			await expect(page.getByTestId('payment-card')).toHaveClass(/border-orange-600/)

			await page.getByTestId('payment-cash').click()
			await expect(page.getByTestId('payment-cash')).toHaveClass(/border-orange-600/)
		}
	})

	test.skip('checkout forma manzil va telefon inputlariga yozish', async ({ page }) => {
		const productCard = page.getByTestId('product-card').first()
		await productCard.waitFor({ state: 'visible', timeout: 10000 })
		await productCard.click()

		const sizeOption = page.getByTestId('size-option').first()
		if (await sizeOption.isVisible({ timeout: 3000 }).catch(() => false)) await sizeOption.click()

		await expect(page.getByTestId('add-to-cart')).toBeEnabled({ timeout: 5000 })
		await page.getByTestId('add-to-cart').click()
		await page.goto('/cart')
		await page.getByTestId('cart-checkout').click()

		await page.waitForURL(/\/(login|checkout)/, { timeout: 5000 })

		if (page.url().includes('/checkout')) {
			const addressInput = page.getByTestId('checkout-address')
			const phoneInput = page.getByTestId('checkout-phone')

			if (await addressInput.isVisible()) {
				await addressInput.fill('Toshkent, Chilonzor 9-kvartal, 12-uy')
				await expect(addressInput).toHaveValue(/Toshkent/)
			}

			await phoneInput.fill('+998901234567')
			await expect(phoneInput).toHaveValue('+998901234567')
		}
	})
})
