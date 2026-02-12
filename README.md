# 🌱 HabitFlow

> Build better habits, one day at a time.

A full-stack habit tracking application built with **Node.js**, **Express.js**, and **MongoDB**.

---

## 📸 Pages

| Page | Description |
|------|-------------|
| `/` | Login / Register |
| `/pages/dashboard.html` | Dashboard with today's habits, streak, weekly grid |
| `/pages/habits.html` | Manage all habits (CRUD, filter, search) |
| `/pages/progress.html` | Analytics: charts, heatmap, performance table |
| `/pages/profile.html` | Account settings, achievements, preferences |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone & install

```bash
git clone https://github.com/yourname/habitflow.git
cd habitflow
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. (Optional) Seed demo data

```bash
npm run seed
# Demo: demo@habitflow.com / demo123
# Admin: admin@habitflow.com / admin123
```

### 4. Start the server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

App runs at **http://localhost:3000**

---

## 📁 Project Structure

```
habitflow/
├── server.js                  # Entry point
├── config/
│   ├── db.js                  # MongoDB connection
│   └── seed.js                # Demo data seeder
├── models/
│   ├── User.js                # User schema
│   ├── Habit.js               # Habit schema
│   └── index.js               # Log, Category, Achievement
├── controllers/
│   ├── authController.js      # Register & Login
│   ├── userController.js      # Profile management
│   └── habitController.js     # Habit CRUD & check-ins
├── routes/
│   ├── authRoutes.js          # POST /register, /login
│   ├── userRoutes.js          # GET/PUT /users/profile
│   ├── habitRoutes.js         # CRUD /habits
│   ├── logRoutes.js           # GET /logs
│   └── adminRoutes.js         # Admin endpoints
├── middleware/
│   ├── authMiddleware.js      # JWT protect + adminOnly
│   ├── validateMiddleware.js  # Joi validation
│   └── errorMiddleware.js     # Global error handler
└── public/                    # Frontend
    ├── index.html             # Auth page
    ├── css/style.css
    ├── js/
    │   ├── auth.js
    │   ├── app.js
    │   ├── dashboard.js
    │   ├── habits.js
    │   ├── progress.js
    │   └── profile.js
    └── pages/
        ├── dashboard.html
        ├── habits.html
        ├── progress.html
        └── profile.html
```

---

## 📡 API Documentation

### Base URL: `/api`

---

### 🔓 Auth (Public)

#### `POST /api/register`
Register a new user.

**Request body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response:**
```json
{
  "token": "eyJhbGci...",
  "user": { "_id": "...", "username": "johndoe", "email": "...", "role": "user" }
}
```

---

#### `POST /api/login`
Authenticate user and get JWT.

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response:** Same as register.

---

### 🔒 Protected Endpoints
All require `Authorization: Bearer <token>` header.

---

### 👤 Users

#### `GET /api/users/profile`
Get logged-in user's profile.

#### `PUT /api/users/profile`
Update profile fields (username, email, firstName, lastName, bio) and/or change password.

```json
{
  "username": "newname",
  "email": "new@email.com",
  "currentPassword": "old123",
  "newPassword": "new456"
}
```

#### `DELETE /api/users/profile`
Delete current user's account.

---

### ✅ Habits

#### `POST /api/habits`
Create a new habit.

```json
{
  "name": "Morning Run",
  "description": "30 min jog",
  "category": "health",
  "frequency": "daily",
  "target": 1,
  "color": "#2EC4B6",
  "reminder": "07:00"
}
```

**Categories:** `health`, `mind`, `work`, `social`, `creative`, `finance`  
**Frequencies:** `daily`, `weekly`, `weekdays`, `weekends`

#### `GET /api/habits`
Get all habits for the logged-in user.

#### `GET /api/habits/:id`
Get a specific habit by ID.

#### `PUT /api/habits/:id`
Update a habit.

#### `DELETE /api/habits/:id`
Delete (soft-delete) a habit. Admins can hard-delete.

#### `POST /api/habits/:id/checkin`
Mark habit as completed for a date.

```json
{
  "date": "2025-02-10",
  "note": "Felt great!"
}
```

---

### 📊 Logs

#### `GET /api/logs`
Get user's check-in logs with optional filters.

**Query params:** `?habitId=...&from=2025-01-01&to=2025-01-31`

#### `GET /api/logs/:id`
Get a specific log entry.

---

### 🛡️ Admin (Requires `role: "admin"`)

#### `GET /api/admin/users`
List all users.

#### `PUT /api/admin/users/:id/role`
Set a user's role (`user` or `admin`).

#### `GET /api/admin/habits`
List all habits from all users.

#### `DELETE /api/admin/habits/:id`
Permanently delete any habit.

#### `GET /api/admin/stats`
Get site-wide statistics.

---

## 🗄️ Database Collections

| Collection | Fields |
|------------|--------|
| **users** | username, email, password (hashed), firstName, lastName, bio, role, preferences |
| **habits** | user, name, description, category, frequency, color, streak, completedDates, weeklyStatus |
| **logs** | user, habit, date, note, mood |
| **categories** | name, emoji, color, isDefault |
| **achievements** | user, key, label, icon, unlockedAt |

---

## 🔐 Security Features

- Passwords hashed with **bcryptjs** (salt rounds: 12)
- Authentication via **JWT** (30-day expiry)
- All private routes protected by `protect` middleware
- Admin routes protected by `adminOnly` middleware
- Request validation via **Joi** schemas
- Global error handler with meaningful HTTP status codes

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | Joi |
| Frontend | Bootstrap 5, Vanilla JS |
| Charts | Chart.js |
| Icons | Bootstrap Icons |

---

## 👥 Authors

- [Your Name] - Full Stack Development
- [Partner Name] - Full Stack Development
