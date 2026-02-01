# Zo-rPizza: Kattalashgan loyihada yuzaga keladigan muammolar (jiddiylik bo‘yicha)

Loyiha kattalashgani bilan quyidagi muammolar yuzaga kelishi yoki kuchayishi mumkin. Raqamlar jiddiylik darajasini bildiradi (1 = eng jiddiy).

---

## 1. **Xavfsizlik: maxfiy ma’lumotlar va Git**

- **Firebase service account JSON** – `.gitignore` da faqat `firebase-service-account.json` bor; `zo-rpizza-firebase-adminsdk-*.json` qo‘shilmagan. Agar bu fayl Git’ga commit qilingan bo‘lsa, maxfiy kalitlar ochiq bo‘ladi.
- **`.env`** – Git status’da `backend/.env` o‘zgargan ko‘rinadi; `.env` hech qachon commit qilinmasligi kerak.
- **Production URL** – `https://zo-rpizza-production.up.railway.app` frontend’da 3 ta faylda (api.ts, apiClient.ts, apiFetch.ts) qattiq yozilgan; environment orqali boshqarilishi ma’qul.

**Natija:** Birorta maxfiy fayl commit qilinsa, butun loyiha va production xavf ostida qoladi.

---

## 2. **Dependency: bitta noto‘g‘ri package butun loyihani “yiqitishi”**

- **Monorepo** – Root, backend, frontend, e2e – bitta `pnpm-workspace`. Backend’da `pnpm install` yoki bitta package’ning yangi versiyasi muammoli bo‘lsa, CI/build butunlay ishlamay qolishi mumkin.
- **Versiya ziddiyati** – Frontend (React 19, Next 16) va backend (Prisma 6, Node 18) turli zanjirlarga bog‘langan; biror joyda major yangilansa boshqa qismlar sinishi mumkin.
- **Lockfile** – Root va backend’da alohida `pnpm-lock.yaml`; birini yangilab, ikkinchisini unutsa, “ishlayapti – ishlamayapti” holati paydo bo‘ladi.

**Natija:** Kichkina package o‘zgartirish yoki `pnpm install` butun build/test/CI’ni buzishi mumkin.

---

## 3. **Kod takrorlanishi: bir joyni o‘zgartirish, hammasini scan qilish**

- **API URL logikasi** – `getSmartApiUrl()` va production URL 3 ta joyda takrorlanadi: `lib/api.ts`, `lib/apiClient.ts`, `lib/apiFetch.ts`. Biror mantiqni o‘zgartirish kerak bo‘lsa, 3 ta faylni topib, bir xil o‘zgartirish qilish kerak.
- **Tracking sahifa** – `process.env.NEXT_PUBLIC_API_URL` to‘g‘ridan-to‘g‘ri ishlatiladi; env bo‘lmasa `undefined` + URL = xato. Boshqa API chaqiruqlari `api` (axios) yoki `apiFetch` ishlatadi – yagona nuqta yo‘q.
- **Error logging URL** – `ErrorBoundary.tsx` va `errorTracking.ts` yana `NEXT_PUBLIC_API_URL` ni alohida chaqiradi.

**Natija:** Kichkina “faqat API URL’ni o‘zgartirish” uchun ham loyihani scan qilib, barcha ishlatilgan joylarni topish kerak bo‘ladi.

---

## 4. **Workspace va struktura nomuvofiqligi**

- **pnpm-workspace.yaml** – `packages: frontend, backend, shared` ko‘rsatilgan, lekin `shared` papkasi yo‘q. Script’lar `shared` ga tayanmaydi, lekin kelajakda `pnpm -r` yoki yangi package qo‘shilganda chalkashlik beradi.
- **e2e** – `e2e/` root’da, lekin workspace’da package sifatida ko‘rsatilmagan; `test:e2e` frontend orqali ishga tushadi. E2E alohida context (backend URL, env) talab qilsa, sozlash chalkashishi mumkin.

**Natija:** Yangi developer yoki yangi package qo‘shilganda “shared qayerda?”, “e2e qaysi package?” degan savollar va noto‘g‘ri qarorlar chiqadi.

---

## 5. **CI/build: to‘liq tekshiruv yo‘q**

