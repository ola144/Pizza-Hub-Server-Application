# PizzaHub Server

This server powers the PizzaHub full-stack application. It provides the API for authentication, user management, inventory operations, admin actions, and order processing for the pizza ordering platform.

## Overview

The backend is built with Node.js and Express and uses MongoDB via Mongoose. It handles both customer and admin flows, including secure JWT-based authentication, email verification, password reset, inventory updates, and order lifecycle management.

## Main responsibilities

- User registration and login
- Admin authentication and authorization
- Email verification and password reset
- Inventory create/update operations
- Order creation and status updates
- Admin order management and pagination
- Scheduled low-stock checks and automated admin email alerts
- Error handling and structured API responses

## Tech stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT
- Cookie parser
- Nodemailer
- Socket.io
- Razorpay
- Zod validation

## API base URL

By default, the application is configured for:

```text
http://localhost:5000/api/v1
```

## Project structure

```text
server/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── auth.controller.js
│   │   └── admin-order.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── role.middleware.js
│   ├── models/
│   │   ├── Admin.js
│   │   └── User.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   └── admin-order.routes.js
│   ├── services/
│   │   └── email.service.js
│   ├── sockets/
│   ├── utils/
│   │   ├── auth.js
│   │   ├── seedAdmin.js
│   │   └── token.js
│   └── ...
├── package.json
└── README.md
```

## Core routes

### Authentication

- POST /api/v1/auth/signup
- POST /api/v1/auth/login
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password
- GET /api/v1/auth/verify-email/:token

### Admin

- GET /api/v1/admin
- POST /api/v1/admin/inventory
- PATCH /api/v1/admin/inventory/:id
- GET /api/v1/admin/orders
- GET /api/v1/admin/orders/:id
- PATCH /api/v1/admin/orders/:id/status
- GET /api/v1/inventory/low-stock

### Orders and user flows

- POST /api/v1/orders
- GET /api/v1/orders
- GET /api/v1/orders/:id
- PATCH /api/v1/orders/:id/status

## Authentication model

The server uses JWT tokens and cookie-based auth for session handling. Access control is enforced through middleware that checks:

- whether a valid token exists
- whether the user is authenticated
- whether the user has the required admin role

## Environment setup

Create a `.env` file in the server folder with values such as:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pizzahub
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-password
```

## Installation

```bash
cd server
npm install
```

## Run locally

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run start
```

## Typical backend workflow

### Customer workflow

1. Create an account.
2. Verify the email address.
3. Sign in to receive a token.
4. Browse ingredients and create a custom pizza order.
5. Submit the order.
6. Track the order status from the customer dashboard.

### Admin workflow

1. Sign in with an admin account.
2. View dashboard metrics and summary data.
3. Manage ingredients and stock counts.
4. Review all orders.
5. Update the order status as the pizza moves through fulfillment.
6. Receive scheduled low-stock email alerts when inventory drops below threshold values.

## Low-stock alert system

The server includes a scheduled background job that checks inventory regularly. When an item is below its configured threshold, it sends an email to the admin inbox with the item name, category, current stock, and threshold. This check is run automatically and is intended to help prevent running out of ingredients unexpectedly.

## Notes

This backend supports both a storefront experience and operational management, making it a strong full-stack example for an e-commerce-style pizza application. It is designed to be extended with additional features such as payment confirmation, notifications, analytics, and richer reporting.
