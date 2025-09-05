# Renewly - Subscription Management API


Renewly is a Node.js and Express-based REST API for managing user subscriptions. It provides endpoints for user authentication, subscription lifecycle (create, update, cancel, delete), RBAC‑protected administration, audit logging, and upcoming renewal tracking. Built with Express, MongoDB (Mongoose), and hardened with layered middleware (JWT auth + Arcjet security), it is designed for extensibility and production readiness.

## Features

- User authentication and authorization (JWT-based)
- Create, update, cancel, and delete subscriptions
- Track upcoming renewals
- Secure middleware integration (Arcjet, custom auth)
- Role-Based Access Control (RBAC) (SUPER_ADMIN, ADMIN, MANAGER, USER, READ_ONLY, SERVICE)
- Append‑only audit logging (login, role changes, subscription mutations)
- Modular route and controller structure
- Environment-based configuration
- Error handling middleware
- Open source friendly

## Tech Stack

- **Node.js** (ES Modules)
- **Express.js**
- **MongoDB** (Mongoose ODM)
- **JWT Authentication**
- **Arcjet** (security & abuse mitigation)
- **dotenv** (environment management)

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas or local MongoDB instance

### Installation

```bash
git clone https://github.com/yourusername/subtrack.git
cd subtrack
npm install
```

### Environment Setup

Create a `.env.development.local` file in the root directory:

```
PORT=8085
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
ARCJET_KEY=your_arcjet_key
```

### Running the App

```bash
npm run dev
```

The API will be available at `http://localhost:8085`.

## API Endpoints

### Auth

- `POST /api/v1/auth/sign-in` — User login
- `POST /api/v1/auth/sign-up` — User registration

### User

- `GET /api/v1/user/users` — Get all users (SUPER_ADMIN | ADMIN)
- `GET /api/v1/user/:id` — Get user by ID (authenticated)
- `PATCH /api/v1/user/:userId/role` — Change a user's role (SUPER_ADMIN | ADMIN, with elevation guard)

### Subscription

- `GET /api/v1/subscription/` — List all subscriptions (SUPER_ADMIN | ADMIN | MANAGER)
- `GET /api/v1/subscription/:id` — Get subscription details (placeholder)
- `POST /api/v1/subscription/` — Create a subscription (authenticated)
- `PUT /api/v1/subscription/:id` — Update a subscription (owner or elevated role)
- `DELETE /api/v1/subscription/:id` — Delete a subscription (owner or ADMIN | SUPER_ADMIN)
- `GET /api/v1/subscription/user/:id` — Get subscriptions for a user (must match user or elevated)
- `PUT /api/v1/subscription/:id/cancel` — Cancel a subscription (owner or elevated)
- `GET /api/v1/subscription/upcoming-renewals` — Get upcoming renewals (placeholder)

## Project Structure (Key Files)
```
app.js
config/
constants/roles.js
controllers/
	auth.controller.js
	subscription.controller.js
	user.controller.js
database/mongodb.js
middleware/
	auth.middleware.js
	requireRoles.middleware.js
	arcjet.middleware.js
	error.middleware.js
models/
	user.model.js
	subscription.model.js
	auditLog.model.js
utils/auditLogger.js
routes/
	auth.routes.js
	user.routes.js
	subscription.routes.js
```

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
POST /api/v1/subscription/
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

**Topics:** subscription management, express api, nodejs backend, mongodb, rest api, authentication, middleware, user management, payments, open source, rbac, audit logging
