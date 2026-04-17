# Game Rental Website

Web rental akun game dengan fitur lengkap untuk user dan admin panel.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** SQLite (tanpa instalasi tambahan)

## Fitur

### User Side
- Landing page dengan katalog game
- Detail akun game dengan rank, skin, hero
- Sistem pemesanan dan checkout
- Pembayaran via DANA & QRIS
- Riwayat pesanan

### Admin Panel
- Dashboard dengan statistik
- Kelola game
- Kelola akun game
- Kelola pesanan
- Kelola users

## Setup

### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev      # Run dev server on port 5173
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run db:init  # Initialize database tables (sudah dibuat otomatis)
npm start        # Run server on port 5000
```

### 3. Default Admin Login

- Username: `admin`
- Password: `admin123`

### 4. Sample Data

Database sudah dilengkapi dengan:
- 4 Game: Mobile Legends, PUBG Mobile, Valorant, Genshin Impact
- 6 Akun game sample dengan berbagai rank dan harga
- 1 Admin account

## Routes

### API Endpoints

- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

- `GET /api/games` - List semua game
- `GET /api/games/:slug` - Detail game dengan akun

- `GET /api/accounts` - List semua akun
- `GET /api/accounts/:id` - Detail akun

- `POST /api/orders` - Buat pesanan (auth required)
- `GET /api/orders` - List pesanan user (auth required)

- `POST /api/payments/methods` - Get metode pembayaran
- `POST /api/payments/qris/generate` - Generate QRIS

- `GET /api/admin/dashboard` - Stats dashboard (admin)
- `GET /api/admin/orders` - List semua pesanan (admin)
- `PUT /api/admin/orders/:id/status` - Update status pesanan (admin)

## Pembayaran

### DANA
Transfer ke nomor DANA yang tertera di halaman checkout, lalu upload bukti transfer.

### QRIS
Scan QR code yang di-generate oleh sistem.

## Catatan Development

- Frontend running di `http://localhost:5173`
- Backend running di `http://localhost:5000`
- Database SQLite tersimpan di `backend/data/game_rental.db`

## Struktur Project

```
POS(Rental)/
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Footer
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Halaman user & admin
│   │   ├── services/       # API service
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── models/         # Database & schema
│   │   ├── routes/         # API routes
│   │   └── index.js        # Main server
│   ├── data/               # SQLite database
│   └── package.json
└── README.md
```
