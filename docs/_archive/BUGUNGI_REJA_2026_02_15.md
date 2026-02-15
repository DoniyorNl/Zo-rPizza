# 📋 Bugungi reja – 2026-02-15 (Yakshanba)

## 📌 Kecha qilingan ishlar (2026-02-14) – xulosa

### 1. Cache va muhit
- **node_modules** (root, frontend, backend), **.next**, **dist**, **.jest-cache** tozalandi.
- **pnpm install** qayta ishlatildi, Prisma generate avtomatik bajarildi.

### 2. `pnpm run dev:both` ishlashi
- **Muammo:** Backend ishlamas edi — "No projects matched the filters".
- **Sabab:** Root skriptlarda `--filter backend`, lekin paket nomi **zor-pizza-backend**.
- **Yechim:** `package.json` da `dev:backend`, `test:backend`, `test:backend:watch`, `test:backend:coverage` uchun filter **zor-pizza-backend** qilindi.

### 3. Frontend dev server
- Next.js **-H 127.0.0.1** qo‘shildi (uv_interface_addresses xatosi yo‘q).
- **turbopack.root: '..'** — workspace ogohlantirishi yopildi.

### 4. Local API va CORS
- **127.0.0.1** ham local hisoblanadi (`apiBaseUrl.ts`).
- Local da frontend **http://localhost:5001** ga so‘rov yuboradi.
- "Error fetching categories" / CORS / Network Error bartaraf etildi.
- SSR (development) ham local backend ishlatadi.

**O‘zgargan fayllar:** `package.json`, `frontend/package.json`, `frontend/next.config.ts`, `frontend/lib/apiBaseUrl.ts`.

---

## 🎯 Bugun nimalar qilamiz (tartib bilan)

### 0. Ishni boshlash (birinchi qadam)
```bash
pnpm run dev:both
```
- Frontend: **http://127.0.0.1:3000** (yoki http://localhost:3000)
- Backend: **http://localhost:5001**
- Brauzerda asosiy sahifa ochilsa, categories/products/deals yuklansa — muhit to‘g‘ri.

---

### 1. Tekshirish: mavjud feature’lar ishlayaptimi?
Quyidagilarni tekshirish (5–10 min):

| Narsa | Qayerda | Tekshirish |
|-------|---------|------------|
| Categories / products / deals | Bosh sahifa | Yuklanishi, xato yo‘qligi |
| Branches | `/branches` | Xarita va filiallar ro‘yxati |
| Checkout | Savat → Checkout | Manzil, promo, loyalty |
| Order history | `/orders` yoki profil | Buyurtmalar ro‘yxati, Reorder |
| Tracking | `/tracking/[id]` | Buyurtma statusi, xarita |
| Delivery time | Checkout yoki manzil | “~X min” ko‘rinishi |

Agar biror joyda xato yoki ishlamasa — aniqlab, birinchi navbatda shuni tuzatamiz.

---

### 2. Test order va driver flow (agar GPS/tracking test qilmoqchi bo‘lsak)
- Admin: **http://127.0.0.1:3000/admin/orders** — buyurtma yaratish / driver ga berish.
- Driver: **testdriver@pizza.com** / **123456789** — dashboard, buyurtma, GPS tracking.
- Ketma-ketlik: Customer order → Admin assign → Driver qabul → GPS → Yetkazildi.

Bu qadamni faqat tracking/driver ishini tekshirish kerak bo‘lsa qilamiz.

---

### 3. Feature ishlariga davom (FEATURES_IMPLEMENTATION.md)
`docs/FEATURES_IMPLEMENTATION.md` dagi 7 ta feature dan qaysi biri to‘liq emas yoki yangi kerak — shunga qarab ishlash:

| # | Feature | Holat (taxminan) | Bugun qilish mumkin |
|---|--------|-------------------|---------------------|
| 1 | Branch finder | Backend + `/branches` bor | UI/UX yaxshilash, nearest tekshirish |
| 2 | Delivery time | Backend + DeliveryTimeEstimate bor | Checkout’da integratsiya, test |
| 3 | Saved addresses | Profile addresses API bor | Checkout’da manzil tanlash/qo‘shish |
| 4 | Promo codes | Backend + PromoCodeInput bor | Validate + createOrder’da apply test |
| 5 | Loyalty | Backend + LoyaltyDisplay bor | Balance, redeem at checkout test |
| 6 | Order history + reorder | `/orders` + reorder API bor | Reorder flow, xatoliklar tuzatish |
| 7 | Live order tracking | Socket + tracking sahifa bor | End-to-end test, status/map |

Bugun bir yoki ikkita feature’ni “to‘liq ishlaydi va test qilindi” darajasiga yetkazish maqsadga muvofiq.

---

### 4. Xatoliklar va kichik tuzatishlar
- Console (frontend) va terminal (backend) da xato bo‘lsa — yozib olish va tuzatish.
- Mobile ko‘rinishi, PWA, performance — keyingi kunlar uchun qoldirish mumkin.

---

### 5. Yakuniy tekshirish va hujjat
- `pnpm run dev:both` bilan bosh sahifadan checkout/tracking gacha bir marta o‘tib chiqish.
- Bugun qilingan ishlar ro‘yxatini **ERTAGA.md** yoki **DAILY_LOG_2026_02_15.md** ga qisqacha yozish.

---

## 📂 Foydali linklar (local)

| Narsa | URL |
|-------|-----|
| Bosh sahifa | http://127.0.0.1:3000 |
| Filiallar | http://127.0.0.1:3000/branches |
| Buyurtmalarim | http://127.0.0.1:3000/orders |
| Tracking | http://127.0.0.1:3000/tracking/[orderId] |
| Admin (buyurtmalar) | http://127.0.0.1:3000/admin/orders |
| Driver dashboard | http://127.0.0.1:3000/driver/dashboard |
| API health | http://localhost:5001/health |

---

## 🧪 Test akkauntlar

| Rol | Email | Parol |
|-----|-------|--------|
| Driver | testdriver@pizza.com | 123456789 |
| Customer | test@test.com | (.env / test) |
| Admin | admin@zorpizza.com | (.env) |

---

_Reja yaratildi: 2026-02-15_  
_Kecha log: `docs/DAILY_LOG_2026_02_14.md`_  
_Feature reja: `docs/FEATURES_IMPLEMENTATION.md`_
