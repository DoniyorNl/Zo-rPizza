# Test manzil: restoran (default) va kuzatish

**Faqat test uchun** ishlatiladigan default restoran manzili – buyurtma “domino” (pitsa chiqadigan joy) shu manzildan hisoblanadi.

---

## 1. Saqlangan test manzil

**Manzil:** Kerkstraat 29, 4141 AT Leerdam (Niderlandiya)

**Koordinatalar (taxminiy, Leerdam markazi yaqini):**

- **Lat:** 51.894
- **Lng:** 5.097

Aniq koordinatalarni Google Maps yoki boshqa geocoding xizmatidan olish mumkin.

---

## 2. Qayerdan o‘zgartirish mumkin

### Frontend (xaritadagi restoran nuqtasi)

Restoran marker’i va default markaz quyidagilardan keladi:

| Usul | Qayerda | Qanday |
|------|---------|--------|
| **Env** | `frontend/.env.local` | `NEXT_PUBLIC_RESTAURANT_ADDRESS`, `NEXT_PUBLIC_RESTAURANT_LAT`, `NEXT_PUBLIC_RESTAURANT_LNG` – agar berilgan bo‘lsa, ular ishlatiladi. |
| **Config** | `frontend/lib/trackingConfig.ts` | Env bo‘lmasa **default** sifatida shu fayldagi qiymatlar (Leerdam test manzili) ishlatiladi. |

Production’da `.env.production` yoki Vercel env’da `NEXT_PUBLIC_RESTAURANT_*` qo‘yib, haqiqiy restoran manzilini berasiz.

### Backend

Hozir backend restoran koordinatasini saqlamaydi – masofa/ETA **haydovchi → yetkazish manzili** orasida hisoblanadi. Kelajakda restoran nuqtasi kerak bo‘lsa (masalan, restoran → mijoz ETA), backend’da env `RESTAURANT_LAT` / `RESTAURANT_LNG` yoki config fayl qo‘shish mumkin.

---

## 3. Real holatda haydovchi joyi qanday aniqlanadi

- **API:** `POST /api/tracking/driver/location`  
  Body: `{ "lat": 51.89, "lng": 5.09 }`  
  Header: `Authorization: Bearer <token>` (haydovchi yoki admin token).

- **Kim yuboradi:**  
  - **Haqiqiy tizimda:** haydovchi ilovasi (mobil yoki PWA) brauzer/mobil GPS orqali `lat`/`lng` yig‘ib, har 10–30 soniyada shu endpoint’ga POST qiladi.  
  - Yoki admin panelda “Haydovchi joyi”ni qo‘lda yangilash (test uchun).

- **Backend nima qiladi:**  
  - Token’dan foydalanuvchi (haydovchi) aniqlanadi.  
  - `User.currentLocation` yangilanadi.  
  - Shu haydovchiga biriktirilgan va statusi `OUT_FOR_DELIVERY` bo‘lgan buyurtma bo‘lsa, `Order.driverLocation` ham shu `lat`/`lng` bilan yangilanadi.  
  - Keyin foydalanuvchi `/tracking/[orderId]` yoki modal orqali xaritada haydovchi nuqtasini ko‘radi.

Ya’ni haydovchi joyi **har doim backend’ga yuborilgan** `lat`/`lng` dan keladi (GPS → ilova → API).

---

## 4. Hozir qanday tekshirish mumkin

### A) Restoran nuqtasi (test manzil)

- Frontend’da **default** endi **Leerdam** (Kerkstraat 29 atrofidagi koordinatalar).  
- `pnpm dev` qilib, `/tracking/[orderId]` ochilsa, xaritada restoran marker’i shu nuqtada bo‘lishi kerak.  
- O‘zgartirish: `frontend/.env.local` da `NEXT_PUBLIC_RESTAURANT_LAT`, `NEXT_PUBLIC_RESTAURANT_LNG` (va ixtiyoriy `NEXT_PUBLIC_RESTAURANT_ADDRESS`) berilsa, ular ishlatiladi.

### B) Haydovchi joyi (tracking)

1. **API orqali (Postman / curl):**  
   - Haydovchi hisobi bilan login qilib token oling.  
   - Buyurtmani haydovchiga birikting va statusini `OUT_FOR_DELIVERY` qiling (admin yoki mavjud flow orqali).  
   - `POST /api/tracking/driver/location` ga `{ "lat": 51.90, "lng": 5.10 }` yuboring.  
   - Keyin `/tracking/[orderId]` sahifasini yangilang – xaritada haydovchi yangi nuqtada ko‘rinishi kerak.

2. **DB orqali (tez sinov):**  
   - Prisma Studio yoki SQL orqali shu buyurtma uchun `Order.driverLocation` ni `{"lat": 51.90, "lng": 5.10, "timestamp": "..."}` qilib yozing.  
   - `/tracking/[orderId]` da haydovchi shu joyda ko‘rinadi.

3. **Kelajakda:**  
   - Admin panelda “Haydovchi joyini yangilash” tugmasi yoki haydovchi uchun alohida sahifa qo‘shilsa, xuddi shu `POST /api/tracking/driver/location` chaqiriladi – tekshirish oson bo‘ladi.

---

## 5. Qisqacha

| Nima | Qayerda saqlanadi | O‘zgartirish |
|------|-------------------|--------------|
| Test restoran manzili | **docs/TRACKING_TEST_ADDRESS.md** (bu fayl) | Matnni tahrirlash |
| Default restoran koordinatalari (frontend) | **frontend/lib/trackingConfig.ts** | Kod yoki env `NEXT_PUBLIC_RESTAURANT_*` |
| Haydovchi joyi | Backend: `Order.driverLocation`, `User.currentLocation` | Faqat `POST /api/tracking/driver/location` orqali (yoki test uchun DB) |
