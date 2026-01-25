# 🧪 Testing Guide - Test Qo'llanma

Bu qo'llanmada Zo'r Pizza loyihasida testlarni qanday ishlatish haqida ma'lumot berilgan.

---

## 📋 Mavjud Test Turlari

### Frontend Tests

- **Unit Tests** - Komponentlar va funksiyalar testi (Jest)
- **Integration Tests** - Store va API integration testlari
- **E2E Tests** - To'liq foydalanuvchi oqimi testlari (Playwright)

### Backend Tests

- **Unit Tests** - Controller va service testlari
- **Integration Tests** - API endpoint testlari

---

## 🚀 Test Commandlari

### Root Papkadan (Barcha Testlar)

#### 1️⃣ Barcha testlarni ishga tushirish

```bash
npm test
# yoki
pnpm test
```

Bu command **frontend va backend** testlarini ketma-ket ishga tushiradi.

#### 2️⃣ To'liq test suite (unit + e2e)

```bash
npm run test:all
# yoki
pnpm test:all
```

Bu command barcha unit testlar + E2E testlarni ishga tushiradi.

---

### Frontend Testlari

#### Alohida frontend testlari

```bash
# Root papkadan
npm run test:frontend

# Yoki frontend papkasida
cd frontend
npm test
```

#### Watch mode (o'zgarishlarni kuzatish)

```bash
# Root papkadan
npm run test:frontend:watch

# Frontend papkasida
cd frontend
npm run test:watch
```

#### Coverage bilan (qamrov hisoboti)

```bash
# Root papkadan
npm run test:frontend:coverage

# Frontend papkasida
cd frontend
npm run test:coverage
```

#### E2E testlar (Playwright)

```bash
# Root papkadan
npm run test:e2e

# Frontend papkasida
cd frontend
npm run test:e2e
```

#### E2E testlar UI mode bilan

```bash
# Root papkadan
npm run test:e2e:ui

# Frontend papkasida
cd frontend
npm run test:e2e:ui
```

---

### Backend Testlari

#### Alohida backend testlari

```bash
# Root papkadan
npm run test:backend

# Backend papkasida
cd backend
npm test
```

#### Watch mode

```bash
# Root papkadan
npm run test:backend:watch

# Backend papkasida
cd backend
npm run test:watch
```

#### Coverage bilan

```bash
# Root papkadan
npm run test:backend:coverage

# Backend papkasida
cd backend
npm test
```

#### Faqat unit testlar

```bash
cd backend
npm run test:unit
```

#### Faqat integration testlar

```bash
cd backend
npm run test:integration
```

---

## 📊 Test Natijalarini Tushunish

### Jest Output

```
PASS  __tests__/components/Header.test.tsx
  ✓ Header renders correctly (25ms)
  ✓ Shows user menu when logged in (15ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

### Coverage Report

```
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
components/Header   |   85.5  |   75.0   |   90.0  |   85.5  |
```

- **% Stmts** - Kod qatorlari qamrovi
- **% Branch** - If/else shoxobchalar qamrovi
- **% Funcs** - Funksiyalar qamrovi
- **% Lines** - Kod satrlari qamrovi

---

## 💡 Maslahatlar

### 1. Development paytida

Watch mode ishlatish tavsiya etiladi:

```bash
npm run test:frontend:watch
```

### 2. Commit qilishdan oldin

Barcha testlarni ishga tushiring:

```bash
npm run test:all
```

### 3. CI/CD uchun

Coverage bilan testlarni ishga tushiring:

```bash
npm run test:frontend:coverage
npm run test:backend:coverage
```

### 4. Debugging uchun

E2E testlarni UI mode bilan ishga tushiring:

```bash
npm run test:e2e:ui
```

---

## 🔧 Test Konfiguratsiyalari

### Frontend

- **Jest Config**: `frontend/jest.config.cjs`
- **Playwright Config**: `e2e/playwright.config.ts`
- **Test Files**: `frontend/__tests__/**/*.test.tsx`

### Backend

- **Jest Config**: `backend/jest.config.js`
- **Test Files**: `backend/tests/**/*.test.ts`

---

## 📝 Yangi Test Yozish

### Frontend Component Test

```typescript
// __tests__/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Backend Controller Test

```typescript
// tests/unit/myController.test.ts
import { myController } from '@/controllers/myController'

describe('MyController', () => {
	it('returns correct data', async () => {
		const result = await myController.getData()
		expect(result).toBeDefined()
	})
})
```

### E2E Test

```typescript
// e2e/tests/my-flow.spec.ts
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
	await page.goto('http://localhost:3000')
	await page.click('text=Login')
	await expect(page).toHaveURL(/.*login/)
})
```

---

## 🐛 Troubleshooting

### Test ishlamasa:

1. Dependencies o'rnatilganini tekshiring:

   ```bash
   pnpm install
   ```

2. Database ishga tushganini tekshiring (backend testlar uchun)

3. Environment variables to'g'ri sozlanganini tekshiring:
   - `frontend/.env.local`
   - `backend/.env`

4. Cache tozalang:

   ```bash
   # Frontend
   cd frontend
   rm -rf .next

   # Backend
   cd backend
   rm -rf node_modules/.cache
   ```

---

## 📚 Qo'shimcha Resurslar

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)

---

**Savollar bo'lsa, development team bilan bog'laning! 🚀**
