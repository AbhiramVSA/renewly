# Subscription Management API

A robust, open-source Node.js application for managing user subscriptions. Built with Express and MongoDB, this app provides authentication, subscription management, and user administration features.

## Features
- User authentication (JWT-based)
- Subscription CRUD operations
- Role-based access control
- Error handling middleware
- MongoDB integration
- RESTful API structure
- Environment-based configuration
- Open source compliant

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/AbhiramVSA/subscription-management-app.git
   cd subscription-management-app
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure environment variables:**
   - Copy `config/env.js.example` to `config/env.js` and update values as needed.
   - Example:
     ```js
     module.exports = {
       MONGODB_URI: 'mongodb://localhost:27017/subscriptiondb',
       JWT_SECRET: 'your_jwt_secret',
       PORT: 3000
     };
     ```
4. **Start the application:**
   ```sh
   npm start
   ```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT

### Users
- `GET /api/users` — List all users (admin only)
- `GET /api/users/:id` — Get user by ID
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user

### Subscriptions
- `GET /api/subscriptions` — List subscriptions
- `POST /api/subscriptions` — Create subscription
- `GET /api/subscriptions/:id` — Get subscription by ID
- `PUT /api/subscriptions/:id` — Update subscription
- `DELETE /api/subscriptions/:id` — Delete subscription

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
Contributions are welcome! Please open issues and submit pull requests via GitHub. All contributions must comply with the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/).

## License
This project is licensed under the [MIT License](LICENSE).

## Security
If you discover a security vulnerability, please report it via GitHub Issues or contact the maintainers directly.

## Maintainers
- [AbhiramVSA](https://github.com/AbhiramVSA)

## Acknowledgements
- Express.js
- MongoDB
- JWT
- Open Source Community

---

For more information, see the documentation in the repository or contact the maintainers.
