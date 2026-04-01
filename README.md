# ApnaPG — Trust-Based Student Housing Platform

ApnaPG is a comprehensive, broker-free web platform designed to connect verified property owners with student tenants. It simplifies the process of finding PGs and managing tenancies through trust, transparency, and modern web technologies.

## 🚀 Project Overview

The ApnaPG project consists of a decoupled frontend and backend:
- **[Frontend (ApnaPG-frontend)](#frontend-architecture)**: A React-based Single Page Application (SPA).
- **[Backend (ApnaPG-backend)](#backend-architecture)**: A robust FastAPI (Python) REST application.

---

## 🏗 Frontend Architecture (`ApnaPG-frontend/`)

The frontend is a modern React application built for performance and developer experience.

### Tech Stack
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Language**: TypeScript
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) with Tailwind Merge and CLSX
- **State Management / Data Fetching**: [React Query (TanStack)](https://tanstack.com/query) & [Axios](https://axios-http.com/)
- **Authentication**: [Clerk React](https://clerk.com/)
- **Maps**: [React Leaflet](https://react-leaflet.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Key Features
- **Role-based Dashboards**: Distinct, protected routing for Tenants and Owners (`/tenant/dashboard`, `/owner/dashboard`).
- **Interactive Mapping**: Leaflet integration for displaying PG locations visually.
- **Clerk Auth**: Secure authentication and identity management gracefully handled by Clerk components (`<SignedIn>`, `<SignedOut>`, etc.).

### Getting Started (Frontend)
1. Navigate to the frontend directory: `cd ApnaPG-frontend`
2. Install dependencies: `npm install`
3. Set up your `.env.local` with your Clerk Publishable Key (and any backend API URLs).
4. Run the development server: `npm run dev`

---

## ⚙️ Backend Architecture (`ApnaPG-backend/`)

The backend is built leveraging FastAPI, offering high-performance, asynchronous endpoints, and automatic Swagger documentation.

### Tech Stack
- **Framework**: [FastAPI 0.115](https://fastapi.tiangolo.com/) & Uvicorn
- **Database**: PostgreSQL (with `psycopg2-binary`)
- **ORM & Migrations**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) & [Alembic](https://alembic.sqlalchemy.org/)
- **Authentication**: JWT validation using `pyjwt` (verifying Clerk's tokens)
- **Media Storage**: [Cloudinary](https://cloudinary.com/) (for property images, user avatars)
- **PDF Generation**: [ReportLab](https://www.reportlab.com/) (e.g., generating lease documents or rent receipts)

### Core Models & Business Logic
The business layer relies on the following key entities:
- **User (`users`)**: Authenticated profiles synced via Clerk webhooks. Users are categorized by roles: `tenant`, `owner`, or `admin`.
- **Property (`properties`)**: PG/Room listings created by verified owners. It stores location (latitude/longitude), rental price, occupancy type, and customizable house rules.
- **Connection**: Represents the link/contract between a tenant and a listed property.
- **Review**: Enables a bi-directional review system (Tenant ↔ Owner) ensuring trust and platform quality.
- **PropertyImage**: Associated images for a listed property outsourced to Cloudinary.

### Getting Started (Backend)
1. Navigate to the backend directory: `cd ApnaPG-backend`
2. Set up a Python virtual environment: `python -m venv env` and activate it (e.g., `env\Scripts\activate` on Windows).
3. Install dependencies: `pip install -r requirements.txt`
4. Set up the `.env` file with PostgreSQL connection string, Clerk Secret keys, and Cloudinary credentials.
5. Apply database migrations: `alembic upgrade head`
6. Run the uvicorn development server: `uvicorn app.main:app --reload`
   - Access interactive API docs at `http://127.0.0.1:8000/docs`.

---

## 🔒 Security & Authentication

ApnaPG utilizes a modern identity stack. **Clerk** handles user registration, login, and session management on the frontend. The backend verifies the Clerk-issued JWTs for protected routes and uses Webhooks to keep its local `users` database synchronized with Clerk's identity store.
