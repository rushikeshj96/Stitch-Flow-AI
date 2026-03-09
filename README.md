# StitchFlow AI 🪡

> **AI-Powered Tailor & Boutique Management Platform** — SaaS application for managing customers, measurements, orders, and AI-generated fashion designs.

---

## 🏗️ Tech Stack

| Layer     | Technology                                     |
|-----------|------------------------------------------------|
| Frontend  | React 18, Vite, TailwindCSS, React Router v6  |
| Backend   | Node.js, Express.js, MongoDB, Mongoose         |
| Auth      | JWT (access tokens), bcrypt                    |
| AI        | OpenAI GPT-4 + DALL-E 3                       |
| Email     | Nodemailer (SMTP)                              |

---

## 📁 Project Structure

```
AI-tailor-Management/
├── 📦 package.json                    # Monorepo root
├── 📖 README.md
│
├── 🖥️  frontend/                       # React + Vite App
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx                   # App entry point
│       ├── App.jsx
│       ├── styles/
│       │   └── index.css              # Global + Tailwind styles
│       ├── routes/
│       │   ├── AppRoutes.jsx          # All routes (lazy-loaded)
│       │   └── ProtectedRoute.jsx     # Auth guard
│       ├── layouts/
│       │   ├── AuthLayout.jsx
│       │   └── DashboardLayout.jsx
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── SignupPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── CustomersPage.jsx
│       │   ├── CustomerDetailPage.jsx
│       │   ├── MeasurementsPage.jsx
│       │   ├── OrdersPage.jsx
│       │   ├── OrderDetailPage.jsx
│       │   ├── AIDesignPage.jsx
│       │   ├── NotificationsPage.jsx
│       │   ├── ProfilePage.jsx
│       │   └── NotFoundPage.jsx
│       ├── components/
│       │   ├── common/
│       │   │   ├── Sidebar.jsx
│       │   │   ├── Topbar.jsx
│       │   │   └── LoadingSpinner.jsx
│       │   ├── auth/
│       │   │   └── LoginForm.jsx
│       │   ├── customer/              # Customer components
│       │   ├── orders/                # Order components
│       │   ├── measurements/          # Measurement components
│       │   ├── ai/                    # AI design components
│       │   └── notifications/         # Notification components
│       ├── context/
│       │   ├── AuthContext.jsx        # Auth state + JWT management
│       │   ├── ThemeContext.jsx       # Dark/light theme
│       │   └── NotificationContext.jsx
│       ├── hooks/
│       │   ├── useAsync.js            # Generic async state hook
│       │   ├── useSearch.js           # Debounced search hook
│       │   └── usePagination.js       # Pagination hook
│       ├── services/
│       │   ├── apiClient.js           # Axios + interceptors
│       │   ├── authService.js
│       │   ├── customerService.js
│       │   ├── orderService.js
│       │   ├── measurementService.js
│       │   ├── aiService.js
│       │   └── notificationService.js
│       ├── utils/
│       │   ├── helpers.js             # formatDate, formatCurrency, etc.
│       │   └── validators.js          # Client-side validators
│       └── assets/
│           ├── images/
│           └── icons/
│
└── ⚙️  backend/                        # Express + MongoDB API
    ├── .env.example
    ├── package.json
    └── src/
        ├── server.js                  # Entry point + graceful shutdown
        ├── app.js                     # Express app config
        ├── config/
        │   ├── database.js            # MongoDB connection
        │   └── config.js              # Env config object
        ├── models/
        │   ├── User.js                # Auth model + JWT methods
        │   ├── Customer.js
        │   ├── Measurement.js
        │   ├── Order.js               # Auto order number + status history
        │   └── Notification.js
        ├── controllers/
        │   ├── authController.js
        │   ├── customerController.js
        │   ├── orderController.js
        │   └── aiController.js        # OpenAI DALL-E + GPT-4
        ├── routes/
        │   ├── authRoutes.js
        │   ├── customerRoutes.js
        │   ├── orderRoutes.js
        │   ├── measurementRoutes.js
        │   ├── aiRoutes.js
        │   └── notificationRoutes.js
        ├── middleware/
        │   ├── authMiddleware.js      # JWT protect + role authorize
        │   ├── errorHandler.js        # Global error handler
        │   ├── notFound.js
        │   └── validate.js            # express-validator checker
        ├── validations/
        │   ├── authValidation.js
        │   ├── customerValidation.js
        │   └── orderValidation.js
        └── utils/
            ├── logger.js              # Winston logger
            ├── asyncHandler.js        # Async wrapper
            └── emailService.js        # Nodemailer
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- OpenAI API Key

### 1. Clone & Install

```bash
git clone <repo-url>
cd AI-tailor-Management

# Install backend
cd backend && npm install

# Install frontend  
cd ../frontend && npm install
```

### 2. Configure Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# → Edit backend/.env with your MongoDB URI, JWT secret, OpenAI key

# Frontend
cp frontend/.env.example frontend/.env
# → Edit frontend/.env with API base URL
```

### 3. Run Development Servers

```bash
# Terminal 1 – Backend
cd backend && npm run dev        # → http://localhost:5000

# Terminal 2 – Frontend
cd frontend && npm run dev       # → http://localhost:3000
```

---

## 🔌 API Reference

| Module        | Base Route            |
|---------------|-----------------------|
| Auth          | `POST /api/auth/...`  |
| Customers     | `/api/customers`      |
| Measurements  | `/api/measurements`   |
| Orders        | `/api/orders`         |
| AI Designer   | `/api/ai`             |
| Notifications | `/api/notifications`  |
| Health Check  | `GET /health`         |

---

## 🛡️ Security Features
- Helmet.js for HTTP security headers
- Rate limiting (100 req/15min global, 10 req/15min auth)
- JWT token with expiry
- bcrypt password hashing (12 salt rounds)
- CORS restricted to frontend URL
- Input validation via express-validator

---

## 🤖 AI Features
- **Design Generator** – DALL-E 3 image generation from text prompts
- **Fashion Suggestions** – GPT-4 powered garment recommendations based on customer profile

---

*Built with ❤️ for tailors, boutiques & fashion entrepreneurs*
