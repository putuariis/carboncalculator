# Detektif Jejak Karbon — Full Stack v2.0.0

Versi ini dikembangkan dari `index (6).html` yang diberikan.

## Yang diperbaiki
- Frontend dipisahkan menjadi `public/index.html`, `public/app.css`, dan `public/app.js`.
- Ditambahkan backend Node.js native HTTP tanpa dependency eksternal.
- API persistence:
  - `GET /api/health`
  - `GET /api/submissions?limit=50`
  - `POST /api/submissions`
- Data investigasi otomatis disimpan di browser (`localStorage`) agar tidak hilang saat refresh.
- Submit ke server memakai API same-origin, bukan Google Apps Script placeholder.
- Validasi payload backend, batas ukuran request, sanitasi string, dan path traversal protection.
- Perhitungan dan state tetap kompatibel dengan alur TKP 1–5 dari prototype.
- Aksesibilitas dasar: focus-visible dan Escape untuk modal.
- Poster PNG dan clipboard tetap dipertahankan.

## Menjalankan

Pastikan Node.js 18+ tersedia.

```bash
npm start
```

Buka `http://localhost:3000`.

Mode development:

```bash
npm run dev
```

Validasi syntax:

```bash
npm run check
```

## Struktur

- `public/index.html` — UI
- `public/app.css` — styling custom
- `public/app.js` — state, kalkulasi, UI logic, API client
- `server.js` — static server + REST API
- `data/submissions.json` — persistence sederhana

## Catatan faktor emisi

Nilai faktor emisi pada prototype asli memiliki beberapa perbedaan antara teks penjelasan dan angka yang dipakai fungsi kalkulasi. Versi ini tidak mengklaim memvalidasi faktor tersebut terhadap sumber EPA eksternal; nilai kalkulasi dipertahankan agar hasil tidak berubah secara diam-diam. Untuk produksi/akademik, faktor sebaiknya diverifikasi dan dikelola sebagai konfigurasi/versioned dataset.
