# Circuit breaker: "Too many authentication errors" tuzatish

Agar server ishga tushganda quyidagi xato chiqsa:

```
PrismaClientInitializationError: Error querying the database: FATAL: Circuit breaker open: Too many authentication errors
```

bu **Supabase/Supavisor** tomondan **kirish himoyasi**: noto‘g‘ri parol yoki juda ko‘p muvaffaqiyatsiz ulanish urinishlari tufayli ulanishlar vaqtincha bloklanadi.

---

## Sabab

- **Noto‘g‘ri parol** – `DATABASE_URL` dagi parol Supabase Database paroli bilan mos emas.
- **Juda ko‘p muvaffaqiyatsiz urinish** – deploy/restart yoki boshqa sabablar tufayli tez-tez noto‘g‘ri credential bilan ulanish; tizim "circuit breaker" ni ochadi va yangi ulanishlarni qabul qilmaydi.

---

## Tuzatish qadamlari

### 1. To‘g‘ri parol va pooler URL

**1-qadam.** [Supabase Dashboard](https://supabase.com/dashboard) → loyihangiz → **Settings** → **Database**.

**2-qadam.** **Database password** ni bilasizmi?

- **Ha** – 3-qadamga o‘ting.
- **Yo‘q** – **Reset database password** orqali yangi parol oling va uni xavfsiz joyga yozib qo‘ying. Eslatma: parolni reset qilgach, barcha joylarda (masalan Railway `DATABASE_URL`) yangilashingiz kerak.

**3-qadam.** **Connection string** bo‘limida **Connection pooling** dan **Transaction** (yoki Session) URI ni nusxalang. Format:

```
postgresql://postgres.PROJECT_REF:SIZNING_PAROLINGIZ@aws-0-REGION.pooler.supabase.com:6543/postgres
```

**4-qadam.** Oxiriga **mutlaqo** `?sslmode=require` qo‘shing:

```
postgresql://postgres.xxx:PAROL@aws-0-xxx.pooler.supabase.com:6543/postgres?sslmode=require
```

Bu to‘liq matn – sizning **DATABASE_URL** ingiz bo‘ladi.

**5-qadam.** Railway (yoki boshqa hosting) da **Variables** → `DATABASE_URL` ni shu qiymat bilan yangilang. Parol maxsus belgilar (`@`, `#`, `%` va h.k.) bo‘lsa, URL-encode qiling (masalan `@` → `%40`).

---

### 2. Circuit breaker ochilgan bo‘lsa: kuting yoki restart

Juda ko‘p auth xatolari tufayli circuit breaker ochilgan bo‘lsa:

- **Variant A:** **20–30 daqiqa** kuting. Supabase/Supavisor vaqt o‘tgach yangi ulanishlarni qabul qiladi. Keyin **to‘g‘ri** `DATABASE_URL` (yuqoridagi pooler + to‘g‘ri parol) bilan **bitta** marta Redeploy qiling. Qayta tez-tez noto‘g‘ri parol bilan urinmaslik kerak.
- **Variant B:** Supabase Dashboard → **Settings** → **General** → **Restart project** (agar mavjud bo‘lsa). Restart dan keyin yana to‘g‘ri `DATABASE_URL` bilan ulaning.

---

### 3. Tekshirish

- Redeploy dan keyin server loglarida `✅ Database connected` chiqishi kerak.
- `Circuit breaker open` yoki `Too many authentication errors` qaytarmasligi kerak.
- Agar yana xato bo‘lsa: `DATABASE_URL` ni logda chiqarmang, lekin host va portni tekshiring – **6543** va **pooler.supabase.com** bo‘lishi kerak (5432 va direct host emas). Batafsil: [RAILWAY_SUPABASE_FIX.md](./RAILWAY_SUPABASE_FIX.md).

---

## Qisqacha

| Muammo                | Yechim                                                                              |
| --------------------- | ----------------------------------------------------------------------------------- |
| Noto‘g‘ri parol       | Supabase’dan to‘g‘ri parol, URL’da to‘g‘ri yozing (maxsus belgilar encode)          |
| Direct URL (5432)     | Pooler URL ishlating: port **6543**, `...pooler.supabase.com`, `?sslmode=require`   |
| Circuit breaker ochiq | 20–30 min kuting yoki loyihani restart qiling, keyin to‘g‘ri URL bilan bitta deploy |
