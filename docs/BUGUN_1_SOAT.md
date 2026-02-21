# Bugun 1 soat – nima qilamiz?

**Maqsad:** 1 soat ichida eng foydali va yakunlanishi mumkin bo‘lgan ishlar.

---

## ✅ Avtomatik bajarilgan (CI)

- **GitHub Actions** – `main` va `branch2` ga push qilganda ishlaydi:
  - `pnpm install --frozen-lockfile`
  - Prisma generate, backend testlar, frontend testlar, `pnpm build`
- Branch nomi o‘zgarsa: `.github/workflows/ci.yml` da `branches` ga qo‘shing.

---

## 1 soatlik reja (qo‘lda)

### Variant A: E2E tekshirish (~25–30 min)

1. **Terminal 1:** Backend + frontend ishga tushiring  
   ```bash
   pnpm dev:both
   ```
2. **Terminal 2:** So‘rovlar tushgach (≈30 s) E2E ishga tushiring  
   ```bash
   pnpm test:e2e
   ```
3. Agar testlar fail bo‘lsa – qaysi spec (fayl) va qaysi test xato berganini yozib oling; keyin tuzatish rejaga qo‘shiladi.

### Variant B: Qo‘lda asosiy flow (~20 min)

1. `pnpm dev:both` ishga tushiring.
2. Brauzerda tekshiring:
   - [ ] Bosh sahifa `/` – kategoriyalar, mahsulotlar ko‘rinadi
   - [ ] Mahsulot → o‘lcham tanlash → Savatga qo‘shish
   - [ ] Savat `/cart` – narx, Checkout tugmasi
   - [ ] Checkout `/checkout` – forma to‘ldirish, Buyurtma berish (login kerak bo‘lishi mumkin)
   - [ ] Success sahifa → Tracking tugmasi
   - [ ] `/orders` – buyurtmalar ro‘yxati (login kerak)

### Variant C: Bitta kichik test yozish (~40 min)

- **OrdersPage** yoki **ProfilePage** uchun minimal unit test (render, asosiy elementlar).
- Joy: `frontend/__tests__/pages/OrdersPage.test.tsx` (yoki ProfilePage).
- Namuna: `frontend/__tests__/pages/CheckoutPage.test.tsx` dan nusxa oling.

### Variant D: Hujjat va deploy (~15 min)

- `docs/deployment/DEPLOYMENT_GUIDE.md` ni o‘qib, production uchun qaysi env o‘zgaruvchilari kerakligini ro‘yxatga oling.
- `DEPLOY_CHECKLIST.md` dagi pre-deploy ro‘yxatini bajarib, `pnpm build` va `pnpm test` o‘tishini tasdiqlang.

---

## Qisqa jadval

| Vaqt   | Qilish mumkin                    |
|--------|-----------------------------------|
| 15 min | E2E ishga tushirish (dev:both + test:e2e) |
| 20 min | Qo‘lda asosiy flow tekshirish    |
| 40 min | OrdersPage yoki ProfilePage test |
| 15 min | Deploy checklist + build/test     |

**Tavsiya:** Agar serverlar ishlab turgan bo‘lsa – **Variant A** (E2E); aks holda **Variant B** (qo‘lda flow) yoki **Variant D** (checklist + build/test).

---

_Oxirgi yangilanish: 2026-02-21_
