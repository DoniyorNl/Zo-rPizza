# CI: "frozen-lockfile" / lockfile mos emas xatosi

## Xato matni

```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json
```

## Sabab

`package.json` (masalan backend da `socket.io` qo‘shilgan) o‘zgartirildi, lekin **root** `pnpm-lock.yaml` yangilanmasdan commit qilingan yoki CI/Docker eski commit dan build oladi.

## Yechim

### 1. Mahalliy moshinada lockfile ni yangilang

Loyiha **root** papkasida (Zo-rPizza/):

```bash
cd /Users/mac/Desktop/Zo-rPizza
pnpm install
```

Bu root `pnpm-lock.yaml` ni barcha workspace (backend, frontend) package.json larga moslab yangilaydi.

### 2. Yangilangan lockfile ni commit va push qiling

```bash
git add pnpm-lock.yaml
git status   # faqat pnpm-lock.yaml va boshqa kerakli o‘zgarishlar
git commit -m "chore: pnpm-lock.yaml yangilash (socket.io va boshqalar)"
git push origin branch2
```

### 3. CI/Docker qayta ishga tushiring

Push dan keyin GitHub Actions (yoki Docker build) qayta ishlaydi; endi `pnpm install --frozen-lockfile` yangi lockfile bilan o‘tadi.

---

## Kelajakda

- `package.json` (root, backend yoki frontend) o‘zgartirgan har safar root da **`pnpm install`** ishlatib, **`pnpm-lock.yaml`** ni commit qiling.
- CI har doim `--frozen-lockfile` ishlatadi – bu buildni takrorlanuvchi qiladi.

---

---

## Railway: 502 Bad Gateway (pnpm yuklab olinmayapti)

**Xato:** `mise ERROR Failed to install ... pnpm@9.15.9: HTTP status server error (502 Bad Gateway or Proxy Error) for url (https://github.com/pnpm/pnpm/releases/...)`

**Sabab:** GitHub vaqtincha 502 qaytardi – Railway (mise) pnpm ni GitHub dan yuklab ololmayapti.

**Qilingan:** Root `package.json` ga **`"packageManager": "pnpm@9.15.9"`** qo‘shildi. Railpack bu maydon bor bo‘lsa **Corepack** orqali pnpm ishlatadi (GitHub releases dan yuklab olish shart emas).

**Agar yana 502 chiqsa:** Bir necha daqiqadan keyin **Redeploy** qiling – 502 ko‘pincha vaqtincha. Yoki Railway dashboard da **Clear build cache** dan keyin qayta deploy.

---

_Oxirgi yangilanish: 2026-02-22_
