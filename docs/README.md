# Zo-rPizza Dokumentatsiyasi

Bu Zo-rPizza loyihasining to'liq dokumentatsiyasi.

## 📚 Tarkibi

- [API Dokumentatsiyasi](./api/) - Backend API endpointlar va ularning foydalanish qo'llanmalari
- [Arxitektura](./architecture/) - Loyiha arxitekturasi va dizayn qarorlari
- [Deployment](./deployment/) - Loyihani serverga joylashtirish bo'yicha yo'riqnoma
- [Development](./development/) - Dasturchilar uchun qo'llanma

## 🏗️ Loyiha Tuzilmasi

```
Zo-rPizza/
├── frontend/          # Next.js frontend ilovasi
├── backend/           # Express.js backend API
├── shared/            # Umumiy typelar, utils va validatorlar
├── e2e/              # End-to-end testlar
├── docs/             # Dokumentatsiya
├── tools/            # Build va development skriptlari
└── .github/          # GitHub workflows
```

## 🚀 Tezkor Boshlash

1. **Setup qilish:**

   ```bash
   chmod +x tools/scripts/setup.sh
   ./tools/scripts/setup.sh
   ```

2. **Ishga tushurish:**

   ```bash
   pnpm dev
   ```

3. **Testlar:**
   ```bash
   pnpm test
   ```

## 📞 Yordam

Qo'shimcha ma'lumot uchun [Development](./development/) bo'limiga qarang.
