# MSW Setup for UI Preview Without Backend

## Goal
Preview all UI pages with realistic dummy data, no backend needed.

## Install
```bash
pnpm add -D msw
npx msw init public/
```

## Files to Create

### 1. `app/mocks/data.ts` — Dummy Data
```ts
export const mockProfile = {
  id: 1,
  name: 'Иван Иванов',
  email: 'ivan@example.com',
  telegramId: 123456789,
};

export const mockCurrencies = [
  { id: 1, symbol: 'UZS', name: 'Узбекский сум' },
  { id: 2, symbol: 'USD', name: 'Доллар США' },
  { id: 3, symbol: 'RUB', name: 'Российский рубль' },
];

export const mockContacts = [
  {
    id: 1, name: 'Алексей Петров', phone: '+998901234567',
    Balance: [
      { amount: 500000, currency: mockCurrencies[0], updatedAt: '2025-05-01T10:00:00Z' },
      { amount: 100, currency: mockCurrencies[1], updatedAt: '2025-04-20T10:00:00Z' },
    ],
  },
  {
    id: 2, name: 'Мария Сидорова', phone: '+998907654321',
    Balance: [
      { amount: -200000, currency: mockCurrencies[0], updatedAt: '2025-05-10T10:00:00Z' },
    ],
  },
  {
    id: 3, name: 'Дмитрий Козлов', phone: '+998912345678',
    Balance: [
      { amount: -50, currency: mockCurrencies[1], updatedAt: '2025-04-15T10:00:00Z' },
    ],
  },
  {
    id: 4, name: 'Елена Новикова', phone: '+998913456789',
    Balance: [
      { amount: 1000000, currency: mockCurrencies[0], updatedAt: '2025-05-12T10:00:00Z' },
    ],
  },
  {
    id: 5, name: 'Сергей Морозов', phone: null,
    Balance: [],
  },
];

export const mockTransactions = [
  { id: 1, amount: 500000, currency: mockCurrencies[0], note: 'За обед', type: 'LEND', createdAt: '2025-05-01T10:00:00Z' },
  { id: 2, amount: 100, currency: mockCurrencies[1], note: 'Книга', type: 'LEND', createdAt: '2025-04-20T10:00:00Z' },
  { id: 3, amount: -200000, currency: mockCurrencies[0], note: 'Возврат', type: 'BORROW', createdAt: '2025-04-18T10:00:00Z' },
  { id: 4, amount: 300000, currency: mockCurrencies[0], note: 'Такси', type: 'LEND', createdAt: '2025-03-15T10:00:00Z' },
];
```

### 2. `app/mocks/handlers.ts` — MSW Request Handlers
```ts
import { http, HttpResponse } from 'msw';
import { mockProfile, mockContacts, mockTransactions, mockCurrencies } from './data';

const BASE = import.meta.env.VITE_BACKEND_URL || 'https://senafa.kurbonov.net.uz';

export const handlers = [
  // Auth
  http.post(`${BASE}/api/auth/telegram-sign-up`, () =>
    HttpResponse.json({ token: 'mock-jwt-token' })
  ),
  http.post(`${BASE}/api/auth/sign-in`, () =>
    HttpResponse.json({ token: 'mock-jwt-token' })
  ),

  // Profile
  http.get(`${BASE}/api/users/profile`, () =>
    HttpResponse.json(mockProfile)
  ),
  http.patch(`${BASE}/api/users/profile`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockProfile, ...body });
  }),
  http.patch(`${BASE}/api/users/password`, () =>
    HttpResponse.json(mockProfile)
  ),

  // Contacts
  http.get(`${BASE}/api/contacts`, () =>
    HttpResponse.json(mockContacts)
  ),
  http.post(`${BASE}/api/contacts`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 99, ...body, Balance: [] });
  }),
  http.patch(`${BASE}/api/contacts/:id`, async ({ request, params }) => {
    const body = await request.json();
    const contact = mockContacts.find(c => c.id === Number(params.id));
    return HttpResponse.json({ ...contact, ...body });
  }),
  http.delete(`${BASE}/api/contacts/:id`, () =>
    HttpResponse.json({ success: true })
  ),

  // Transactions
  http.get(`${BASE}/api/contacts/:id/transactions`, () =>
    HttpResponse.json(mockTransactions)
  ),
  http.post(`${BASE}/api/contacts/:id/transactions`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 99, ...body, createdAt: new Date().toISOString() });
  }),

  // Currencies
  http.get(`${BASE}/api/currencies`, () =>
    HttpResponse.json(mockCurrencies)
  ),
  http.post(`${BASE}/api/currencies`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 99, ...body });
  }),
];
```

### 3. `app/mocks/browser.ts` — MSW Browser Worker
```ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

### 4. Update `app/entry.client.tsx` (or create if not exists)
```ts
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
// ... existing imports

async function prepareApp() {
  if (import.meta.env.VITE_MOCK === 'true') {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
    // Auto-set auth token so you skip login
    sessionStorage.setItem('dl_auth_token', 'mock-jwt-token');
  }
}

prepareApp().then(() => {
  // existing hydration/render code
});
```

### 5. Add to `.env.development`
```
VITE_MOCK=true
```

## How to Use
```bash
# With mocks (UI preview)
VITE_MOCK=true pnpm run dev

# Without mocks (real API)
pnpm run dev
```

## API Endpoints Used in the App
Found by searching for `api.` calls:

| Component | Endpoint | Method |
|-----------|----------|--------|
| `welcome.tsx` | `auth.authControllerTelegramSignUp` | POST |
| `welcome.tsx` | `auth.authControllerSignIn` | POST |
| `home.tsx` | `contacts.contactsControllerFindAll` | GET |
| `contacts-list.tsx` | `contacts.contactsControllerFindAll` | GET |
| `contacts-list.tsx` | `contacts.contactsControllerCreate` | POST |
| `contacts-list.tsx` | `contacts.contactsControllerUpdate` | PATCH |
| `contacts-list.tsx` | `contacts.contactsControllerRemove` | DELETE |
| `transaction-list.tsx` | `transactions.transactionsControllerFindAll` | GET |
| `add-transaction-modal.tsx` | `transactions.transactionsControllerCreate` | POST |
| `currencies-modal.tsx` | `currencies.currenciesControllerFindAll` | GET |
| `currencies-modal.tsx` | `currencies.currenciesControllerCreate` | POST |
| `profile.tsx` | `users.usersControllerGetProfile` | GET |
| `profile.tsx` | `users.usersControllerUpdateProfile` | PATCH |
| `profile.tsx` | `users.usersControllerUpdatePassword` | PATCH |
| `reports.tsx` | `contacts.contactsControllerFindAll` | GET |

## Notes
- MSW intercepts at the service worker level — zero changes to components
- `onUnhandledRequest: 'bypass'` lets non-API requests (fonts, assets) pass through
- Auto-sets auth token so you land on `/home` directly
- Mock data is in Russian to match the UI
- To adjust URL paths, check `app/api/api-client.ts` for exact routes the generated client uses
