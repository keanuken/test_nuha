# Backend Developer Test — PT Data Integrasi Inovasi (nuha.care)

## Studi Kasus

Membangun modul **Login & Management Access** untuk aplikasi internal perusahaan.

---

## Functional Requirements

### 1. Authentication
- Karyawan login menggunakan **username + password**
- Response berupa **JWT token** (access token + refresh token)
- Token digunakan untuk semua request selanjutnya via `Authorization: Bearer <token>`

### 2. Multi-Role Login
- Satu karyawan bisa memiliki **lebih dari satu jabatan/role**
- Setelah login berhasil:
  - Jika karyawan hanya punya **1 role** → langsung masuk, token berisi role tersebut
  - Jika karyawan punya **>1 role** → sistem mengembalikan daftar role yang dimiliki, karyawan memilih role, lalu sistem issue token baru dengan role yang dipilih

### 3. Menu Berdasarkan Role
- Setelah login + pilih role, sistem mengembalikan **daftar menu** sesuai role yang dipilih
- Menu bersifat **nested/hierarchical tanpa batas level** (tree structure)
- Contoh: Dashboard → Sub Menu → Sub Sub Menu → dst

### 4. Management Menu
- CRUD menu (create, read, update, delete)
- Menu memiliki **parent_id** untuk mendukung multiple level tanpa batas
- Field menu: `id`, `name`, `icon`, `path/url`, `parent_id`, `order`, `is_active`
- Endpoint untuk get menu tree (nested)

### 5. Management Access Role
- CRUD role
- Assign/revoke menu ke role (many-to-many)
- Assign/revoke role ke karyawan (many-to-many)

---

## Technical Requirements

| Item | Spesifikasi |
|---|---|
| Runtime | Node.js |
| Database | PostgreSQL |
| Auth | JWT (access token + refresh token) |
| Framework | Express.js (rekomendasi) |
| ORM | Prisma atau Sequelize |
| Dokumentasi | REST API docs (Postman Collection / Swagger) |
| Repository | GitHub (public) |
| Bonus | Wireframe/Mockup (Figma / draw.io) |

---

## ERD (Entity Relationship Design)

### Tabel

#### `employees` (karyawan)
```
id          UUID PK
username    VARCHAR UNIQUE NOT NULL
password    VARCHAR NOT NULL  -- bcrypt hash
name        VARCHAR NOT NULL
email       VARCHAR UNIQUE
is_active   BOOLEAN DEFAULT true
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

#### `roles`
```
id          UUID PK
name        VARCHAR UNIQUE NOT NULL  -- e.g. "Admin", "Manager", "Staff"
description VARCHAR
is_active   BOOLEAN DEFAULT true
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

#### `employee_roles` (many-to-many: karyawan ↔ role)
```
id            UUID PK
employee_id   UUID FK → employees.id
role_id       UUID FK → roles.id
UNIQUE(employee_id, role_id)
```

#### `menus`
```
id          UUID PK
name        VARCHAR NOT NULL
icon        VARCHAR           -- icon class / url
path        VARCHAR           -- frontend route path
parent_id   UUID FK → menus.id (nullable, NULL = root menu)
order       INTEGER DEFAULT 0
is_active   BOOLEAN DEFAULT true
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

#### `role_menus` (many-to-many: role ↔ menu)
```
id        UUID PK
role_id   UUID FK → roles.id
menu_id   UUID FK → menus.id
UNIQUE(role_id, menu_id)
```

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Login dengan username + password | ❌ |
| POST | `/api/auth/select-role` | Pilih role setelah login (multi-role) | ✅ temp token |
| POST | `/api/auth/refresh` | Refresh access token | ✅ refresh token |
| POST | `/api/auth/logout` | Logout (invalidate token) | ✅ |

### Menu (user)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/me/menus` | Get menu tree sesuai role aktif | ✅ |
| GET | `/api/me/profile` | Get profile + roles karyawan | ✅ |

### Management Menu (admin)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/menus` | List semua menu (flat) | ✅ |
| GET | `/api/menus/tree` | Get menu tree (nested) | ✅ |
| POST | `/api/menus` | Create menu | ✅ |
| PUT | `/api/menus/:id` | Update menu | ✅ |
| DELETE | `/api/menus/:id` | Delete menu | ✅ |

### Management Role (admin)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/roles` | List semua role | ✅ |
| POST | `/api/roles` | Create role | ✅ |
| PUT | `/api/roles/:id` | Update role | ✅ |
| DELETE | `/api/roles/:id` | Delete role | ✅ |
| GET | `/api/roles/:id/menus` | Get menu yang di-assign ke role | ✅ |
| POST | `/api/roles/:id/menus` | Assign menu ke role | ✅ |
| DELETE | `/api/roles/:id/menus/:menuId` | Revoke menu dari role | ✅ |

