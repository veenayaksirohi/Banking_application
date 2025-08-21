# TODO List for Banking Application

## Project Setup
- [x] Initialize Django project and app structure
- [x] Set up virtual environment and install dependencies
- [x] Configure settings and add required apps

## Models
- [x] Create users model
- [x] Create accounts model
- [x] Create transactions model
- [x] Add unique account number logic
- [x] Rename id to user_id as primary key in users model
- [x] Make account_number the primary key in accounts model (remove id)
- [x] Rename id to transaction_id as primary key in transactions model
- [x] Rename account_id to account_number as ForeignKey in transactions model

## Serializers
- [x] RegistrationSerializer for user registration
- [x] LoginSerializer for user login
- [x] AccountsSerializer for account creation
- [ ] TransactionSerializer for transaction API

## Views & APIs
- [x] User registration API
- [x] User login API
- [x] Account creation API
- [ ] Transaction API (deposit, withdraw, transfer)
- [ ] Add account and transaction detail endpoints
- [ ] Implement deposit API: `/accounts/{account_id}/deposit`
- [ ] Implement withdraw API: `/accounts/{account_id}/withdraw`
- [ ] Implement transfer API: `/accounts/{account_id}/transfer`
- [ ] Implement transaction history API: `/accounts/{account_id}/transactions`

## Admin & Management
- [x] Register models in Django admin
- [ ] Add custom admin filters/search for accounts and transactions

## Validation & Security
- [x] Validate phone number and email uniqueness
- [x] Validate account number format
- [ ] Use password hashing for user passwords
- [ ] Add authentication/authorization to sensitive endpoints

## Testing
- [ ] Write unit tests for serializers
- [ ] Write unit tests for views
- [ ] Test API endpoints with Postman/curl
- [ ] Test all endpoints for correct behavior after schema changes

## Documentation
- [x] Create README.md with setup and API usage
- [ ] Add API documentation for all endpoints
- [ ] Add usage examples for common workflows
- [ ] Update API documentation and example payloads

## Deployment
- [ ] Prepare for deployment (collectstatic, allowed hosts, etc.)
- [ ] Set up production database and environment variables
- [ ] Deploy to cloud or server

## Enhancements (Future)
- [ ] Add JWT or session-based authentication
- [ ] Add user profile and settings endpoints
- [ ] Add transaction history export (CSV/PDF)
- [ ] Add notifications for account activity
- [ ] Add support for multiple currencies
- [ ] Review and update all migrations to use RenameField where appropriate
- [ ] Update all serializers and views to use new field names 