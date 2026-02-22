# Branch2 dan yangi kodni repo ga tushirish – to‘liq jarayon

**Maqsad:** Branch2 dagi barcha o‘zgarishlarni GitHub ga push qilish, Railway build xatosini tuzatish, keyin main ga merge qilib reponi yangilash.

---

## A. Railway build xatosi (ERR_PNPM_OUTDATED_LOCKFILE)

**Sabab:** Railway (yoki boshqa CI) repodan **pnpm-lock.yaml** ni oladi. Agar u fayl **socket.io** ni o‘z ichiga olmasa (eski versiya bo‘lsa), `pnpm install --frozen-lockfile` xato beradi.

**Yechim:** Root **pnpm-lock.yaml** ni package.json ga mos holatda commit qilib, **branch2** ga push qilish kerak. Sizda mahalliy lockfile da socket.io bor – uni repo ga yuborish kifoya.

---

## B. Qadam-baqadam: Branch2 → Push → Merge → Repo yangilangan

### 1-qadam: Mahalliy loyihada tekshirish

Terminalda (loyiha root – `Zo-rPizza/`):

```bash
cd /Users/mac/Desktop/Zo-rPizza

# Qaysi branch da ekanligingiz
git branch

# Lockfile o‘zgarganmi?
git status
```

Agar **pnpm-lock.yaml** "modified" yoki "untracked" bo‘lmasa, avval lockfile ni yangilang:

```bash
pnpm install
git status   # endi pnpm-lock.yaml modified bo‘lishi kerak
```

---

### 2-qadam: Barcha kerakli o‘zgarishlarni commit qilish

```bash
# Root lockfile (muhim – Railway uchun)
git add pnpm-lock.yaml

# Boshqa yangi/o‘zgargan fayllar (hujjatlar, .github, .coderabbit va h.k.)
git add .
# Yoki aniq: git add docs .github .coderabbit.yaml backend frontend

# Nima commit qilinishini ko‘ring ( .env, .env.local bo‘lmasin )
git status

# Commit
git commit -m "chore: pnpm-lock.yaml yangilash (socket.io), docs va CI sozlamalari"
```

Agar **"nothing to commit"** chiqsa – mahalliy lockfile allaqachon oxirgi commit da. Demak:
- **Push** qiling: `git push origin branch2` – GitHub dagi branch2 yangilanadi.
- Railway **branch2** dan build olayotgan bo‘lishi kerak (4-qadam). Agar Railway **main** dan build olayotgan bo‘lsa, branch2 ni push qilganda main hali eski – shuning uchun Railway da Source/Branch ni **branch2** qiling yoki branch2 ni main ga merge qiling (5-qadam).

---

### 3-qadam: Branch2 ni GitHub ga push qilish

```bash
git push origin branch2
```

Agar birinchi marta push qilsangiz:

```bash
git push -u origin branch2
```

Shundan keyin GitHub dagi **branch2** yangi kod (jumladan yangi **pnpm-lock.yaml**) bilan yangilanadi. Railway **branch2** dan build olayotgan bo‘lsa, keyingi deploy da lockfile xatosi ketishi kerak.

---

### 4-qadam: Railway da branch ni tekshirish

1. Railway dashboard → loyihangiz → **Settings** (yoki Service sozlamalari).
2. **Build** / **Source** bo‘limida **Branch** qaysi ekanini ko‘ring.
3. Agar **main** ko‘rsatilgan bo‘lsa – uni **branch2** qiling (yoki **branch2** dan deploy qiladigan qilib sozlang).
4. **Redeploy** / **Deploy** tugmasini bosing – yangi build **branch2** dan oladi va yangi **pnpm-lock.yaml** ishlatiladi.

---

### 5-qadam: Branch2 ni main ga merge qilish (repo to‘liq yangilanishi uchun)

GitHub da:

1. Repo sahifasiga o‘ting.
2. **Pull requests** → **New pull request**.
3. **base:** `main`, **compare:** `branch2` tanlang.
4. **Create pull request** – sarlavha va tavsif yozing.
5. CI (Actions) va CodeRabbit tekshiruvi o‘tsa, **Merge pull request** → **Confirm merge**.

Yoki terminal orqali (main ni branch2 bilan yangilash):

```bash
git checkout main
git pull origin main
git merge branch2
git push origin main
```

Shundan keyin **main** branch ham yangi kodga ega bo‘ladi. Railway ni yana **main** dan build qiladigan qilib qo‘ysangiz, keyingi deploy lar main dan oladi.

---

### 6-qadam: Xulosa

| Qadam | Nima qilindi |
|-------|----------------|
| 1–2   | Mahalliy: `pnpm install` → `git add pnpm-lock.yaml` (+ boshqa) → `git commit` |
| 3     | `git push origin branch2` – GitHub dagi branch2 yangilandi |
| 4     | Railway da branch = branch2, Redeploy – build lockfile xatosiz o‘tadi |
| 5     | GitHub da branch2 → main merge – repo to‘liq yangilandi |

---

## Tezkor buyruqlar (barcha o‘zgarishlar branch2 da)

```bash
cd /Users/mac/Desktop/Zo-rPizza
git status
pnpm install
git add pnpm-lock.yaml
git add .
git status
git commit -m "chore: pnpm-lock.yaml (socket.io), docs va sozlamalar"
git push origin branch2
```

Keyin: Railway da branch2 dan redeploy; kerak bo‘lsa GitHub da branch2 → main merge.

---

_Oxirgi yangilanish: 2026-02-22_
