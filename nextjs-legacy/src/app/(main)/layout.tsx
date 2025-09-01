import { CurrenciesProvider } from '@/providers/currencies-provider';
import { getCurrencies } from '../actions';
import { Providers } from '../providers';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currencies = await getCurrencies();
  return (


    <Providers>
      <CurrenciesProvider currencies={currencies}>
        {children}
      </CurrenciesProvider>
    </Providers>)
};