- **CI** – Faqat backend va frontend unit/integration testlar ishlaydi; **build** (masalan `pnpm build`) va **e2e** CI’da yo‘q. Build broken bo‘lsa, merge’dan keyin aniqlanadi.
- **Backend build** – `"build": "echo 'Build skipped for production'"` – haqiqiy compile/bundle yo‘q; production’da `tsx src/server.ts` kabi ishlatilayotgan bo‘lsa, xato production’da ochiladi.
- **E2E** – Playwright testlar CI’da ishlamaydi; regressiya yoki “localhost” ga bog‘liq muammolar tez-tez tutilmaydi.

**Natija:** Kichkina breaking o‘zgarish main’ga kirib, production’da yoki keyinroq e2e’da aniqlanadi.

---

## 6. **Hujjatlar ko‘p va eskirishi mumkin**

- **docs/** – 20+ MD fayl (BACKEND_TESTING, CLEANUP_SUMMARY, DAILY_LOG_*, deployment, development, …). Qaysi biri hozirgi qoidalar, qaysi biri eskirgan – aniq emas.
- **Kod ichidagi izohlar** – Ba’zi fayllarda “🆕”, “📝 UPDATED” kabi belgilar; vaqt o‘tishi bilan chalg‘ituvchi bo‘ladi.
- **ENVIRONMENT.md** – Bir necha joyda (root, backend, frontend); yangilanishlar bir joyda qolib, boshqasida eskirgan qolishi mumkin.

**Natija:** Muammoni tuzatish uchun “qaysi hujjat to‘g‘ri?” deb butun docs’ni scan qilish talab etiladi.

---

## 7. **Import va bog‘liqliklar: uzoq zanjir**

- **Frontend** – 100+ faylda `@/` yoki `../` import’lar; bir komponent yo‘li o‘zgarsa (papka ko‘chirilsa, nom o‘zgarsa), ko‘p fayllarda xato chiqadi.
- **Umumiy tiplar** – Frontend’da `types/` (category, deal), backend’da Prisma + validators; bir xil entity uchun 2 ta “truth” – API kelgan ma’lumot va frontend type mos kelmasa, runtime xatolar.
- **Admin va shop** – Admin (dashboard, products, users, …) va shop (menu, cart, checkout, tracking) alohida bo‘limlar; umumiy komponentlar (button, card, api) ularga aralash bog‘langan. Bir bo‘limdagi o‘zgarish boshqasiga ta’sir qilishi mumkin.

**Natija:** Kichkina refactor (papka/komponent nomi) katta miqdorda fayllarni tekshirish va tuzatishni talab qiladi.

---

## 8. **Environment va konfiguratsiya tarqalgan**

- **NEXT_PUBLIC_API_URL** – 7+ joyda ishlatiladi; ba’zida fallback bor, ba’zida yo‘q (tracking sahifa to‘g‘ridan-to‘g‘ri `process.env.NEXT_PUBLIC_API_URL`).
- **Backend** – PORT, CORS, FRONTEND_URL(S), ALLOW_LOCALHOST_ORIGIN, FIREBASE_SERVICE_ACCOUNT_BASE64, DATABASE_URL – barchasi .env’da; hammasi to‘g‘ri bo‘lmasa, server ishlamaydi yoki xavfsizlik zaiflashadi.
- **Test** – Jest (frontend/backend), Playwright (e2e); har biri o‘z env ehtiyojlari – chalkashlik va “faqat CI’da ishlamaydi” holatlari.

**Natija:** “Ishlamayapti” degan xabar kelganda, avvalo qaysi env qaysi muhitda kerak – butun loyihani tekshirish kerak.

---

## 9. **Test qamrovi va tez feedback**

- **Unit/integration** – Backend’da ko‘p unit test, frontend’da komponent/hook testlar bor; lekin barcha route’lar va kritik flow’lar qamrab olinganligi aniq emas.
- **E2E** – 3 ta spec (admin, order, tracking); boshqa kritik yo‘llar (login, register, menu, checkout to‘liq) e2e’da bo‘lmasa, refactor qilganda regressiya osongina qochadi.
- **CI vaqt** – Backend + frontend testlar ketma-ket; loyiha kattalashsa, har push’da kutish vaqti oshadi, developer’lar testlarni mahalliy ishlamay qo‘yishi mumkin.

**Natija:** Kichkina o‘zgarish katta buzilishlarni yashirib qoladi, aniqlash vaqtida butun loyiha scan qilinadi.

---

## 10. **Rivojlantirish tajribasi (DX)**

- **Ishga tushirish** – `dev`, `dev:backend`, `dev:both` – yangi developer qaysi birini, qanday tartibda ishlatish kerakligini bilishi kerak; backend’siz frontend, frontend’siz e2e to‘liq mantiqiy bo‘lmaydi.
- **Node/pnpm versiyalari** – CI’da Node 18; mahalliy mashinada boshqa versiya bo‘lsa, “menda ishlayapti” / “CI’da ishlamayapti” muammolari.
- **Prisma** – Backend’da postinstall’da `prisma generate`; `node_modules` to‘liq o‘chirilganda yoki cache buzilsa, generate qayta ishlashi kerak – buni har doim eslab turish qiyin.

**Natija:** Kichkina muammoni tuzatish uchun ham “qanday ishga tushirish kerak?” va “nimaga xato?” ni aniqlash uchun loyihani keng scan qilish talab etiladi.

---

## Qisqacha tartib (jiddiylik bo‘yicha)

| # | Muammo turi | Asosiy ta’sir |
|---|-------------|----------------|
| 1 | Maxfiy ma’lumotlar / Git | Loyiha va production xavfsizligi |
| 2 | Dependency / package | Build, CI, ishga tushish butunlay buzilishi |
| 3 | Kod takrorlanishi (API URL va b.) | Har bir kichkina o‘zgarishda butun loyihani scan qilish |
| 4 | Workspace (shared, e2e) | Chalkashlik, noto‘g‘ri qarorlar |
| 5 | CI/build to‘liq emas | Xatolar main’da yoki production’da ochiladi |
| 6 | Hujjatlar ko‘p va eskirgan | To‘g‘ri qoidalarni topish qiyin |
| 7 | Import zanjiri va tiplar | Refactor katta va xavfli |
| 8 | Environment tarqalgan | “Ishlamayapti” – qayerda muammo aniq emas |
| 9 | Test qamrovi | Regressiya kech aniqlanadi |
| 10 | DX (qanday ishlatish) | Har bir kichkina vazifa uchun vaqt yo‘qotiladi |

---

## Hal qilingan o‘zgarishlar (qisqacha)

| # | Muammo | Qilingan ish |
|---|--------|----------------|
| 1 | Maxfiy ma’lumotlar / Git | `backend/.gitignore` ga `*-firebase-adminsdk-*.json`, `zo-rpizza-firebase-adminsdk-*.json` qo‘shildi. API base URL bitta modulda: `frontend/lib/apiBaseUrl.ts`; barcha chaqiruqlar shu orqali. |
| 2 | Dependency / versiya standarti | Root, backend, frontend’da **engines** (node >=18, pnpm >=8). Root’da **.npmrc** (engine-strict=true). CI root’dan **bitta** `pnpm install --frozen-lockfile`. |
| 3 | Kod takrorlanishi (API URL) | **apiBaseUrl.ts** – yagona manba; api.ts, apiClient.ts, apiFetch.ts, tracking, ErrorBoundary, errorTracking shu moduldan foydalanadi. |
| 4 | Workspace | **pnpm-workspace.yaml** dan `shared` olib tashlandi (papka yo‘q edi). |
| 5 | CI/build va caching | CI: root’dan install, Prisma generate, backend test, frontend test, **pnpm build**. Cache: pnpm, Next.js (.next/cache), Jest (frontend va backend .jest-cache). |
| 6–10 | Hujjatlar, import, env, test, DX | **docs/VERSIYA_VA_CACHE.md** qo‘shildi (versiya + caching tushuntirishi). **test:changed** script’lar (Jest --onlyChanged --changedSince=main). Jest cacheDirectory aniqlandi. |

Batafsil: **docs/VERSIYA_VA_CACHE.md** – package versiyalari va caching haqida.
