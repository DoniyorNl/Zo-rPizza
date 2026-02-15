# 📍 GPS Tracking Funksiyasi - To'liq Qo'llanma

## ✅ Nima Qilindi?

### 1️⃣ Backend (API)

- ✅ **Tracking Controller** - GPS tracking logikasi (`backend/src/controllers/tracking.controller.ts`)
- ✅ **Tracking Routes** - API endpoints (`backend/src/routes/tracking.routes.ts`)
- ✅ **GPS Utils** - Masofa va ETA hisoblash (`backend/src/utils/gps.utils.ts`)
- ✅ **Server.ts** - Tracking routes ulandi
- ✅ **Database Schema** - GPS tracking uchun maydonlar qo'shilgan
- ✅ **Tests** - Tracking controller va GPS utils testlari

### 2️⃣ Frontend (UI)

- ✅ **Tracking Page** - Live tracking sahifasi (`frontend/app/(shop)/tracking/[id]/page.tsx`)
- ✅ **TrackingMap Component** - OpenStreetMap bilan xarita (`frontend/components/tracking/TrackingMap.tsx`)
- ✅ **Header Icon** - Active order bo'lganda tracking icon ko'rinadi
- ✅ **ETA Progress Bar** - Chiroyli vizual progress bar
- ✅ **Timeline** - Yetkazib berish bosqichlari

---

## 🎯 Qanday Ishlaydi?

### Foydalanuvchi Uchun

1. **Buyurtma Berish**
   - Foydalanuvchi buyurtma beradi
   - Order status: `PENDING` → `CONFIRMED` → `PREPARING`

2. **Tracking Icon Paydo Bo'ladi**
   - Order status `PREPARING` yoki `OUT_FOR_DELIVERY` bo'lganda
   - Headerda yashil **MapPin** icon ko'rinadi (Live badge bilan)
   - Icon har 30 sekundda yangilanadi

3. **Tracking Sahifasiga O'tish**
   - Tracking icon ga bosish
   - Yoki `/tracking/{orderId}` ga to'g'ridan-to'g'ri kirish

4. **Live Tracking**
   - **Xarita** - OpenStreetMap da real-time joylashuv
   - **Driver Location** - Yetkazuvchining hozirgi joyi (🏍️)
   - **Delivery Location** - Yetkazish manzili (🏠)
   - **Restaurant** - Restoran joylashuvi (🍕)
   - **Route** - Driver dan delivery gacha yo'l (ko'k chiziq)

5. **Ma'lumotlar**
   - **Masofa** - Driver va delivery o'rtasidagi masofa (km)
   - **ETA** - Taxminiy yetkazish vaqti (daqiqa)
   - **Yaqinlashdi** - Driver yaqinlashganini ko'rsatadi

6. **Progress Bar**
   - Yetkazib berish jarayonini vizual ko'rsatadi
   - 4 bosqich: Boshlandi → Yo'lda → Yaqinlashdi → Yetkazildi
   - Real-time animatsiya

---

## 🔧 Backend API Endpoints

### 1. **GET /api/tracking/order/:orderId**

Order tracking ma'lumotlarini olish

**Headers:**

```
Authorization: Bearer {firebase_token}
```

**Response:**

```json
{
	"success": true,
	"data": {
		"order": {
			"id": "order-123",
			"status": "OUT_FOR_DELIVERY",
			"totalAmount": 50000,
			"deliveryAddress": "Toshkent, Chilonzor",
			"createdAt": "2026-01-25T10:00:00Z"
		},
		"tracking": {
			"driverLocation": { "lat": 41.3, "lng": 69.24 },
			"deliveryLocation": { "lat": 41.31, "lng": 69.25 },
			"distance": 2.5,
			"eta": 15,
			"isNearby": false,
			"lastUpdate": "2026-01-25T10:15:00Z"
		},
		"driver": {
			"id": "driver-1",
			"name": "Aziz",
			"phone": "+998901234567",
			"vehicleType": "bike"
		}
	}
}
```

### 2. **POST /api/tracking/driver/location**

Driver joylashuvini yangilash (Driver uchun)

**Headers:**

```
Authorization: Bearer {firebase_token}
```

**Body:**

```json
{
	"lat": 41.3,
	"lng": 69.24
}
```

### 3. **POST /api/tracking/order/:orderId/start**

Delivery tracking ni boshlash (Driver/Admin)

**Body:**

```json
{
	"deliveryLocation": {
		"lat": 41.31,
		"lng": 69.25
	}
}
```

### 4. **POST /api/tracking/order/:orderId/complete**

Delivery ni tugallash (Driver/Admin)

### 5. **GET /api/tracking/active**

Barcha active deliveries (Admin only)

---

## 📱 Frontend Components

### TrackingMap Component

**Props:**

```typescript
interface TrackingMapProps {
	deliveryLocation: Location // Yetkazish manzili (majburiy)
	driverLocation?: Location // Driver joylashuvi (optional)
	restaurantLocation?: Location // Restoran (default: Toshkent)
	zoom?: number // Xarita zoom (default: 13)
	height?: string // Xarita balandligi (default: 400px)
	showRoute?: boolean // Yo'lni ko'rsatish (default: true)
}
```

**Ishlatish:**

```tsx
<TrackingMap
	deliveryLocation={{ lat: 41.31, lng: 69.25 }}
	driverLocation={{ lat: 41.3, lng: 69.24 }}
	height='500px'
	showRoute={true}
/>
```

