// =====================================
// 📁 FILE PATH: e2e/tests/login-register.spec.ts
// 🎭 E2E TEST: Login va Register Flow
// 📝 REJA: Kirish, Ro'yxatdan o'tish, validatsiya, xato xabarlar
// =====================================

import { test, expect } from '@playwright/test'

/**
 * Login va Register E2E testlari
 *
 * Test qilinadi:
 * 1. Login sahifa elementlari
 * 2. Login forma validatsiya (bo'sh yuborish)
 * 3. Login xato xabari (noto'g'ri credential)
 * 4. Register sahifa elementlari
 * 5. Register validatsiya (parol mos kelmasa, qisqa parol)
 * 6. Sahifalar orasidagi navigatsiya
 */

test.describe('Login Page E2E', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login')
	})

	test('login sahifasi to\'g\'ri yuklanadi', async ({ page }) => {
		await expect(page).toHaveURL('/login')
		await expect(page.getByTestId('login-form')).toBeVisible()
		await expect(page.getByText(/Xush kelibsiz/i)).toBeVisible()
		await expect(page.getByText(/Zor Pizza ga kirish/i)).toBeVisible()
	})

	test('login forma elementlari mavjud', async ({ page }) => {
		await expect(page.getByTestId('login-email')).toBeVisible()
		await expect(page.getByTestId('login-password')).toBeVisible()
		await expect(page.getByTestId('login-submit')).toBeVisible()
	})

	test('login bo\'sh forma yuborilganda sahifa /login da qoladi', async ({ page }) => {
		// Bo'sh forma yuborish – HTML5 required yoki Firebase xato
		await page.getByTestId('login-submit').click()

		// Sahifa o'zgarmasligi kerak (redirect bo'lmasa)
		await expect(page).toHaveURL('/login')
	})

	test('login – noto\'g\'ri credential bilan xato xabari', async ({ page }) => {
		await page.getByTestId('login-email').fill('notexisting@test.com')
		await page.getByTestId('login-password').fill('wrongpassword123')
		await page.getByTestId('login-submit').click()

		// Firebase/auth xato beradi – xato xabari ko'rinishi (timeout: auth so'rov vaqti)
		await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 15000 })
	})

	test('Parolni unutdingizmi linki mavjud', async ({ page }) => {
		await expect(page.getByRole('link', { name: /Parolni unutdingizmi/i })).toBeVisible()
		await expect(page.getByRole('link', { name: /Parolni unutdingizmi/i })).toHaveAttribute(
			'href',
			'/forgot-password',
		)
	})

	test('Ro\'yxatdan o\'tish linki login sahifasida', async ({ page }) => {
		const registerLink = page.getByRole('link', { name: /Ro'yxatdan o'tish/i })
		await expect(registerLink).toBeVisible()
		await registerLink.click()
		await expect(page).toHaveURL('/register')
	})
})

test.describe('Register Page E2E', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/register')
	})

	test('register sahifasi to\'g\'ri yuklanadi', async ({ page }) => {
		await expect(page).toHaveURL('/register')
		await expect(page.getByTestId('register-form')).toBeVisible()
		await expect(page.getByText(/akkaunt yarating|Ro'yxatdan|yarating va buyurtma/i)).toBeVisible()
	})

	test('register forma elementlari mavjud', async ({ page }) => {
		await expect(page.getByTestId('register-email')).toBeVisible()
		await expect(page.getByTestId('register-password')).toBeVisible()
		await expect(page.getByTestId('register-confirm-password')).toBeVisible()
		await expect(page.getByTestId('register-submit')).toBeVisible()
	})

	test('register – parol mos kelmasa xato', async ({ page }) => {
		await page.getByTestId('register-email').fill('test@example.com')
		await page.getByTestId('register-password').fill('password123')
		await page.getByTestId('register-confirm-password').fill('password456')
		await page.getByTestId('register-submit').click()

		await expect(page.getByTestId('register-error')).toBeVisible()
		await expect(page.getByText(/Parollar mos kelmadi/i)).toBeVisible()
	})

	test('register – qisqa parol xato', async ({ page }) => {
		await page.getByTestId('register-email').fill('test@example.com')
		await page.getByTestId('register-password').fill('123')
		await page.getByTestId('register-confirm-password').fill('123')
		await page.getByTestId('register-submit').click()

		await expect(page.getByTestId('register-error')).toBeVisible()
		// "Parol kamida 6 ta belgidan iborat bo'lishi kerak"
		await expect(page.locator('[data-testid="register-error"]')).toContainText(/6|belgi|belgidan/i)
	})

	test('register – Kirish linki orqali login sahifasiga', async ({ page }) => {
		const loginLink = page.getByRole('link', { name: /Kirish/i })
		await expect(loginLink).toBeVisible()
		await loginLink.click()
		await expect(page).toHaveURL('/login')
	})
})
