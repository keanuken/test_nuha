# nuha-backend

Backend Developer Test — PT Data Integrasi Inovasi (nuha.care)

## Tech Stack
- **Node.js** + **Express.js**
- **PostgreSQL** + **Prisma ORM**
- **JWT** (access token + refresh token)
- **bcryptjs** untuk password hashing

## Cara Menjalankan

### 1. Clone & Install
```bash
git clone <repo-url>
cd test_nuha
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env — isi DATABASE_URL dan JWT secrets
```

### 3. Setup Database
```bash
# Generate Prisma client
npm run db:generate

# Jalankan migrasi
npm run db:migrate

# Seed data awal
npm run db:seed
```

### 4. Jalankan Server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server berjalan di `http://localhost:3000`

## Test Accounts (setelah seed)

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Super Admin |
| `manager1` | `pass123` | Manager + Staff (multi-role) |
| `staff1` | `pass123` | Staff |

## API Endpoints

Lihat [REQUIREMENTS.md](./REQUIREMENTS.md) untuk dokumentasi lengkap endpoint, request, dan response.

### Quick Test
```bash
# Login single role
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Login multi-role (akan dapat temp_token + daftar role)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager1","password":"pass123"}'

# Get menu sesuai role
curl http://localhost:3000/api/me/menus \
  -H "Authorization: Bearer <access_token>"
```

## ERD

Lihat [REQUIREMENTS.md](./REQUIREMENTS.md#erd-entity-relationship-design) untuk desain ERD lengkap.

Untuk visual ERD, import schema ke [dbdiagram.io](https://dbdiagram.io).
