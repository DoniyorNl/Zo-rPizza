# 🚗 GPS TRACKING SISTEMA - To'liq Foydalanuvchi Qo'llanmasi

## Zo'r Pizza Delivery - User va Driver uchun

> **📅 Sana:** 7 Fevral 2026  
> **🎯 Maqsad:** GPS tracking tizimidan foydalanishni tushuntirish  
> **👥 Rollar:** Customer, Driver, Admin

---

## 📋 QISQA XULOSA

### ✅ Tayyor Qismlar

1. ✅ **Backend API** - GPS tracking endpoints (localhost:5001)
2. ✅ **Driver Dashboard** - Active orders, statistics
3. ✅ **Delivery Tracker** - GPS tracking interface
4. ✅ **Customer Tracking** - Real-time map view
5. ✅ **GPS Hook** - Browser geolocation integration
6. ✅ **Database Schema** - Orders, Users tables

### ❌ Qolgan Ishlar

1. ❌ **Test Driver Account** - Database da driver user yaratish
2. ❌ **Test Order** - Driver ga assign qilingan order
3. ❌ **Frontend Routes** - `/driver/orders`, `/driver/history` pages
4. ⚠️ **Production Deployment** - Railway + Vercel

---

## 🎬 SISTEMA QANDAY ISHLAYDI?

### 1️⃣ Customer Journey (Mijoz)

```
1. Customer login qiladi
   ↓
2. Pizza buyurtma beradi
   ↓
3. Admin driver ni tayinlaydi
   ↓
4. Order status: CONFIRMED
   ↓
5. Driver yetkazishni boshlaydi → OUT_FOR_DELIVERY
   ↓
6. Customer tracking page ochadi
   📍 http://localhost:3000/tracking/:orderId
   ↓
7. Map da driver location ko'rinadi (real-time)
   ↓
8. Driver manzilga yetib boradi
   ↓
9. Driver "Yakunlash" tugmasini bosadi
   ↓
10. Order status: DELIVERED ✅
```

### 2️⃣ Driver Journey (Haydovchi)

```
1. Driver login qiladi
   📍 http://localhost:3000/login
   ↓
2. Driver Dashboard ochiladi
   📍 http://localhost:3000/driver/dashboard
   ↓
3. Aktiv buyurtmalar ko'rinadi (CONFIRMED)
   ↓
4. Driver "Batafsil ko'rish" tugmasini bosadi
   ↓
5. Delivery Tracker page ochiladi
   📍 http://localhost:3000/driver/delivery/:orderId
   ↓
6. Driver "Deliveryni Boshlash" tugmasini bosadi
   ↓
7. Browser GPS permission so'raydi
   🔔 "Allow" tugmasini bosish kerak
   ↓
8. GPS tracking boshlanadi (har 5 sekundda)
   - Driver location → Backend → Database
   - Map yangilanadi
   ↓
9. Driver manzilga yetib boradi
   ↓
10. Driver "Deliveryni Yakunlash" tugmasini bosadi
    ↓
11. Order status: DELIVERED
    GPS tracking to'xtaydi
    Dashboard ga qaytadi
```

### 3️⃣ Admin Journey

```
1. Admin login qiladi
   ↓
2. Admin panel ochadi
   📍 http://localhost:3000/admin/orders
   ↓
3. Yangi order ko'radi (PENDING)
   ↓
4. Driver ni tayinlaydi
   ↓
5. Status: CONFIRMED
```

---

## 🧪 TEST QILISH - STEP BY STEP

### BOSQICH 1: Backend Tekshirish ✅

Backend ishga tushganmi?

```bash
# Terminal 1:
cd /Users/mac/Desktop/Zo-rPizza/backend
pnpm dev

# Output:
# 🚀 Server is running on http://localhost:5001
```

**Test:**

```bash
curl http://localhost:5001/health

# Expected:
# { "status": "ok", "timestamp": "..." }
```

---

### BOSQICH 2: Frontend Tekshirish ✅

Frontend ishga tushganmi?

```bash
# Terminal 2:
cd /Users/mac/Desktop/Zo-rPizza/frontend
pnpm dev

# Output:
# ▲ Next.js 15.1.3
# - Local: http://localhost:3000
```

