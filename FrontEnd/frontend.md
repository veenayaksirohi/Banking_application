# Banking API Frontend Development Guide

This guide provides all essential information to build a React (Vite, JavaScript) frontend for the Banking API backend.

## Quick Start

\`\`\`bash
# Create new Vite project
npm create vite@latest banking-frontend -- --template react
cd banking-frontend

# Install dependencies
npm install axios react-router-dom jwt-decode

# Optional UI libraries
npm install @mui/material @emotion/react @emotion/styled
\`\`\`

## Environment Setup

Create `.env` file:
\`\`\`env
VITE_API_BASE_URL=http://localhost:3000
\`\`\`

## Authentication System

### JWT Token Management
- Tokens expire in 1 hour
- Store in localStorage
- Include in all authenticated requests

\`\`\`javascript
// api.js - Axios setup
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Auto-attach token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
\`\`\`

### Auth Context
\`\`\`javascript
// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
\`\`\`

## API Endpoints Reference

### Authentication (No Auth Required)

#### Register User
\`\`\`javascript
POST /auth/register
{
  firstName: string,    // max 30 chars, required
  lastName: string,     // max 150 chars, required  
  email: string,        // valid email, unique, required
  phoneNumber: string,  // exactly 10 digits, unique, required
  password: string      // max 128 chars, required
}
\`\`\`

#### Login
\`\`\`javascript
POST /auth/login
{
  email: string,        // OR phoneNumber (either one)
  phoneNumber: string,  // OR email (either one)
  password: string      // required
}
// Returns: { token, user }
\`\`\`

### User Management (Auth Required)

\`\`\`javascript
GET    /users/:userId                 // Get user profile
PUT    /users/:userId                 // Update user (firstName, lastName, phoneNumber)
DELETE /users/:userId                 // Delete user account
GET    /users/:userId/accounts        // List user's accounts
\`\`\`

### Account Management (Auth Required)

\`\`\`javascript
POST   /accounts                      // Create account
GET    /accounts/:accountNumber       // Get account details
PUT    /accounts/:accountNumber       // Update account
DELETE /accounts/:accountNumber       // Delete account
GET    /accounts/:accountNumber/balance // Get current balance
\`\`\`

#### Create Account Body:
\`\`\`javascript
{
  accountType: "SAVINGS" | "CURRENT",  // required
  balance?: number,                    // optional, defaults to 0.00
  status?: "ACTIVE" | "INACTIVE"       // optional, defaults to ACTIVE
}
\`\`\`

### Transactions (Auth Required)

\`\`\`javascript
GET  /accounts/:accountNumber/transactions              // Get history
POST /accounts/:accountNumber/transactions/deposit     // Deposit money
POST /accounts/:accountNumber/transactions/withdraw    // Withdraw money  
POST /accounts/:accountNumber/transactions/transfer    // Transfer money
\`\`\`

#### Transaction Bodies:
\`\`\`javascript
// Deposit/Withdraw
{
  amount: number,        // positive decimal, required
  description?: string   // optional
}

// Transfer
{
  toAccountNumber: string, // required
  amount: number,          // positive decimal, required
  description?: string     // optional
}
\`\`\`

#### Transaction History Query Params:
\`\`\`javascript
?limit=50&offset=0&type=DEPOSIT  // type: DEPOSIT, WITHDRAWAL, TRANSFER
\`\`\`

## Data Models

\`\`\`javascript
// User
{
  userId: number,
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  dateJoined: string
}

// Account  
{
  accountNumber: string,        // 10-digit auto-generated
  userId: number,
  accountType: 'SAVINGS' | 'CURRENT',
  balance: number,              // decimal(10,2)
  status: 'ACTIVE' | 'INACTIVE',
  dateCreated: string,
  createdAt: string,
  updatedAt: string
}

// Transaction
{
  transactionId: number,
  accountNumber: string,
  relatedAccount?: string,      // for transfers
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER',
  amount: number,
  timestamp: string,
  balanceAfter: number,
  description?: string
}
\`\`\`

## Suggested Project Structure

\`\`\`
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── accounts/
│   │   ├── AccountList.jsx
│   │   ├── AccountCard.jsx
│   │   └── CreateAccountForm.jsx
│   ├── transactions/
│   │   ├── TransactionHistory.jsx
│   │   ├── TransactionForm.jsx
│   │   └── TransferForm.jsx
│   └── layout/
│       ├── Navbar.jsx
│       └── Layout.jsx
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── accountService.js
│   └── transactionService.js
├── context/
│   └── AuthContext.jsx
├── hooks/
│   ├── useAuth.js
│   └── useAccounts.js
└── utils/
    ├── formatters.js
    └── validators.js
\`\`\`

## Essential Components

### Protected Route
\`\`\`javascript
// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
\`\`\`

### Service Examples
\`\`\`javascript
// accountService.js
import api from './api';

export const accountService = {
  createAccount: (data) => api.post('/accounts', data),
  getAccount: (accountNumber) => api.get(`/accounts/${accountNumber}`),
  getBalance: (accountNumber) => api.get(`/accounts/${accountNumber}/balance`),
  getUserAccounts: (userId) => api.get(`/users/${userId}/accounts`),
};

// transactionService.js
export const transactionService = {
  getHistory: (accountNumber, params) => 
    api.get(`/accounts/${accountNumber}/transactions`, { params }),
  deposit: (accountNumber, data) => 
    api.post(`/accounts/${accountNumber}/transactions/deposit`, data),
  withdraw: (accountNumber, data) => 
    api.post(`/accounts/${accountNumber}/transactions/withdraw`, data),
  transfer: (accountNumber, data) => 
    api.post(`/accounts/${accountNumber}/transactions/transfer`, data),
};
\`\`\`

## Validation Rules

### Registration Validation
- firstName: max 30 characters, required
- lastName: max 150 characters, required
- email: valid email format, unique, max 255 characters
- phoneNumber: exactly 10 digits, unique
- password: max 128 characters, required

### Transaction Validation
- amount: must be positive decimal (> 0)
- account must be ACTIVE for transactions
- sufficient funds required for withdrawals/transfers
- cannot transfer to same account

## Error Handling

\`\`\`javascript
// Error handler utility
export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 400:
        return data.message || 'Invalid request';
      case 401:
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return 'Session expired';
      case 403:
        return 'Access denied';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Server error';
      default:
        return 'An error occurred';
    }
  }
  return 'Network error';
};
\`\`\`

## Security Best Practices

1. **Token Management**
   - Store JWT in localStorage (or httpOnly cookies for production)
   - Clear tokens on logout
   - Handle token expiration (401 responses)

2. **Input Validation**
   - Validate all form inputs client-side
   - Match backend validation rules
   - Sanitize user inputs

3. **Route Protection**
   - Protect all authenticated routes
   - Redirect to login on unauthorized access
   - Check user permissions for account access

## Required Features Checklist

### Authentication
- [ ] Login form (email/phone + password)
- [ ] Registration form
- [ ] Logout functionality
- [ ] Protected routes
- [ ] Token management

### User Management  
- [ ] User profile display
- [ ] Profile editing
- [ ] Account overview

### Account Operations
- [ ] Create new account
- [ ] View account details
- [ ] Check account balance
- [ ] List user accounts

### Transactions
- [ ] Deposit form
- [ ] Withdrawal form  
- [ ] Transfer form
- [ ] Transaction history
- [ ] Transaction filtering

### UI/UX
- [ ] Responsive design
- [ ] Loading states
- [ ] Error messages
- [ ] Success notifications
- [ ] Form validation feedback

## Backend Information

- **Base URL**: `http://localhost:3000`
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (1-hour expiration)
- **Account Numbers**: 10-digit auto-generated
- **Transaction Types**: DEPOSIT, WITHDRAWAL, TRANSFER
- **Account Types**: SAVINGS, CURRENT
- **Account Status**: ACTIVE, INACTIVE

The backend is fully implemented and tested with 100% test coverage. All endpoints are functional and ready for frontend integration.
