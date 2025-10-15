# Cash, Debt and Loans Management Application

## Project Overview

This is a cash, debt, and loans management application built with the NestJS framework. The application provides an API for managing financial transactions, debts, and loans, with a special focus on Telegram bot integration for easy access and management of financial data.

### Key Features
- **User Management**: Registration, authentication, and user verification
- **Debt/Lending Tracking**: Management of debts and loans between users and contacts
- **Currency Support**: Multi-currency handling for transactions
- **Telegram Bot Integration**: Seamless interaction through Telegram
- **Contact Management**: System for managing contacts and their financial relationships
- **Transaction History**: Complete record of all financial transactions

### Technology Stack
- **Backend Framework**: NestJS (TypeScript)
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT-based authentication
- **API Documentation**: Swagger/OpenAPI
- **Telegram Bot**: Telegraf with nestjs-telegraf integration
- **Password Hashing**: bcrypt
- **Input Validation**: class-validator and class-transformer

## Project Structure

- `/backend`: Main NestJS application
  - `/src`: Source code files
    - `/auth`: Authentication module
    - `/currency`: Currency management module
    - `/contacts`: Contact management module
    - `/transactions`: Transaction management module
    - `/users`: User management module
    - `/telegram-bot`: Telegram bot functionality
    - `/prisma`: Prisma database schema and client
  - `/prisma`: Database schema and migrations
  - `/test`: Test files
  - `/dist`: Compiled JavaScript output

## Database Schema

The application uses a SQLite database with the following key entities:

- **User**: Application users with email/password authentication or Telegram integration
- **Contact**: People the user has financial relationships with
- **Currency**: Supported currencies with names and symbols
- **Transaction**: Records of financial exchanges between users and contacts
- **Balance**: Current balances per contact and currency
- **Telegram Integration**: Links users to their Telegram accounts

## Building and Running the Application

### Prerequisites
- Node.js (v18 or higher)
- pnpm (recommended package manager)
- SQLite (for local development)

### Installation
1. Install dependencies:
```bash
cd backend
pnpm install
```

2. Set up environment variables in `.env`:
```bash
DATABASE_URL="file:./dev.db"
PORT=3001
TELEGRAM_BOT_API_KEY=your-telegram-bot-api-key
```

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Run database migrations:
```bash
npx prisma db push  # for development
# OR
npx prisma migrate deploy  # for production
```

### Running the Application

#### Development
```bash
# Watch mode (recompiles on file changes)
pnpm run start:dev
```

#### Production
```bash
# Build the application
pnpm run build

# Run the production build
pnpm run start:prod
```

#### Other Commands
```bash
# Run unit tests
pnpm run test

# Run end-to-end tests
pnpm run test:e2e

# Run tests with coverage
pnpm run test:cov

# Format code with Prettier
pnpm run format

# Lint code
pnpm run lint
```

### Using Docker
The application can be containerized using the provided Dockerfile:

```bash
# Build the Docker image
docker build -t cash-debt-loans-app .

# Run the application
docker run -p 3001:3001 cash-debt-loans-app
```

## API Documentation
The application includes Swagger API documentation available at:
- Base URL: `http://localhost:3001/api` (or your configured port)
- Provides interactive documentation for all API endpoints

## Telegram Bot Integration
The application includes a Telegram bot interface that allows users to manage their debts and loans directly from Telegram. The bot uses the TELEGRAM_BOT_API_KEY from environment variables.

## Development Conventions

### Code Style
- TypeScript with strict null checks enabled
- ESLint and Prettier for consistent code formatting
- Decorators for NestJS framework features (modules, controllers, etc.)
- Prisma for database interactions

### Testing
- Jest for unit and integration testing
- Test files are located in the `/test` directory
- Files named with `.spec.ts` extension for test files

### Security
- JWT-based authentication for API endpoints
- Passwords are hashed using bcrypt
- Input validation with class-validator

### Database Migrations
- Prisma is used for database schema management
- Schema changes should be made in `prisma/schema.prisma`
- Use `npx prisma migrate dev` to create and apply migrations during development

## Main Modules

1. **Auth Module**: Handles user authentication, registration, and JWT management
2. **Users Module**: Manages user profiles and account information
3. **Contacts Module**: Handles relationships between users and their contacts
4. **Transactions Module**: Manages all debt and loan transactions
5. **Currency Module**: Handles different currencies and their properties
6. **Telegram Bot Module**: Provides Telegram bot functionality for the application

## Environment Variables

- `DATABASE_URL`: Database connection string (default: SQLite file:./dev.db)
- `PORT`: Port to run the application on (default: 3001)
- `TELEGRAM_BOT_API_KEY`: API key for the Telegram bot integration

## Troubleshooting

### Common Issues
1. **Database Connection Issues**
   - Ensure Prisma client is generated with `npx prisma generate`
   - Run migrations with `npx prisma migrate dev`

2. **Telegram Bot Not Working**
   - Verify that `TELEGRAM_BOT_API_KEY` is correctly set in the environment
   - Check that the bot has the necessary permissions

3. **Build Issues**
   - Clean the build directory with `pnpm run build` after dependency updates
   - Ensure all TypeScript compilation settings are correct

This application is designed for managing personal financial relationships, tracking debts and loans with friends, family, or business contacts. The Telegram integration provides a convenient interface for quick transactions and balance checks on the go.