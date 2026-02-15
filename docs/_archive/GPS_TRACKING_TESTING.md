# 🧪 GPS TRACKING SYSTEM - Testing Guide

## Zo'r Pizza Delivery - Manual Testing

> **📅 Sana:** 7 Fevral 2026  
> **🎯 Maqsad:** GPS tracking tizimini sinash va verify qilish  
> **⏱️ Vaqt:** 30-45 daqiqa

---

## 📋 Pre-requisites

### 1. Backend Running

```bash
cd backend
pnpm dev

# Output:
# 🚀 Server is running on http://localhost:5001
```

### 2. Frontend Running

```bash
cd frontend
pnpm dev

# Output:
# - Local: http://localhost:3000
```

### 3. Database Connection

```bash
cd backend
pnpm prisma studio

# Prisma Studio: http://localhost:5555
```

---

## 🧪 TEST PLAN

### Test 1: Driver Authentication ✅

**Maqsad:** Driver sifatida tizimga kirish

**Steps:**

1. Browser da ochish: `http://localhost:3000/login`
2. Driver accounti bilan login qilish:
   - Email: `driver@test.com`
   - Password: `testpassword`
3. Redirect bo'lishi kerak: `/driver/dashboard`

**Expected Result:**

- ✓ Login muvaffaqiyatli
- ✓ Driver dashboard ochildi
- ✓ Header da driver nomi ko'rinadi
- ✓ Stats cards ko'rinadi

---

### Test 2: Dashboard - Active Orders ✅

**Maqsad:** Aktiv buyurtmalarni ko'rish

**Steps:**

1. Driver dashboard oching
2. "Aktiv buyurtmalar" bo'limini ko'ring
3. Buyurtma kartalarini tekshiring

**Expected Result:**

