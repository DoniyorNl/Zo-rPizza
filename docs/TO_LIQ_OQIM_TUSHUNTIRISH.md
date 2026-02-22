# To‘liq oqim: Git, GitHub, Branch2, Main, PR, Railway, CodeRabbit

**Maqsad:** Commit, push, pull, branch, main, branch2, PR, build, test, Railway, CodeRabbit – hammasi qanday bog‘langan va qaysi tartibda ishlashi kerak.

---

## 1. Nima nima?

| So‘z | Qisqacha ma’nosi |
|------|-------------------|
| **Git** | Kod versiyalarini saqlash dasturi (mahalliy kompyuteringizda). |
| **GitHub** | Kodni bulutda saqlash – siz va boshqalar bir repoda ishlaysiz. |
| **Repo (repository)** | Bitta loyiha – barcha fayllar, tarix. GitHub da "Zo-rPizza" repo. |
| **Branch** | Repo ning bir nusxasi. **main** – asosiy; **branch2** – siz ishlayotgan nusxa. |
| **Commit** | Bir nechta o‘zgarishlarni "sahifa" sifatida saqlash (mahalliy). |
| **Push** | Mahalliy commitlarni GitHub ga yuborish. |
| **Pull** | GitHub dagi yangiliklarni mahalliyga tortib olish. |
| **PR (Pull Request)** | "Mening branch2 imni main ga qo‘shing" degan so‘rov. |
| **Merge** | PR qabul qilinib, branch2 dagi kod main ga yoziladi. |
| **Railway** | Kodni internet da ishlatish (backend/frontend deploy). |
| **CodeRabbit** | PR ochilganda avtomatik kod tekshiruvi (sharh qoldiradi). |
| **Build** | Kodni "ishga tayyor" qilish (masalan `pnpm build`). |
| **Test** | Kod to‘g‘ri ishlashini tekshirish (`pnpm test`). |

---

## 2. Oqim – bitta chiziqda

```
Siz (kompyuter)          GitHub                    Railway / CodeRabbit
─────────────────────────────────────────────────────────────────────────

1. Kod o‘zgartirasiz
   (branch2 da)

2. git add + git commit
   → o‘zgarishlar mahalliy
   "sahifa" bo‘ldi

3. git push origin branch2
   → GitHub dagi "branch2"
   yangilandi

4. (Ixtiyoriy) GitHub da
   Pull Request ochasiz:
   "branch2 → main"

5. CodeRabbit PR ni
   ko‘rib sharh qiladi

6. Siz yoki boshqa
   "Merge" qiladi
   → main yangilandi

7. Railway main (yoki
   branch2) dan build
   olib deploy qiladi
```

---

## 3. Qadam-baqadam (sizning ishingiz)

### A. Oddiy ish kuni (kod yozasiz, GitHub ga yuborasiz)

| Qadam | Buyruq yoki harakat | Nima bo‘ldi? |
|-------|----------------------|--------------|
| 1 | Loyihada fayllarni o‘zgartirasiz | O‘zgarishlar faqat sizning kompyuteringizda. |
| 2 | `git status` | Qaysi fayllar o‘zgargani ko‘rinadi. |
| 3 | `git add .` (yoki aniq fayllar) | O‘zgarishlar "staged" – commit ga tayyor. |
| 4 | `git commit -m "qisqa xabar"` | Bitta "sahifa" (commit) yaratildi – hali faqat mahalliy. |
| 5 | `git push origin branch2` | Bu commit(lar) **GitHub** dagi **branch2** ga yuborildi. |

**Push** = mahalliy branch2 ni GitHub dagi branch2 ga **yuborish**.  
**Pull** = GitHub dagi branch2 ni mahalliy branch2 ga **tortib olish** (`git pull origin branch2`).

---

### B. "Main ga qo‘shish" (PR va merge)

| Qadam | Qayerda | Nima qilasiz? |
|-------|----------|----------------|
| 1 | GitHub (brauzer) | Repo → **Pull requests** → **New pull request**. |
| 2 | GitHub | **base: main**, **compare: branch2** tanlaysiz → **Create pull request**. |
| 3 | GitHub | PR sahifasida tavsif yozasiz (nima o‘zgargani, qanday tekshirish). |
| 4 | CodeRabbit | PR ochilgach avtomatik kodni ko‘rib sharh qoldiradi (siz hech narsa qilmasiz). |
| 5 | GitHub | **Merge pull request** → **Confirm merge**. Endi **main** da branch2 dagi kod bor. |