### Management Karyawan (admin)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/employees` | List karyawan | ✅ |
| POST | `/api/employees` | Create karyawan | ✅ |
| PUT | `/api/employees/:id` | Update karyawan | ✅ |
| DELETE | `/api/employees/:id` | Delete karyawan | ✅ |
| GET | `/api/employees/:id/roles` | Get role karyawan | ✅ |
| POST | `/api/employees/:id/roles` | Assign role ke karyawan | ✅ |
| DELETE | `/api/employees/:id/roles/:roleId` | Revoke role dari karyawan | ✅ |

---

## Request & Response Examples

### POST `/api/auth/login`

**Request:**
```json
{
  "username": "john.doe",
  "password": "secret123"
}
```

**Response (single role):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "employee": {
      "id": "uuid",
      "name": "John Doe",
      "username": "john.doe"
    },
    "active_role": {
      "id": "uuid",
      "name": "Staff"
    }
  }
}
```

**Response (multi-role → pilih role dulu):**
```json
{
  "success": true,
  "data": {
    "requires_role_selection": true,
    "temp_token": "eyJhbGci...",
    "roles": [
      { "id": "uuid-1", "name": "Manager" },
      { "id": "uuid-2", "name": "Staff" }
    ]
  }
}
```

### POST `/api/auth/select-role`

**Request:**
```json
{
  "role_id": "uuid-1"
}
```
Header: `Authorization: Bearer <temp_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "active_role": {
      "id": "uuid-1",
      "name": "Manager"
    }
  }
}
```

### GET `/api/me/menus`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Dashboard",
      "icon": "dashboard",
      "path": "/dashboard",
      "order": 1,
      "children": []
    },
    {
      "id": "uuid",
      "name": "Master Data",
      "icon": "database",
      "path": null,
      "order": 2,
      "children": [
        {
          "id": "uuid",
          "name": "Karyawan",
          "icon": "users",
          "path": "/master/karyawan",
          "order": 1,
          "children": []
        },
        {
          "id": "uuid",
          "name": "Role",
          "icon": "shield",
          "path": "/master/role",
          "order": 2,
          "children": []
        }
      ]
    }
  ]
}
```

---

## Project Structure

```
test_nuha/
├── REQUIREMENTS.md          ← file ini
├── README.md
├── .env.example
├── .gitignore
├── package.json
├── prisma/
│   ├── schema.prisma        ← database schema
│   └── seed.js              ← seed data (admin, roles, menus)
├── src/
│   ├── app.js               ← express app setup
│   ├── server.js            ← entry point
│   ├── config/
│   │   ├── database.js
│   │   └── jwt.js
│   ├── middleware/
│   │   ├── auth.js          ← JWT verify middleware
│   │   └── errorHandler.js
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js
│   │   ├── menu/
│   │   │   ├── menu.routes.js
│   │   │   ├── menu.controller.js
│   │   │   └── menu.service.js
│   │   ├── role/
│   │   │   ├── role.routes.js
│   │   │   ├── role.controller.js
│   │   │   └── role.service.js
│   │   └── employee/
│   │       ├── employee.routes.js
│   │       ├── employee.controller.js
│   │       └── employee.service.js
│   └── utils/
│       ├── response.js      ← standard response helper
│       └── menuTree.js      ← flat → nested tree builder
└── docs/
    └── postman_collection.json
```

---

## Seed Data (untuk interview)

### Roles
- `Super Admin` — akses semua menu
- `Manager` — akses menu operasional
- `Staff` — akses menu terbatas

### Menu Tree (contoh)
```
Dashboard
Master Data
  └── Karyawan
  └── Role
  └── Menu
Laporan
  └── Laporan Harian
  └── Laporan Bulanan
Pengaturan
  └── Profil
  └── Ubah Password
```

### Karyawan Test
- `admin` / `admin123` → role: Super Admin
- `manager1` / `pass123` → role: Manager + Staff (multi-role)
- `staff1` / `pass123` → role: Staff

---

## Deliverables Checklist

- [ ] Source code Node.js + PostgreSQL
- [ ] ERD (draw.io / dbdiagram.io)
- [ ] API Documentation (Postman Collection / Swagger)
- [ ] GitHub repository (public)
- [ ] README dengan cara menjalankan project
- [ ] Seed data untuk demo interview
- [ ] Bonus: Wireframe/Mockup (Figma)

---

## Notes
- Password di-hash menggunakan **bcrypt**
- JWT payload minimal: `{ employee_id, role_id, iat, exp }`
- Untuk multi-role: gunakan **temp_token** dengan claim `{ employee_id, requires_role_selection: true }` — expire 5 menit
- Menu tree dibangun secara **rekursif** di service layer
- Gunakan **UUID** sebagai primary key