- ✓ Buyurtmalar ro'yxati ko'rinadi
- ✓ Har bir buyurtmada:
  - Order number (#0001)
  - Customer name va phone
  - Delivery address
  - Status badge (Confirmed, Out for Delivery)
  - Price
  - Action button

**Sample Test Data:**

```sql
-- Prisma Studio orqali yangi order yaratish
-- status: CONFIRMED
-- driverId: <your-driver-id>
```

---

### Test 3: GPS Permission Request ✅

**Maqsad:** GPS ruxsat so'rash va berish

**Steps:**

1. Aktiv order kartasida "Batafsil ko'rish" tugmasini bosing
2. Delivery tracker page ochiladi
3. "Deliveryni Boshlash" tugmasini bosing
4. Browser GPS permission dialog ko'rinadi
5. "Allow" tugmasini bosing

**Expected Result:**

- ✓ GPS permission so'raladi
- ✓ Permission granted bo'ladi
- ✓ GPS tracking boshlanadi
- ✓ Green banner ko'rinadi: "GPS Tracking Faol"

**Troubleshooting:**

```
Agar permission denied:
1. Chrome: Settings → Privacy → Location → Allow
2. Firefox: about:preferences#privacy → Permissions → Location
3. Safari: Preferences → Websites → Location
```

---

### Test 4: Start Delivery + GPS Tracking ✅

**Maqsad:** Deliveryni boshlash va GPS ni yoqish

**Steps:**

1. Delivery tracker page: `/driver/delivery/:orderId`
2. "Deliveryni Boshlash" tugmasini bosing
3. GPS permission bering
4. 5 soniya kuting

**Expected Result:**

- ✓ Delivery status: OUT_FOR_DELIVERY
- ✓ GPS tracking faol (green banner)
- ✓ Map component ko'rinadi
- ✓ Driver marker mapda ko'rinadi
- ✓ Customer marker mapda ko'rinadi

**Backend Check:**

```bash
# Backend logs tekshirish
# Har 5 sekundda quyidagi log chiqishi kerak:
POST /api/tracking/update-location 200
```

**Database Check:**

```sql
-- Prisma Studio:
-- Order -> driverLocation field
-- Har 5 sekundda yangilanishi kerak
{
  "lat": 41.311,
  "lng": 69.249,
  "timestamp": 1707328845000
}
```

---

### Test 5: Real-time Map Updates ✅

**Maqsad:** Mapning real-time yangilanishini tekshirish

**Method 1: Fake GPS (Chrome DevTools)**

**Steps:**

1. Chrome da delivery tracker ochilgan
2. F12 → Console
3. Quyidagi kodni ishga tushiring:

```javascript
// Fake GPS coordinates (Toshkent atrofida)
const fakeCoords = [
	{ lat: 41.3111, lng: 69.2496 },
	{ lat: 41.3105, lng: 69.249 },
	{ lat: 41.31, lng: 69.2485 },
	{ lat: 41.3095, lng: 69.248 },
	{ lat: 41.309, lng: 69.2475 },
]

let index = 0
const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition

navigator.geolocation.getCurrentPosition = function (success, error, options) {
	const pos = fakeCoords[index % fakeCoords.length]
	index++

	success({
		coords: {
			latitude: pos.lat,
			longitude: pos.lng,
			accuracy: 10,
			altitude: null,
			altitudeAccuracy: null,
			heading: null,
			speed: null,
		},
		timestamp: Date.now(),
	})
}

console.log('✅ Fake GPS active!')
```

**Expected Result:**

- ✓ Driver marker har 5 sekundda harakat qiladi
- ✓ Map auto-zoom bo'ladi
- ✓ Backend logs: POST /api/tracking/update-location 200
- ✓ Database: driverLocation yangilanadi

---

### Test 6: Two Browser Test 🌐

**Maqsad:** Customer va Driver bir vaqtda ishlashini sinash

**Setup:**

- **Browser 1 (Chrome):** Customer tracking view
- **Browser 2 (Firefox):** Driver delivery view

**Steps:**

**Browser 1 (Customer):**

1. Login as customer
2. Create order
3. Open tracking: `http://localhost:3000/tracking/:orderId`

**Browser 2 (Driver):**

1. Login as driver
2. Go to dashboard
3. Accept order
4. Start delivery + GPS tracking

**Expected Result:**

- ✓ Browser 1: Map ko'rinadi
- ✓ Browser 1: Driver location real-time yangilanadi
- ✓ Browser 1: Distance va ETA ko'rsatiladi
- ✓ Browser 2: GPS tracking faol
- ✓ Browser 2: Map driver locationni ko'rsatadi

**Customer Polling:**
Browser 1 da har 10 sekundda backend dan data olinadi:

```
GET /api/tracking/order/:orderId 200
```

---

### Test 7: Complete Delivery ✅

**Maqsad:** Deliveryni yakunlash

**Steps:**

1. Driver delivery tracker da
2. "Deliveryni Yakunlash" tugmasini bosing
3. Confirmation dialog: "Ha"

**Expected Result:**

- ✓ Order status: DELIVERED
- ✓ GPS tracking to'xtaydi
- ✓ Redirect: /driver/dashboard
- ✓ Success message ko'rinadi

**Database Check:**

```sql
-- Order:
status: DELIVERED
deliveryCompletedAt: <timestamp>
```

---

## 🐛 Troubleshooting

### GPS Ishlamayapti?

**1. Browser qo'llab-quvvatlaydimi?**

```javascript
// Console:
'geolocation' in navigator
// true bo'lishi kerak
```

**2. Permission status?**

```javascript
// Console:
navigator.permissions.query({ name: 'geolocation' }).then(result => console.log(result.state))
// 'granted' bo'lishi kerak
```

**3. HTTPS kerakmi?**

- Development: localhost → GPS works
- Production: HTTPS required

---

### Map Ko'rinmayapti?

**1. driverLocation null?**

```bash
# Backend check:
GET /api/tracking/order/:orderId
# Response:
{
  "tracking": {
    "driverLocation": { "lat": ..., "lng": ... }
  }
}
```

**2. TrackingMap props?**

```typescript
<TrackingMap
  driverLocation={location}  // not null
  deliveryLocation={order.deliveryLocation}  // not null
/>
```

---

### Backend 500 Error?

**1. Database connection?**

```bash
cd backend
pnpm prisma db pull
```

**2. Logs tekshirish:**

```bash
cd backend
pnpm dev

# Terminal da xatolarni o'qing
```

---

## ✅ Test Checklist

- [ ] Driver login successful
- [ ] Dashboard loads with orders
- [ ] GPS permission granted
- [ ] Delivery started successfully
- [ ] GPS tracking active (green banner)
- [ ] Location updates every 5 seconds
- [ ] Map shows driver marker
- [ ] Map shows customer marker
- [ ] Two browser test passed
- [ ] Complete delivery successful
- [ ] Backend logs clean (no errors)
- [ ] Database updates correct

---

## 📊 Performance Metrics

### GPS Accuracy

- **Desktop:** ±50-500m (IP-based)
- **Mobile:** ±10-50m (GPS chip)
- **Target:** <50m (high accuracy mode)

### Update Frequency

- **Driver → Backend:** 5 seconds
- **Customer polling:** 10 seconds
- **Map refresh:** Instant

### Response Times

- **POST /tracking/update-location:** <200ms
- **GET /tracking/order/:id:** <300ms

---

## 🚀 Production Testing

### Pre-deployment

1. ✅ All tests passed locally
2. ✅ Backend deployed (Railway)
3. ✅ Frontend deployed (Vercel)
4. ✅ HTTPS enabled
5. ✅ Environment variables set

### Post-deployment

```bash
# Test production API
curl https://api.zorpizza.uz/api/tracking/order/test-id \
  -H "Authorization: Bearer production-token"

# Test frontend
open https://zorpizza.uz/driver/dashboard
```

---

## 📝 Test Report Template

```markdown
# GPS Tracking Test Report

**Date:** 7 Fevral 2026
**Tester:** [Your Name]
**Environment:** Development

## Results

### ✅ Passed Tests

- Driver authentication
- Dashboard loading
- GPS permission
- Start delivery
- Real-time updates
- Two browser test
- Complete delivery

### ❌ Failed Tests

- None

### 🐛 Bugs Found

- None

### 📈 Performance

- GPS accuracy: ±15m
- Update latency: 5.2s avg
- Backend response: 180ms avg

## Recommendation

✅ Ready for production deployment
```

---

## 🎯 Xulosa

Barcha testlar muvaffaqiyatli o'tsa:

1. ✅ GPS tracking ishlayapti
2. ✅ Real-time updates faol
3. ✅ Map integration to'g'ri
4. ✅ Backend API barqaror

**Keyingi qadam:** Production deployment! 🚀

---

**Test completed!** ✅
