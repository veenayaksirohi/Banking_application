
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
This project is a simple banking system built with Django and Django REST Framework. It supports user registration, login, account creation, and transaction management.

## Features
- User registration and login (with email or phone number)
- Account creation (savings/current)
- Unique account number generation (format: ACCXXXXXXX)
- Transaction tracking (deposit, withdrawal, transfer)
- Admin interface for managing all data

## Project Structure
```
Banking_application/
  BackEnd/           # Node.js/Express/Prisma backend
    src/
      controllers/
      routes/
      models/
      ...
    prisma/
      schema.prisma
      migrations/
    package.json
    server.js
    ...
  FrontEnd/          # React/Vite frontend
    src/
      components/
      App.jsx
      ...
    package.json
    vite.config.js
    ...
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
5. **Start the backend server**
  ```bash
  npm start
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

Below is a text-based ERD (using Mermaid) for the core banking models (`users`, `accounts`, and `transactions`). This diagram shows the fields and relationships between these models for quick reference:

```mermaid
erDiagram
    users {
        user_id AutoField PK
        username CharField
        email EmailField
        phone_number CharField
        password CharField
        full_name CharField
        date_joined DateField
    }
    accounts {
        account_number CharField PK
        user_id FK (users)
        account_type CharField
        balance DecimalField
        date_created DateField
        status CharField
    }
    transactions {
        transaction_id AutoField PK
        account_number FK (accounts)
        related_account FK (accounts, nullable)
        type CharField
        amount DecimalField
        timestamp DateTimeField
        balance_after DecimalField
        description TextField
    }
    users ||--o{ accounts : "has"
    accounts ||--o{ transactions : "has"
    accounts ||--o{ transactions : "related"
```

## Models
### users
- user_id (AutoField, primary key)
- username (CharField, unique)
- email (EmailField, unique)
- phone_number (CharField, unique, 10 digits)
- password (CharField)
- full_name (CharField)
- date_joined (DateField, auto_now_add)

### accounts
- account_number (CharField, primary key, unique, format: ACCXXXXXXX)
- user_id (ForeignKey to users)
- account_type (CharField: 'savings' or 'current')
- balance (DecimalField)
- date_created (DateField, auto_now_add)
- status (CharField: 'active' or 'closed')

### transactions
- transaction_id (AutoField, primary key)
- account_number (ForeignKey to accounts)
- related_account (ForeignKey to accounts, nullable)
- type (CharField: 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER')
- amount (DecimalField)
- timestamp (DateTimeField, auto_now_add)
- balance_after (DecimalField)
- description (TextField, optional)


## API Endpoints

### User Registration
- **POST** `/api/register`
  - Request: `{ "username": ..., "email": ..., "phone_number": ..., "password": ..., "full_name": ... }`
  - Response: `{ "message": "User registered successfully.", "user_id": ... }`

### User Login
- **POST** `/api/login`
  - Request: `{ "email": ... or "phone_number": ..., "password": ... }`
  - Response: `{ "message": "Login successful.", "user": { ... } }`

### Account Creation
- **POST** `/api/accounts`
  - Request: `{ "user_id": ..., "account_type": ..., "balance": ... }`
  - Response: `{ "message": "Account created successfully.", "account_number": ... }`

### Deposit
- **POST** `/api/accounts/:account_number/deposit`
  - Request: `{ "amount": ..., "description": ... }`
  - Response: `{ "message": "Deposit successful.", ... }`

### Withdraw
- **POST** `/api/accounts/:account_number/withdraw`
  - Request: `{ "amount": ..., "description": ... }`
  - Response: `{ "message": "Withdrawal successful.", ... }`

### Transfer
- **POST** `/api/accounts/:account_number/transfer`
  - Request: `{ "target_account": ..., "amount": ..., "description": ... }`
  - Response: `{ "message": "Transfer successful.", ... }`

### Transaction History
- **GET** `/api/accounts/:account_number/transactions`
  - Response: `[ ...transactions... ]`

### Account Details
- **GET** `/api/accounts/:account_number`
  - Response: `{ ...account details... }`

### Transaction Details
- **GET** `/api/transactions/:transaction_id`
  - Response: `{ ...transaction details... }`

## Example API Requests


## Example API Requests

### Register a User
```json
POST /api/register
{
  "username": "testuser",
  "email": "test@example.com",
  "phone_number": "1234567890",
  "password": "password123",
  "full_name": "Test User"
}
```

### Login
```json
POST /api/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Create an Account
```json
POST /api/accounts
{
  "user_id": 1,
  "account_type": "savings",
  "balance": 1000.00
}
```

### Deposit
```json
POST /api/accounts/ACC1234567/deposit
{
  "amount": 500.00,
  "description": "Initial deposit"
}
```

### Withdraw
```json
POST /api/accounts/ACC1234567/withdraw
{
  "amount": 200.00,
  "description": "ATM withdrawal"
}
```

### Transfer
```json
POST /api/accounts/ACC1234567/transfer
{
  "target_account": "ACC7654321",
  "amount": 100.00,
  "description": "Transfer to friend"
}
```

### Transaction History
```json
GET /api/accounts/ACC1234567/transactions
```

### Account Details
```json
GET /api/accounts/ACC1234567
```

### Transaction Details
```json
GET /api/transactions/1
```

## Admin Usage
- Visit `/admin/` and log in with your superuser credentials.
- You can manage users, accounts, and transactions from the admin interface.

## Notes
- After major schema changes (such as renaming primary keys or foreign keys), always review and update your migrations to use `RenameField` where appropriate to avoid data loss.
- Test all endpoints after making model changes.

---

**For more Django tips, see the [W3Schools Django Models Tutorial](https://www.w3schools.com/django/django_models.php)**
