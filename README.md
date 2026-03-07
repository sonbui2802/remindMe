# ⏰ RemindMe App

A full-stack application that allows users to create, manage schedule reminders, and receive reliable email notifications when tasks are due. 

## 🚀 Live Demo

* **Frontend:** https://remindme-app-drab.vercel.app/
* **Backend API:** Hosted on Render

*(Demo account: You can register directly on the homepage).*

## ✨ Features

* **User Authentication:** Secure registration and login using JWT and password hashing (Bcrypt).
* **Reminder Management:** Full CRUD operations for scheduling tasks and events.
* **Robust Email Notification System:** A custom database-backed job queue to handle email delivery securely.
* **Concurrency Control:** Utilizes MySQL `FOR UPDATE SKIP LOCKED` (Mutex locking) to prevent race conditions and duplicate email sending when multiple workers run simultaneously.
* **RESTful API:** Clean, modular, and scalable backend architecture.

## 🛠 Tech Stack

* **Frontend:** React, Tailwind CSS, Vite
* **Backend:** Node.js, Express.js
* **Database:** MySQL (using `mysql2/promise` with transactions)
* **Task Scheduling:** `node-cron`
* **Other Tools:** Nodemailer (SMTP), JWT
* **Deployment:** Vercel (Frontend), VPS/Render (Backend)

## 📦 Project Structure

```text
remindMe
│
├── backend
│   └── src
│       ├── config        # Database & Nodemailer configuration
│       ├── controllers   # Request handlers (Logic entry points)
│       ├── cron          # Scheduled background jobs (Scanner & Sender)
│       ├── middlewares   # JWT authentication and error handling
│       ├── models        # Database queries and schema interactions
│       ├── routes        # API endpoints
│       ├── services      # Core business logic and transactions
│       ├── app.js        # Express app setup
│       └── index.js      # Server entry point
│
├── frontend
│   ├── public            # Static assets
│   └── src
│       ├── assets        # Images & global styles
│       ├── components    # Reusable UI components
│       ├── hooks         # Custom React hooks
│       ├── pages         # Application pages
│       ├── services      # API integration
│       ├── App.tsx
│       └── main.tsx
│
└── README.md