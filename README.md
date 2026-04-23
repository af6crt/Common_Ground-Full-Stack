
# 🌱 Common Ground – Neighbourhood Community Platform

Common Ground connects neighbours through shared interests, local events, and home‑cooked meals. It brings together students, adults, and elderly community members to build meaningful connections.

---

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Database Seeding](#database-seeding)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Submission Notes](#submission-notes)

---

## ✨ Features

### For All Users
- Browse **15 clubs**, **20 events**, and **25 meals** with dietary filters (Halal, Vegetarian, Vegan, Healthy)
- Fully responsive design (mobile, tablet, desktop)

### For Registered Users
- Create an account and sign in (JWT authentication)
- Join clubs – member count updates in real time
- Attend events – attendee count updates
- Request home‑cooked meals – portions decrease automatically
- Create, edit, and delete your own events
- Share, edit, and delete meals
- Personal dashboard showing joined clubs, attended events, requested meals, and created content
- Edit your profile (name, phone, age group, interests, password)

---

## 🛠️ Technology Stack

| Layer          | Technology |
|----------------|------------|
| Frontend       | React 18 + TypeScript + Tailwind CSS + Vite |
| Backend        | Node.js + Express + TypeScript |
| Database       | PostgreSQL + Prisma ORM |
| Authentication | JWT + bcrypt |
| Testing        | Jest (unit tests) + Playwright (E2E) |
| API Docs       | Swagger / OpenAPI (YAML) |

---

## 📁 Project Structure

```
Common_Ground Full‑Stack/
├── backend/                     # Express + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── tests/               # Jest test files
│   │   └── server.ts
│   ├── swagger.yaml
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/                    # React frontend (Vite)
│   ├── src/
│   │   ├── App.tsx              # Main application
│   │   ├── services/
│   │   ├── index.css
│   │   └── main.tsx
│   ├── playwright tests/        # E2E test files
│   ├── playwright.config.ts
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 20.x or higher
- **PostgreSQL** 14+ (or a cloud database like [Neon](https://neon.tech))

### Step 1: Unzip the project

Extract the zip file and open a terminal in the **root folder** named `Common_Ground Full‑Stack`.

### Step 2: Install backend dependencies

```bash
cd backend
npm install
```

### Step 3: Install frontend dependencies

Open a **new terminal** (still in the root folder) and run:

```bash
cd frontend
npm install
```

---

## 🏃 Running the Application

You need **two terminals** – one for the backend, one for the frontend.

### Terminal 1 – Backend

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ Swagger documentation loaded
✅ Server running on port 3005
📚 API Docs: http://localhost:3005/api-docs
```

### Terminal 2 – Frontend

```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v8.0.8  ready in 687 ms
➜  Local:   http://localhost:5173/
```

Now open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌱 Database Seeding

The first time you run the backend, you need to set up the database and seed initial data.

Make sure PostgreSQL is running, then in the **backend terminal**:

```bash
npx prisma migrate dev --name init   # (if not already run)
npx prisma db seed
```

**Seed output:**
```
🌱 Seeding database...
✓ Cleared existing data
✓ Created demo user: demo321@example.com / demo123
✓ Seeded 15 clubs
✓ Seeded 20 events
✓ Seeded 25 meals
✅ Seeding complete!
```

To browse the database visually:
```bash
npx prisma studio
# Opens http://localhost:5555
```

---

## 🧪 Testing

### Backend Unit Tests (Jest)

```bash
cd backend
npm test
```

**Expected output:**
```
Test Suites: 4 passed, 4 total
Tests:       13 passed, 13 total
```

### Frontend E2E Tests (Playwright)

Make sure **both backend and frontend are running**, then open a new terminal in the frontend folder:

```bash
cd frontend
npx playwright test
```

All 15 tests should pass. To run with a visible browser:
```bash
npx playwright test --headed
```

---

## 📚 API Documentation

Once the backend is running, visit:  
**[http://localhost:3005/api-docs](http://localhost:3005/api-docs)**

The documentation is generated from `backend/swagger.yaml` and includes all REST endpoints for auth, events, meals, clubs, and users.

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` folder using the example below (copy from `.env.example`):

```env
DATABASE_URL="postgresql://username:password@localhost:5432/commonground"
JWT_SECRET="your-super-secret-key-change-this"
PORT=3005
```

> ⚠️ **Do not commit `.env`** – it is already ignored by `.gitignore`.  
> `.env.example` is provided as a template.

---

## 🛠️ Troubleshooting

### Port 3005 already in use

If you see `Error: listen EADDRINUSE: address already in use :::3005`:

1. Find the process using port 3005:
   ```bash
   netstat -ano | findstr :3005
   ```
   Example output:
   ```
   TCP    0.0.0.0:3005           0.0.0.0:0              LISTENING       17612
   ```

2. Kill the process – **replace 17612 with the actual PID** shown:
   ```bash
   taskkill /PID 17612 /F
   ```

3. Restart the backend:
   ```bash
   npm run dev
   ```

### Database connection issues

- Verify PostgreSQL is running.
- Check your `DATABASE_URL` in `.env`.
- Run `npx prisma migrate dev` to re‑apply migrations.

### Playwright tests fail

- Ensure backend and frontend are both running (`localhost:3005` and `localhost:5173`).
- Install Playwright browsers (if missing):
  ```bash
  npx playwright install
  ```
- Run tests in headed mode to see what happens:
  ```bash
  npx playwright test --headed
  ```

---

## 📦 Submission Notes

You are submitting a **zip file** of the entire `Common_Ground Full‑Stack` folder.  
**Excluded** (already in `.gitignore`):
- `node_modules/`
- `.env`
- `dist/` or `build/`
- `playwright-report/` and `test-results/`

**Included**:
- All source code (backend, frontend)
- Prisma schema & migrations
- Test files (Jest, Playwright)
- `.git` folder (or a link to your repository in the decision log)
- `README.md` (this file)
- `.env.example`

---

## 🎥 Video Demonstration

A 10‑minute video is submitted separately, showing:
- All CRUD operations (create, read, update, delete)
- Authentication flow (register, login, logout, protected routes)
- Running tests (Jest and Playwright)
- API documentation (Swagger UI)
- Accessibility features and responsive design

---

## 🙏 Credits

Developed by **Adeena Fayyaz** as a full‑stack assignment for **COM5409 – Web Design and Programming**.  
Technology choices and architecture are documented in the separate **Decision Log**.

---

**Thank you for exploring Common Ground!**  
If you encounter any issues, please refer to the troubleshooting section above.
```