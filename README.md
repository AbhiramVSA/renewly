# Renewly

Renewly is a Node.js and Express-based REST API for managing user subscriptions. It provides endpoints for user authentication, subscription creation, updates, cancellations, and tracking upcoming renewals. Built with MongoDB, SubTrack is designed for extensibility, security, and production readiness.

## Features

- User authentication and authorization (JWT-based)
- Create, update, and delete subscriptions
- Track upcoming renewals
- Secure middleware integration (Arcjet, custom auth)
- Modular route and controller structure
- Environment-based configuration
- Error handling middleware
- Open source friendly

## Tech Stack

- **Node.js** (ES Modules)
- **Express.js**
- **MongoDB** (Mongoose ODM)
- **JWT Authentication**
- **Arcjet** (security middleware)
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

- `GET /api/v1/user/users` — Get all users
- `GET /api/v1/user/:id` — Get user by ID (protected)

### Subscription

- `GET /api/v1/subscription/` — List all subscriptions
- `GET /api/v1/subscription/:id` — Get subscription details
- `POST /api/v1/subscription/` — Create a subscription (protected)
- `PUT /api/v1/subscription/:id` — Update a subscription
- `DELETE /api/v1/subscription/:id` — Delete a subscription
- `GET /api/v1/subscription/user/:id` — Get subscriptions for a user (protected)
- `PUT /api/v1/subscription/:id/cancel` — Cancel a subscription
- `GET /api/v1/subscription/upcoming-renewals` — Get upcoming renewals

## Project Structure
```
app.js
config/
controllers/
database/
middleware/
models/
routes/
```

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

**Topics:** subscription management, express api, nodejs backend, mongodb, rest api, authentication, middleware, user management, payments, open source