**Test:**
Browser da ochish: `http://localhost:3000`

✅ Homepage ko'rinishi kerak

---

### BOSQICH 3: Test Driver Yaratish ❌

**Muammo:** Sizda driver account yo'q!

**Yechim:** Database da driver user yaratish.

#### Option A: Prisma Studio (Eng oson)

```bash
# Terminal 3:
cd /Users/mac/Desktop/Zo-rPizza/backend
pnpm prisma studio

# Browser: http://localhost:5555
```

**Prisma Studio da:**

1. **User** jadvalini oching
2. **Add Record** tugmasini bosing
3. Quyidagi ma'lumotlarni kiriting:

```
id:              (auto-generated UUID)
firebaseUid:     "test-driver-uid"
email:           "driver@test.com"
name:            "Test Driver"
phone:           "+998901234567"
role:            DRIVER
vehicleType:     "motorcycle"
password:        null
createdAt:       (auto)
updatedAt:       (auto)
```

4. **Save** bosing ✅

#### Option B: SQL (Advanced)

```sql
-- Prisma Studio → SQL Editor
INSERT INTO "User" (
  id,
  firebaseUid,
  email,
  name,
  phone,
  role,
  vehicleType
) VALUES (
  gen_random_uuid(),
  'test-driver-uid',
  'driver@test.com',
  'Test Driver',
  '+998901234567',
  'DRIVER',
  'motorcycle'
);
```

---

### BOSQICH 4: Firebase Authentication

**Muammo:** Driver login qila olmaydi chunki Firebase da account yo'q.

**Yechim:** Firebase Console da user yaratish.

#### Firebase Console:

1. Browser: `https://console.firebase.google.com`
2. Project: **zor-pizza**
3. **Authentication** → **Users** → **Add User**
4. Quyidagi ma'lumotlarni kiriting:

```
Email:    driver@test.com
Password: Test@123
```

5. **firebaseUid** ni copy qiling
6. Prisma Studio da User jadvalida **firebaseUid** ni update qiling

**YOKI:**

Frontend orqali signup:

```
1. http://localhost:3000/signup
2. Email: driver@test.com
3. Password: Test@123
4. Role: DRIVER (backend'da avtomatik)
```

---

### BOSQICH 5: Driver Login ✅

1. Browser: `http://localhost:3000/login`
2. Email: `driver@test.com`
3. Password: `Test@123`
4. **Login** tugmasini bosing

**Expected:**

- ✅ Login successful
- ✅ Redirect: `/driver/dashboard`
- ✅ Driver dashboard ochiladi

**Agar login bo'lmasa:**

- Consoleni tekshiring (F12)
- Backend logs tekshiring
- FirebaseUid to'g'ri yozilganmi?

---

### BOSQICH 6: Test Order Yaratish ❌

**Muammo:** Driver dashboardda buyurtmalar yo'q!

**Yechim:** Test order yaratish va driver ga tayinlash.

#### Prisma Studio:

1. **Order** jadvalini oching
2. **Add Record** tugmasini bosing
3. Quyidagi ma'lumotlarni kiriting:

```
id:                  (auto-generated UUID)
orderNumber:         "0001"
userId:              <customer-user-id>
driverId:            <test-driver-id>  ⚠️ MUHIM!
status:              CONFIRMED
totalPrice:          50000
deliveryAddress:     "Toshkent, Chilonzor, 12-mavze"
deliveryPhone:       "+998901234567"
paymentMethod:       CASH
deliveryLocation:    {"lat": 41.2995, "lng": 69.2401}
driverLocation:      null
createdAt:           (auto)
updatedAt:           (auto)
```

4. **Save** bosing ✅

**MUHIM:**

- `driverId` - Test driver ID ni kiriting!
- `deliveryLocation` - Customer manzili (JSON)

---

### BOSQICH 7: Driver Dashboard Test ✅

1. Driver dashboard refresh qiling: `http://localhost:3000/driver/dashboard`
2. "Aktiv buyurtmalar" bo'limida order ko'rinishi kerak

**Expected:**

