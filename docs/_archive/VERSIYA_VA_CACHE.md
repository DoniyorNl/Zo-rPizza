# Package versiyalari va caching (tushuntirish)

Bu hujjatda loyihada **package versiyalarini bir standartda ushlab turish** va **test/build uchun caching** qanday ishlashi va nima qilganimiz tushuntiriladi.

---

## 1. Package versiyasini bir standartda ushlab turish

### Nima muammo edi?

- Bitta noto‘g‘ri yoki ziddiyatli package butun loyihani (build, CI) buzishi mumkin.
- Har bir developer yoki CI turli Node/pnpm versiyasida ishlasa, “menda ishlayapti, CI’da ishlamayapti” holati chiqadi.
- `package.json` da `^1.2.3` kabi versiyalar – har safar `pnpm install` yangi minor/patch olishi mumkin; biror yangilanish sinishi mumkin.

### Qanday yechim: lockfile + engines + .npmrc

#### 1) **Lockfile (pnpm-lock.yaml)**

- **npm** da: `package-lock.json`
- **pnpm** da: **`pnpm-lock.yaml`** – xuddi shu vazifani bajaradi.

**Lockfile nima qiladi?**

- `pnpm install` qilganda pnpm `pnpm-lock.yaml` ga qarab **aniq** (exact) versiyalarni o‘rnatadi.
- `package.json` da `"react": "^19.2.3"` bo‘lsa ham, lockfile da masalan `19.2.3` qat’iy yozilgan bo‘ladi – barcha muhitda bir xil versiya ishlatiladi.
- **Standart:** Loyiha root’ida **bitta** `pnpm-lock.yaml` bo‘ladi; barcha package’lar (frontend, backend) shu lockfile orqali bir xil versiyalarda.

**Nima qilish kerak:**

- Har doim **loyiha root’idan** `pnpm install` ishlatish (backend yoki frontend ichida alohida `pnpm install` emas).
- Lockfile’ni Git’ga commit qilish; yangi dependency qo‘shganda yoki yangilaganda `pnpm install` qilib, o‘zgarishlarni commit qilish.
- CI’da `pnpm install --frozen-lockfile` ishlatish – lockfile’dan tashqari versiya o‘rnatilmasin.

**Frontend uchun install qanday qilinadi? (root’dan)**

- **Faqat dependency’larni o‘rnatish** (lockfile’dagi barcha package’lar, jumladan frontend):  
  loyiha **root** papkasida:  
  `pnpm install`  
  Bu bitta `pnpm-lock.yaml` bo‘yicha frontend, backend va root’dagi barcha package’larni o‘rnatadi. Front uchun alohida `cd frontend && pnpm install` qilish shart emas.

- **Frontend’ga yangi package qo‘shish**:  
  yana **root**’dan, lekin **frontend** package’iga qo‘shish uchun `--filter frontend` ishlatiladi:
  - dependency:  
    `pnpm add <package-name> --filter frontend`  
    Masalan: `pnpm add date-fns --filter frontend`
  - devDependency:  
    `pnpm add -D <package-name> --filter frontend`  
    Masalan: `pnpm add -D @types/node --filter frontend`

  Shu buyruq frontend’ning `package.json` ga qo‘shadi va **root**’dagi `pnpm-lock.yaml` ni yangilaydi. Keyin odatda `pnpm install` qayta ishlatish shart emas – add o‘zi lockfile’ni yangilaydi.

- **Backend’ga yangi package qo‘shish**:  
  `pnpm add <package-name> --filter zor-pizza-backend`  
  (yoki dev uchun: `pnpm add -D <package-name> --filter zor-pizza-backend`)

**Xulosa:** `package-lock.json` kabi **pnpm da lockfile – `pnpm-lock.yaml`**. Boshqa alohida “package lock json” kerak emas; muhimi – bitta lockfile va uni doim root’dan ishlatish.

#### 2) **engines (package.json)**

- Root, backend va frontend `package.json` lariga **engines** qo‘shdik:
  - `"node": ">=18"`
  - Root’da qo‘shimcha: `"pnpm": ">=8"`

**Nima uchun?**

- Node yoki pnpm versiyasi talabdan past bo‘lsa, loyiha ishlamasligi aniq bo‘ladi.
- `.npmrc` da `engine-strict=true` qo‘yilganda – `pnpm install` Node/pnpm versiyasini tekshiradi; mos kelmasa install xato beradi. Shunday qilib hamma (developer va CI) bir xil standartda ishlaydi.

#### 3) **.npmrc (root)**

- `engine-strict=true` – engines’da ko‘rsatilgan Node/pnpm talabiga rioya qilishni majburlaydi.

### Qisqacha

| Vazifa | Buyruq (barchasi loyiha **root**’idan) |
|--------|----------------------------------------|
| Barcha dependency’larni o‘rnatish (front + back) | `pnpm install` |
| Frontend’ga yangi package qo‘shish | `pnpm add <package> --filter frontend` (yoki `-D` dev uchun) |
| Backend’ga yangi package qo‘shish | `pnpm add <package> --filter zor-pizza-backend` (yoki `-D` dev uchun) |
| Aniq versiyalarni saqlash | **pnpm-lock.yaml** (bitta, root’da) |
| Node/pnpm standarti | **engines** (package.json) + **.npmrc** (engine-strict=true) |
| CI’da install | `pnpm install --frozen-lockfile` |

