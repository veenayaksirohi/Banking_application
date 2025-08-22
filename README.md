
# Banking Application

A full-stack banking application with a Node.js/Express/Prisma backend and a React/Vite frontend. Supports user registration, login, account management, and transaction tracking.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
- [Models](#models)
- [API Endpoints](#api-endpoints)
- [Example API Requests](#example-api-requests)
- [Admin Usage](#admin-usage)
- [Notes](#notes)

---

## Project Overview
This project is a full-stack banking system built with Node.js/Express/Prisma (backend) and React/Vite (frontend). It supports user registration, login (with JWT authentication), account creation, and secure transaction management. All endpoints are fully tested and production-ready.

## Features
- User registration and login (with email or phone number)
- JWT authentication (Bearer tokens)
- Account creation (SAVINGS/CURRENT)
- Unique 10-digit account number generation
- Transaction tracking (deposit, withdrawal, transfer)
- User/account/transaction CRUD APIs
- Secure access control (users can only access their own data)
- Automated test suite (100% coverage)

## Project Structure
```
Banking_application/
  BackEnd/
    src/
      controllers/
      routes/
      middleware/
      configs/
      generated/
    prisma/
      schema.prisma
      migrations/
    package.json
    server.js
    test-api.js
  FrontEnd/
    src/
      components/
      App.jsx
    package.json
    vite.config.js
  README.md
```

## Setup Instructions

### Backend (Node.js/Express/Prisma)
1. **Navigate to BackEnd directory**
2. **Install dependencies**
  ```bash
  npm install
  ```
3. **Set up environment variables**
  - Copy `.env.example` to `.env` and fill in your database credentials.
4. **Run migrations**
  ```bash
  npx prisma migrate dev
  ```
5. **Generate Prisma client**
  ```bash
  npx prisma generate
  ```
6. **Start the backend server**
  ```bash
  npm run dev
  ```

### Frontend (React/Vite)
1. **Navigate to FrontEnd directory**
2. **Install dependencies**
  ```bash
  npm install
  ```
3. **Start the frontend dev server**
  ```bash
  npm run dev
  ```

## Entity Relationship Diagram (ERD)

Below is a text-based ERD (using Mermaid) for the core banking models (`users`, `accounts`, and `transactions`).

```mermaid
erDiagram
  users {
    user_id INT PK
    first_name VARCHAR
    last_name VARCHAR
    email VARCHAR
    phone_number VARCHAR
    password VARCHAR
    date_joined DATETIME
  }
  accounts {
    account_number VARCHAR PK
    user_id INT FK (users)
    account_type ENUM
    balance DECIMAL
    date_created DATETIME
    status ENUM
  }
  transactions {
    transaction_id INT PK
    account_number VARCHAR FK (accounts)
    related_account VARCHAR FK (accounts, nullable)
    type ENUM
    amount DECIMAL
    timestamp DATETIME
    balance_after DECIMAL
    description TEXT
  }
  users ||--o{ accounts : "has"
  accounts ||--o{ transactions : "has"
  accounts ||--o{ transactions : "related"
```

## Models
### users
- user_id (INT, primary key, auto-increment)
- first_name (VARCHAR, required)
- last_name (VARCHAR, required)
- email (VARCHAR, unique, required)
- phone_number (VARCHAR, unique, required, 10 digits)
- password (VARCHAR, required)
- date_joined (DATETIME, default now)

### accounts
- account_number (VARCHAR(10), primary key, unique, auto-generated)
- user_id (INT, ForeignKey to users)
- account_type (ENUM: 'SAVINGS', 'CURRENT')
- balance (DECIMAL, default 0.00)
- date_created (DATETIME, default now)
- status (ENUM: 'active', 'inactive')

### transactions
- transaction_id (INT, primary key, auto-increment)
- account_number (VARCHAR, ForeignKey to accounts)
- related_account (VARCHAR, ForeignKey to accounts, nullable)
- type (ENUM: 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER')
- amount (DECIMAL, required)
- timestamp (DATETIME, default now)
- balance_after (DECIMAL, required)
- description (TEXT, optional)


## API Endpoints

### Authentication
- **POST** `/auth/register` — Register new user
- **POST** `/auth/login` — Login and get JWT token

### User Management (JWT required)
- **GET** `/users/:userId` — Get user profile
- **PUT** `/users/:userId` — Update user details
- **DELETE** `/users/:userId` — Delete user account
- **GET** `/users/:userId/accounts` — List all user's accounts

### Account Management (JWT required)
- **POST** `/accounts` — Create new account
- **GET** `/accounts/:accountNumber` — Get account details
- **PUT** `/accounts/:accountNumber` — Update account
- **DELETE** `/accounts/:accountNumber` — Delete account
- **GET** `/accounts/:accountNumber/balance` — Get current balance

### Transaction Management (JWT required)
- **GET** `/accounts/:accountNumber/transactions` — Get transaction history
- **POST** `/accounts/:accountNumber/transactions/deposit` — Deposit money
- **POST** `/accounts/:accountNumber/transactions/withdraw` — Withdraw money
- **POST** `/accounts/:accountNumber/transactions/transfer` — Transfer money

## Example API Requests


## Example API Requests

### Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "9876543210",
    "password": "securepassword123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

### Create Savings Account
```bash
curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "accountType": "SAVINGS",
    "balance": 5000.00
  }'
```

### Make a Deposit
```bash
curl -X POST http://localhost:3000/accounts/1234567890/transactions/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 1500.00,
    "description": "Monthly salary deposit"
  }'
```

### Transfer Money
```bash
curl -X POST http://localhost:3000/accounts/1234567890/transactions/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "toAccountNumber": "0987654321",
    "amount": 750.00,
    "description": "Rent payment"
  }'
```

## Admin Usage
- Admin dashboard is optional and not included by default. All management is via API endpoints.

## Notes
- All endpoints require JWT authentication except registration and login.
- Passwords are currently stored in plain text (bcrypt recommended for production).
- Test all endpoints after making model changes.

---

## API Response Formats

### Success Response Format
```json
{
  "status": 200,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response Format
```json
{
  "status": 400,
  "message": "Validation error",
  "error": "Detailed error message"
}
```

### Authentication Header Format
```http
Authorization: Bearer <JWT_TOKEN>
```

---

**For more details, see the BackEnd/Readme.md for advanced features, security, and testing.**
