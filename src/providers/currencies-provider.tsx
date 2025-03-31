'use client';
import { currencyTable } from '@/db/schema';
import { createContext } from 'react';

export const CurrenciesContext = createContext<typeof currencyTable.$inferSelect[]>([]);

export function CurrenciesProvider({ children, currencies }: { children: React.ReactNode, currencies: typeof currencyTable.$inferSelect[] }) {
  return (
    <CurrenciesContext.Provider value={currencies}>
      {children}
    </CurrenciesContext.Provider>
  );
}
