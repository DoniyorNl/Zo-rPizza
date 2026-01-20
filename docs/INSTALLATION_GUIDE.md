# 📦 Installation Guide

## Testing & Error Handling Setup

### 1. Backend Dependencies

```bash
cd backend
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest jest-mock-extended
npm install winston
```

### 2. Frontend Dependencies

```bash
cd frontend
npm install --save-dev jest @types/jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @swc/jest identity-obj-proxy
npm install --save-dev @playwright/test
```

### 3. Playwright Setup (E2E)

```bash
# Root directory'da
npx playwright install
npx playwright install-deps
```

---

## Running Tests

### Backend

```bash
cd backend

# Barcha testlar
npm test

# Coverage bilan
npm test -- --coverage

# Specific test file
npm test -- tests/unit/controllers/products.controller.test.ts

# Watch mode
npm run test:watch
```

### Frontend

```bash
cd frontend

# Barcha testlar
npm test

# Coverage bilan
npm run test:coverage

# Watch mode
npm run test:watch
```

### E2E

```bash
# Terminal 1: Backend server
cd backend && npm run dev

# Terminal 2: Frontend server
cd frontend && npm run dev

# Terminal 3: E2E tests
npm run test:e2e

# Interactive UI
npm run test:e2e:ui
```

---

## Troubleshooting

### Backend test xatoliklari

**Problem**: `Cannot find module '@/...'`

**Solution**:
```bash
cd backend
npx prisma generate
npm test
```

**Problem**: `Winston module not found`

**Solution**:
```bash
cd backend
npm install winston
```

### Frontend test xatoliklari

**Problem**: `SyntaxError: Unexpected token 'export'`

**Solution**: Check `jest.config.js` has correct transform settings

**Problem**: `Cannot find module '@testing-library/react'`

**Solution**:
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### E2E test xatoliklari

**Problem**: `browserType.launch: Executable doesn't exist`

**Solution**:
```bash
npx playwright install chromium
```

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:3000`

**Solution**: Make sure frontend dev server is running

---

## Verification

### 1. Backend tests ishlashini tekshirish

```bash
cd backend
npm test -- tests/unit/controllers/products.controller.test.ts
```

Expected output:
```
PASS tests/unit/controllers/products.controller.test.ts
  Products Controller
    getAllProducts
      ✓ should return all products successfully (XXms)
      ✓ should filter products by categoryId (XXms)
      ✓ should handle errors gracefully (XXms)
```

### 2. Frontend tests ishlashini tekshirish

```bash
cd frontend
npm test -- __tests__/hooks/useNotifications.test.tsx
```

Expected output:
```
PASS __tests__/hooks/useNotifications.test.tsx
  useNotifications Hook
    ✓ should fetch notifications on mount (XXXms)
    ✓ should handle fetch error gracefully (XXms)
```

### 3. E2E tests ishlashini tekshirish

```bash
# Servers running bo'lishi kerak
npm run test:e2e -- e2e/order-flow.spec.ts --headed
```

---

## Coverage

Coverage reports `coverage/` papkasida:

```bash
# Backend coverage
cd backend && npm test -- --coverage
open coverage/lcov-report/index.html

# Frontend coverage
cd frontend && npm run test:coverage
open coverage/lcov-report/index.html
```

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/tests.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm test

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm test

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npx playwright install --with-deps
      - run: cd backend && npm install && npm run dev &
      - run: cd frontend && npm install && npm run dev &
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## What's Included

### Backend
- ✅ Jest configuration
- ✅ Test setup with mocks
- ✅ Unit tests (products, users controllers)
- ✅ Integration tests (API endpoints)
- ✅ Middleware tests (auth)
- ✅ Error classes
- ✅ Winston logger
- ✅ Error handler middleware
- ✅ Error logging API

### Frontend
- ✅ Jest configuration
- ✅ Test setup with mocks
- ✅ Hook tests (useNotifications)
- ✅ Component tests (ErrorBoundary)
- ✅ ErrorBoundary component
- ✅ Error tracking service
- ✅ User-friendly error messages
- ✅ Error message utilities

### E2E
- ✅ Playwright configuration
- ✅ Order flow tests
- ✅ Admin operations tests
- ✅ Multi-browser support

---

## Next Actions

1. **Install dependencies**:
   ```bash
   cd backend && npm install
   cd frontend && npm install
   npx playwright install
   ```

2. **Run tests**:
   ```bash
   cd backend && npm test
   cd frontend && npm test
   npm run test:e2e
   ```

3. **Check coverage**:
   ```bash
   cd backend && npm test -- --coverage
   cd frontend && npm run test:coverage
   ```

4. **Write more tests** to increase coverage

---

**Installation complete!** 🎉

All testing and error handling infrastructure is ready.
