import { http, HttpResponse } from 'msw';
import {
  mockProfile,
  mockContacts,
  mockTransactions,
  mockCurrencies,
  mockSummary,
  mockTrends,
  mockTopDebtors,
  mockTopCreditors,
  mockCurrencyBreakdown,
} from './data';

const BASE = import.meta.env.VITE_BACKEND_URL || 'https://senafa.kurbonov.net.uz';

export const handlers = [
  // Auth
  http.post(`${BASE}/auth/signup`, () =>
    HttpResponse.json({ token: makeMockJwt(), user: { id: 1, name: 'Иван Иванов', email: 'ivan@example.com' } }),
  ),
  http.post(`${BASE}/auth/signin`, () =>
    HttpResponse.json({ token: makeMockJwt(), user: { id: 1, name: 'Иван Иванов', email: 'ivan@example.com' } }),
  ),
  http.post(`${BASE}/auth/telegram_auth`, () =>
    HttpResponse.json({ token: makeMockJwt(), user: { id: 1, name: 'Иван Иванов', telegram_id: '123456789' } }),
  ),

  // Profile
  http.get(`${BASE}/users/profile`, () => HttpResponse.json(mockProfile)),
  http.patch(`${BASE}/users/profile`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockProfile, ...body });
  }),
  http.patch(`${BASE}/users/password`, () => HttpResponse.json(mockProfile)),

  // Contacts
  http.get(`${BASE}/contacts`, () => HttpResponse.json(mockContacts)),
  http.post(`${BASE}/contacts`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: 99, user_id: 1, Balance: [], ...body });
  }),
  http.get(`${BASE}/contacts/:id`, ({ params }) => {
    const contact = mockContacts.find(c => c.id === Number(params.id));
    return HttpResponse.json(contact ?? mockContacts[0]);
  }),
  http.patch(`${BASE}/contacts/:id`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>;
    const contact = mockContacts.find(c => c.id === Number(params.id));
    return HttpResponse.json({ ...contact, ...body });
  }),
  http.delete(`${BASE}/contacts/:id`, () => HttpResponse.json(null, { status: 200 })),

  // Contact balance & transactions
  http.get(`${BASE}/contacts/:id/balance`, ({ params }) => {
    const contact = mockContacts.find(c => c.id === Number(params.id));
    return HttpResponse.json(contact?.Balance ?? []);
  }),
  http.get(`${BASE}/contacts/:id/transactions`, () => HttpResponse.json(mockTransactions)),
  http.post(`${BASE}/contacts/:id/recalculate-balance`, ({ params }) => {
    const contact = mockContacts.find(c => c.id === Number(params.id));
    return HttpResponse.json(contact?.Balance ?? []);
  }),
  http.get(`${BASE}/contacts/:id/prepare-invite`, () => HttpResponse.json('https://t.me/qarzuz_bot?start=invite_abc123')),

  // Transactions
  http.post(`${BASE}/transactions/topup`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: 100, user_id: 1, ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }),
  http.post(`${BASE}/transactions/withdraw`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: 101, user_id: 1, ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }),
  http.patch(`${BASE}/transactions/:id`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: Number(params.id), user_id: 1, ...body, updatedAt: new Date().toISOString() });
  }),
  http.post(`${BASE}/transactions/:id/cancel`, ({ params }) =>
    HttpResponse.json({ id: Number(params.id), deletedAt: new Date().toISOString() }),
  ),

  // Currencies
  http.get(`${BASE}/currencies`, () => HttpResponse.json(mockCurrencies)),
  http.post(`${BASE}/currencies`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: 99, createdAt: new Date().toISOString(), ...body });
  }),
  http.patch(`${BASE}/currencies/:id`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>;
    const currency = mockCurrencies.find(c => c.id === Number(params.id));
    return HttpResponse.json({ ...currency, ...body });
  }),
  http.delete(`${BASE}/currencies/:id`, () => HttpResponse.json(null, { status: 200 })),

  // Reports
  http.get(`${BASE}/reports/summary`, () => HttpResponse.json(mockSummary)),
  http.get(`${BASE}/reports/trends`, () => HttpResponse.json(mockTrends)),
  http.get(`${BASE}/reports/top-debtors`, () => HttpResponse.json(mockTopDebtors)),
  http.get(`${BASE}/reports/top-creditors`, () => HttpResponse.json(mockTopCreditors)),
  http.get(`${BASE}/reports/currency-breakdown`, () => HttpResponse.json(mockCurrencyBreakdown)),

  // Root health check
  http.get(`${BASE}/`, () => HttpResponse.json('OK')),
];

/** Create a mock JWT that won't expire for 24 hours */
function makeMockJwt(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: 1,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
}
