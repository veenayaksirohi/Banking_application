

# TODO List for Banking Application (Node.js/Express/Prisma & React)

## Project Setup

- [x] Initialize Node.js/Express backend and React frontend
- [x] Set up project structure and install dependencies
- [x] Configure environment variables and settings

## Database Models (Prisma)

- [x] Create User model
- [x] Create Account model
- [x] Create Transaction model
- [x] Add unique account number logic
- [x] Use account_number as primary key in Account model
- [x] Use transaction_id as primary key in Transaction model
- [x] Use account_number as ForeignKey in Transaction model

## DTOs / Validation

- [x] User registration validation
- [x] User login validation
- [x] Account creation validation
- [x] Transaction validation (deposit, withdraw, transfer)

## Backend APIs (Express)

- [x] User registration API
- [x] User login API
- [x] Account creation API
- [x] Transaction API (deposit, withdraw, transfer)
- [x] Account and transaction detail endpoints
- [x] Deposit API: `/api/accounts/:account_number/deposit`
- [x] Withdraw API: `/api/accounts/:account_number/withdraw`
- [x] Transfer API: `/api/accounts/:account_number/transfer`
- [x] Transaction history API: `/api/accounts/:account_number/transactions`

## Admin & Management

- [ ] Add admin dashboard (optional)
- [ ] Add filters/search for accounts and transactions (optional)

## Validation & Security

- [x] Validate phone number and email uniqueness
- [x] Validate account number format
- [x] Use password hashing for user passwords
- [x] Add authentication/authorization to sensitive endpoints

## Testing

- [ ] Write unit tests for validation and services
- [ ] Write unit tests for API endpoints
- [ ] Test API endpoints with Postman/curl
- [ ] Test all endpoints for correct behavior after schema changes

## Documentation

- [x] Create README.md with setup and API usage
- [x] Add API documentation for all endpoints
- [ ] Add usage examples for common workflows
- [ ] Update API documentation and example payloads

## Deployment

- [ ] Prepare for deployment (build, env, etc.)
- [ ] Set up production database and environment variables
- [ ] Deploy backend and frontend to cloud or server

## Enhancements (Future)

- [ ] Add JWT or session-based authentication
- [ ] Add user profile and settings endpoints
- [ ] Add transaction history export (CSV/PDF)
- [ ] Add notifications for account activity
- [ ] Add support for multiple currencies
- [ ] Review and update all migrations as needed
- [ ] Refactor and update all DTOs and APIs to use new field names