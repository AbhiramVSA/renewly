# Renewly — Subscription Management Platform

**SubTrack** is a full-stack subscription management platform built with modern web technologies. The project consists of a robust Node.js/Express API backend and a responsive React/TypeScript frontend, designed for independent deployment and scalability.

## 🚀 Features

### Backend API
- **Authentication**: JWT-based auth with access & refresh tokens
- **RBAC**: Role-Based Access Control with 6 distinct roles (SUPER_ADMIN, ADMIN, MANAGER, USER, READ_ONLY, SERVICE)
- **Subscription Management**: Full CRUD operations for subscription tracking
- **Audit Logging**: Append-only security logging for all critical actions
- **Security**: Arcjet integration for rate limiting and abuse protection
- **RESTful API**: Clean, consistent API design with comprehensive error handling

### Frontend App
- **Modern Stack**: Vite + React 18 + TypeScript + Tailwind CSS
- **UI Components**: Shadcn/UI component library with Radix UI primitives
- **State Management**: TanStack Query for server state, React Hook Form for forms
- **Authentication**: Protected routes with automatic token refresh
- **Responsive Design**: Mobile-first design with smooth animations (Framer Motion)
- **Developer Experience**: Hot reload, TypeScript support, ESLint configuration

### Architecture
- **Independent Deployment**: Separate backend and frontend projects for flexible scaling
- **Environment Configuration**: Comprehensive environment variable management
- **Cross-Origin Support**: CORS configuration for separate domain deployment
- **Development Workflow**: Independent development servers with proxy configuration

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 18+ (ESM modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh token rotation
- **Security**: Arcjet, bcryptjs, CORS
- **Development**: Nodemon, ESLint

### Frontend
- **Build Tool**: Vite
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: Shadcn/UI + Radix UI
- **HTTP Client**: Axios with interceptors
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Animation**: Framer Motion
- **Development**: ESLint, PostCSS

## 📁 Project Structure

This project uses a **monorepo structure** with independent backend and frontend applications:

```
subscription-management-app/
├── backend/                     # Express.js API Server
│   ├── app.js                   # Main application entry point
│   ├── package.json             # Backend dependencies & scripts
│   ├── .env.development.local   # Backend environment variables
│   ├── config/
│   │   └── env.js              # Environment configuration
│   ├── constants/              # Application constants
│   ├── controllers/            # Route controllers
│   │   ├── auth.controller.js  # Authentication logic
│   │   ├── subscription.controller.js
│   │   └── user.controller.js
│   ├── database/
│   │   └── mongodb.js          # Database connection
│   ├── middleware/             # Custom middleware
│   │   ├── auth.middleware.js  # JWT authentication
│   │   ├── error.middleware.js # Error handling
│   │   └── rbac.middleware.js  # Role-based access control
│   ├── models/                 # Mongoose schemas
│   │   ├── subscription.model.js
│   │   ├── user.model.js
│   │   └── auditLog.model.js
│   ├── routes/                 # API routes
│   │   ├── auth.routes.js
│   │   ├── subscription.routes.js
│   │   └── user.routes.js
│   ├── scripts/               # Utility scripts
│   └── utils/                 # Helper functions
├── frontend/                   # React Application
│   ├── index.html             # HTML entry point
│   ├── package.json           # Frontend dependencies & scripts
│   ├── .env.development.local # Frontend environment variables
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.ts     # Tailwind CSS configuration
│   ├── components.json        # Shadcn/UI configuration
│   ├── src/
│   │   ├── main.tsx           # React entry point
│   │   ├── App.tsx            # Main app component
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── lib/               # Utilities & API client
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # State management
│   │   └── types/             # TypeScript type definitions
│   └── public/                # Static assets
├── api/                       # Vercel serverless functions
├── package.json               # Root package.json (development scripts)
├── vercel.json                # Vercel deployment configuration
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (Atlas or local instance)
- **Git** for version control

### 1. Clone Repository

```bash
git clone https://github.com/AbhiramVSA/subscription-management-app.git
cd subscription-management-app
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create environment configuration file:

```bash
# Create backend/.env.development.local
PORT=8001
NODE_ENV=development
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/subtrack
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=604800000
ARCJET_KEY=your_arcjet_api_key_here
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173
```

Start the backend development server:

```bash
npm run dev
```

✅ **Backend API available at**: `http://localhost:8001`

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create frontend environment configuration:

```bash
# Create frontend/.env.development.local
ENV_BASE_URL=http://localhost:8001
```

Start the frontend development server:

```bash
npm run dev
```

✅ **Frontend application available at**: `http://localhost:8080`

### 4. Development Workflow

Both applications can be run independently:

- **Backend only**: `cd backend && npm run dev`
- **Frontend only**: `cd frontend && npm run dev`
- **Both from root**: `npm run dev` (uses concurrently)

The frontend is configured to proxy API requests to the backend during development.

## API Endpoints

### Auth

- `POST /api/v1/auth/sign-in` — User login
- `POST /api/v1/auth/sign-up` — User registration
- `POST /api/v1/auth/refresh` — Refresh access token
- `POST /api/v1/auth/sign-out` — Sign out (invalidate refresh token)
- `POST /api/v1/auth/sign-out-all` — Sign out from all devices (requires auth)

### User

- `GET /api/v1/user/users` — Get all users (SUPER_ADMIN | ADMIN)
- `GET /api/v1/user/:id` — Get user by ID (authenticated)
- `PATCH /api/v1/user/:userId/role` — Change a user's role (SUPER_ADMIN | ADMIN, with elevation guard)

### Subscription

- `GET /api/v1/subscriptions/` — List all subscriptions (SUPER_ADMIN | ADMIN | MANAGER)
- `GET /api/v1/subscriptions/:id` — Get subscription details (owner or elevated)
- `POST /api/v1/subscriptions/` — Create a subscription (authenticated)
- `PUT /api/v1/subscriptions/:id` — Update a subscription (owner or elevated)
- `DELETE /api/v1/subscriptions/:id` — Delete a subscription (owner or ADMIN | SUPER_ADMIN)
- `GET /api/v1/subscriptions/user/:id` — Get subscriptions for a user (must match user or elevated)
- `PUT /api/v1/subscriptions/:id/cancel` — Cancel a subscription (owner or elevated)
- `GET /api/v1/subscriptions/upcoming-renewals` — Get upcoming renewals

## 🔧 Development Configuration

### Environment Variables

#### Backend (`.env.development.local`)
```env
PORT=8001                          # API server port
NODE_ENV=development               # Environment mode
DB_URI=mongodb://...              # MongoDB connection string
JWT_SECRET=your_jwt_secret        # JWT signing secret
JWT_EXPIRES_IN=15m                # Access token expiry
JWT_REFRESH_SECRET=refresh_secret # Refresh token secret
JWT_REFRESH_EXPIRES_IN=604800000  # Refresh token expiry (7 days)
ARCJET_KEY=your_arcjet_key        # Arcjet security key
ALLOWED_ORIGINS=http://localhost:8080 # CORS origins
```

#### Frontend (`.env.development.local`)
```env
ENV_BASE_URL=http://localhost:8001 # Backend API URL
```

### Build & Deployment

The project supports multiple deployment strategies:

1. **Monorepo Deployment** - Deploy both apps together
2. **Separate Deployment** - Deploy backend and frontend independently
3. **Serverless Deployment** - Backend as Vercel functions, frontend as static site

#### Production Environment Variables

**Backend Production**:
```env
NODE_ENV=production
DB_URI=mongodb+srv://...          # Production MongoDB
ALLOWED_ORIGINS=https://yourdomain.com
```

**Frontend Production**:
```env
ENV_BASE_URL=https://api.yourdomain.com
```

## Authentication & Refresh Tokens

Renewly implements JWT-based authentication with refresh token support for enhanced security and user experience.

### Authentication Flow

1. **Sign Up/Sign In**: Returns both access token (short-lived) and refresh token (long-lived)
2. **API Requests**: Use access token in Authorization header
3. **Token Refresh**: When access token expires, use refresh token to get new tokens
4. **Sign Out**: Invalidate specific refresh token or all tokens

### Token Configuration

Environment variables for token management:
```env
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m                    # Access token expiry (15 minutes)
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=604800000      # Refresh token expiry (7 days in ms)
```

### Example: Refresh Token Usage

```bash
# Get new access token using refresh token
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token_here"
}
```

Response:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "new_access_token",
    "refreshToken": "new_refresh_token",
    "user": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "USER"
    }
  }
}
```

### Token Management Endpoints

- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/sign-out` - Sign out (invalidate refresh token)
- `POST /api/v1/auth/sign-out-all` - Sign out from all devices (requires auth)