Boshqa maxsus “package lock json” yoki qo‘shimcha usul kerak emas – pnpm-lock.yaml + engines yetadi.

---

## 2. Caching: avvalgi natijalar eslab qolinsin, faqat o‘zgargan qismlar test/build qilinsin

### Nima ma’nosi?

- **useEffect** ning dependency array’i kabi: dependency o‘zgaganda effect qayta ishlaydi, o‘zgamaganda eski holat ishlatiladi.
- Test/build da ham: **o‘zgargan fayllar** bo‘yicha qayta test/build qilinsa va qolgani **cache**’dan olinsa – tezroq natija beradi.

### Loyihada qanday caching qo‘shdik

#### A) **Jest cache (unit/integration testlar)**

- **Jest** o‘zi transform natijalarini (masalan TypeScript → JS) cache’ga yozadi.
- Biz **cacheDirectory** ni aniq belgiladik:
  - Frontend: `frontend/.jest-cache`
  - Backend: `backend/.jest-cache`
- Keyingi test ishga tushganda: o‘zgarmagan fayllar uchun transform qayta ishlamaydi, cache’dan olinadi – testlar tezroq tugaydi.
- **CI** da: `frontend/.jest-cache` va `backend/.jest-cache` ni **actions/cache** bilan saqlaymiz; keyingi run’da restore qilinadi, shuning uchun CI ham tezroq ishlaydi.

Bu “faqat o‘zgargan qismlar test qilinsin” ga yaqin: Jest o‘zgargan fayllar bo‘yicha transform’ni qayta hisoblaydi, qolgani cache’dan.

#### B) **Faqat o‘zgargan fayllar bo‘yicha test: test:changed**

- **Jest** da `--onlyChanged` va `--changedSince=main` bor.
- Script qo‘shdik:
  - Frontend: `pnpm test:changed` → `jest --onlyChanged --changedSince=main`
  - Backend: `pnpm test:changed` → xuddi shu
- **Ma’nosi:** Git’da `main` dan farq qilgan fayllar bo‘yicha **faqat shu fayllarga bog‘liq** testlar ishga tushadi. Qolgan testlar ishlamaydi – vaqt tejaydi.
- Bu **useEffect dependency** ga o‘xshaydi: “main’dan o‘zgarganlar” = dependency o‘zgagan, shu bo‘yicha test qayta ishga tushdi.

**Eslatma:** To‘liq ishonch uchun vaqt-vaqtida `pnpm test` (barcha testlar) yoki CI’da har push’da to‘liq test ishlatish ma’qul.

#### C) **Next.js build cache**

- **Next.js** build vaqtida `.next/cache` ga ma’lumot yozadi.
- CI’da **frontend/.next/cache** ni **actions/cache** bilan saqlaymiz.
- Keyingi CI run’da cache restore qilinsa – Next.js qayta hisoblamaydigan qismlarni cache’dan oladi, build tezroq tugaydi.

#### D) **pnpm store (CI)**

- **setup-node** da `cache: 'pnpm'` – pnpm dependency’lari cache’lanadi, keyingi run’da install tezroq bo‘ladi.

### Caching qisqacha

| Qayerda | Nima cache qilinadi | Ma’no |
|---------|----------------------|--------|
| Jest (mahalliy) | `.jest-cache` | Transform natijalari – testlar tezroq |
| Jest (CI) | `frontend/.jest-cache`, `backend/.jest-cache` | CI testlari tezroq |
| Next.js (CI) | `frontend/.next/cache` | Build tezroq |
| pnpm (CI) | pnpm store | `pnpm install` tezroq |
| Faqat o‘zgargan test | `pnpm test:changed` | main’dan o‘zgarganlar bo‘yicha test – vaqt tejash |

### “useEffect dependency” bilan o‘xshashlik

- **useEffect** – dependency o‘zgaganda effect qayta ishlaydi.
- **Jest cache** – fayl kontenti (yoki path) o‘zgaganda transform/test qayta ishlaydi, qolgani cache’dan.
- **test:changed** – Git’da `main` dan o‘zgargan fayllar = “dependency o‘zgagan”; faqat shular bo‘yicha test ishga tushadi.

Shu usullar bilan “avvalgi natijalar eslab qolinadi” va “faqat o‘zgargan qismlar” bo‘yicha ish yengillashtirildi.

---

## 3. CI’da qilgan o‘zgarishlar (qisqacha)

- **Bitta install:** Root’dan `pnpm install --frozen-lockfile` – bitta lockfile, bir xil versiyalar.
- **Build qadam:** Testlardan keyin `pnpm build` – build broken bo‘lsa CI xato beradi.
- **Cache:** Next.js (frontend/.next/cache), Jest (frontend va backend .jest-cache), pnpm store – tezroq CI.
- **Prisma:** `pnpm --filter zor-pizza-backend run prisma:generate` – client generatsiya aniq bajariladi.

Agar boshqa savol bo‘lsa (masalan, Turborepo/Nx kabi “faqat o‘zgargan package’lar build/test” qilish), alohida muhokama qilish mumkin.
