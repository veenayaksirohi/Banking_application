# Banking Application

A Django-based banking application with user registration, login, account management, and transaction tracking.

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
  Banksys/
    Banking_fxn/
      models.py
      views.py
      serializers.py
      admin.py
      url.py
    Banksys/
      settings.py
      urls.py
    db.sqlite3
    manage.py
  README.md
```

## Setup Instructions
1. **Clone the repository**
2. **Create and activate a virtual environment**
3. **Install dependencies**
   ```bash
   pip install django djangorestframework django-extensions pydot graphviz
   ```
   (If using uv: `uv pip install django djangorestframework django-extensions pydot graphviz`)
4. **Apply migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. **Create a superuser (for admin access)**
   ```bash
   python manage.py createsuperuser
   ```
6. **Run the development server**
   ```bash
   python manage.py runserver
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
- **POST** `/register/`
  - Request: `{ "username": ..., "email": ..., "phone_number": ..., "password": ..., "full_name": ... }`
  - Response: `{ "message": "User registered successfully.", "user_id": ... }`

### User Login
- **POST** `/login/`
  - Request: `{ "email": ... or "phone_number": ..., "password": ... }`
  - Response: `{ "message": "Login successful.", "user": { ... } }`

### Account Creation
- **POST** `/accounts/`
  - Request: `{ "user_id": ..., "account_type": ..., "balance": ... }`
  - Response: `{ "message": "Account created successfully.", "account_number": ... }`

### (Optional) Transactions
- **POST** `/transactions/`
  - Request: `{ "account_number": ..., "type": ..., "amount": ..., "related_account": ..., "description": ... }`
  - Response: `{ "message": "Transaction successful.", ... }`

## Example API Requests

### Register a User
```json
POST /register/
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
POST /login/
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Create an Account
```json
POST /accounts/
{
  "user_id": 1,
  "account_type": "savings",
  "balance": 1000.00
}
```

## Admin Usage
- Visit `/admin/` and log in with your superuser credentials.
- You can manage users, accounts, and transactions from the admin interface.

## Notes
- After major schema changes (such as renaming primary keys or foreign keys), always review and update your migrations to use `RenameField` where appropriate to avoid data loss.
- Test all endpoints after making model changes.

---

**For more Django tips, see the [W3Schools Django Models Tutorial](https://www.w3schools.com/django/django_models.php)**
