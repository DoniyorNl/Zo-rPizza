# E2E Testlar

## O‘tkazib yuborilgan testlar (test.skip)

Quyidagi testlar Firebase/backend to‘liq sozlanganida ishlaydi. Hozircha `skip` qilingan:

| Spec | Sabab |
|------|-------|
| **admin-operations** | Admin user (admin@zorpizza.uz) Firebase da bo‘lishi kerak |
| **checkout-flow** (4 test) | Mahsulot variations + login talab qilinadi |
| **order-flow** (3 test) | To‘liq order flow, products, login |
| **tracking-flow** | test@example.com + haqiqiy tracking ma’lumotlari |
| **driver-history-export** | Driver login + PDF/CSV export |

## Skip ni olib tashlash

Firebase va backend ishlagach, `test.skip` → `test` va `test.describe.skip` → `test.describe` qilib o‘zgartiring.

## Ishga tushirish

```bash
pnpm run test:e2e
```
