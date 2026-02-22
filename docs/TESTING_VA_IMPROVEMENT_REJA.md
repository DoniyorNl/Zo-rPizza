# Zo'r Pizza – To'liq Testing va Improvement Rejasi

## 📊 Hozirgi holat

### Backend (440+ test)
- ✅ Unit: barcha controllerlar, middleware, utils, validators
- ✅ Integration: auth, products, orders
- ❌ Integration: branches, delivery, profile, tracking, loyalty, promos, deals, coupons

### Frontend (160 test)
- ✅ Hooks: usePopularProducts, useDeals, useCategories, useNotifications
- ✅ Store: cartStore
- ✅ Components: HeroSection, DealsSection, ProductCard, CategoryNav, DeliveryToggle, TrackingMap, ErrorBoundary, MemberSection, PopularProducts, DriverHistoryPage
- ✅ Pages: Checkout, Cart
- ✅ Components: PromoCodeInput, LoyaltyDisplay
- ❌ Pages: Orders, Profile, Tracking, Login, Menu
- ❌ Components: BranchModal, Toast, TrackingModal, PizzeriaUserMap

### E2E (4 spec, 26 test)
- ✅ Admin: dashboard, products, orders, analytics, users
- ✅ Order flow: full harid
- ✅ Tracking flow
- ✅ Driver history
- ✅ Checkout (cart, delivery forma, to'lov usullari)
- ✅ Login/Register (forma, validatsiya, navigatsiya)
- ❌ Profile (addresses, favorites)
- ❌ Branches page

---

## 1️⃣ TESTING REJASI

### 1.1 Backend – Qo‘shimcha testlar

| Prioriteta | Fayl | Test qilish kerak | Holat |
|-----------|------|-------------------|-------|
| 1 | `branches.controller.test.ts` | resolveMapUrl, createBranch, updateBranch, deleteBranch, getBranchById | ✅ Unit bor |
| 1 | `orders.integration.test.ts` | reorder, deleteOrder, getDriverOrders | Pending |
| 2 | `branches.api.test.ts` (yangi) | GET/POST/PATCH/DELETE /api/branches | ✅ Done (13 test) |
| 2 | `delivery.api.test.ts` (yangi) | POST /api/delivery/estimate | ✅ Done (5 test) |
| 2 | `profile.api.test.ts` (yangi) | addresses CRUD | ✅ Done (9 test) |
| 2 | `tracking.api.test.ts` (yangi) | start, update location, complete | ✅ Done (13 test) |
| 3 | `loyalty.api.test.ts` (yangi) | balance, redeem |
| 3 | `promos.api.test.ts` (yangi) | validate promo |

### 1.2 Frontend – Unit testlar

| Prioriteta | Komponent/Sahifa | Test qilish kerak |
|-----------|------------------|-------------------|
| 1 | CheckoutPage | forma validatsiya, submit, pickup/delivery | ✅ Done |
| 1 | CartPage | mahsulotlar, miqdor, checkout tugmasi | ✅ Done |
| 1 | PromoCodeInput | promo apply, xato, success | ✅ Done |
| 1 | LoyaltyDisplay | ballar, redeem | ✅ Done |
| 2 | OrdersPage | ro‘yxat, select all, bulk delete |
| 2 | ProfilePage | stats, addresses, favorites |
| 2 | TrackingModal | xarita, status |
| 2 | PizzeriaUserMap | Leaflet mock, masofa |
| 3 | BranchModal | location parse, submit |
| 3 | LoginPage, RegisterPage | forma, xato xabarlar |

### 1.3 E2E – Qo‘shimcha spec

| Prioriteta | Spec | Ssenariy |
|-----------|------|----------|
| 1 | `checkout-flow.spec.ts` | Delivery + Pickup, promo, loyalty |
| 1 | `login-register.spec.ts` | Kirish, ro‘yxatdan o‘tish, parol eslash |
| 2 | `profile-flow.spec.ts` | Manzil qo‘shish, profil yangilash |
| 2 | `branches.spec.ts` | Filiallar ro‘yxati, eng yaqin filial |
| 3 | `tracking-full.spec.ts` | Yetkazib berish boshlanishidan to completion gacha |

### 1.4 Test infrastruktura

- [x] E2E uchun `data-testid` lar qo‘shish (checkout, cart, login form)
- [ ] CI/CD (GitHub Actions): `pnpm test`, `pnpm run test:e2e`
- [ ] Coverage target: backend 80%+, frontend 70%+
- [ ] Test database (Supabase test yoki SQLite in-memory)

---

## 2️⃣ REAL PIZZERIA PLATFORMA – YETISHMAYOTGANLAR

### 2.1 To‘lov va moliya

| Feature | Hozir | Kerak |
|---------|-------|-------|
| Naqd/karta | Faqat tanlov | Ha |
| Payme / Click | Yo‘q | Integration |
| Online to‘lov status | Yo‘q | Webhook, status yangilash |
| Chek/receipt | Yo‘q | PDF yoki print |

### 2.2 Xabarnomalar

| Feature | Hozir | Kerak |
|---------|-------|-------|
| In-app | Mavjud | Yaxshilash |
| SMS | Yo‘q | Twilio / local SMS gateway |
| Push | PWA mavjud | Fire'n qilish |
| Email | Yo‘q | Order confirmation email |

### 2.3 Operatsion

| Feature | Hozir | Kerak |
|---------|-------|-------|
| Ish vaqti | Yo‘q | Branch opening hours |
| Zavod ustun | Yo‘q | Kitchen display / print |
| Buyurtma ovoz | Yo‘q | Sound notification |
| Zavod status | Yo‘q | Tayyor / qayta ishlash |

### 2.4 Mijoz tajribasi

| Feature | Hozir | Kerak |
|---------|-------|-------|
| Izohlar (reviews) | Schema bor | UI, API, ko‘rsatish |
| Reyting | Yo‘q | ⭐ product/category |
| Sevimlilar | Schema bor | UI to‘liq |
| Manzillar | Mavjud | Yaxshilash (geocoding) |
| Til | Faqat o‘zbek | Rus, ingliz (i18n) |

### 2.5 Boshqaruv

| Feature | Hozir | Kerak |
|---------|-------|-------|
| Inventory | Ingredient model bor | Stock, ogohlantirish |
| Haydovchi tayinlash | Mavjud | Avtomatik eng yaqin |
| Narxlar | Mavjud | Vaqt bo‘yicha (peak) |
| Aksiya vaqti | Mavjud | Bir nechta kun/vaqt |

---

## 3️⃣ IMPROVEMENT REJASI

### 3.1 Xavfsizlik

- [ ] Rate limiting (mavjud) – login, order, API uchun alohida
- [ ] Input sanitization (XSS)
- [ ] CORS sozlamalari tekshirish
- [ ] Firestore rules / API key himoya
- [ ] Sensitive data – env, token logging yo‘q

### 3.2 Performance

- [ ] Image optimization (Next.js Image – mavjud)
- [ ] API caching (Redis yoki memory)
- [ ] Lazy load – admin dashboard charts
- [ ] Bundle analysis, code splitting

### 3.3 SEO va marketing

- [ ] Meta tags (title, description) har sahifa uchun
- [ ] Open Graph, Twitter cards
- [ ] Sitemap.xml
- [ ] robots.txt

### 3.4 Monitoring va xatoliklar

- [ ] Sentry yoki similar (frontend + backend)
- [ ] Health check – /health kengaytirish
- [ ] Logging – structured (Winston mavjud)
- [ ] Uptime monitoring

### 3.5 Mobil va PWA

- [ ] PWA (mavjud) – offline, install prompt
- [ ] Touch UX – buttons, swipe
- [ ] Responsive – barcha sahifalar
- [ ] App store / Play Store (TWA/Capacitor) – keyingi bosqich

### 3.6 Developer experience

- [ ] README yangilash
- [ ] API docs (Swagger/OpenAPI)
- [ ] .env.example to‘liq
- [ ] Docker Compose – local dev

---

## 4️⃣ AMALGA OSHIRISH TARTIBI

### Faza 1 (1–2 hafta) – Testing

1. Backend: branches, delivery, profile integration testlari
2. Frontend: Checkout, Cart, PromoCodeInput, LoyaltyDisplay unit testlari
3. E2E: checkout-flow, login-register spec
4. `data-testid` lar qo‘shish (checkout, login)

### Faza 2 (2–3 hafta) – Kritik featurelar

1. To‘lov: Payme/Click integration (Uzbekiston)
2. SMS: buyurtma tasdiq, haydovchi yuborildi
3. Ish vaqti: branch opening hours
4. Reviews UI: mahsulot sahifasida izohlar

### Faza 3 (2 hafta) – UX va platforma

1. i18n: o‘zbek, rus
2. SEO: meta, sitemap
3. Error tracking: Sentry
4. Zavod: print yoki simple KDS

### Faza 4 (davomiy) – Kengaytirish

1. Inventory management
2. Analytics kengaytirish
3. Push notifications
4. Mobile app (TWA)

---

## 5️⃣ QISQACHA JADVAL

| # | Vazifa | Turi | Prioriteta |
|---|--------|------|------------|
| 1 | Branches integration test | Backend | P1 |
| 2 | Checkout + Cart unit test | Frontend | P1 |
| 3 | PromoCodeInput, LoyaltyDisplay test | Frontend | P1 |
| 4 | checkout-flow E2E spec | E2E | P1 |
| 5 | data-testid checkout/login | Frontend | P1 |
| 6 | Payme/Click to‘lov | Feature | P1 |
| 7 | SMS notification | Feature | P1 |
| 8 | Branch ish vaqti | Feature | P2 |
| 9 | Reviews UI | Feature | P2 |
| 10 | i18n (uz, ru) | Feature | P2 |
| 11 | Sentry | Infra | P2 |
| 12 | SEO (meta, sitemap) | Infra | P2 |

---

_Oxirgi yangilanish: 2026-02-15_
