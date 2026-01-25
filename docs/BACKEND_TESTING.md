# 🧪 Backend Testing Guide

## Backend Test Tuzilmasi

Backend testlar 2 turga bo'lingan:

### 1. **Unit Tests** (`tests/unit/`)

- Controllers testlari
- Middleware testlari
- Utils testlari
- Validators testlari

### 2. **Integration Tests** (`tests/integration/`)

- API endpoint testlari
- To'liq request/response flow testlari

## Backend Testlarni Ishga Tushirish

### Barcha testlar

```bash
cd backend
npm test
```

### Faqat unit testlar

```bash
cd backend
npm run test:unit
```

### Faqat integration testlar

```bash
cd backend
npm run test:integration
```

### Watch mode

```bash
cd backend
npm run test:watch
```

### Coverage bilan

```bash
cd backend
npm test
# Coverage avtomatik hisoblanadi
```

## Root Papkadan Backend Testlari

```bash
# Root papkadan
npm run test:backend

# Watch mode
npm run test:backend:watch

# Coverage
npm run test:backend:coverage
```

## Mavjud Test Fayllari

### Controllers (15 ta)

- `auth.controller.test.ts`
- `orders.controller.test.ts`
- `products.controller.test.ts`
- `tracking.controller.test.ts` ⭐
- `notifications.controller.test.ts`
- `dashboard.controller.test.ts`
- `categories.controller.test.ts`
- `deals.controller.test.ts`
- `coupons.controller.test.ts`
- `toppings.controller.test.ts`
- `users.controller.test.ts`
- `analytics.controller.test.ts`
- `firebase-auth.controller.test.ts`

### Integration Tests (3 ta)

- `auth.api.test.ts`
- `orders.api.test.ts`
- `products.api.test.ts`

### Middleware Tests (3 ta)

- `auth.middleware.test.ts`
- `admin.middleware.test.ts`
- `errorHandler.test.ts`

### Utils Tests (3 ta)

- `errors.test.ts`
- `gps.utils.test.ts` ⭐ (Tracking uchun)
- `validators.test.ts`

## Test Misollari

### Unit Test Misoli

```typescript
describe('Tracking Controller', () => {
	it('should update driver location', async () => {
		const mockReq = {
			user: { id: 'driver-1' },
			body: { lat: 41.3, lng: 69.24 },
		}

		await updateDriverLocation(mockReq, mockRes)

		expect(mockRes.json).toHaveBeenCalledWith({
			success: true,
			message: 'Location updated',
		})
	})
})
```

### Integration Test Misoli

```typescript
describe('POST /api/orders', () => {
	it('should create a new order', async () => {
		const response = await request(app)
			.post('/api/orders')
			.set('Authorization', `Bearer ${token}`)
			.send(orderData)

		expect(response.status).toBe(201)
		expect(response.body.success).toBe(true)
	})
})
```

## Test Coverage

Backend testlar quyidagilarni qamrab oladi:

- ✅ Authentication & Authorization
- ✅ Order Management
- ✅ Product CRUD
- ✅ GPS Tracking ⭐
- ✅ Notifications
- ✅ Dashboard Analytics
- ✅ Error Handling
- ✅ Middleware Validation

## Tracking Testlari

Tracking funksiyasi uchun maxsus testlar:

### `tracking.controller.test.ts`

- Driver location yangilash
- Order tracking ma'lumotlarini olish
- Delivery tracking boshlash
- Delivery tugallash
- Active deliveries ro'yxati

### `gps.utils.test.ts`

- Masofa hisoblash
- ETA (Estimated Time of Arrival) hisoblash
- Location validatsiya
- Nearby detection

## Test Ishga Tushirish Tartibi

1. **Development paytida**:

   ```bash
   npm run test:watch
   ```

2. **Commit qilishdan oldin**:

   ```bash
   npm test
   ```

3. **CI/CD da**:
   ```bash
   npm test
   # Coverage hisoboti avtomatik yaratiladi
   ```

## Troubleshooting

### Database bilan bog'liq xatolar

Testlarda Prisma mock qilingan, lekin agar real database kerak bo'lsa:

```bash
# Test database yaratish
DATABASE_URL="postgresql://..." npm test
```

### Port band bo'lsa

Backend server test paytida ishlamaydi, faqat mock qilinadi.

---

**Backend testlar to'liq yozilgan va ishga tayyor! 🚀**
