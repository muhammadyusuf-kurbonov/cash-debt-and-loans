import { useQuery } from '@tanstack/react-query';
import { endOfDay, endOfMonth, endOfWeek, endOfYear, startOfDay, startOfMonth, startOfWeek, startOfYear } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiClient } from '~/lib/api-client';
import { isAuthenticated } from '~/lib/telegram-auth';

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
  const { data: summary } = useQuery({
    queryKey: ['reports', 'summary', period],
    queryFn: async () => {
      const response = await api.reports.reportsControllerGetSummary({ from, to });
      return response.data;
    },
    initialData: { owedToMe: 0, iOwe: 0, netBalance: 0 },
  });

  const { data: trends } = useQuery({
    queryKey: ['reports', 'trends', period],
    queryFn: async () => {
      const response = await api.reports.reportsControllerGetTrends({
        from,
        to,
        period: trendPeriod,
      });
      return response.data;
    },
    initialData: [],
  });

  const { data: topDebtors } = useQuery({
    queryKey: ['reports', 'top-debtors'],
    queryFn: async () => {
      const response = await api.reports.reportsControllerGetTopDebtors({ limit: '5' });
      return response.data;
    },
    initialData: [],
  });

  const { data: topCreditors } = useQuery({
    queryKey: ['reports', 'top-creditors'],
    queryFn: async () => {
      const response = await api.reports.reportsControllerGetTopCreditors({ limit: '5' });
      return response.data;
    },
    initialData: [],
  });

  const { data: currencyBreakdown } = useQuery({
    queryKey: ['reports', 'currency-breakdown'],
    queryFn: async () => {
      const response = await api.reports.reportsControllerGetCurrencyBreakdown();
      return response.data;
    },
    initialData: [],
  });

  // Calculate max amounts for progress bars
  const maxDebtor = useMemo(() => {
    return topDebtors.length > 0 ? Math.max(...topDebtors.map(d => d.amount)) : 1;
  }, [topDebtors]);

  const maxCreditor = useMemo(() => {
    return topCreditors.length > 0 ? Math.max(...topCreditors.map(c => c.amount)) : 1;
  }, [topCreditors]);

  // Transform data for UI
  const { owedToMe, iOwe, netBalance } = summary;
  const formattedTopDebtors = useMemo(() => {
    return topDebtors.map(d => ({
      name: d.contactName,
      amount: d.amount,
      symbol: d.currencySymbol,
      maxAmount: maxDebtor,
    }));
  }, [topDebtors, maxDebtor]);

  const formattedTopCreditors = useMemo(() => {
    return topCreditors.map(c => ({
      name: c.contactName,
      amount: c.amount,
      symbol: c.currencySymbol,
      maxAmount: maxCreditor,
    }));
  }, [topCreditors, maxCreditor]);

  const formattedCurrencyBreakdown = useMemo(() => {
    return currencyBreakdown.map(cb => ({
      symbol: cb.symbol,
      net: cb.net,
    }));
  }, [currencyBreakdown]);

  // Transform trends data for the chart
  const { chartPath, chartAreaPath, chartLabels } = useMemo(() => {
    if (!trends || trends.length === 0) {
      return { 
        chartPath: "M0,50 L400,50", 
        chartAreaPath: "M0,50 L400,50 V100 H0 Z",
        chartLabels: [] 
      };
    }

    const maxVal = Math.max(...trends.map(t => Math.max(t.receivables, t.payables)), 1);
    
    const points = trends.map((t, i) => {
      const x = (i / (trends.length - 1 || 1)) * 400;
      // Map net balance to Y: receivables are positive, payables are negative
      const net = t.receivables - t.payables;
      const y = 50 - (net / maxVal) * 40; 
      return { x, y };
    });

    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const areaPath = `${path} V100 H0 Z`;

    // Generate 4 labels based on data
    const labels = [];
    if (trends.length > 0) {
      const step = Math.max(1, Math.floor(trends.length / 4));
      for (let i = 0; i < trends.length; i += step) {
        if (labels.length < 4) {
          // Format date/label based on trendPeriod
          const date = new Date(trends[i].date);
          if (trendPeriod === 'day') {
            labels.push(date.toLocaleDateString('ru', { day: 'numeric', month: 'short' }));
          } else {
            labels.push(date.toLocaleDateString('ru', { month: 'short', year: '2-digit' }));
          }
        }
      }
    }

    return { chartPath: path, chartAreaPath: areaPath, chartLabels: labels };
  }, [trends, trendPeriod]);

    const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

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
        {/* Summary Cards */}
        <div className="space-y-3">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Мне должны</p>
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
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Я должен</p>
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
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">Чистый баланс</p>
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
            <h3 className="text-sm font-bold">Динамика долгов</h3>
            <span className="text-[10px] text-gray-400 font-medium">
              {period === 'today' ? 'За сегодня' : 
               period === 'month' ? 'За 30 дней' :
               period === 'custom' ? `С ${new Date(customRange.from).toLocaleDateString('ru', { day: 'numeric', month: 'short' })} по ${new Date(customRange.to).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}` :
               ''}
            </span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 transition-all duration-300">
            <div className="w-full h-32 relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 100">
                <path d={chartPath} fill="none" stroke="currentColor" className="text-primary" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                <defs>
                  <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity="0.12" />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={chartAreaPath} fill="url(#chartGrad)" />
              </svg>
              <div className="flex justify-between mt-3 text-[8px] font-bold text-gray-400 dark:text-gray-500 tracking-tighter uppercase">
                {chartLabels.map((l, i) => <span key={i}>{l}</span>)}
              </div>
            </div>
          </div>
        </section>

        {/* Top Debtors & Creditors */}
        <div className="grid grid-cols-1 gap-6">
          <section className="space-y-3">
            <h3 className="text-sm font-bold px-1">Топ должников</h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {topDebtors.length === 0 && (
                  <div className="p-4 text-center text-gray-400 text-sm">Нет должников</div>
                )}
{formattedTopDebtors.map((debtor, i) => (
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
            <h3 className="text-sm font-bold px-1">Топ кредиторов</h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {topCreditors.length === 0 && (
                  <div className="p-4 text-center text-gray-400 text-sm">Нет кредиторов</div>
                )}
{formattedTopCreditors.map((creditor, i) => (
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
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">По валютам</h3>
          <div className="grid grid-cols-1 gap-3">
            {currencyBreakdown.length === 0 && (
              <div className="text-gray-400 text-sm">Нет данных</div>
            )}
            {formattedCurrencyBreakdown.map(({ symbol, net }) => (
              <div key={symbol} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:border-primary/30">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">{symbol}</p>
                <p className={`text-xl font-extrabold ${net > 0 ? 'text-emerald-500' : net < 0 ? 'text-rose-500' : ''}`}>
                  {net.toLocaleString('ru', { maximumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