**PR** = "branch2 ni main ga birlashtirish" so‘rovi.  
**Merge** = bu so‘rovni qabul qilish – main yangilanadi.

---

### C. Build va test qayerda?

| Joy | Build / Test | Izoh |
|-----|----------------|------|
| **Sizning kompyuteringiz** | `pnpm build`, `pnpm test` | Push dan oldin tekshirish uchun. |
| **GitHub Actions (CI)** | Push qilganda avtomatik `pnpm install`, `pnpm test`, `pnpm build` | `.github/workflows/ci.yml` – branch2 (yoki main) ga push bo‘lganda ishlaydi. |
| **Railway** | Deploy paytida `pnpm install`, `pnpm build`, `pnpm start` | Kodni "jonli" serverni yaratish uchun. |

**Build** = loyihani ishga tayyorlash.  
**Test** = xato yo‘qligini tekshirish.  
Ikkovi ham: mahalliy (qo‘lda), GitHub CI (avtomatik), Railway (deploy uchun).

---

### D. Railway qaysi branch dan oladi?

- Railway **Settings** → **Source** (yoki **Repository**) → **Branch**.
- U yerda **main** yoki **branch2** yozilgan bo‘ladi.
- **branch2** qilsangiz – har deploy da **branch2** dagi kod build bo‘ladi.
- **main** qilsangiz – faqat **main** dagi kod (PR merge qilingandan keyin main yangi bo‘ladi).

Shuning uchun:  
- Agar hali merge qilmagan bo‘lsangiz va Railway **main** dan olayotgan bo‘lsa – Railway da eski kod ishlaydi.  
- Railway ni **branch2** qilsangiz – branch2 ga push qilganingizdan keyin yangi deploy yangi kodni oladi.

---

## 4. Ikki stsenariy (soddalashtirilgan)

### Stsenariy 1: Faqat branch2 da ishlaysiz, Railway ham branch2 dan

1. Kod yozasiz → `git add` → `git commit` → `git push origin branch2`.
2. GitHub da branch2 yangilanadi.
3. Railway branch2 dan build oladi → Redeploy → sayt yangi kod bilan ishlaydi.
4. Main ni hozircha o‘zgartirmaysiz. PR kerak emas (agar faqat o‘zingiz ishlasangiz).

### Stsenariy 2: Branch2 ni main ga birlashtirmoqchisiz (PR)

1. Kod yozasiz → `git add` → `git commit` → `git push origin branch2`.
2. GitHub da **Pull request** ochasiz: branch2 → main.
3. CodeRabbit PR ni tekshiradi (avtomatik).
4. GitHub Actions (CI) build va test ishlaydi (agar sozlangan bo‘lsa).
5. Siz **Merge** qilasiz → main da endi branch2 dagi kod.
6. Railway **main** dan olayotgan bo‘lsa – keyingi deploy main dan (yangilangan) build oladi.

---

## 5. Chalkashmaslik uchun esda tuting

- **Commit** – mahalliy. **Push** – GitHub ga yuborish.  
- **branch2** – ishlash branch. **main** – "tayyor" asosiy branch.  
- **PR** – branch2 ni main ga qo‘shish so‘rovi. **Merge** – so‘rovni qabul qilish.  
- **Pull** – GitHub dan mahalliy ga tortib olish (`git pull`). **Push** – mahalliy dan GitHub ga yuborish.  
- **Build/Test** – mahalliy (qo‘lda), GitHub CI (push da), Railway (deploy da) – har biri o‘z joyida.  
- **CodeRabbit** – faqat PR ochilganda ishlaydi, commit yoki push qilishdan mustaqil.

---

## 6. Tezkor havola (buyruqlar)

```bash
# Mahalliy: o‘zgarishlarni ko‘rish
git status

# Mahalliy: commit
git add .
git commit -m "qisqa xabar"

# GitHub ga yuborish (branch2)
git push origin branch2

# GitHub dan tortib olish (branch2)
git pull origin branch2
```

PR va merge – faqat GitHub veb-sahifasida (brauzerda).  
Railway branch – Railway dashboard → Service → Settings → Source → Branch.

---

_Oxirgi yangilanish: 2026-02-22_
