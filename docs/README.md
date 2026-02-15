# Zo-rPizza Dokumentatsiyasi

Bu Zo-rPizza loyihasining dokumentatsiyasi.

## 📚 Tarkibi

- [Sahifalar va API](./SAHIFALAR_VA_ENDPOINTLAR.md) - Endpointlar va sahifalar
- [Features](./FEATURES_IMPLEMENTATION.md) - Feature reja
- [Testing va Improvement](./TESTING_VA_IMPROVEMENT_REJA.md) - To'liq testing va platform yaxshilash rejasi
- [Deployment](./deployment/) - Loyihani serverga joylashtirish
- [Development](./development/CONTRIBUTING.md) - Dasturchilar uchun qo'llanma

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
   pnpm run dev:both
   ```

3. **Testlar:**
   ```bash
   pnpm test
   ```

## 📞 Yordam

Qo'shimcha ma'lumot uchun [Development](./development/) bo'limiga qarang.
