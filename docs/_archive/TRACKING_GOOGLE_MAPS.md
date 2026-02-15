# Buyurtmani xaritada kuzatish: flow va Google Maps qo‘shish

## Bepul limit (1–2 user sinov)

Google Maps Platform **bepul usage** beradi (har oy ma’lum limitgacha). 1–2 foydalanuvchi bilan sinab ko‘rish uchun **bepul** yetadi; keyin limit va narxlarni [Google Maps Billing](https://developers.google.com/maps/billing-and-pricing) dan ko‘ring. Kalit olish: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create API Key → Maps JavaScript API yoqing.

---

# Flow va implementation

Standart real pizzeria / e-commerce kabi: **qayerda**, **necha daqiqada**, **qayerga** keladi – barchasi bitta sahifada, xaritada.

---

## Fikr: Google Maps qo‘shish

**Yaxshi g‘oya.** Sabablari:

- Ko‘pchilik foydalanuvchilar **Google Maps**ni tanish – “boshqalariga o‘xshamagan” emas, balki **ishonchli va tushunarli**.
- **Yo‘l va trafik:** Google Maps’da haqiqiy yo‘l (route) va trafik bilan ETA aniqroq bo‘ladi (Directions API ishlatilsa).
- **Mobil:** Google Maps mobilda yaxshi ishlaydi; PWA yoki brauzerda ham qulay.
- **Eslatma:** Google Maps API **kalit** talab qiladi va **to‘lovli limit**lari bor (bepul kreditdan keyin). OpenStreetMap/Leaflet bepul; shuning uchun ixtiyoriy ravishda **env orqali** xarita turini tanlash mumkin (Google yoki Leaflet).

---

## Hozirgi flow (loyihada mavjud)

Endi ham quyidagilar bor:

| Nima               | Qayerda               | Izoh                                                              |
| ------------------ | --------------------- | ----------------------------------------------------------------- |
| **Qayerda**        | Haydovchi joylashuvi  | Backend `driverLocation` (Order / User), frontend xaritada marker |
| **Necha daqiqada** | ETA                   | Backend `gps.utils` (Haversine + trafik), frontend “~15 min”      |
| **Qayerga**        | Yetkazish manzili     | Order’da `deliveryAddress`, `deliveryLat/Lng`                     |
| **Xarita**         | `/tracking/[orderId]` | Leaflet + OpenStreetMap: restoran 🍕, manzil 🏠, haydovchi 🏍️     |
| **Real vaqt**      | 10 sekundda yangilash | Frontend interval, backend’dan `/api/tracking/order/:id`          |

Ya’ni **flow** allaqachon standart pizzeria/e-commerce style: user buyurtmani xaritada ko‘radi, masofa va ETA ko‘rsatiladi. Farq faqat **xarita provayderi**: hozir Leaflet, siz Google Maps qo‘shmoqchisiz.

---

## Google Maps qo‘shishda oqim (qanday ishlashi)

1. **User** buyurtma beradi → manzil va koordinatalar (`deliveryLat`, `deliveryLng`) saqlanadi.
2. **Admin/haydovchi** buyurtmani “Yetkazilmoqda” (OUT_FOR_DELIVERY) qiladi va haydovchi tayinlanadi.
3. **Haydovchi** (mobil yoki admin panel) joylashuvini yuboradi → backend `updateDriverLocation` (yoki shunga o‘xshash) → `Order.driverLocation` yangilanadi.
4. **User** `/tracking/[orderId]` sahifasini ochadi:
   - **Xarita (Google Maps):** restoran, yetkazish manzili, haydovchi nuqtasi ko‘rinadi.
   - **Masofa va ETA:** “~2.3 km”, “~12 min” (backend’dan keladi).
   - **Status:** Kutilmoqda → Tayyorlanmoqda → Yetkazilmoqda → Yetkazildi.
5. **Har 10–15 sekundda** frontend tracking ma’lumotini qayta so‘raydi → xaritadagi haydovchi marker yangilanadi.
6. **Ixtiyoriy:** Google **Directions API** orqali haydovchi → manzil yo‘lini chizish (polyline) va trafik bilan ETA – aniqroq “necha daqiqada qayerga keladi”.

Backend oqimi o‘zgarmaydi; o‘zgaradi faqat **frontend xarita** – Leaflet o‘rniga Google Maps.

---

## Implementation (qisqa reja)

### 1. Google Cloud

- [Google Cloud Console](https://console.cloud.google.com/) da loyiha oching.
- **Maps JavaScript API** yoqing.
- **API kalit** yarating (browser restriction: loyiha domeni yoki localhost).
- Ixtiyoriy: **Directions API** yoqing (yo‘l chizish va trafik ETA uchun).

### 2. Frontend

- **Env:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...` (`.env.local`).
- **Kutubxona:** `@react-google-maps/api` yoki `@googlemaps/js-api-loader`.
- **Komponent:**
  - Variant A: `TrackingMap.tsx` ni **Google Maps** versiyasiga o‘zgartirish (yagona xarita – Google).
  - Variant B: `NEXT_PUBLIC_MAP_PROVIDER=google | leaflet` qilib, **GoogleTrackingMap** va **LeafletTrackingMap** dan bittasini render qilish (fallback: Leaflet bepul).
- **Xaritada:**
  - Marker’lar: restoran (🍕), yetkazish manzili (🏠), haydovchi (🏍️).
  - Ixtiyoriy: Directions API dan polyline olish va xaritada yo‘l chizish.

### 3. Backend

- **O‘zgarish shart emas.** `/api/tracking/order/:id` va driver location update allaqachon mavjud; frontend faqat boshqa xaritada ko‘rsatadi.

### 4. Foydalanuvchi tajribasi

- **/orders** yoki buyurtma detali sahifasida “Kuzatish” tugmasi → `/tracking/[orderId]`.
- Sahifada: **Google xarita** + “Qayerga keladi” (manzil) + “Necha daqiqada” (ETA) + status timeline – hammasi bir joyda, boshqalardan farqli qilish uchun emas, balki aniq va qulay qilish uchun.

---

## Xulosa

| Savol                     | Javob                                                                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Flow qanday?              | User buyurtmani beradi → yetkazilganda `/tracking/[id]` da xaritada haydovchi, manzil, ETA ko‘rinadi; real vaqtda yangilanadi.                                    |
| Qaysi xarita ishlatiladi? | **Leaflet (OpenStreetMap)** – default, bepul, API kalit kerak emas.                                                                                               |
| Google Maps?              | `GoogleTrackingMap.tsx` mavjud, lekin hozir ishlatilmaydi. Agar `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` qo‘shilsa, tracking sahifasida shartli render qilinishi mumkin. |
| Nima o‘zgaradi?           | Faqat frontend xarita: Leaflet (default) yoki env bilan Google Maps tanlash. Backend va flow o‘zgarishsiz.                                                        |

f
