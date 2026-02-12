import type {
  ProfileDto,
  CurrencyResponseDto,
  ContactResponseDto,
  IntersectionTransactionPickTypeClass,
  SummaryDto,
  TrendItemDto,
  DebtorCreditorDto,
  CurrencyBreakdownDto,
} from '~/api/api-client';

export const mockCurrencies: CurrencyResponseDto[] = [
  { id: 1, symbol: 'UZS', name: 'Узбекский сум', createdAt: '2025-01-01T00:00:00Z' },
  { id: 2, symbol: 'USD', name: 'Доллар США', createdAt: '2025-01-01T00:00:00Z' },
  { id: 3, symbol: 'RUB', name: 'Российский рубль', createdAt: '2025-01-01T00:00:00Z' },
];

export const mockProfile: ProfileDto = {
  id: 1,
  name: 'Иван Иванов',
  email: 'ivan@example.com',
  telegram_id: '123456789',
  is_verified: true,
  createdAt: '2025-01-15T10:00:00Z',
};

export const mockContacts: ContactResponseDto[] = [
  {
    id: 1, user_id: 1, name: 'Алексей Петров', ref_user_id: undefined,
    Balance: [
      { currency_id: 1, amount: 500000, contact_id: 1, updatedAt: '2025-05-01T10:00:00Z', currency: mockCurrencies[0] },
      { currency_id: 2, amount: 100, contact_id: 1, updatedAt: '2025-04-20T10:00:00Z', currency: mockCurrencies[1] },
    ],
  },
  {
    id: 2, user_id: 1, name: 'Мария Сидорова', ref_user_id: undefined,
    Balance: [
      { currency_id: 1, amount: -200000, contact_id: 2, updatedAt: '2025-05-10T10:00:00Z', currency: mockCurrencies[0] },
    ],
  },
  {
    id: 3, user_id: 1, name: 'Дмитрий Козлов', ref_user_id: undefined,
    Balance: [
      { currency_id: 2, amount: -50, contact_id: 3, updatedAt: '2025-04-15T10:00:00Z', currency: mockCurrencies[1] },
    ],
  },
  {
    id: 4, user_id: 1, name: 'Елена Новикова', ref_user_id: undefined,
    Balance: [
      { currency_id: 1, amount: 1000000, contact_id: 4, updatedAt: '2025-05-12T10:00:00Z', currency: mockCurrencies[0] },
      { currency_id: 3, amount: 5000, contact_id: 4, updatedAt: '2025-05-11T10:00:00Z', currency: mockCurrencies[2] },
    ],
  },
  {
    id: 5, user_id: 1, name: 'Сергей Морозов', ref_user_id: undefined,
    Balance: [],
  },
];

export const mockTransactions: IntersectionTransactionPickTypeClass[] = [
  { id: 1, contact_id: 1, currency_id: 1, user_id: 1, amount: 500000, note: 'За обед', createdAt: '2025-05-01T10:00:00Z', updatedAt: '2025-05-01T10:00:00Z', currency: mockCurrencies[0] },
  { id: 2, contact_id: 1, currency_id: 2, user_id: 1, amount: 100, note: 'Книга', createdAt: '2025-04-20T10:00:00Z', updatedAt: '2025-04-20T10:00:00Z', currency: mockCurrencies[1] },
  { id: 3, contact_id: 1, currency_id: 1, user_id: 1, amount: -200000, note: 'Частичный возврат', createdAt: '2025-04-18T10:00:00Z', updatedAt: '2025-04-18T10:00:00Z', currency: mockCurrencies[0] },
  { id: 4, contact_id: 1, currency_id: 1, user_id: 1, amount: 300000, note: 'Такси', createdAt: '2025-03-15T10:00:00Z', updatedAt: '2025-03-15T10:00:00Z', currency: mockCurrencies[0] },
];

export const mockSummary: SummaryDto = {
  owedToMe: 1600000,
  iOwe: 250000,
  netBalance: 1350000,
};

export const mockTrends: TrendItemDto[] = [
  { date: '2025-01', receivables: 300000, payables: 50000 },
  { date: '2025-02', receivables: 500000, payables: 100000 },
  { date: '2025-03', receivables: 800000, payables: 150000 },
  { date: '2025-04', receivables: 1200000, payables: 200000 },
  { date: '2025-05', receivables: 1600000, payables: 250000 },
];

export const mockTopDebtors: DebtorCreditorDto[] = [
  { contactId: 4, contactName: 'Елена Новикова', amount: 1000000, currencySymbol: 'UZS' },
  { contactId: 1, contactName: 'Алексей Петров', amount: 500000, currencySymbol: 'UZS' },
  { contactId: 1, contactName: 'Алексей Петров', amount: 100, currencySymbol: 'USD' },
];

export const mockTopCreditors: DebtorCreditorDto[] = [
  { contactId: 2, contactName: 'Мария Сидорова', amount: 200000, currencySymbol: 'UZS' },
  { contactId: 3, contactName: 'Дмитрий Козлов', amount: 50, currencySymbol: 'USD' },
];

export const mockCurrencyBreakdown: CurrencyBreakdownDto[] = [
  { currencyId: 1, symbol: 'UZS', owed: 1500000, iOwe: 200000, net: 1300000 },
  { currencyId: 2, symbol: 'USD', owed: 100, iOwe: 50, net: 50 },
  { currencyId: 3, symbol: 'RUB', owed: 5000, iOwe: 0, net: 5000 },
];
