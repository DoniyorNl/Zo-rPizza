# Railway: pnpm-lock.yaml "out of date" – qanday tuzatish

## Xato

```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with <ROOT>/package.json
...
specifiers in the lockfile (...) don't match specs in package.json (..., "socket.io":"^4.7.0", ...)
```

**Ma’no:** Repoda (GitHub) yotgan **pnpm-lock.yaml** da `socket.io` yo‘q. Backend **package.json** da esa `socket.io` bor. Railway shu repodan clone qiladi – lockfile eski bo‘lgani uchun xato.

---

## Yechim: yangi lockfile ni commit va push qilish

Mahalliy moshinangizda **root** papkada (Zo-rPizza/) bajarasiz:

### 1. Lockfile ni yangilang

```bash
cd /Users/mac/Desktop/Zo-rPizza
pnpm install
```

(Backend da `socket.io` bor – `pnpm install` root lockfile ni avtomatik yangilaydi.)

### 2. Lockfile o‘zgarganini tekshiring

```bash
git status
```

**pnpm-lock.yaml** "modified" ko‘rinishi kerak. Agar ko‘rinmasa – allaqachon yangi bo‘lishi mumkin; 3-qadamga o‘ting.

### 3. Faqat lockfile ni commit qiling

```bash
git add pnpm-lock.yaml
git status
git commit -m "chore: pnpm-lock.yaml yangilash (socket.io)"
git push origin branch2
```

### 4. GitHub da tekshiring

1. GitHub → reponingiz → **branch2** branch ni tanlang.
2. **pnpm-lock.yaml** faylini oching.
3. **Ctrl+F** (yoki Cmd+F) → **socket.io** qidiring – u yerda `socket.io:` yoki `socket.io@` bo‘lishi kerak.

Agar bor bo‘lsa – Railway keyingi deploy da shu fayldan foydalanadi va xato ketadi.

### 5. Railway da Redeploy

Railway dashboard → **Redeploy** (yoki yangi commit tushganda avtomatik deploy).

---

## Agar "nothing to commit" chiqsa

Agar `git add pnpm-lock.yaml` dan keyin ham "nothing to commit" bo‘lsa:

- **Variant A:** Lockfile allaqachon oxirgi commit da – lekin **push** qilinmagan.  
  ```bash
  git push origin branch2
  ```
- **Variant B:** Boshqa kompyuter yoki clone da lockfile yangilangan, joriy papkada eski.  
  Joriy papkada qayta: `pnpm install` → keyin `git status` → agar "modified" bo‘lsa, `git add` → `commit` → `push`.

---

## Qisqa buyruqlar (barchasini ketma-ket)

```bash
cd /Users/mac/Desktop/Zo-rPizza
pnpm install
git add pnpm-lock.yaml
git status
git commit -m "chore: pnpm-lock.yaml socket.io"
git push origin branch2
```

Keyin Railway da **Redeploy**.

---

_Oxirgi yangilanish: 2026-02-22_