**Features:**

- ✅ OpenStreetMap (Leaflet)
- ✅ Custom markers (🍕, 🏍️, 🏠)
- ✅ Animated driver marker (pulse effect)
- ✅ Route visualization (dashed line)
- ✅ Auto-fit bounds
- ✅ Legend

---

## 🎨 UI Features

### 1. **Header Tracking Icon**

- Faqat user uchun ko'rinadi
- Active order bo'lganda paydo bo'ladi
- Yashil rang + "Live" badge
- Pulse animatsiya
- Har 30 sekundda tekshiriladi

### 2. **Tracking Page**

- **Live Map** - Real-time xarita
- **Stats Cards** - Masofa, ETA, Nearby
- **Progress Bar** - Gradient + animatsiya
- **Timeline** - 4 bosqichli jarayon
- **Order Status** - Vertical timeline
- **Driver Info** - Ism, telefon, transport turi
- **Auto Refresh** - Har 10 sekundda yangilanadi

### 3. **Responsive Design**

- Mobile: 1 ustun
- Desktop: 2/3 xarita + 1/3 ma'lumot

---

## 🧪 Testing

### Backend Tests

**Tracking Controller:**

```bash
cd backend
npm test -- tracking.controller.test.ts
```

**GPS Utils:**

```bash
npm test -- gps.utils.test.ts
```

### E2E Tests

```bash
cd e2e
npm run test:e2e -- tracking-flow.spec.ts
```

---

## 🚀 Qanday Ishga Tushirish?

### 1. Backend

```bash
cd backend
npm run dev
```

Backend server: `http://localhost:5001`

### 2. Frontend

```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:3000`

### 3. Test Qilish

**Scenario:**

1. Login qiling
2. Buyurtma bering
3. Admin panel ga kiring
4. Order statusni `PREPARING` ga o'zgartiring
5. Headerda tracking icon paydo bo'ladi
6. Icon ga bosing
7. Tracking page ochiladi

**Demo uchun:**

- Driver location: `{ lat: 41.3, lng: 69.24 }`
- Delivery location: `{ lat: 41.31, lng: 69.25 }`

---

## 📊 Database Schema

### Order Model

```prisma
model Order {
  // ... existing fields

  // Tracking fields
  driverId              String?
  driverLocation        Json?           // { lat, lng, timestamp }
  deliveryLocation      Json?           // { lat, lng }
  trackingStartedAt     DateTime?
  deliveryStartedAt     DateTime?
  deliveryCompletedAt   DateTime?
  estimatedTime         Int?            // minutes
}
```

### User Model (Driver)

```prisma
model User {
  // ... existing fields

  // Driver fields
  isDriver            Boolean        @default(false)
  driverStatus        String?        // 'available', 'busy', 'offline'
  currentLocation     Json?          // { lat, lng, timestamp }
  vehicleType         String?        // 'bike', 'car', 'scooter'
  vehicleNumber       String?
}
```

---

## 🔐 Security

- ✅ Firebase Authentication
- ✅ User faqat o'z orderlarini track qilishi mumkin
- ✅ Admin barcha orderlarni ko'rishi mumkin
- ✅ Driver faqat o'z locationini yangilashi mumkin
- ✅ Rate limiting (General limiter)

---

## 🎯 Keyingi Bosqichlar (Optional)

### Qo'shimcha Features:

1. **Push Notifications** - Driver yaqinlashganda
2. **SMS Notifications** - Order statuslari
3. **Driver App** - Alohida driver mobile app
4. **Route Optimization** - Eng qisqa yo'lni topish
5. **Multiple Stops** - Bir nechta yetkazish
6. **Real-time Chat** - Driver va customer o'rtasida
7. **Rating System** - Driver baholash
8. **History** - Tracking history

---

## 📝 Muhim Eslatmalar

1. **OpenStreetMap** ishlatilmoqda (Google Maps emas)
   - Bepul va open-source
   - API key kerak emas
   - Leaflet library

2. **Real-time Updates**
   - Frontend: Har 10 sekundda
   - Header: Har 30 sekundda
   - WebSocket yo'q (hozircha polling)

3. **Location Permissions**
   - Driver app location permission berishi kerak
   - Browser geolocation API ishlatiladi

4. **Offline Mode**
   - Hozircha qo'llab-quvvatlanmaydi
   - Internet kerak

---

## 🐛 Troubleshooting

### Xarita ko'rinmasa:

1. Leaflet CSS yuklanganini tekshiring
2. Browser console da xatolarni ko'ring
3. `npm install leaflet` ishlatilganini tekshiring

### Tracking icon ko'rinmasa:

1. Order status `PREPARING` yoki `OUT_FOR_DELIVERY` ekanligini tekshiring
2. User login qilganini tekshiring
3. Browser console da xatolarni ko'ring

### 404 Error:

1. Backend server ishlab turganini tekshiring
2. Tracking routes ulangan ekanligini tekshiring
3. Order ID to'g'ri ekanligini tekshiring

---

## 📚 Qo'shimcha Resurslar

- [Leaflet Documentation](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [GPS Utils Documentation](./docs/GPS_TRACKING_COMPLETE.md)

---

**Tracking funksiyasi to'liq ishga tayyor! 🎉**
