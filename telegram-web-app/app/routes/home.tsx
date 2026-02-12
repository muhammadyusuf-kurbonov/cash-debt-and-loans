import { useQuery } from '@tanstack/react-query';
import { init, viewport } from '@tma.js/sdk-react';
import { max, formatDistanceToNow } from 'date-fns';
import { useEffect, useMemo } from "react";
import { useNavigate } from 'react-router';
import { ApiClient } from '~/lib/api-client';
import { isAuthenticated } from "~/lib/telegram-auth";
import { useTelegramData } from "~/lib/useTelegramData";
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Qarz.uz" },
    { name: "description", content: "Track your debts and loans efficiently" },
  ];
}

export default function Home() {
  const { isTelegram } = useTelegramData();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (!isTelegram) return;
    init();
    if (viewport.requestFullscreen.isAvailable()) {
      viewport.requestFullscreen().then(() => viewport.expand());
    }
  }, []);

  const api = ApiClient.getOpenAPIClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await api.contacts.contactsControllerFindAll();
      return response.data.sort((a, b) => {
        let aTime = a.Balance.length ? max(a.Balance.map(bal => bal.updatedAt)).getTime() : a.id * 1000000000;
        let bTime = b.Balance.length ? max(b.Balance.map(bal => bal.updatedAt)).getTime() : b.id * 1000000000;
        return -aTime + bTime;
      });
    },
  });

  // Calculate totals by currency
  const totals = useMemo(() => {
    const byCurrency: Record<string, { owed: number; iOwe: number }> = {};
    for (const contact of contacts ?? []) {
      for (const bal of contact.Balance) {
        if (!byCurrency[bal.currency.symbol]) {
          byCurrency[bal.currency.symbol] = { owed: 0, iOwe: 0 };
        }
        if (bal.amount > 0) {
          byCurrency[bal.currency.symbol].owed += bal.amount;
        } else {
          byCurrency[bal.currency.symbol].iOwe += Math.abs(bal.amount);
        }
      }
    }
    return byCurrency;
  }, [contacts]);

  const netByCurrency = useMemo(() => {
    const result: Record<string, number> = {};
    for (const [symbol, { owed, iOwe }] of Object.entries(totals)) {
      result[symbol] = owed - iOwe;
    }
    return result;
  }, [totals]);

  // Recent activity: get contacts with most recent balance updates
  const recentContacts = useMemo(() => {
    return (contacts ?? [])
      .filter(c => c.Balance.length > 0)
      .slice(0, 5);
  }, [contacts]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
          <h1 className="text-[17px] font-semibold tracking-tight">Qarz.uz</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6 max-w-[960px] mx-auto w-full">
        {/* Total Net Debt Hero */}
        <div className="flex flex-col items-center text-center space-y-1">
          <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Общий баланс</p>
          <div className="space-y-0.5">
            {Object.entries(netByCurrency).length === 0 ? (
              <h2 className="text-4xl font-extrabold tracking-tight">0.00</h2>
            ) : (
              Object.entries(netByCurrency).map(([symbol, value]) => (
                <h2 key={symbol} className="text-4xl font-extrabold tracking-tight">
                  {value >= 0 ? '+' : ''}{value.toLocaleString('ru', { maximumFractionDigits: 2 })} {symbol}
                </h2>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/contacts')}
            className="flex flex-col items-center justify-center gap-2 h-24 bg-primary text-white rounded-2xl shadow-sm active:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-3xl">add_circle</span>
            <span className="text-sm font-bold">Я дал в долг</span>
          </button>
          <button
            onClick={() => navigate('/contacts')}
            className="flex flex-col items-center justify-center gap-2 h-24 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 active:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-3xl text-primary">payments</span>
            <span className="text-sm font-bold">Мне дали в долг</span>
          </button>
        </div>

        {/* Owed to Me / I Owe Summary */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">north_east</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Мне должны</p>
                <div>
                  {Object.entries(totals).map(([symbol, { owed }]) =>
                    owed > 0 && (
                      <p key={symbol} className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        +{owed.toLocaleString('ru', { maximumFractionDigits: 2 })} {symbol}
                      </p>
                    )
                  )}
                  {Object.values(totals).every(t => t.owed === 0) && (
                    <p className="text-lg font-bold text-gray-400">0.00</p>
                  )}
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">chevron_right</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-rose-600 dark:text-rose-400">south_east</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Я должен</p>
                <div>
                  {Object.entries(totals).map(([symbol, { iOwe }]) =>
                    iOwe > 0 && (
                      <p key={symbol} className="text-lg font-bold text-rose-600 dark:text-rose-400">
                        -{iOwe.toLocaleString('ru', { maximumFractionDigits: 2 })} {symbol}
                      </p>
                    )
                  )}
                  {Object.values(totals).every(t => t.iOwe === 0) && (
                    <p className="text-lg font-bold text-gray-400">0.00</p>
                  )}
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">chevron_right</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Последние операции</h3>
            <button onClick={() => navigate('/contacts')} className="text-primary text-sm font-semibold">Все</button>
          </div>

          {recentContacts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center text-gray-400">
              <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
              <p>Нет недавних операций</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
              {recentContacts.map((contact, idx) => {
                const initials = (contact.name || '?').slice(0, 2).toUpperCase();
                const lastUpdate = contact.Balance.length > 0
                  ? formatDistanceToNow(max(contact.Balance.map(b => b.updatedAt)), { addSuffix: true })
                  : '';

                return (
                  <div
                    key={contact.id}
                    onClick={() => navigate(`/transactions?contactId=${contact.id}&contactName=${encodeURIComponent(contact.name || 'Contact')}`)}
                    className={`flex items-center justify-between p-4 cursor-pointer active:bg-gray-50 dark:active:bg-gray-700 transition-colors ${idx < recentContacts.length - 1 ? 'border-b border-gray-50 dark:border-gray-700' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-semibold">{contact.name || 'Unnamed'}</span>
                        <span className="text-[12px] text-gray-500 dark:text-gray-400">{lastUpdate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {contact.Balance.map(bal => (
                        <span
                          key={bal.currency.id}
                          className={`block text-[15px] font-bold ${bal.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : bal.amount < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500'}`}
                        >
                          {bal.amount >= 0 ? '+' : ''}{bal.amount.toLocaleString('ru', { maximumFractionDigits: 2 })} {bal.currency.symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
