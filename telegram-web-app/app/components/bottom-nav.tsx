import { useLocation, useNavigate } from 'react-router';
import { useState } from 'react';
import { AddTransactionModal } from './add-transaction-modal';

const tabs = [
  { path: '/home', icon: 'dashboard', label: 'Home' },
  { path: '/reports', icon: 'analytics', label: 'Reports' },
  { path: '__add__', icon: 'add', label: 'Add' },
  { path: '/contacts', icon: 'group', label: 'People' },
  { path: '/profile', icon: 'settings', label: 'Settings' },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);

  // Don't show on welcome/login page
  if (location.pathname === '/') return null;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 flex justify-around items-end py-2 px-4 md:hidden"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {tabs.map((tab) => {
          if (tab.path === '__add__') {
            return (
              <div key={tab.path} className="-mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary text-white p-3 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-2xl">add</span>
                </button>
              </div>
            );
          }

          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 ${isActive ? 'text-primary' : 'text-gray-400'}`}
            >
              <span
                className={`material-symbols-outlined text-2xl ${isActive ? 'filled' : ''}`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {tab.icon}
              </span>
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <AddTransactionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={async () => {
          setShowAddModal(false);
        }}
      />
    </>
  );
}
