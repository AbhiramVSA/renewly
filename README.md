# Renewly — Subscription Management Platform (API + Frontend)


Renewly is a subscription management platform with a production‑ready Node.js/Express API and a modern Vite + React + TypeScript frontend. It supports authentication with JWT access/refresh tokens, role‑based access control (RBAC), append‑only audit logging, upcoming renewal tracking, and secure middleware hardening (Arcjet). Designed for extensibility and real‑world deployments.

## Features

- API: JWT auth with access + refresh tokens
- API: Create, update, cancel, and delete subscriptions
- API: Upcoming renewals endpoint and rich filtering/pagination
- API: Secure middleware integration (Arcjet, custom auth)
- API: Role-Based Access Control (RBAC) — SUPER_ADMIN, ADMIN, MANAGER, USER, READ_ONLY, SERVICE
- API: Append‑only audit logging (login, role changes, subscription mutations)
- API: Centralized error handling with consistent JSON shape
- Frontend: Vite + React + TypeScript, protected routes, axios refresh interceptor
- Frontend: Modern landing page and subscriptions UI with animations
- Environment-based configuration and open‑source compliant (MIT)

## Tech Stack

- Backend: Node.js (ESM), Express, MongoDB/Mongoose, JWT, Arcjet, dotenv
- Frontend: Vite, React, TypeScript, Tailwind CSS, axios, TanStack Query, framer‑motion

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas or local MongoDB instance

### Clone

```bash
git clone https://github.com/AbhiramVSA/subscription-management-app.git
cd subscription-management-app
```

### Project Layout
```
backend/
	app.js
	config/
	controllers/
	database/
	middleware/
	models/
	routes/
frontend/
	src/
	index.html
	package.json
```

### Backend Setup

1) Install deps
```
cd backend
npm install
```

2) Create `backend/.env.development.local`
```
PORT=8001
DB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=604800000
ARCJET_KEY=your_arcjet_key
```

3) Start the API
```
npm run dev
```
The API will be available at http://localhost:8001.

### Frontend Setup

1) Install deps
```
cd ../frontend
npm install
```

2) Create `frontend/.env.local`
```
VITE_API_BASE_URL=http://localhost:8001
```

3) Start the app
```
npm run dev
```
The frontend runs on http://localhost:5173.

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

## Project Structure (Key Files)
```
backend/
	app.js
	config/
	controllers/
	database/
	middleware/
	models/
	routes/
	utils/
frontend/
	src/
	index.html
	package.json
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

## Roadmap / Ideas
- Pagination + advanced filtering for subscriptions.
- Expose audit log query endpoint (secured).
- Soft delete & restore workflows.
- Email / webhook notifications before renewals.
- API key support for SERVICE role.
- Rate limit tiers per role.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## License

This project is licensed under the [MIT License](LICENSE).

## Security

If you discover a security vulnerability, please open an issue or contact the maintainers directly.

## Maintainers

- [AbhiramVSA](https://github.com/AbhiramVSA)

---

**Topics:** renewly, subscription management, express api, nodejs backend, mongodb, rest api, authentication, middleware, user management, payments, open source, rbac, audit logging
