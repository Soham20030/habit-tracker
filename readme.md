# 🌱 Fullstack Habit Tracker Web App

A full-featured habit tracker web application built with **React**, **Express.js**, and **PostgreSQL**, supporting **JWT-based authentication**, **habit management**, **daily completion tracking**, and detailed **progress visualization**.

---

## 🚀 Features

### 🔐 Authentication
- Secure **JWT-based login and registration**
- **Password hashing** with bcrypt
- **Authentication state** managed using React Context API
- **Protected routes** to prevent unauthorized access

### 📋 Habit Management
- Create, view, update, and delete personal habits
- Smart UI logic for empty and populated states
- Personalized dashboard with user-specific habits

### ✅ Daily Habit Completion
- Checkbox system to mark habits as completed
- Real-time feedback and UI updates
- Completion status for the current date

### 📊 Progress Visualization
- 📅 **Calendar View** showing daily completion history
- 🔥 **Streak Tracker** with current and best streak tracking
- 📈 **Analytics Dashboard** showing:
  - Weekly/monthly completion summaries
  - Total completions
  - Completion percentages
- 📊 **Line/Bar Charts** to visualize progress trends

---

## 🧰 Tech Stack

| Category      | Tech Used                             |
|---------------|----------------------------------------|
| **Frontend**  | React, Vite, React Router DOM, Context API |
| **Backend**   | Node.js, Express.js                   |
| **Database**  | PostgreSQL                            |
| **Auth**      | JWT, bcrypt                           |
| **Deployment**| Vercel (frontend), Render/Railway (backend) |
| **Styling**   | CSS                                    |
| **Tools**     | Postman, Thunder Client               |

---

## 🗃️ Project Structure

habit-tracker/
├── server/ # Backend (Express.js)
│ ├── db/ # PostgreSQL DB config
│ │ └── db.js
│ ├── Routes/ # API route handlers
│ │ └── authRoutes.js
│ │ └── habitRoutes.js
│ │ └── completionRoutes.js
│ ├── middleware/ # Auth middleware
│ │ └── authMiddleware.js
│ ├── .env # Environment variables
│ ├── index.js # Main server entry point
│ └── package.json
├── client/ # Frontend (React + Vite)
│ ├── src/
│ │ ├── pages/ # Page components
│ │ ├── components/ # Reusable components
│ │ ├── AuthContext.js
│ │ └── main.jsx
│ ├── package.json
│ └── vite.config.js


---

## 🧾 Database Schema

### `habit_users`  
| Field     | Type     |
|-----------|----------|
| id        | SERIAL PRIMARY KEY |
| username  | VARCHAR  |
| email     | VARCHAR (UNIQUE) |
| password  | VARCHAR (hashed) |

### `habits`  
| Field       | Type      |
|-------------|-----------|
| id          | SERIAL PRIMARY KEY |
| user_id     | INTEGER (FK → habit_users.id) |
| name        | VARCHAR   |
| description | TEXT      |
| created_at  | TIMESTAMP |

### `completions`  
| Field          | Type      |
|----------------|-----------|
| id             | SERIAL PRIMARY KEY |
| habit_id       | INTEGER (FK → habits.id) |
| completed_date | DATE      |
| completed      | BOOLEAN   |

---

## 📡 API Endpoints

### **Authentication**
- `POST /api/auth/register` – Register new users
- `POST /api/auth/login` – Login and receive JWT token
- `GET /api/auth/profile` – Get logged-in user's profile

### **Habits**
- `GET /api/habits` – Get all habits for the current user
- `POST /api/habits` – Create a new habit
- `PUT /api/habits/:id` – Update an existing habit
- `DELETE /api/habits/:id` – Delete a habit

### **Completions**
- `POST /api/completions` – Mark a habit as completed
- `GET /api/completions` – Get all completions for the user
- `GET /api/completions/:habitId` – Get completions for a specific habit

---

## 💻 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker

DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
