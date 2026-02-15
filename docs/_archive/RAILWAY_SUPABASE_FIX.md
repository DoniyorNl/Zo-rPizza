# Railway + Supabase: P1001 "Can't reach database" tuzatish

Agar xato: `Can't reach database server at db.xxx.supabase.co:5432` — bu **direct** ulanish. Railway’dan **pooler** URL ishlatish kerak.

---

## 1. Supabase’dan pooler URL olish (nusxalagandan keyin nima qilish)

**1-qadam.** [Supabase Dashboard](https://supabase.com/dashboard) → loyihangiz → **Settings** → **Database**. Pastga scroll qiling.

**2-qadam.** **Connection string** bo‘limida **Connection pooling** ni toping. U yerda **Transaction** va **Session** deb ikkita uzun matn (URI) bor. Ulardan **bittasini** (masalan Transaction) **to‘liq** nusxalang (Copy).

**3-qadam.** Nusxalagan matn shunga o‘xshash bo‘ladi:

```
postgresql://postgres.pzvzksrphyjsxlfkebic:SIZNING_PAROLINGIZ@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**4-qadam — muhim.** Bu matnning **oxirida** `?sslmode=require` bo‘lishi kerak. Agar yo‘q bo‘lsa, qo‘lda qo‘shing. Yakuniy natija bitta qator bo‘lishi kerak, masalan:

```
postgresql://postgres.xxx:PAROL@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require
```

Bu **to‘liq** matnni brauzer yoki notepad’ga nusxalab saqlang — keyingi bo‘limda Railway’ga yopishtirasiz.

---

## 2. Nusxalagan URL ni Railway’ga qo‘yish

**5-qadam.** [Railway Dashboard](https://railway.app/dashboard) oching → loyihangiz → **Backend** servisini tanlang.

**6-qadam.** Servis sahifasida yuqorida **Variables** tabini bosing.

**7-qadam.** Ro‘yxatda **DATABASE_URL** ni toping.

- **Agar allaqachon bor bo‘lsa:** uning qiymatini o‘chirib, 1–4 qadamda tayyorlagan **to‘liq** pooler URL ni shu yerga yoping (Ctrl+V / Cmd+V). Keyin **Save** yoki **Update**.
- **Agar yo‘q bo‘lsa:** **+ New Variable** bosing. **Name** ga: `DATABASE_URL`. **Value** ga: 1–4 qadamdagi to‘liq pooler URL ni yoping. **Add** / **Save**.

**8-qadam.** O‘zgarish saqlangandan keyin **Redeploy** qiling: **Deployments** → oxirgi deploy → **⋮** (uch nuqta) → **Redeploy**. Shundan keyin server yangi `DATABASE_URL` bilan ishga tushadi.

---

## 3. Tekshirish

- Deploy tugagach **Logs** da `PrismaClientInitializationError` / `P1001` bo‘lmasligi kerak.
- Agar **"Circuit breaker open: Too many authentication errors"** chiqsa → parol noto‘g‘ri yoki juda ko‘p muvaffaqiyatsiz urinish; [CIRCUIT_BREAKER_FIX.md](./CIRCUIT_BREAKER_FIX.md) ga qarang.
- Agar yana 5432 yoki `db.xxx.supabase.co` ko‘rinsa — Railway’da hali ham **eski (direct)** URL ishlatilayapti. Variables’da faqat **pooler** URL (port 6543, `pooler.supabase.com`) ekanligini tekshiring va qayta Redeploy qiling.

---

## Qisqa farq

| Ulanish    | Host                          | Port     | Railway’da         |
| ---------- | ----------------------------- | -------- | ------------------ |
| Direct     | db.xxx.supabase.co            | 5432     | ❌ Ishlamaydi      |
| **Pooler** | aws-0-xxx.pooler.supabase.com | **6543** | ✅ Ishlatish kerak |

---

**Xulosa:** Railway’da `DATABASE_URL` har doim **pooler** URL (port 6543, `?sslmode=require`) bo‘lishi kerak. Reset qilgandan keyin qayta variable qo‘ygan bo‘lsangiz ham, yana direct (5432) qo‘yilgan bo‘lishi mumkin — faqat pooler URL qo‘ying va Redeploy qiling.
