# nuha.care — Login & Access Management

Backend module for employee login and role-based access management, built as part of the PT Data Integrasi Inovasi backend developer test.

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Runtime | **Node.js** | Non-blocking I/O, ideal for REST APIs |
| Framework | **Express.js** | Minimal, flexible, widely adopted |
| Database | **PostgreSQL** | Relational, supports UUID PK, robust constraints |
| ORM | **Prisma** | Type-safe queries, auto-migration, clean schema DSL |
| Authentication | **JWT** (jsonwebtoken) | Stateless auth — access token + refresh token + temp token |
| Password Hashing | **bcryptjs** | Industry-standard one-way hashing with salt |
| API Docs | **Swagger** (swagger-jsdoc + swagger-ui-express) | Interactive docs at `/api-docs` |
| Frontend | **Vanilla JS + Tailwind CSS** | Lightweight mockup, no framework overhead |

---

## Setup

### Prerequisites

- Node.js v18+
- PostgreSQL running locally (or via Docker)

### 1. Clone & Install

```bash
git clone <repo-url>
cd test_nuha
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/nuha_db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
JWT_TEMP_EXPIRES_IN="5m"
PORT=3000
```

### 3. Database Migration & Seed

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server: `http://localhost:3000`
API Docs: `http://localhost:3000/api-docs`

### Docker (optional)

```bash
docker-compose up -d
```

---

## Default Accounts (Seed)

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Super Admin |
| `manager1` | `pass123` | Manager + Staff *(multi-role)* |
| `staff1` | `pass123` | Staff |

---

## ERD

```mermaid
erDiagram
    employees {
        uuid id PK
        string username UK
        string password
        string name
        string email UK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    roles {
        uuid id PK
        string name UK
        string description
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    employee_roles {
        uuid id PK
        uuid employee_id FK
        uuid role_id FK
        timestamp created_at
    }

    menus {
        uuid id PK
        string name
        string path
        uuid parent_id FK
        int order
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    role_menus {
        uuid id PK
        uuid role_id FK
        uuid menu_id FK
        timestamp created_at
    }

    employees ||--o{ employee_roles : "has"
    roles ||--o{ employee_roles : "assigned to"
    roles ||--o{ role_menus : "has"
    menus ||--o{ role_menus : "assigned to"
    <!-- menus ||--o{ menus : "parent_id (self-ref)" -->
```

**Relationships:**
- `employees` ↔ `roles` → many-to-many via `employee_roles`
- `roles` ↔ `menus` → many-to-many via `role_menus`
- `menus` → self-referential via `parent_id` (unlimited nesting depth)

**Menu ordering rules:**
- `order` is unique per parent scope (no duplicates among siblings)
- On create/update, siblings with `order >= target` are shifted +1 first (splice insert)
- Example: inserting at order 2 → `[A(1), B(2), C(3)]` becomes `[A(1), NEW(2), B(3), C(4)]`

---

## Authentication Flow

### Single Role Login

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server

    C->>S: POST /api/auth/login { username, password }
    S->>S: 1. Verify password (bcrypt)
    S->>S: 2. Check roles → only 1 role
    S-->>C: { access_token, refresh_token, active_role }
    C->>S: GET /api/me/menus (Bearer access_token)
    S-->>C: { menu tree filtered by role }
```

### Multi-Role Login

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server

    C->>S: POST /api/auth/login { username, password }
    S->>S: 1. Verify password (bcrypt)
    S->>S: 2. Check roles → multiple roles found
    S-->>C: { temp_token (5min), requires_role_selection, roles[] }
    C->>C: User selects a role
    C->>S: POST /api/auth/select-role { role_id } (Bearer temp_token)
    S->>S: 3. Validate temp token
    S->>S: 4. Verify employee owns that role
    S-->>C: { access_token, refresh_token, active_role }
```

### Token Refresh

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server

    C->>S: POST /api/auth/refresh { refresh_token }
    S->>S: 1. Verify refresh token signature
    S->>S: 2. Lookup employee + role
    S-->>C: { access_token (new) }
