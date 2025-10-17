# Cash, Debt and Loans Management Web Application

## Project Overview

This is a modern React-based web application for managing cash, debts, and loans built with React Router. It's part of a larger system that includes a backend API for managing financial transactions, debts, and loans, with a focus on Telegram bot integration. The frontend is a Telegram web app that provides a user interface for tracking debts and loans with friends, family, or business contacts.

### Key Features
- **Contact Management**: Create and manage contacts with whom you have financial relationships
- **Transaction Tracking**: Record debt and loan transactions with contacts
- **Multi-currency Support**: Handle transactions in different currencies
- **Balance Tracking**: View balances per contact and total balances
- **Telegram Integration**: Part of a system that supports Telegram bot interaction

### Technology Stack
- **Frontend Framework**: React 19 with React Router 7
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS with shadcn/ui components
- **API Client Generation**: swagger-typescript-api
- **UI Components**: Radix UI primitives with shadcn styling
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Type Safety**: TypeScript
- **Package Manager**: pnpm

## Project Structure

- `/app`: Main application source code
  - `/api`: Generated API client and Swagger specification
  - `/components`: Reusable UI components including shadcn/ui components
  - `/lib`: Utility functions and API client
  - `root.tsx`: Root component with basic HTML structure
  - `routes.ts`: Route configuration
  - `routes/home.tsx`: Main home page component
  - `app.css`: Tailwind CSS imports and global styles

## Building and Running the Application

### Prerequisites
- Node.js (v20 or higher)
- pnpm (recommended package manager)

### Installation
1. Install dependencies:
```bash
pnpm install
```

### Development
1. Start the development server:
```bash
pnpm run dev
```
The application will be available at `http://localhost:5173`.

### Building for Production
1. Create a production build:
```bash
pnpm run build
```

### Running Production Build
```bash
pnpm run start
```

### Generating API Client
To regenerate the API client from backend Swagger specification:
```bash
pnpm run generate:api-client
```

### Using Docker
The application can be containerized using the provided Dockerfile:

```bash
# Build the Docker image
docker build -t telegram-web-app .

# Run the container
docker run -p 3000:3000 telegram-web-app
```

## API Integration

The application communicates with a backend API (likely running on port 3001) using:
- A generated API client based on the backend's Swagger specification
- JWT-based authentication stored in localStorage
- RESTful endpoints for contacts, transactions, and currencies

## Development Conventions

### Code Style
- TypeScript with strict mode enabled
- Tailwind CSS utility classes for styling
- Component-based architecture with clear separation of concerns
- React hooks for state management
- Generated API client for backend communication

### Component Structure
- UI components in `/components/ui` following shadcn patterns
- Feature components in `/components` 
- API client in `/lib/api-client.ts`
- Utility functions in `/lib/utils.ts`

### Naming Conventions
- PascalCase for React components
- camelCase for functions and variables
- Use descriptive names for props and state variables
- Follow React Router's file-based routing conventions

## Main Components

1. **Home Route**: Main dashboard showing contacts with balances and total balances
2. **ContactList**: Component for displaying and managing contacts
3. **AddTransactionModal**: Modal for adding new transactions
4. **AddContactModal**: Modal for adding new contacts
5. **StickyFooter**: Fixed footer showing total balances
6. **Money**: Component for displaying currency values
7. **CurrenciesModal**: Modal for managing currencies
8. **TopRightMenu**: Menu component for additional actions

## Environment Configuration

The application connects to a backend service:
- By default, it connects to `http://localhost:3001`
- This can be overridden with a `BACKEND_URL` environment variable

## Styling

The application uses:
- Tailwind CSS for styling with CSS variables
- shadcn/ui component library built on Radix UI primitives
- Inter font loaded from Google Fonts
- Custom-styled components with class-variance-authority
- Responsive design following mobile-first approach

This web application is designed to provide an intuitive interface for managing personal financial relationships, tracking debts and loans with friends, family, or business contacts. The overall system includes a backend API and potentially a Telegram bot for convenient access to financial data.

## Qwen Added Memories
- The project structure has both a backend (NestJS) and a frontend (Telegram Web App - React/Vite). The backend is located at /home/muhammadyusuf-kurbonov/Projects/MyProjects/cash-debt-and-loans/backend and the frontend is at /home/muhammadyusuf-kurbonov/Projects/MyProjects/cash-debt-and-loans/telegram-web-app