## RBAC Overview

Defined roles: `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `USER`, `READ_ONLY`, `SERVICE`.

Examples:
- View all users: SUPER_ADMIN | ADMIN
- List all subscriptions: SUPER_ADMIN | ADMIN | MANAGER
- Change user role: SUPER_ADMIN | ADMIN (ADMIN cannot assign SUPER_ADMIN)
- Delete subscription: Owner OR (SUPER_ADMIN | ADMIN)

Helper middleware: `requireRoles(...roles)` plus ownership checks inside controllers.

## Audit Logging

Append‑only collection `AuditLog` records security‑sensitive actions:
- LOGIN
- CREATE_SUBSCRIPTION / UPDATE_SUBSCRIPTION / DELETE_SUBSCRIPTION / CANCEL_SUBSCRIPTION
- ROLE_CHANGE

Immutable enforcement is done by throwing inside pre-update/delete hooks. Failing to write an audit entry never blocks the primary action (best effort logging).

## Security Notes
- JWT auth with role + active user check.
- Arcjet middleware for basic abuse/rate protections.
- Principle of least privilege enforced via route + controller checks.
- `isActive` flag on users (future: implement deactivation endpoints).

## Example: Change User Role
```
PATCH /api/v1/user/<userId>/role
Authorization: Bearer <ADMIN_OR_SUPER_ADMIN_TOKEN>
Content-Type: application/json