```

---

## Role Access Matrix

### Menu Visibility per Role

| Menu | Super Admin | Manager | Staff |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| Master Data | ✅ | ✅ | ✅ |
| &nbsp;&nbsp;└ Karyawan | ✅ | ✅ | ❌ |
| &nbsp;&nbsp;└ Role | ✅ | ❌ | ❌ |
| &nbsp;&nbsp;└ Menu | ✅ | ✅ | ✅ |
| Laporan | ✅ | ✅ | ❌ |
| &nbsp;&nbsp;└ Laporan Harian | ✅ | ✅ | ❌ |
| &nbsp;&nbsp;└ Laporan Bulanan | ✅ | ✅ | ❌ |
| Pengaturan | ✅ | ✅ | ✅ |
| &nbsp;&nbsp;└ Profil | ✅ | ✅ | ✅ |
| &nbsp;&nbsp;└ Ubah Password | ✅ | ✅ | ✅ |

### API Access per Role

| Endpoint Group | Super Admin | Manager | Staff |
|---|---|---|---|
| `POST /api/auth/*` | ✅ | ✅ | ✅ |
| `GET /api/me/*` | ✅ | ✅ | ✅ |
| `GET /api/menus` | ✅ | ✅ | ✅ |
| `POST/PUT/DELETE /api/menus` | ✅ | ✅ | ✅ |
| `GET /api/employees` | ✅ | ✅ | ❌ |
| `POST/PUT/DELETE /api/employees` | ✅ | ✅ | ❌ |
| `/api/employees/:id/roles` | ✅ | ✅ | ❌ |
| `GET /api/roles` | ✅ | ❌ | ❌ |
| `POST/PUT/DELETE /api/roles` | ✅ | ❌ | ❌ |
| `/api/roles/:id/menus` | ✅ | ❌ | ❌ |

### Page Guard (Frontend)

| Page | Super Admin | Manager | Staff |
|---|---|---|---|
| `/dashboard` | ✅ | ✅ | ✅ |
| `/master/karyawan` | ✅ | ✅ | ❌ modal |
| `/master/role` | ✅ | ❌ modal | ❌ modal |
| `/master/menu` | ✅ | ✅ | ✅ |

> Unauthorized access via direct URL shows a blocking modal and redirects to `/dashboard`.

---

## Menu Ordering — Splice Insert

When creating or updating a menu with a specific `order`, siblings are shifted to preserve sequence integrity.

```
Before create "banana" at order 2:
  [apple(1), blueberry(2), cherry(3), date(4)]

Step 1 — shift siblings where order >= 2:
  [apple(1), blueberry(3), cherry(4), date(5)]

Step 2 — insert banana at order 2:
  [apple(1), banana(2), blueberry(3), cherry(4), date(5)]
```

Same logic applies on update — siblings at the target position are shifted before the menu is moved.

---

## Middleware

### `authenticate`
Verifies JWT access token on every protected route. Injects `req.user = { employee_id, role_id }`.

### `authenticateTemp`
Verifies temp token (multi-role flow only). Blocks full tokens from accessing `/select-role`.

### `roleGuard(...roles)`
Must be used after `authenticate`. Looks up the role name from `req.user.role_id` and returns `403 Forbidden` if not in the allowed list.

```js
// Example usage
router.get('/', authenticate, roleGuard('Super Admin', 'Manager'), ctrl.getAll);
```

### `requireRole(...roles)` (Frontend)
Client-side guard in `app.js`. Called at page load — shows a blocking modal and redirects to `/dashboard` if the active role is not allowed.

```js
if (!requireAuth()) throw '';
if (!requireRole('Super Admin', 'Manager')) throw '';
```

---

## Auto-Assign Menu to Roles

When a new menu is created with a `parentId`, it is automatically assigned to all roles that have access to any ancestor in the menu tree. This prevents orphaned menus that are visible in the DB but never appear in any sidebar.

```
New menu created with parentId → walk ancestor chain up
  → find first ancestor that has role assignments
  → createMany roleMenu entries for all those roles
```

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/api/auth/login` | ❌ | — | Login with username + password |
| POST | `/api/auth/select-role` | ✅ temp | — | Select role (multi-role flow) |
| POST | `/api/auth/refresh` | ✅ refresh | — | Refresh access token |
| POST | `/api/auth/logout` | ✅ | All | Logout |

### Me
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/me/menus` | ✅ | All | Menu tree for active role |
| GET | `/api/me/profile` | ✅ | All | Employee profile + roles |

### Menu Management
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/menus` | ✅ | All | List all menus (flat) |
| GET | `/api/menus/tree` | ✅ | All | Menu tree (nested) |
| POST | `/api/menus` | ✅ | All | Create menu (splice insert) |
| PUT | `/api/menus/:id` | ✅ | All | Update menu (splice on order change) |
| DELETE | `/api/menus/:id` | ✅ | All | Delete menu |

### Role Management
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/roles` | ✅ | Super Admin | List all roles |
| POST | `/api/roles` | ✅ | Super Admin | Create role |
| PUT | `/api/roles/:id` | ✅ | Super Admin | Update role |
| DELETE | `/api/roles/:id` | ✅ | Super Admin | Delete role |
| GET | `/api/roles/:id/menus` | ✅ | Super Admin | Get menus assigned to role |
| POST | `/api/roles/:id/menus` | ✅ | Super Admin | Assign menu to role |
| DELETE | `/api/roles/:id/menus/:menuId` | ✅ | Super Admin | Revoke menu from role |

### Employee Management
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/employees` | ✅ | Super Admin, Manager | List employees |
| POST | `/api/employees` | ✅ | Super Admin, Manager | Create employee |
| PUT | `/api/employees/:id` | ✅ | Super Admin, Manager | Update employee |
| DELETE | `/api/employees/:id` | ✅ | Super Admin, Manager | Delete employee |
| GET | `/api/employees/:id/roles` | ✅ | Super Admin, Manager | Get employee roles |
| POST | `/api/employees/:id/roles` | ✅ | Super Admin, Manager | Assign role to employee |
| DELETE | `/api/employees/:id/roles/:roleId` | ✅ | Super Admin, Manager | Revoke role from employee |

---

## Project Structure

```
test_nuha/
├── prisma/
│   ├── schema.prisma        ← database schema & relations
│   └── seed.js              ← seed roles, menus, employees
├── src/
│   ├── app.js               ← express app, middleware, routes, page routes
│   ├── server.js            ← entry point
│   ├── config/
│   │   ├── database.js      ← prisma client singleton
│   │   ├── jwt.js           ← jwt config (secret, expiry)
│   │   └── swagger.js       ← swagger setup
│   ├── middleware/
│   │   ├── auth.js          ← authenticate + authenticateTemp + roleGuard
│   │   └── errorHandler.js  ← global error handler
│   ├── modules/
│   │   ├── auth/            ← login, select-role, refresh, logout
│   │   ├── menu/            ← CRUD + splice ordering + auto-assign roles
│   │   ├── role/            ← CRUD + assign/revoke menus
│   │   └── employee/        ← CRUD + assign/revoke roles
│   └── utils/
│       ├── response.js      ← standard { success, message, data } wrapper
│       └── menuTree.js      ← flat array → nested tree (recursive)
└── public/                  ← frontend mockup (Vanilla JS + Tailwind)
    ├── index.html           ← login page (with redirect_after_login support)
    ├── dashboard.html       ← quick links rendered by role
    ├── layout.html          ← shared sidebar component
    ├── app.js               ← API client, requireAuth, requireRole, sidebar renderer
    └── master/
        ├── menu.html        ← all roles
        ├── role.html        ← Super Admin only
        └── karyawan.html    ← Super Admin + Manager
```
