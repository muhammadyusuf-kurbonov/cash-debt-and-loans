import { useQuery } from '@tanstack/react-query';
import { endOfDay, endOfMonth, endOfWeek, endOfYear, startOfDay, startOfMonth, startOfWeek, startOfYear } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiClient } from '~/lib/api-client';
import { isAuthenticated } from '~/lib/telegram-auth';
import { TransactionsList } from '~/components/transaction-list';
import { useQueryClient } from '@tanstack/react-query';

export function meta() {
  return [
    { title: "Reports - Qarz.uz" },
    { name: "description", content: "Financial reports and insights" },
  ];
}

type Period = 'today' | 'month' | 'custom';

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Сегодня',
  month: 'Месяц',
  custom: 'Свой',
};

function getRangeParams(period: Period, customRange: { from: string, to: string }) {
  const now = new Date();
  switch (period) {
    case 'today':
      return {
        from: startOfDay(now).toISOString(),
        to: endOfDay(now).toISOString(),
        trendPeriod: 'day' as const,
      };
    case 'month':
      return {
        from: startOfMonth(now).toISOString(),
        to: endOfMonth(now).toISOString(),
        trendPeriod: 'day' as const,
      };
    case 'custom':
      return {
        from: customRange.from ? startOfDay(new Date(customRange.from)).toISOString() : undefined,
        to: customRange.to ? endOfDay(new Date(customRange.to)).toISOString() : undefined,
        trendPeriod: 'day' as const,
      };
    default:
      return { from: undefined, to: undefined, trendPeriod: 'day' as const };
  }
}

export default function Reports() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('month');
  const [customRange, setCustomRange] = useState({
    from: startOfMonth(new Date()).toISOString().split('T')[0],
    to: endOfMonth(new Date()).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!isAuthenticated()) navigate('/');
  }, []);

  const api = ApiClient.getOpenAPIClient();

  // Use real report endpoints
  const { from, to, trendPeriod } = useMemo(() => getRangeParams(period, customRange), [period, customRange]);

  // Use real report endpoints
  const { data: summaries, refetch: refetchSummary } = useQuery({
    queryKey: ['reports', 'summary', period, from, to],
    queryFn: async () => {
      const response = await api.reports.reportsControllerGetSummary({ from, to });
      return response.data;
    },
    initialData: [],
  });

  const { data: transactionsData, refetch: refetchTransactions } = useQuery({
    queryKey: ['reports', 'transactions', period, from, to],
    queryFn: async () => {
      const response = await api.reports.reportsControllerGetTransactions({ from, to });
      return response.data;
    },
    initialData: [],
  });

  const queryClient = useQueryClient();

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['reports'] });
    refetchSummary();
    refetchTransactions();
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await api.transactions.transactionsControllerCancel(String(id));
      refreshAll();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleEditNote = async (id: number, note: string) => {
    try {
      await api.transactions.transactionsControllerUpdate(String(id), { note });
      refreshAll();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };





  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">analytics</span>
            <h1 className="text-xl font-bold tracking-tight">Отчёты</h1>
          </div>
        </div>
        {/* Period Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {(['today', 'month', 'custom'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                period === p
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Custom Range Picker */}
        {period === 'custom' && (
          <div className="mt-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">С</span>
              <input
                type="date"
                value={customRange.from}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, from: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-bold focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">По</span>
              <input
                type="date"
                value={customRange.to}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, to: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-bold focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Summary Cards per Currency */}
        <div className="space-y-6">
          {summaries.length === 0 && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center text-gray-400">
              Нет данных за выбранный период
            </div>
          )}
          {summaries.map((s) => (
            <div key={s.currencyId} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{s.currencySymbol}</span>
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Мне должны</p>
                    <p className="text-xl font-extrabold text-emerald-500">
                      {s.owedToMe.toLocaleString('ru', { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Я должен</p>
                    <p className="text-xl font-extrabold text-rose-500">
                      {s.iOwe.toLocaleString('ru', { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="bg-primary p-4 rounded-2xl shadow-lg shadow-primary/20 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">Чистый баланс ({s.currencySymbol})</p>
                    <p className="text-2xl font-extrabold text-white">
                      {s.netBalance.toLocaleString('ru', { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-white/80 flex flex-col items-end">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Transactions History */}
        <section className="space-y-3 pb-8">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100 italic">История операций</h3>
            <span className="text-[10px] text-gray-400 font-medium">
              {period === 'today' ? 'За сегодня' : 
               period === 'month' ? 'За 30 дней' :
               period === 'custom' ? `С ${new Date(customRange.from).toLocaleDateString('ru', { day: 'numeric', month: 'short' })} по ${new Date(customRange.to).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}` :
               ''}
            </span>
          </div>
          <TransactionsList 
            transactions={transactionsData} 
            onDeleteTransaction={handleDeleteTransaction}
            onEditNote={handleEditNote}
            showContact
          />
        </section>
      </main>
    </div>
  );
}