{
	"role": "MANAGER"
}
```
Response:
```
{
	"success": true,
	"data": { "_id": "<id>", "role": "MANAGER" }
}
```

## Example: Create Subscription
```
POST /api/v1/subscriptions/
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
	"name": "Netflix Premium",
	"price": 15.99,
	"currency": "USD",
	"frequency": "monthly",
	"category": "entertainment",
	"startDate": "2024-02-01T00:00:00.000Z",
	"paymentMethod": "Credit Card"
}
```

## 🗺 Roadmap

### Planned Features
- [ ] **Advanced Filtering**: Pagination and complex subscription filtering
- [ ] **Audit Dashboard**: Query interface for audit logs (admin only)
- [ ] **Soft Delete**: Recoverable deletion with restore workflows
- [ ] **Notifications**: Email/webhook alerts for upcoming renewals
- [ ] **API Keys**: Service account authentication for third-party integrations
- [ ] **Enhanced RBAC**: Rate limiting tiers per role
- [ ] **Analytics**: Subscription spending insights and trends
- [ ] **Mobile App**: React Native companion app
- [ ] **Backup/Export**: Data export functionality
- [ ] **Multi-tenant**: Support for multiple organizations

### Current Version
- ✅ JWT Authentication with refresh tokens
- ✅ Role-based access control (6 roles)
- ✅ Full subscription CRUD operations
- ✅ Audit logging for security events
- ✅ Modern React frontend with TypeScript
- ✅ Independent deployment architecture
- ✅ Comprehensive error handling
- ✅ Security middleware integration

## 📊 Available Scripts

### Root Directory
```bash
npm run dev              # Start both backend and frontend
npm run dev:server       # Start backend only
npm run dev:client       # Start frontend only
npm run build           # Build frontend for production
npm run test            # Run test suite
npm run cleanup-tokens  # Clean expired refresh tokens
```

### Backend Directory (`cd backend`)
```bash
npm run dev    # Start backend with nodemon
npm start      # Start backend in production mode
```

### Frontend Directory (`cd frontend`)
```bash
npm run dev      # Start development server (port 8080)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Install** dependencies for both backend and frontend
4. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
5. **Make** your changes and add tests
6. **Commit** your changes (`git commit -m 'Add amazing feature'`)
7. **Push** to your branch (`git push origin feature/amazing-feature`)
8. **Open** a Pull Request

### Code Standards
- **TypeScript** for type safety (frontend)
- **ESM modules** throughout the project
- **ESLint** for code consistency
- **Conventional commits** for clear history
- **Comprehensive error handling**
- **Security-first** approach

### Areas for Contribution
- 🐛 **Bug fixes** and performance improvements
- 📝 **Documentation** enhancements
- 🧪 **Test coverage** expansion
- 🎨 **UI/UX** improvements
- 🔒 **Security** enhancements
- 🚀 **New features** from the roadmap

## License

This project is licensed under the [MIT License](LICENSE).

## Security

If you discover a security vulnerability, please open an issue or contact the maintainers directly.

## Maintainers

- [AbhiramVSA](https://github.com/AbhiramVSA)

---

## 📋 Project Specifications

### Technical Requirements
- **Node.js**: v18+ (ESM modules required)
- **MongoDB**: v4.4+ (Atlas recommended)
- **Memory**: 512MB+ for development
- **Storage**: 100MB+ for dependencies

### Browser Support
- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

### Performance Targets
- **API Response Time**: <200ms average
- **Frontend Load Time**: <3s first contentful paint
- **Bundle Size**: <1MB total JavaScript
- **Lighthouse Score**: 90+ performance rating

---

**Keywords:** subscription management, react typescript, express api, nodejs backend, mongodb, jwt authentication, rbac, audit logging, vite, tailwind css, shadcn ui, vercel deployment, modern web development
