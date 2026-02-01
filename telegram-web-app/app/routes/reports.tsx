import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiClient } from '~/lib/api-client';
import { isAuthenticated } from '~/lib/telegram-auth';
import { max } from 'date-fns';

export function meta() {
  return [
    { title: "Reports - Qarz.uz" },
    { name: "description", content: "Financial reports and insights" },
  ];
}

type Period = 'today' | 'month' | 'range';

export default function Reports() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('month');

  useEffect(() => {
    if (!isAuthenticated()) navigate('/');
  }, []);

  const api = ApiClient.getOpenAPIClient();

  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await api.contacts.contactsControllerFindAll();
      return response.data.sort((a, b) => {
        let aTime = a.Balance.length ? max(a.Balance.map(bal => bal.updatedAt)).getTime() : a.id * 1000000000;
        let bTime = b.Balance.length ? max(b.Balance.map(bal => bal.updatedAt)).getTime() : b.id * 1000000000;
        return -aTime + bTime;
      });
    },
    initialData: [],
  });

  // Derive reports from contacts data
  const { owedToMe, iOwe, netBalance, topDebtors, topCreditors, currencyBreakdown } = useMemo(() => {
    const byCurrency: Record<string, { owed: number; iOwe: number }> = {};
    const debtors: Array<{ name: string; amount: number; symbol: string; maxAmount: number }> = [];
    const creditors: Array<{ name: string; amount: number; symbol: string; maxAmount: number }> = [];

    for (const contact of contacts) {
      for (const bal of contact.Balance) {
        if (!byCurrency[bal.currency.symbol]) {
          byCurrency[bal.currency.symbol] = { owed: 0, iOwe: 0 };
        }
        if (bal.amount > 0) {
          byCurrency[bal.currency.symbol].owed += bal.amount;
          debtors.push({ name: contact.name || 'Unnamed', amount: bal.amount, symbol: bal.currency.symbol, maxAmount: 0 });
        } else if (bal.amount < 0) {
          byCurrency[bal.currency.symbol].iOwe += Math.abs(bal.amount);
          creditors.push({ name: contact.name || 'Unnamed', amount: Math.abs(bal.amount), symbol: bal.currency.symbol, maxAmount: 0 });
        }
      }
    }

    const sortedDebtors = debtors.sort((a, b) => b.amount - a.amount).slice(0, 5);
    const sortedCreditors = creditors.sort((a, b) => b.amount - a.amount).slice(0, 5);
    const maxDebtor = sortedDebtors[0]?.amount || 1;
    const maxCreditor = sortedCreditors[0]?.amount || 1;

    let totalOwed = 0, totalIOwe = 0;
    const breakdown: Array<{ symbol: string; net: number }> = [];
    for (const [symbol, { owed, iOwe }] of Object.entries(byCurrency)) {
      totalOwed += owed;
      totalIOwe += iOwe;
      breakdown.push({ symbol, net: owed - iOwe });
    }

    return {
      owedToMe: totalOwed,
      iOwe: totalIOwe,
      netBalance: totalOwed - totalIOwe,
      topDebtors: sortedDebtors.map(d => ({ ...d, maxAmount: maxDebtor })),
      topCreditors: sortedCreditors.map(c => ({ ...c, maxAmount: maxCreditor })),
      currencyBreakdown: breakdown,
    };
  }, [contacts]);

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col w-full max-w-[960px] mx-auto min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">analytics</span>
            <h1 className="text-xl font-bold tracking-tight">Reports</h1>
          </div>
        </div>
        {/* Period Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {(['today', 'month', 'range'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                period === p
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {p === 'today' ? 'Today' : p === 'month' ? 'Month' : 'Range'}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="space-y-3">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Owed to you</p>
              <p className="text-2xl font-extrabold">
                {owedToMe.toLocaleString('ru', { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-emerald-500 flex flex-col items-end">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">You owe</p>
              <p className="text-2xl font-extrabold">
                {iOwe.toLocaleString('ru', { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-rose-500 flex flex-col items-end">
              <span className="material-symbols-outlined">trending_down</span>
            </div>
          </div>

          <div className="bg-primary p-4 rounded-2xl shadow-lg shadow-primary/20 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">Net Balance</p>
              <p className="text-2xl font-extrabold text-white">
                {netBalance.toLocaleString('ru', { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-white/80 flex flex-col items-end">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
          </div>
        </div>

        {/* Debt Trends Chart Placeholder */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold">Debt Trends</h3>
            <span className="text-[10px] text-gray-400 font-medium">Last 30 days</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="w-full h-32 relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 100">
                <path d="M0,80 L50,60 L100,75 L150,40 L200,50 L250,30 L300,20 L350,45 L400,10" fill="none" stroke="currentColor" className="text-primary" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                <defs>
                  <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="currentColor" className="text-primary" stopOpacity="0.15" />
                    <stop offset="95%" stopColor="currentColor" className="text-primary" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,80 L50,60 L100,75 L150,40 L200,50 L250,30 L300,20 L350,45 L400,10 V100 H0 Z" fill="url(#chartGrad)" />
              </svg>
              <div className="flex justify-between mt-2 text-[8px] font-bold text-gray-400 tracking-tighter uppercase">
                <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
              </div>
            </div>
          </div>
        </section>

        {/* Top Debtors & Creditors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="space-y-3">
            <h3 className="text-sm font-bold px-1">Top Debtors</h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {topDebtors.length === 0 && (
                  <div className="p-4 text-center text-gray-400 text-sm">No debtors</div>
                )}
                {topDebtors.map((debtor, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {getInitials(debtor.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{debtor.name}</p>
                      <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(debtor.amount / debtor.maxAmount) * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{debtor.amount.toLocaleString('ru', { maximumFractionDigits: 2 })} {debtor.symbol}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold px-1">Top Creditors</h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {topCreditors.length === 0 && (
                  <div className="p-4 text-center text-gray-400 text-sm">No creditors</div>
                )}
                {topCreditors.map((creditor, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="size-9 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center font-bold text-xs">
                      {getInitials(creditor.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{creditor.name}</p>
                      <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(creditor.amount / creditor.maxAmount) * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{creditor.amount.toLocaleString('ru', { maximumFractionDigits: 2 })} {creditor.symbol}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Currency Breakdown */}
        <section className="space-y-3 pb-8">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Currency Breakdown</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {currencyBreakdown.length === 0 && (
              <div className="text-gray-400 text-sm">No data</div>
            )}
            {currencyBreakdown.map(({ symbol, net }) => (
              <div key={symbol} className="flex-shrink-0 min-w-[120px] bg-gray-100 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-[10px] font-bold text-gray-500 mb-1">{symbol}</p>
                <p className="text-lg font-extrabold">{net.toLocaleString('ru', { maximumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
