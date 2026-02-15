# 📍 Tracking Tizimi - Yangilangan Qo'llanma (2026-02-07)

## ✅ HAL QILINGAN MUAMMO

**Xato:** "Kuzatish ##0001 - Kuzatish ma'lumoti yuklanmadi"

**Sabab:** Backend'da tracking route registratsiya qilinmagan edi

**Yechim:** 
- ✅ `trackingRoutes` import qilindi
- ✅ `/api/tracking` endpoint qo'shildi
- ✅ Backend qayta ishga tushirildi

---

## 🚀 Endi Qilish Kerak

### 1. Backend'ni Qayta Ishga Tushiring
```bash
cd /Users/mac/Desktop/Zo-rPizza/backend
pnpm dev
```

### 2. Test Qiling
Browser'da:
```
http://localhost:3000/tracking/ORDER_ID
```

### 3. Order'ga Tracking Ma'lumotlarini Qo'shish

Tracking ishlashi uchun order'da quyidagilar bo'lishi kerak:

```typescript
{
  driverId: "USER_ID",              // Haydovchi
  deliveryLocation: {                // Yetkazish joyi
    lat: 41.315,
    lng: 69.245
  },
  driverLocation: {                  // Haydovchi joyi
    lat: 41.311,
    lng: 69.240
  },
  status: "OUT_FOR_DELIVERY"         // Status
}
```

---

## 📡 Tracking API Endpoints (Endi Ishlaydi!)

### ✅ GET /api/tracking/order/:orderId
Order tracking ma'lumotlarini olish

### ✅ POST /api/tracking/driver/location
Haydovchi GPS location yangilash

### ✅ POST /api/tracking/order/:orderId/start
Tracking boshlash

### ✅ POST /api/tracking/order/:orderId/complete
Yetkazishni yakunlash

---

## ⚠️ Agar Hali Ham "Ma'lumoti Yuklanmadi" Ko'rsatsa

Order'da quyidagilar to'ldirilganligini tekshiring:

```sql
-- Database'da tekshirish
SELECT 
  id,
  orderNumber,
  status,
  driverId,
  deliveryLocation,
  driverLocation
FROM orders 
WHERE id = 'YOUR_ORDER_ID';
```

Agar bo'sh bo'lsa, to'ldiring:

```sql
UPDATE orders 
SET 
  driverId = 'HAYDOVCHI_USER_ID',
  deliveryLocation = '{"lat": 41.315, "lng": 69.245, "address": "Manzil"}',
  driverLocation = '{"lat": 41.311, "lng": 69.240}',
  status = 'OUT_FOR_DELIVERY'
WHERE id = 'ORDER_ID';
```

---

## 🎯 Test Uchun Order Yaratish

```bash
# Admin sifatida order yaratib, driverga biriktiring
# yoki Supabase Dashboard'da to'ldiring
```

---

## 📞 Keyingi Bosqichlar

1. ✅ Backend ishga tushirildi
2. 🔄 Order'larga driver biriktirish
3. 🔄 GPS location ma'lumotlarini to'ldirish
4. ✅ Frontend tracking sahifasi tayyor

---

**Yangilangan:** 7 Fevral 2026  
**Status:** ✅ Backend Fixed - Testing Required
