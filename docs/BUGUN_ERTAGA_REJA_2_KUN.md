# Zo'r Pizza – 2 kunlik yakunlash rejasi

**Sana:** 2026-02-21  
**Maqsad:** 2 kun ichida loyihani deploy-ready holatga keltirish, xatolarsiz.

---

## Hozirgi holat (tekshirilgan)

| Qism | Holat | Izoh |
|------|--------|------|
| **Backend testlar** | 467 ✅ | Barcha o'tadi |
| **Frontend testlar** | 160 ✅ | Barcha o'tadi |
| **E2E** | 4 spec, 26 test | checkout-flow, login-register, order-flow, admin, tracking, driver |
| **Asosiy funksiyalar** | Mavjud | Branches, delivery estimate, profile/addresses, promos, loyalty, orders, tracking |
| **Root README.md** | Zaif | Faqat "CodeRabbit test" – yangilash kerak |
| **QUICK_REFERENCE.md** | Eskirgan | Test soni 34/9 – hozir 467/160 |

---

## Bugungi reja (Kun 1 – 21.02.2026)

### 1. Hujjatlar va birinchi taassurot (≈30 min)
- [x] **README.md** (root): loyiha nomi, qisqa tavsif, `pnpm install` → `pnpm dev:both`, asosiy sahifalar, test buyruqlari.
- [x] **docs/QUICK_REFERENCE.md**: "Test Results" yangilandi (Backend 480, Frontend 160).

### 2. Kritik tekshirishlar (≈1–2 soat)
- [x] **Build:** `pnpm build` – xatosiz (font CDN ga o‘tkazildi, Turbopack build xatosi bartaraf).
- [ ] **E2E:** `pnpm test:e2e` – backend + frontend ishlab turgan holda (`pnpm dev:both` keyin boshqa terminalda).
- [ ] **Asosiy flow qo'lda:** Bosh sahifa → mahsulot → savat → checkout → buyurtma → success → tracking.

### 3. Yetishmayotgan/kritik testlar (vaqt bo'lsa)
- [x] **Backend:** `tracking.api.test.ts` – 13 test (getOrderTracking, start, complete, updateDriverLocation).
- [ ] **Frontend:** OrdersPage, ProfilePage – unit test (rejada P2). Vaqt yetmasa – ertaga.

### 4. Xavfsizlik va deploy (≈30 min)
- [x] **DEPLOY_CHECKLIST.md** – pre-deploy ro‘yxati, production env jadvali.
- [x] **.env.example** – backend va frontend mavjud va to‘liq.

---

## Ertangi reja (Kun 2 – 22.02.2026)

### 1. Qolgan testlar va stabilite
- [ ] Backend: loyalty.api.test, promos.api.test (agar rejada bo'lsa).
- [ ] E2E: profile-flow.spec.ts, branches.spec.ts – vaqt bo'lsa.
- [ ] `pnpm test` va `pnpm test:e2e` barcha yashil.

### 2. Production tayyorgarlik
- [ ] Deploy (Render/Railway yoki tanlangan platforma) – backend + frontend.
- [ ] Health check va asosiy URL lar ishlashi.
- [ ] README da (yoki docs da) production URL va qisqa "How to deploy" bo'limi.

### 3. Yakuniy tekshirish
- [ ] Barcha MD fayllar (asosiy docs) da "Last Updated" yoki versiya sanasi to'g'ri.
- [ ] Loyiha ustida "final pass": lint, build, test, E2E.

---

## Qanday improvmentlar qilish mumkin (prioritet)

| # | Improvment | Qisqa | Vaqt |
|---|------------|--------|------|
| 1 | README to'ldirish | Loyiha tavsifi, buyruqlar, linklar | Bugun |
| 2 | QUICK_REFERENCE yangilash | Test sonlari, buyruqlar | Bugun |
| 3 | Build + E2E tekshirish | Xato yo'qligiga ishonch | Bugun |
| 4 | .env.example | Backend/frontend uchun to'liq | Bugun/ertaga |
| 5 | Deploy checklist | Production env, URL | Ertaga |
| 6 | To'lov (Payme/Click) | Rejada Faza 2 – 2 kunlik rejada emas | Keyin |
| 7 | SMS/xabarnoma | Rejada Faza 2 | Keyin |
| 8 | SEO (meta, sitemap) | Rejada Faza 3 | Keyin |

---

## Xatolardan qochish – tekshirishlar ro'yxati

- **Har bir o'zgarishdan keyin:** tegishli testlarni ishga tushiring (`pnpm test` yoki `pnpm test:frontend` / `pnpm test:backend`).
- **Commit oldidan:** `pnpm build` va kerak bo'lsa `pnpm test:e2e` (yoki hech bo'lmaganda `pnpm test`).
- **Env:** Hech qachon `.env` yoki `.env.local` ni repo ga commit qilmaslik; faqat `.env.example`.
- **Docs:** Faqat bitta "truth" – BUYRUQLAR.md (buyruqlar), TESTING_VA_IMPROVEMENT_REJA.md (katta reja), bu fayl (2 kunlik reja).

---

_Oxirgi yangilanish: 2026-02-21_
