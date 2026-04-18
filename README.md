# 🎒 Məktəb Ləvazimatları — School Supplies E-Commerce

A production-ready, full-stack e-commerce application for school supplies built with Next.js, Express.js, PostgreSQL, and Prisma ORM.

---

## 📁 Project Structure

```
mekteb-store/
├── backend/                    # Express.js API server
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js     # Prisma client singleton
│   │   ├── controllers/        # Business logic
│   │   │   ├── auth.controller.js
│   │   │   ├── category.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── cart.controller.js
│   │   │   ├── order.controller.js
│   │   │   └── admin.controller.js
│   │   ├── middleware/         # Express middleware
│   │   │   ├── auth.middleware.js     # JWT auth
│   │   │   ├── error.middleware.js    # Global error handler
│   │   │   ├── upload.middleware.js   # Multer file uploads
│   │   │   └── validate.middleware.js # express-validator
│   │   ├── routes/             # Route definitions
│   │   │   ├── auth.routes.js
│   │   │   ├── category.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── cart.routes.js
│   │   │   ├── order.routes.js
│   │   │   └── admin.routes.js
│   │   ├── utils/
│   │   │   └── seed.js         # Database seeder
│   │   └── index.js            # App entry point
│   ├── uploads/                # Uploaded images (auto-created)
│   ├── .env.example
│   └── package.json
│
└── frontend/                   # Next.js 14 App Router
    ├── src/
    │   ├── app/                # Next.js app directory
    │   │   ├── layout.js       # Root layout
    │   │   ├── page.js         # Homepage
    │   │   ├── globals.css     # Tailwind + global styles
    │   │   ├── login/page.js
    │   │   ├── register/page.js
    │   │   ├── products/
    │   │   │   ├── page.js     # Products listing
    │   │   │   └── [id]/page.js # Product detail
    │   │   ├── checkout/page.js
    │   │   ├── account/
    │   │   │   ├── page.js     # Profile
    │   │   │   └── orders/page.js
    │   │   └── admin/          # Admin panel
    │   │       ├── layout.js   # Admin sidebar layout
    │   │       ├── page.js     # Dashboard
    │   │       ├── products/
    │   │       │   ├── page.js
    │   │       │   ├── new/page.js
    │   │       │   └── [id]/edit/page.js
    │   │       ├── categories/page.js
    │   │       ├── orders/page.js
    │   │       └── users/page.js
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Header.js
    │   │   │   ├── Footer.js
    │   │   │   └── Providers.js
    │   │   ├── shop/
    │   │   │   ├── ProductCard.js
    │   │   │   ├── ProductGrid.js  # With search + filter
    │   │   │   ├── CartDrawer.js
    │   │   │   ├── FeaturedProducts.js
    │   │   │   └── CategoryGrid.js
    │   │   └── admin/
    │   │       └── ProductForm.js
    │   ├── store/              # Zustand state management
    │   │   ├── auth.store.js
    │   │   └── cart.store.js
    │   └── lib/
    │       ├── api.js          # Axios client with interceptors
    │       └── utils.js        # Helpers, formatters
    ├── .env.local.example
    ├── next.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Quick Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

---

### 1. Clone & Install

```bash
# Backend
cd mekteb-store/backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2. Environment Variables

#### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/mekteb_store"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-chars"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=5242880
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### 3. Database Setup

```bash
cd backend

# Create database (run in psql or pgAdmin)
# CREATE DATABASE mekteb_store;

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed demo data
npm run db:seed
```

---

