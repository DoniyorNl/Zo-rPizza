# 🧪 Testing Documentation

## Loyiha uchun test strategiyasi

### Test turlari

1. **Unit Tests** — Alohida funksiya/component testlari
2. **Integration Tests** — API endpoint testlari
3. **E2E Tests** — To'liq user flow testlari

---

## Backend Testing

### Setup

```bash
cd backend
npm install
```

### Test dependencies

- `jest` - Test framework
- `ts-jest` - TypeScript support
- `supertest` - API testing
- `jest-mock-extended` - Prisma mocking

### Running tests

```bash
# Barcha testlar
npm test

# Watch mode (development)
npm run test:watch

# Faqat unit tests
npm run test:unit

# Faqat integration tests
npm run test:integration

# Coverage report
npm test -- --coverage
```

### Test fayllari

- `tests/setup.ts` - Global setup, mocks
- `tests/unit/controllers/` - Controller unit testlari
- `tests/integration/` - API integration testlari

### Example: Unit Test

```typescript
import { createProduct } from '../../../src/controllers/products.controller'
import { prismaMock } from '../../setup'

describe('createProduct', () => {
  it('should create product successfully', async () => {
    const mockProduct = { id: '1', name: 'Pizza' }
    prismaMock.product.create.mockResolvedValue(mockProduct)

    await createProduct(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(201)
  })
})
```

### Coverage Target

- **Lines**: 70%+
- **Functions**: 70%+
- **Branches**: 70%+

---

## Frontend Testing

### Setup

```bash
cd frontend
npm install
```

### Test dependencies

- `jest` - Test framework
- `@testing-library/react` - Component testing
- `@testing-library/jest-dom` - DOM matchers
- `@testing-library/user-event` - User interactions

### Running tests

```bash
# Barcha testlar
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Test fayllari

- `jest.setup.js` - Global setup
- `__tests__/hooks/` - Hook testlari
- `__tests__/components/` - Component testlari

### Example: Hook Test

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useNotifications } from '@/hooks/useNotifications'

describe('useNotifications', () => {
  it('should fetch notifications', async () => {
    const { result } = renderHook(() => useNotifications())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.notifications).toBeDefined()
  })
})
```

### Coverage Target

- **Lines**: 50%+
- **Functions**: 50%+
- **Branches**: 50%+

---

## E2E Testing

### Setup

```bash
# Root directory'da
npm install -D @playwright/test
npx playwright install
```

### Running E2E tests

```bash
# Barcha E2E testlar
npm run test:e2e

# UI mode (interactive)
npm run test:e2e:ui

# Specific test
npx playwright test e2e/order-flow.spec.ts

# Debug mode
npx playwright test --debug
```

### Test fayllari

- `e2e/order-flow.spec.ts` - Buyurtma flow
- `e2e/admin-operations.spec.ts` - Admin operatsiyalar
- `playwright.config.ts` - Playwright configuration

### Browsers

- Chromium (Chrome)
- Firefox
- WebKit (Safari)
- Mobile Chrome

---

## Error Handling

### Backend Error Classes

```typescript
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/utils/errors'

// Example usage
throw new BadRequestError('Invalid input')
throw new NotFoundError('Product')
throw new UnauthorizedError()
```

### Frontend Error Boundary

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Error Tracking

```typescript
import { logError, getAxiosErrorMessage } from '@/lib/errorTracking'

try {
  // Your code
} catch (error) {
  logError(error, { context: 'additional info' })
  const message = getAxiosErrorMessage(error)
  showToast(message)
}
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd backend && npm install
      - run: cd backend && npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd frontend && npm install
      - run: cd frontend && npm test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npx playwright install
      - run: npm run test:e2e
```

---

## Best Practices

1. **Test nomi aniq bo'lsin**: `should return 200 when user is authenticated`
2. **AAA pattern**: Arrange, Act, Assert
3. **Mock external dependencies**: Database, Firebase, API calls
4. **Test edge cases**: null, undefined, empty arrays, errors
5. **Keep tests isolated**: Har bir test mustaqil
6. **Use data generators**: `generateMockUser()`, `generateMockProduct()`
7. **Cleanup after tests**: `beforeEach`, `afterEach`

---

## Troubleshooting

### Backend test xatolari

```bash
# Prisma client regenerate
cd backend && npx prisma generate

# Clear Jest cache
cd backend && npx jest --clearCache
```

### Frontend test xatolari

```bash
# Clear Next.js cache
cd frontend && rm -rf .next

# Clear Jest cache
cd frontend && npx jest --clearCache
```

### E2E test xatolari

```bash
# Reinstall browsers
npx playwright install --with-deps

# Check if dev server is running
curl http://localhost:3000
```

---

## Coverage Reports

Coverage hisobotlari `coverage/` papkasida saqlanadi:

```bash
# Backend
cd backend && npm test -- --coverage
open coverage/lcov-report/index.html

# Frontend
cd frontend && npm test -- --coverage
open coverage/lcov-report/index.html
```

---

## Next Steps

1. ✅ Test environment sozlash
2. ✅ Unit tests yozish
3. ✅ Integration tests yozish
4. ✅ E2E tests yozish
5. ⏳ CI/CD pipeline qo'shish
6. ⏳ Coverage 70%+ ga yetkazish
7. ⏳ Pre-commit hooks (Husky)
8. ⏳ Test documentation to'ldirish