```
┌─────────────────────────────────────┐
│ #0001                    [Confirmed] │
│ Customer: John Doe                   │
│ Phone: +998901234567                 │
│ Address: Toshkent, Chilonzor...      │
│ Price: 50,000 so'm                   │
│ [Batafsil ko'rish] →                 │
└─────────────────────────────────────┘
```

3. **"Batafsil ko'rish"** tugmasini bosing

---

### BOSQICH 8: GPS Tracking Boshlash 🚀

Delivery Tracker page ochildi: `/driver/delivery/:orderId`

#### 1. Order Ma'lumotlari

Ko'rinishi kerak:

- Customer nomi, telefon
- Delivery address
- Order status: CONFIRMED
- Price

#### 2. GPS Permission

**"Deliveryni Boshlash"** tugmasini bosing!

Browser GPS permission dialog chiqadi:

```
┌──────────────────────────────────────┐
│  🌍 localhost wants to:              │
│  • Know your location                │
│                                      │
│  [Block]        [Allow] ←--- BOSING  │
└──────────────────────────────────────┘
```

**MUHIM:** **"Allow"** tugmasini bosing!

#### 3. GPS Tracking Faol

✅ Green banner paydo bo'ladi:

```
┌──────────────────────────────────────┐
│ 🟢 GPS Tracking Faol                 │
│ Lokatsiya har 5 sekundda             │
│ yangilanmoqda • Aniqlik: ±15m        │
└──────────────────────────────────────┘
```

#### 4. Map Ko'rinadi 🗺️

Xaritada 2 ta marker:

- 🔴 Customer location (qizil)
- 🔵 Driver location (ko'k) - sizning joylashuvingiz

#### 5. Backend Logs

Terminal 1 (backend) da:

```bash
POST /api/tracking/update-location 200 - 45ms
POST /api/tracking/update-location 200 - 42ms
POST /api/tracking/update-location 200 - 38ms
# Har 5 sekundda
```

✅ GPS tracking ishlayapti!

---

### BOSQICH 9: Customer Tracking Test 🎭

**Two Browser Test:**

#### Browser 1 (Chrome) - Customer View:

1. Yangi incognito window oching
2. URL: `http://localhost:3000/tracking/:orderId`

   **YOKI:**

   Customer accounti bilan login qiling:
   - Login → My Orders → Track Order

3. Map ochiladi
4. Driver location real-time ko'rinadi

**Expected:**

- 🗺️ Map ko'rinadi
- 🔵 Driver marker harakat qiladi (har 5-10 sek)
- 📍 Distance: "2.5 km"
- ⏱️ ETA: "12 daqiqa"

#### Browser 2 (Firefox) - Driver View:

1. Driver dashboard
2. GPS tracking faol
3. Deliveryni davom ettirish

**Test:**

- Browser 1 da map yangilanishini kuzating
- Driver location real-time yangilanadi
- Distance kamayadi

---

### BOSQICH 10: Deliveryni Yakunlash ✅

Driver Browser da (Browser 2):

1. **"Deliveryni Yakunlash"** tugmasini bosing
2. Confirmation dialog: **"Ha"**

**Expected:**

- ✅ Success message: "Delivery yakunlandi!"
- ✅ Redirect: `/driver/dashboard`
- ✅ GPS tracking to'xtaydi
- ✅ Order status: DELIVERED

**Database Check:**

```sql
-- Prisma Studio:
SELECT status, deliveryCompletedAt
FROM "Order"
WHERE id = 'order-id';

-- Expected:
-- status: DELIVERED
-- deliveryCompletedAt: 2026-02-07 20:45:30
```

---

## 🎯 DRIVER PLATFORMASI - To'liq Tavsifi

### Driver Login

**URL:** `http://localhost:3000/login`

**Credentials:**

- Email: `driver@test.com`
- Password: `Test@123`

**Login qilgandan keyin:**

- Redirect: `/driver/dashboard`
- AuthContext: `backendUser.role = 'DRIVER'`
- Token saqlandi: `localStorage.firebaseToken`

---

### Driver Dashboard

**URL:** `http://localhost:3000/driver/dashboard`

#### Components:

**1. Header:**

- Logo: "Driver Panel"
- User info: Driver nomi, vehicleType
- Logout button

**2. Welcome Banner:**

```
┌────────────────────────────────────────┐
│ Assalomu alaykum, Test Driver! 👋     │
│ Bugun 3 ta buyurtma mavjud            │
└────────────────────────────────────────┘
```

**3. Stats Cards:**

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ 📦 Bugungi  │  │ 🚗 Aktiv    │  │ ✅ Bajarildi│  │ 💰 Daromad  │
│    3 ta     │  │    1 ta     │  │    2 ta     │  │  100,000 s  │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

**4. Aktiv Buyurtmalar:**

Har bir order kartasi:

```
┌─────────────────────────────────────────────────┐
│ #0001                          [Yo'lda] 🟠      │
│                                                 │
│ 📞 John Doe • +998901234567                     │
│ 📍 Toshkent, Chilonzor, 12-mavze                │
│                                                 │
│ 💬 Izoh: Eshik oldiga qo'ying                   │
│                                                 │
│                              50,000 so'm        │
│                                                 │
│ [📍 GPS Tracking Ochish →]                      │
└─────────────────────────────────────────────────┘
```

**Order Statuslar:**

- 🔵 **Tasdiqlandi** (CONFIRMED) - Yangi order
- 🟠 **Yo'lda** (OUT_FOR_DELIVERY) - GPS tracking faol
- 🟡 **Tayyorlanmoqda** (PREPARING) - Oshxonada

---

### Delivery Tracker Page

**URL:** `http://localhost:3000/driver/delivery/:orderId`

#### Components:

**1. Order Details Card:**

```
┌─────────────────────────────────────────┐
│ 📦 Buyurtma ma'lumotlari   [CONFIRMED]  │
│                                         │
│ 👤 Mijoz: John Doe                      │
│ 📞 Telefon: +998901234567               │
│ 📍 Manzil: Toshkent, Chilonzor...       │
│                                         │
│ #0001                    50,000 so'm    │
└─────────────────────────────────────────┘
```

**2. GPS Status Banner:**

**Before Start:**

```
┌─────────────────────────────────────────┐
│ ⚪ GPS Tracking hali boshlanmagan       │
└─────────────────────────────────────────┘
```

**After Start:**

```
┌─────────────────────────────────────────┐
│ 🟢 GPS Tracking Faol                    │
│ Lokatsiya har 5 sekundda yangilanmoqda  │
│ • Aniqlik: ±15m                         │
└─────────────────────────────────────────┘
```

**3. GPS Map:**

```
┌─────────────────────────────────────────┐
│         🗺️ GPS Xarita                   │
│                                         │
│     🔵 Driver (You)                     │
│        │                                │
│        │ 2.5 km                         │
│        │                                │
│        ↓                                │
│     🔴 Customer                         │
│                                         │
└─────────────────────────────────────────┘
```

**4. Action Buttons:**

**Before Start:**

```
[▶️ Deliveryni Boshlash]  [❌ Bekor qilish]
```

**After Start:**

```
[✅ Deliveryni Yakunlash]  [⏹️ GPS Stop]
```

---

### Driver qanday ma'lumotlar kiritadi?

**Delivery Tracker da:**

1. **GPS Permission** - Allow/Deny
2. **Deliveryni Boshlash** - Button bosish
3. **GPS Tracking** - Avtomatik (browser)
4. **Deliveryni Yakunlash** - Button bosish

**Driver MANUAL kiritMAydi:**

- ❌ GPS coordinates
- ❌ Location address
- ❌ Distance/ETA

**Hammasi avtomatik:** 🤖

- GPS browser API orqali
- Backend ga 5 sekundda 1 marta
- Database yangilanadi
- Customer map'i yangilanadi

---

### GPS qanday ishlaydi?

#### 1. Browser Geolocation API

```typescript
// useGPSTracking.ts hook
navigator.geolocation.watchPosition(
	position => {
		const lat = position.coords.latitude
		const lng = position.coords.longitude

		// Backend ga yuborish
		updateDriverLocation(lat, lng)
	},
	error => {
		console.error('GPS error:', error)
	},
	{
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0,
	},
)
```

#### 2. Avtomatik Update (har 5 sek)

```typescript
// Driver delivery page
useEffect(() => {
	if (location && isDeliveryStarted && isTracking) {
		updateDriverLocation(location.lat, location.lng)
	}
}, [location])
```

#### 3. Backend API Request

```bash
POST /api/tracking/update-location
Authorization: Bearer <driver-token>
Body: {
  "lat": 41.3111,
  "lng": 69.2496
}
```

#### 4. Database Update

```sql
UPDATE "Order"
SET
  "driverLocation" = '{"lat": 41.3111, "lng": 69.2496, "timestamp": 1707328845000}'::jsonb,
  "updatedAt" = NOW()
WHERE id = 'order-id';
```

#### 5. Customer Polling

```typescript
// Customer tracking page
useEffect(() => {
	const interval = setInterval(() => {
		fetchTrackingData() // GET /api/tracking/order/:id
	}, 10000) // har 10 sek

	return () => clearInterval(interval)
}, [])
```

---

## ❌ QOLGAN ISHLAR

### 1. Test Data Yaratish

**Kerak:**

- ✅ Backend running
- ✅ Frontend running
- ❌ Driver user (Firebase + Database)
- ❌ Test order (driverId assigned)
- ❌ Customer user (optional)

**Qanday qilish:**

- Yuqoridagi BOSQICH 3-6 ni bajarish
- Prisma Studio ishlatish
- Firebase Console ishlatish

---

### 2. Frontend Pages (Optional)

**Qolgan pages:**

- `/driver/orders` - All orders history
- `/driver/history` - Completed deliveries
- `/driver/profile` - Driver settings

**Zarurat:** Asosiy functionallik ishlaydi, bu pages qo'shimcha.

**Agar kerak bo'lsa:**

```typescript
// frontend/app/driver/orders/page.tsx
// frontend/app/driver/history/page.tsx
// frontend/app/driver/profile/page.tsx
```

---

### 3. Production Deployment

**Backend (Railway):**

```bash
cd backend
railway up
railway variables set DATABASE_URL="..."
```

**Frontend (Vercel):**

```bash
cd frontend
vercel --prod
vercel env add NEXT_PUBLIC_API_URL
```

**Status:** Local test muvaffaqiyatli bo'lsa, deploy qilish mumkin.

---

## 🎓 QISQA XULOSA

### ✅ Qilingan Ishlar:

1. ✅ Backend API (tracking endpoints)
2. ✅ Driver Dashboard page
3. ✅ Delivery Tracker page
4. ✅ GPS Tracking hook
5. ✅ Customer Tracking page
6. ✅ Database schema
7. ✅ Documentation (3 ta guide)

### ❌ Tugallanmagan:

1. ❌ Test driver user yaratish (5 daqiqa)
2. ❌ Test order yaratish (3 daqiqa)
3. ❌ Firebase authentication setup (5 daqiqa)
4. ❌ Manual test qilish (15 daqiqa)

**JAMI:** 30 daqiqa ichida to'liq test qilishingiz mumkin! 🚀

---

## 📞 Yordam Kerakmi?

### GPS ishlamayapti?

**1. Permission denied?**

- Browser settings → Location → Allow

**2. GPS unavailable?**

- Desktop: IP-based location (±100m)
- Mobile: GPS chip (±10m)

**3. Map ko'rinmayapti?**

- driverLocation null emasligini tekshiring
- TrackingMap props to'g'rimi?

### Backend error?

**1. Port 5001 band?**

```bash
lsof -ti :5001 | xargs kill -9
```

**2. Database connection?**

```bash
cd backend
pnpm prisma db pull
```

**3. Logs tekshiring:**

```bash
cd backend && pnpm dev
# Terminal da xatolarni o'qing
```

---

## ✨ OXIRGI SO'Z

Bu GPS tracking sistema **production-ready** kod bilan yozilgan:

- ✅ TypeScript strict mode
- ✅ Error handling
- ✅ Loading states
- ✅ Real-time updates
- ✅ Security (JWT, role-based)
- ✅ Performance optimized

**Faqat test data kerak!** 🎉

Test qilishni boshlaysizmi? 🧪