### 4. Start Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# ✅ Server running on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# ✅ App running on http://localhost:3000
```

---

### 5. Demo Login Credentials

| Role      | Email                  | Password      |
|-----------|------------------------|---------------|
| Admin     | admin@mekteb.az        | admin123      |
| Customer  | aynur@example.com      | customer123   |

---

## 📖 API Documentation

Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint                | Auth     | Description          |
|--------|-------------------------|----------|----------------------|
| POST   | /auth/register          | —        | Register new user    |
| POST   | /auth/login             | —        | Login                |
| GET    | /auth/profile           | JWT      | Get own profile      |
| PUT    | /auth/profile           | JWT      | Update profile       |
| PUT    | /auth/change-password   | JWT      | Change password      |

### Categories

| Method | Endpoint            | Auth       | Description           |
|--------|---------------------|------------|-----------------------|
| GET    | /categories         | —          | List all categories   |
| GET    | /categories/:slug   | —          | Get by slug           |
| POST   | /categories         | Admin      | Create category       |
| PUT    | /categories/:id     | Admin      | Update category       |
| DELETE | /categories/:id     | Admin      | Delete category       |

### Products

| Method | Endpoint              | Auth       | Description              |
|--------|-----------------------|------------|--------------------------|
| GET    | /products             | —          | List products (paginated)|
| GET    | /products/featured    | —          | Get featured products    |
| GET    | /products/:id         | —          | Get product by ID        |
| POST   | /products             | Admin      | Create product + image   |
| PUT    | /products/:id         | Admin      | Update product           |
| DELETE | /products/:id         | Admin      | Soft delete product      |

**Query params for GET /products:**
- `page` (default: 1)
- `limit` (default: 12)
- `search` — name search
- `categorySlug` — filter by category
- `featured` — `true` for featured only
- `minPrice`, `maxPrice`
- `sortBy` — `createdAt | price | name | stock`
- `sortOrder` — `asc | desc`

### Cart

| Method | Endpoint              | Auth  | Description         |
|--------|-----------------------|-------|---------------------|
| GET    | /cart                 | JWT   | Get my cart         |
| POST   | /cart/add             | JWT   | Add item to cart    |
| PUT    | /cart/items/:itemId   | JWT   | Update item qty     |
| DELETE | /cart/items/:itemId   | JWT   | Remove item         |
| DELETE | /cart/clear           | JWT   | Clear cart          |

### Orders

| Method | Endpoint                    | Auth       | Description           |
|--------|-----------------------------|------------|-----------------------|
| POST   | /orders                     | JWT        | Place order from cart |
| GET    | /orders/my-orders           | JWT        | My orders list        |
| GET    | /orders/my-orders/:id       | JWT        | My order detail       |
| GET    | /orders/admin/all           | Admin      | All orders            |
| PATCH  | /orders/admin/:id/status    | Admin      | Update order status   |

### Admin

| Method | Endpoint             | Auth  | Description          |
|--------|----------------------|-------|----------------------|
| GET    | /admin/dashboard     | Admin | Dashboard stats      |
| GET    | /admin/users         | Admin | All users list       |

---

## 🗃️ Database Schema

```
User          ←→ Order (one-to-many)
User          ←→ Cart  (one-to-one)
Category      ←→ Product (one-to-many)
Cart          ←→ CartItem (one-to-many)
CartItem      ←→ Product
Order         ←→ OrderItem (one-to-many)
OrderItem     ←→ Product
```

**Order statuses:** `PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`  
(Can also be `CANCELLED` from any state)

---

## ✨ Features Summary

### Customer
- ✅ Register / Login with JWT
- ✅ Browse & search all products
- ✅ Filter by category
- ✅ Product detail pages
- ✅ Add/remove from cart (persisted server-side when logged in, localStorage for guests)
- ✅ Checkout with address form
- ✅ View order history & status
- ✅ Update profile

### Admin
- ✅ Dashboard with stats & charts
- ✅ Full CRUD for products (with image upload)
- ✅ Full CRUD for categories (with icon picker)
- ✅ View & update order status
- ✅ View all users
- ✅ Low stock alerts

---

## 🔒 Security Features

- **bcrypt** password hashing (12 salt rounds)
- **JWT** with expiry and HTTP header transport
- **Helmet.js** security headers
- **CORS** restricted to frontend origin
- **Input validation** with express-validator (server) and react-hook-form (client)
- **Role-based access control** (RBAC) for admin routes
- **Multer** file type + size restrictions
- **Prisma** parameterized queries (SQL injection protection)

---

## 🏗️ Production Deployment

### Backend (Railway / Render / VPS)
```bash
npm run build       # No build step needed for Express
npm start           # NODE_ENV=production
```

### Frontend (Vercel)
```bash
npm run build
npm start
# or deploy to Vercel with:
# vercel --prod
```

### Environment checklist for production:
- [ ] Set strong `JWT_SECRET` (32+ random chars)
- [ ] Set `NODE_ENV=production`
- [ ] Use SSL PostgreSQL connection string
- [ ] Set correct `FRONTEND_URL` on backend
- [ ] Set correct `NEXT_PUBLIC_API_URL` on frontend
- [ ] Configure file storage (S3 recommended for production images)

---

## 🌐 Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | Next.js 14, React 18    |
| Styling    | Tailwind CSS            |
| State      | Zustand + React Query   |
| Backend    | Express.js              |
| Database   | PostgreSQL + Prisma ORM |
| Auth       | JWT + bcrypt            |
| Uploads    | Multer                  |
| Validation | express-validator + RHF |
