# Frontend Development Guide - Banking Application

This guide provides all necessary information for building a frontend application that integrates with the Banking API using React, Vite, and JavaScript.

## Project Setup

```bash
# Create new Vite project
npm create vite@latest banking-frontend -- --template react

# Navigate to project directory
cd banking-frontend

# Install dependencies
npm install

# Add required packages
npm install axios react-router-dom @mui/material @emotion/react @emotion/styled jwt-decode
```

## Environment Configuration

Create `.env` file in your project root:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Authentication

### JWT Implementation

- Tokens are received upon login
- Store in localStorage
- Include in all authenticated requests
- Token expires in 1 hour

```javascript
// axios instance setup
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## API Endpoints Reference

### Authentication

#### Register User
- **Endpoint**: `POST /auth/register`
- **Body**:
```javascript
{
  firstName: string,    // max 30 chars
  lastName: string,     // max 150 chars
  email: string,       // valid email, unique
  phoneNumber: string, // exactly 10 digits, unique
  password: string     // max 128 chars
}
```
- **Response**: User object with ID and join date

#### Login
- **Endpoint**: `POST /auth/login`
- **Body**:
```javascript
{
  email: string,       // OR
  phoneNumber: string, // Use either email or phone
  password: string
}
```
- **Response**: JWT token and user details

### User Management

#### Get User Profile
- **Endpoint**: `GET /users/:userId`
- **Auth**: Required
- **Response**: User details

#### Update User
- **Endpoint**: `PUT /users/:userId`
- **Auth**: Required
- **Body**:
```javascript
{
  firstName?: string,
  lastName?: string,
  phoneNumber?: string
}
```

#### List User Accounts
- **Endpoint**: `GET /users/:userId/accounts`
- **Auth**: Required
- **Response**: Array of accounts

### Account Management

#### Create Account
- **Endpoint**: `POST /accounts`
- **Auth**: Required
- **Body**:
```javascript
{
  accountType: "SAVINGS" | "CURRENT",
  balance?: number,
  status?: string
}
```

#### Get Account Details
- **Endpoint**: `GET /accounts/:accountNumber`
- **Auth**: Required

#### Get Account Balance
- **Endpoint**: `GET /accounts/:accountNumber/balance`
- **Auth**: Required

### Transactions

#### Get Transaction History
- **Endpoint**: `GET /accounts/:accountNumber/transactions`
- **Auth**: Required
- **Query Params**: 
  - limit (default: 50)
  - offset (default: 0)
  - type (DEPOSIT, WITHDRAWAL, TRANSFER)

#### Deposit Money
- **Endpoint**: `POST /accounts/:accountNumber/transactions/deposit`
- **Auth**: Required
- **Body**:
```javascript
{
  amount: number,       // positive decimal
  description?: string
}
```

#### Withdraw Money
- **Endpoint**: `POST /accounts/:accountNumber/transactions/withdraw`
- **Auth**: Required
- **Body**: Same as deposit

#### Transfer Money
- **Endpoint**: `POST /accounts/:accountNumber/transactions/transfer`
- **Auth**: Required
- **Body**:
```javascript
{
  toAccountNumber: string,
  amount: number,
  description?: string
}
```

## Data Models

### User
```typescript
interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateJoined: string;
}
```

### Account
```typescript
interface Account {
  accountNumber: string;
  userId: number;
  accountType: 'SAVINGS' | 'CURRENT';
  balance: number;
  status: 'ACTIVE' | 'INACTIVE';
  dateCreated: string;
  createdAt: string;
  updatedAt: string;
}
```

### Transaction
```typescript
interface Transaction {
  transactionId: number;
  accountNumber: string;
  relatedAccount?: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  timestamp: string;
  balanceAfter: number;
  description?: string;
}
```

## Suggested Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── accounts/
│   │   ├── AccountList.jsx
│   │   ├── AccountDetails.jsx
│   │   └── CreateAccountForm.jsx
│   ├── transactions/
│   │   ├── TransactionHistory.jsx
│   │   ├── DepositForm.jsx
│   │   ├── WithdrawForm.jsx
│   │   └── TransferForm.jsx
│   └── shared/
│       ├── Navbar.jsx
│       ├── ProtectedRoute.jsx
│       └── Layout.jsx
├── hooks/
│   ├── useAuth.js
│   └── useAccounts.js
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── accountService.js
│   └── transactionService.js
├── context/
│   └── AuthContext.jsx
└── utils/
    ├── formatters.js
    └── validators.js
```

## Required Features

### Authentication & Authorization
- Login/Register forms
- Protected routes
- Token management
- Session handling

### User Management
- Profile view/edit
- Account overview
- Transaction history

### Account Operations
- Create new account
- View account details
- Check balance
- Account status management

### Transaction Features
- Deposit interface
- Withdrawal interface
- Transfer between accounts
- Transaction history with filters

### General Requirements
- Responsive design
- Form validations
- Error handling
- Loading states
- Success/error notifications

## Implementation Tips

1. **State Management**
   - Use React Context for auth state
   - Consider Redux/Zustand for complex state

2. **Route Protection**
```jsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};
```

3. **Error Handling**
```javascript
const handleApiError = (error) => {
  if (error.response) {
    // Handle specific error codes
    switch (error.response.status) {
      case 401:
        // Redirect to login
        break;
      case 403:
        // Show permission denied
        break;
      default:
        // Show generic error
    }
  }
};
```

4. **Form Validation**
- Implement validation matching backend rules
- Show clear error messages
- Prevent duplicate submissions

5. **Security Considerations**
- Never store sensitive data in localStorage
- Implement token refresh mechanism
- Clear auth data on logout

## Testing

1. **Unit Tests**
- Test form validations
- Test API service functions
- Test utility functions

2. **Integration Tests**
- Test protected routes
- Test form submissions
- Test error handling

3. **E2E Tests**
- Test complete user flows
- Test transaction processes
- Test authentication flows
