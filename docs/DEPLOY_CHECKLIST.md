# Deploy Checklist

## Olib tashlangan (cleanup)

- **Unused packages:** `@react-google-maps/api`, `chart.js`, `react-chartjs-2`, `recharts`, `@types/recharts`, `tw-animate-css`
- **Unused file:** `GoogleTrackingMap.tsx` (Leaflet ishlatiladi)
- **Bo'sh fayl:** `Users`
- **Docs:** 38 ta vaqtinchalik/duplicate doc `docs/_archive/` ga ko'chirildi

## Qolgan asosiy docs

- `docs/README.md`
- `docs/INSTALLATION_GUIDE.md`
- `docs/SAHIFALAR_VA_ENDPOINTLAR.md`
- `docs/FEATURES_IMPLEMENTATION.md`
- `docs/QUICK_REFERENCE.md`
- `docs/deployment/`
- `docs/development/`
- `BUYRUQLAR.md` (root)

## Keyingi qadamlar

```bash
pnpm install
pnpm run build
# Yoki test:
pnpm run dev:both
```
