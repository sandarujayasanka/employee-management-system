# StaffLedger — Employee Management System

A full-stack **MERN** (MongoDB, Express, React, Node.js) application for managing employee records, attendance, and leave — built for small-to-medium HR teams.

![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- **Employee records** — add, edit, search, filter and remove employees (department, position, salary, status, join date)
- **Authentication & roles** — JWT-based login. The first account created becomes the **admin**; public sign-up is then locked automatically
- **Team management** — admins can create HR manager / admin accounts from an in-app **Team** page; no open registration after setup
- **Attendance calendar** — mark each employee's day as Present / Leave / Absent / Half Day, including scheduling future leave in advance
- **Leave quota tracking** — each employee has an annual leave allowance. Leave days are deducted in date order automatically, and once the quota is used up, further leave is auto-flagged **No Pay**
- **Dashboard** — live headcount, active/on-leave counts, and department breakdown
- **Responsive UI** — collapsible hamburger sidebar on mobile, scrollable tables, adaptive forms
- **Live employee search** — type-ahead combobox instead of long dropdowns, for teams with many employees

---

## 🧱 Tech stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18 (Vite), React Router, Axios |
| Backend    | Node.js, Express |
| Database   | MongoDB (Mongoose ODM) — works with MongoDB Atlas or a local instance |
| Auth       | JSON Web Tokens (JWT), bcrypt password hashing |
| Styling    | Plain CSS with a custom design-token system (no framework) |

---

## 📁 Project structure

employee-management-system/
├── server/ # Express + MongoDB REST API
│ ├── config/db.js
│ ├── middleware/authMiddleware.js
│ ├── models/ # Employee, User, Attendance
│ ├── routes/ # auth, employees, attendance
│ └── server.js
└── client/ # React (Vite) frontend
└── src/
├── api/axios.js
├── context/AuthContext.jsx
├── components/ # Sidebar, ProtectedRoute
└── pages/ # Login, Register, Dashboard, EmployeeList,

# EmployeeForm, Team, Attendance

---

## 🚀 Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A MongoDB database — either a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster, or MongoDB running locally

### 1. Clone the repository

```bash
git clone https://github.com/sandarujayasanka/employee-management-system.git
cd employee-management-system
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Fill in `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/employee_management
JWT_SECRET=replace_with_a_long_random_string
```

If using Atlas, remember to whitelist your IP address under **Network Access** in the Atlas dashboard.

Start the API:

```bash
npm run dev
```

The server runs at `http://localhost:5000`.

### 3. Frontend setup

In a new terminal:

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### 4. First-time setup

1. Open the app and go to **Create the first admin account** on the login page.
2. This is the **only** account that can self-register — after it's created, `/register` locks itself automatically.
3. From then on, the admin creates every other account from the **Team** page inside the app.

---

## 👤 Roles

| Role      | Can do |
|-----------|--------|
| `admin`   | Manage employees, attendance, and the Team (create/remove user accounts) |
| `manager` | Manage employees and attendance only — no access to Team |

---

## 🔌 API overview

All routes are prefixed with `/api`. Routes marked 🔒 require a valid JWT (`Authorization: Bearer <token>`), and 🔒👑 require an admin role.

| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | `/auth/setup-status` | Whether an admin account already exists |
| POST | `/auth/register` | Create the first admin account (closes after use) |
| POST | `/auth/login` | Log in, returns a JWT |
| GET | `/auth/users` 🔒👑 | List all accounts |
| POST | `/auth/users` 🔒👑 | Create a new team member account |
| DELETE | `/auth/users/:id` 🔒👑 | Remove a team member account |
| GET | `/employees` 🔒 | List employees (supports `search`, `department`, `status` query params) |
| GET | `/employees/stats` 🔒 | Dashboard summary counts |
| GET | `/employees/:id` 🔒 | Get one employee |
| POST | `/employees` 🔒 | Create an employee |
| PUT | `/employees/:id` 🔒 | Update an employee |
| DELETE | `/employees/:id` 🔒 | Remove an employee |
| GET | `/attendance` 🔒 | One employee's attendance for a given month (`employeeId`, `year`, `month`) |
| GET | `/attendance/balance` 🔒 | Leave quota usage for one employee/year |
| GET | `/attendance/summary` 🔒 | Attendance counts for all employees in a month |
| POST | `/attendance` 🔒 | Mark/update a single day's attendance |
| DELETE | `/attendance/:id` 🔒 | Clear a marked day |

---

## 🗺️ Roadmap ideas

- [ ] Excel/PDF export of employee & attendance reports
- [ ] Document uploads (contracts, ID copies) per employee
- [ ] Payroll basics (EPF/ETF calculations)
- [ ] Performance review module

---

## 📄 License

MIT — free to use and modify.