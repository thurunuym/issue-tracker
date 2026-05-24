# 🚀 Issue Tracker

A full stack issue tracking system built with a React frontend and a Node.js/Express backend.  

---

## 🌐 Live Demo

🔗 https://issue-tracker-gamma-lime.vercel.app

---

## 🔐 Demo Credentials

| Role | Email | Password | Access |
|------|------|------|------|
| **Admin** | `admin@gmail.com` | `admin123` | 
| **User** | `test@user.com` | `123456` |

---

# ✨ Features

## ✅ Authentication & Security
- JWT Authentication
- Access Token & Refresh Token flow
- Password hashing with Bcrypt.js
- Role-Based Access Control (RBAC)

## ✅ Issue Management
- Create, update, delete issues
- Assign issues to users

## ✅ File Uploads
- Cloudinary integration

## ✅ Export Features
- Export issue data as CSV
- JSON2CSV integration

## ✅ Responsive UI
- Mobile friendly layout
- Toast notifications

---

# 🏗️ Tech Stack

## Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI Library |
| TypeScript | Type Safety |
| Redux Toolkit | Global State |
| TanStack React Query | Server State Management |
| React Router DOM | Routing |
| Axios | API Requests |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| Recharts | Data Visualization |
| React Hot Toast | Notifications |

---

## Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express 5 | Backend Framework |
| TypeScript | Type Safety |
| MongoDB | Database |
| Mongoose 9 | ODM |
| JWT | Authentication |
| Bcrypt.js | Password Hashing |
| Helmet | Security Headers |
| CORS | Cross-Origin Security |
| Express Rate Limit | API Protection |
| Multer | File Uploads |
| Cloudinary | Cloud Storage |
| JSON2CSV | CSV Export |

---

# 🏛️ Architecture Highlights

## 🔑 Two-Token Authentication
The application uses a secure JWT authentication strategy:
- Short-lived Access Tokens
- Refresh Tokens for persistent sessions
- Protected routes & secure authorization flow

## 👥 Role-Based Access Control (RBAC)
### Admin
- Manage all users
- Manage all issues

### User
- Create issues
- Edit own issues
- Track assigned issues

## ⚡ Optimized State Management
- Redux Toolkit handles authentication/global state
- React Query handles API caching and synchronization

---

# 📁 Project Structure

```bash
issue-tracker/
│
├── backend/
│   ├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.ts
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── redux/
│   ├── hooks/
│   ├── services/
│   └── main.tsx
│
└── README.md
```

---

# ⚙️ Local Development Setup

## 📋 Prerequisites

Make sure you have installed:
- Node.js (v18+)
- MongoDB (local instance or Atlas URI)

---

# 🔧 Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create environment variables:

```bash
cp .env.example .env
```

Update the `.env` file with:
- MongoDB URI
- JWT secrets
- Cloudinary credentials

Start the backend server:

```bash
npm run dev
```

✅ Backend runs on:
```bash
http://localhost:5000
```

> Note: The application automatically seeds default roles on startup.

---

# 💻 Frontend Setup

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create environment variables:

```bash
cp .env.example .env
```

Start the frontend server:

```bash
npm run dev
```

✅ Frontend runs on:
```bash
http://localhost:5173
```

---

# 🔌 API Features

- Authentication & authorization
- Issue CRUD operations
- User management
- File/image uploads
- CSV export support
- Pagination & filtering

---


# 🚀 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB |
| File Storage | Cloudinary |

---

# 🔮 Future Improvements

- Real-time updates with WebSockets
- Notifications

