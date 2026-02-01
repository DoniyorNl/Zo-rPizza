# Frontend environment variables

Set these in Vercel (production) and in your local `.env.local`.

Required
- `NEXT_PUBLIC_API_URL` = backend base URL
  - Local example: `http://localhost:5001`
  - Production example: `https://zo-rpizza-production.up.railway.app`

Optional (tracking xaritasi)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = Google Maps JavaScript API kaliti
  - Agar berilmasa, xarita Leaflet (OpenStreetMap) bilan ishlaydi.
  - 1–2 user sinov uchun Google bepul limit yetadi (Google Cloud Console’da loyiha + Maps JavaScript API yoqing, API kalit yarating).

Optional (restoran default manzili – xaritadagi “pitsa” nuqtasi)
- `NEXT_PUBLIC_RESTAURANT_ADDRESS` = restoran manzili matni (masalan: Kerkstraat 29, 4141 AT Leerdam)
- `NEXT_PUBLIC_RESTAURANT_LAT` = restoran kengligi (default: 51.894 – test uchun Leerdam)
- `NEXT_PUBLIC_RESTAURANT_LNG` = restoran uzunligi (default: 5.097)
  - Agar berilmasa, `frontend/lib/trackingConfig.ts` dagi default (Leerdam test manzili) ishlatiladi. Batafsil: docs/TRACKING_TEST_ADDRESS.md
