# UI Redesign Plan

Full visual redesign based on provided HTML mockups. The new design uses a Telegram-native aesthetic with `#2481cc` primary color, rounded cards, Material Symbols icons, and responsive mobile/desktop layouts.

## Key Design Changes

- **Primary color**: `#2481cc` (Telegram blue) replacing the current zinc/neutral shadcn theme
- **Typography**: Keep Inter font, add font-weight 800/900
- **Icons**: Add Google Material Symbols Outlined (via Google Fonts link) alongside existing Lucide
- **Cards**: `rounded-2xl` with subtle borders, no heavy shadows
- **Layout**: Bottom tab navigation on mobile, top nav bar on desktop
- **New pages**: Reports page

## Files to Modify

### 1. `app/app.css` — Update theme colors
- Change `--primary` to `#2481cc` equivalent in OKLCH
- Update background colors: light `#efeff4` / dark `#1c1c1d`
- Add card color variables
- Keep existing shadcn variable structure intact

### 2. `app/root.tsx` — Add Material Symbols font link
- Add Google Fonts link for `Material+Symbols+Outlined`
- Add `select-none` and `overflow-x-hidden` to body

### 3. `app/components/bottom-nav.tsx` — NEW: Bottom tab navigation
- Tabs: Home, Reports, Add (floating center button), People (contacts), Settings
- Active tab highlighted with primary color and filled icon
- Sticky bottom, backdrop blur, safe-area padding
- Shows on mobile only (hidden on desktop where top nav exists)
- Center "Add" button floats above the bar

### 4. `app/components/top-nav.tsx` — NEW: Desktop top navigation bar
- Logo + "DebtTracker" branding
- Nav links: Dashboard, Debts, Reports, etc.
- Search bar (desktop only)
- User avatar
- Hidden on mobile (bottom nav used instead)

### 5. `app/routes/home.tsx` — Redesign dashboard
- **Total Net Debt** hero section (centered, large number)
- **Quick action buttons**: "Add Debt" (primary) + "Add Loan" (secondary) in 2-col grid
- **Owed to Me / I Owe** summary cards with green/red icons and amounts
- **Recent Activity** section: list of recent transactions across all contacts with person icons, dates, colored amounts
- Replace current `ContactList` rendering with new dashboard layout
- Keep all existing data fetching and mutation logic
- Contact list moves to a separate "People" tab/page

### 6. `app/routes/contacts.tsx` — NEW: Contacts page (People tab)
- Move the existing contacts list logic here
- Restyle with new card design (avatar initials, progress bars for balances)
- Accessible from bottom nav "People" tab

### 7. `app/routes/reports.tsx` — NEW: Reports page
- Summary cards: Owed to You, You Owe, Net Balance
- Period tabs: Today / Month / Range
- Static SVG chart placeholder for "Debt Trends"
- Top Debtors / Top Creditors sections with progress bars
- Currency breakdown horizontal scroll cards
- Data derived from existing contacts + balances API

### 8. `app/components/add-transaction-modal.tsx` — Restyle
- Segmented control for "I owe" / "Owed to me" (replace radio buttons)
- Larger amount input (text-4xl)
- Floating "Save Transaction" button at bottom with gradient fade
- Contact quick-select chips
- Cleaner label styling with uppercase primary-colored labels

### 9. `app/components/contacts-list.tsx` — Restyle
- Avatar circles with initials (primary/10 background)
- Balance shown with progress bars
- Remove Card/CardContent shadcn wrappers, use custom card styling
- Keep framer-motion animations

### 10. `app/components/transaction-list.tsx` — Restyle
- Colored category icons per transaction
- Status badges (Received, Pending, Paid)
- Cleaner layout with hover states

### 11. `app/components/sticky-footer.tsx` — Update
- Add backdrop-blur, safe-area-inset-bottom support
- Semi-transparent background

### 12. `app/components/money.tsx` — Update colors
- Green: `text-emerald-600` / Red: `text-rose-600`

### 13. `app/routes.ts` — Add new routes
- `/reports` → `routes/reports.tsx`
- `/contacts` → `routes/contacts.tsx` (the People tab)

### 14. `app/components/top-right-menu.tsx` — Remove or integrate into new nav
- Menu items move into Settings page or nav dropdown

## Implementation Order

1. Update `app.css` theme colors
2. Update `root.tsx` (font links, body classes)
3. Create `bottom-nav.tsx` and `top-nav.tsx` layout components
4. Integrate layout into `root.tsx` (wrap Outlet)
5. Create `routes/contacts.tsx` (move contact list from home)
6. Redesign `routes/home.tsx` as dashboard
7. Restyle `add-transaction-modal.tsx`
8. Restyle `contacts-list.tsx`
9. Restyle `transaction-list.tsx` and `sticky-footer.tsx`
10. Create `routes/reports.tsx`
11. Update `routes.ts` with new routes
12. Update `money.tsx` colors

## Verification
- `pnpm run typecheck` — no TypeScript errors
- `pnpm run dev` — visual verification in browser
- All existing functionality preserved (auth, CRUD contacts, transactions, currencies)

---

mockups:
Mobile:
```
<!-- Debt Tracker Dashboard -->
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>DebtTracker - Telegram Mini App</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#2481cc",
                        "background-light": "#efeff4",
                        "background-dark": "#1c1c1d",
                        "card-light": "#ffffff",
                        "card-dark": "#2c2c2e",
                    },
                    fontFamily: {
                        "display": ["Inter"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.5rem",
                        "lg": "0.75rem",
                        "xl": "1rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style type="text/tailwindcss">
        body {
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }.safe-bottom {
            padding-bottom: env(safe-area-inset-bottom);
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark min-h-screen text-[#000000] dark:text-white select-none overflow-x-hidden">
<div class="flex flex-col min-h-screen">
<header class="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1c1c1d] border-b border-gray-200 dark:border-gray-800">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
<h1 class="text-[17px] font-semibold tracking-tight">DebtTracker</h1>
</div>
<button class="flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
<span class="material-symbols-outlined text-[20px]">close</span>
</button>
</header>
<main class="flex-1 px-4 py-6 space-y-6">
<div class="flex flex-col items-center text-center space-y-1">
<p class="text-[13px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Net Debt</p>
<h2 class="text-4xl font-extrabold tracking-tight">$12,450.00</h2>
</div>
<div class="grid grid-cols-2 gap-3">
<button class="flex flex-col items-center justify-center gap-2 h-24 bg-primary text-white rounded-2xl shadow-sm active:opacity-80 transition-opacity">
<span class="material-symbols-outlined text-3xl">add_circle</span>
<span class="text-sm font-bold">Add Debt</span>
</button>
<button class="flex flex-col items-center justify-center gap-2 h-24 bg-card-light dark:bg-card-dark text-[#000000] dark:text-white rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 active:opacity-80 transition-opacity">
<span class="material-symbols-outlined text-3xl text-primary">payments</span>
<span class="text-sm font-bold">Add Loan</span>
</button>
</div>
<div class="grid grid-cols-1 gap-3">
<div class="flex items-center justify-between p-4 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
<div class="flex items-center gap-3">
<div class="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
<span class="material-symbols-outlined text-green-600 dark:text-green-400">south_east</span>
</div>
<div>
<p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Owed to Me</p>
<p class="text-lg font-bold text-green-600 dark:text-green-400">$15,200.00</p>
</div>
</div>
<span class="material-symbols-outlined text-gray-300 dark:text-gray-600">chevron_right</span>
</div>
<div class="flex items-center justify-between p-4 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
<div class="flex items-center gap-3">
<div class="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
<span class="material-symbols-outlined text-red-600 dark:text-red-400">north_east</span>
</div>
<div>
<p class="text-xs text-gray-500 dark:text-gray-400 font-medium">I Owe</p>
<p class="text-lg font-bold text-red-600 dark:text-red-400">$2,750.00</p>
</div>
</div>
<span class="material-symbols-outlined text-gray-300 dark:text-gray-600">chevron_right</span>
</div>
</div>
<div class="space-y-3">
<div class="flex items-center justify-between px-1">
<h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recent Activity</h3>
<button class="text-primary text-sm font-semibold">View All</button>
</div>
<div class="bg-card-light dark:bg-card-dark rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
<div class="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800 transition-colors">
<div class="flex items-center gap-3">
<div class="size-11 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[24px]">person</span>
</div>
<div class="flex flex-col">
<span class="text-[15px] font-semibold">Alex Thompson</span>
<span class="text-[12px] text-gray-500 dark:text-gray-400">Yesterday • Personal</span>
</div>
</div>
<div class="text-right">
<span class="text-[15px] font-bold text-green-600 dark:text-green-400">+$1,200.00</span>
</div>
</div>
<div class="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800 transition-colors">
<div class="flex items-center gap-3">
<div class="size-11 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
<span class="material-symbols-outlined text-[24px]">shopping_cart</span>
</div>
<div class="flex flex-col">
<span class="text-[15px] font-semibold">Best Buy</span>
<span class="text-[12px] text-gray-500 dark:text-gray-400">Oct 12 • Electronics</span>
</div>
</div>
<div class="text-right">
<span class="text-[15px] font-bold text-red-600 dark:text-red-400">-$450.00</span>
</div>
</div>
<div class="flex items-center justify-between p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors">
<div class="flex items-center gap-3">
<div class="size-11 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
<span class="material-symbols-outlined text-[24px]">home</span>
</div>
<div class="flex flex-col">
<span class="text-[15px] font-semibold">Mortgage</span>
<span class="text-[12px] text-gray-500 dark:text-gray-400">Oct 10 • Housing</span>
</div>
</div>
<div class="text-right">
<span class="text-[15px] font-bold text-gray-900 dark:text-white">-$2,100.00</span>
</div>
</div>
</div>
</div>
</main>
<div class="sticky bottom-0 p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md safe-bottom">
<button class="w-full bg-primary text-white py-4 rounded-2xl font-bold text-[16px] shadow-lg active:scale-[0.98] transition-all">
                Export Reports
            </button>
</div>
</div>

</body></html>

<!-- Debt & Loan Reports -->
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>DebtTracker - Reports</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                    },
                    fontFamily: {
                        "display": ["Inter"]
                    },
                    borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                },
            },
        }
    </script>
<style type="text/tailwindcss">
        body {
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        ::-webkit-scrollbar {
            display: none;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
<div class="flex flex-col w-full max-w-[480px] mx-auto bg-white dark:bg-background-dark min-h-screen shadow-xl">
<header class="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-4 border-b border-slate-100 dark:border-slate-800">
<div class="flex items-center justify-between mb-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-2xl">analytics</span>
<h1 class="text-xl font-bold tracking-tight">Reports</h1>
</div>
<div class="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuC2T2MKWLy3JmDyDiZWFiRi3LCjs4qZcuxYzIvSDa8xaYzkBbjbezNoxnxZ5kf63TWMPrW1KV6a7gGIVE3yaABMg9dOWYfWua5I5dbrVR9CTxlvH60L_S_lRDn6BfI_XIebGbmDUJ0hQOQFrRr5ydd50YsE251NMBH6H-kowOIoWEFMvphXUns5YUuPbmjSG2nfOgrGE4VqNvs2cBk_pBm6Fap6r58Ucq__AR-C-u4y3PCnngLjG_nsh4E_he5X6hCP59yfpcAFC48");'></div>
</div>
<div class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
<button class="flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 dark:text-slate-400">Today</button>
<button class="flex-1 py-2 text-xs font-bold rounded-lg bg-white dark:bg-slate-700 text-primary shadow-sm">Month</button>
<button class="flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 dark:text-slate-400">Range</button>
</div>
</header>
<main class="flex-1 px-4 py-6 space-y-6">
<div class="space-y-3">
<div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center">
<div>
<p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Owed to you</p>
<p class="text-2xl font-black text-slate-900 dark:text-white">$12,450.00</p>
</div>
<div class="text-emerald-500 flex flex-col items-end">
<span class="material-symbols-outlined">trending_up</span>
<span class="text-[10px] font-bold">+12%</span>
</div>
</div>
<div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center">
<div>
<p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">You owe</p>
<p class="text-2xl font-black text-slate-900 dark:text-white">$4,200.00</p>
</div>
<div class="text-rose-500 flex flex-col items-end">
<span class="material-symbols-outlined">trending_down</span>
<span class="text-[10px] font-bold">-5%</span>
</div>
</div>
<div class="bg-primary p-4 rounded-2xl shadow-lg shadow-primary/20 flex justify-between items-center">
<div>
<p class="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">Net Balance</p>
<p class="text-2xl font-black text-white">$8,250.00</p>
</div>
<div class="text-white/80 flex flex-col items-end">
<span class="material-symbols-outlined">account_balance_wallet</span>
</div>
</div>
</div>
<section class="space-y-3">
<div class="flex justify-between items-center px-1">
<h3 class="text-sm font-bold">Debt Trends</h3>
<span class="text-[10px] text-slate-400 font-medium">Last 30 days</span>
</div>
<div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
<div class="w-full h-32 relative">
<svg class="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 100">
<path d="M0,80 L50,60 L100,75 L150,40 L200,50 L250,30 L300,20 L350,45 L400,10" fill="none" stroke="#137fec" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
<linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
<stop offset="5%" stop-color="#137fec" stop-opacity="0.15"></stop>
<stop offset="95%" stop-color="#137fec" stop-opacity="0"></stop>
</linearGradient>
<path d="M0,80 L50,60 L100,75 L150,40 L200,50 L250,30 L300,20 L350,45 L400,10 V100 H0 Z" fill="url(#chartGrad)"></path>
</svg>
<div class="flex justify-between mt-2 text-[8px] font-bold text-slate-400 tracking-tighter uppercase">
<span>Week 1</span>
<span>Week 2</span>
<span>Week 3</span>
<span>Week 4</span>
</div>
</div>
</div>
</section>
<div class="grid grid-cols-1 gap-6">
<section class="space-y-3">
<h3 class="text-sm font-bold px-1">Top Debtors</h3>
<div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
<div class="divide-y divide-slate-50 dark:divide-slate-800">
<div class="flex items-center gap-3 p-3">
<div class="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">JD</div>
<div class="flex-1 min-w-0">
<p class="text-sm font-semibold truncate">John Doe</p>
<div class="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1">
<div class="h-full bg-primary rounded-full" style="width: 85%"></div>
</div>
</div>
<div class="text-right">
<p class="text-sm font-bold">$4,500</p>
</div>
</div>
<div class="flex items-center gap-3 p-3">
<div class="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">AS</div>
<div class="flex-1 min-w-0">
<p class="text-sm font-semibold truncate">Alice Smith</p>
<div class="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1">
<div class="h-full bg-primary rounded-full" style="width: 45%"></div>
</div>
</div>
<div class="text-right">
<p class="text-sm font-bold">$2,100</p>
</div>
</div>
</div>
</div>
</section>
<section class="space-y-3">
<h3 class="text-sm font-bold px-1">Top Creditors</h3>
<div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
<div class="divide-y divide-slate-50 dark:divide-slate-800">
<div class="flex items-center gap-3 p-3">
<div class="size-9 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center font-bold text-xs">BC</div>
<div class="flex-1 min-w-0">
<p class="text-sm font-semibold truncate">Bank of Central</p>
<div class="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1">
<div class="h-full bg-rose-500 rounded-full" style="width: 70%"></div>
</div>
</div>
<div class="text-right">
<p class="text-sm font-bold">$2,800</p>
</div>
</div>
<div class="flex items-center gap-3 p-3">
<div class="size-9 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center font-bold text-xs">MK</div>
<div class="flex-1 min-w-0">
<p class="text-sm font-semibold truncate">Marcus King</p>
<div class="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1">
<div class="h-full bg-rose-500 rounded-full" style="width: 25%"></div>
</div>
</div>
<div class="text-right">
<p class="text-sm font-bold">$900</p>
</div>
</div>
</div>
</div>
</section>
</div>
<section class="space-y-3 pb-8">
<h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Currency Breakdown</h3>
<div class="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
<div class="flex-shrink-0 min-w-[120px] bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
<p class="text-[10px] font-bold text-slate-500 mb-1">USD</p>
<p class="text-lg font-black">$6,750</p>
</div>
<div class="flex-shrink-0 min-w-[120px] bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
<p class="text-[10px] font-bold text-slate-500 mb-1">EUR</p>
<p class="text-lg font-black">€1,400</p>
</div>
<div class="flex-shrink-0 min-w-[120px] bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
<p class="text-[10px] font-bold text-slate-500 mb-1">GBP</p>
<p class="text-lg font-black">£100</p>
</div>
</div>
</section>
</main>
<nav class="sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 flex justify-around py-3 px-6">
<button class="flex flex-col items-center gap-1 text-slate-400">
<span class="material-symbols-outlined text-2xl">dashboard</span>
<span class="text-[10px] font-bold">Home</span>
</button>
<button class="flex flex-col items-center gap-1 text-primary">
<span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1">analytics</span>
<span class="text-[10px] font-bold">Reports</span>
</button>
<div class="-mt-8">
<button class="bg-primary text-white p-3 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center">
<span class="material-symbols-outlined text-2xl">add</span>
</button>
</div>
<button class="flex flex-col items-center gap-1 text-slate-400">
<span class="material-symbols-outlined text-2xl">group</span>
<span class="text-[10px] font-bold">People</span>
</button>
<button class="flex flex-col items-center gap-1 text-slate-400">
<span class="material-symbols-outlined text-2xl">settings</span>
<span class="text-[10px] font-bold">Settings</span>
</button>
</nav>
</div>

</body></html>

<!-- Add New Transaction -->
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>Add Transaction - DebtTracker</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#248bf2","tg-bg": "#ffffff",
                        "tg-secondary-bg": "#f4f4f5",
                        "tg-text": "#000000",
                        "tg-hint": "#8e8e93",
                        "tg-button": "#248bf2",
                        "tg-button-text": "#ffffff",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                },
            },
        }
    </script>
<style type="text/tailwindcss">
        body {
            @apply bg-white dark:bg-[#1c1c1d] text-slate-900 dark:text-white antialiased overflow-x-hidden;
        }
        .tg-main-button {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 16px;
            background: linear-gradient(to top, rgba(255,255,255,1) 80%, rgba(255,255,255,0));
            z-index: 50;
        }
        .dark .tg-main-button {
            background: linear-gradient(to top, rgba(28,28,29,1) 80%, rgba(28,28,29,0));
        }
        input:focus, textarea:focus, select:focus {
            outline: none !important;
            box-shadow: none !important;
            border-color: #248bf2 !important;
        }.no-scrollbar::-webkit-scrollbar {
            display: none;
        }
    </style>
</head>
<body class="font-display">
<header class="flex items-center justify-between px-4 py-3 sticky top-0 bg-white dark:bg-[#1c1c1d] z-30">
<button class="text-primary font-medium text-base">Cancel</button>
<h1 class="text-lg font-semibold">New Transaction</h1>
<div class="w-12"></div> 
</header>
<main class="px-4 pb-32">
<div class="mt-4 p-1 bg-slate-100 dark:bg-[#2c2c2e] rounded-xl flex">
<label class="flex-1 relative cursor-pointer">
<input checked="" class="peer hidden" name="tx_type" type="radio" value="owe"/>
<div class="py-2 text-center text-sm font-semibold rounded-lg transition-all peer-checked:bg-white dark:peer-checked:bg-[#636366] peer-checked:shadow-sm text-slate-500 dark:text-slate-400 peer-checked:text-slate-900 dark:peer-checked:text-white">
                    I owe
                </div>
</label>
<label class="flex-1 relative cursor-pointer">
<input class="peer hidden" name="tx_type" type="radio" value="owed"/>
<div class="py-2 text-center text-sm font-semibold rounded-lg transition-all peer-checked:bg-white dark:peer-checked:bg-[#636366] peer-checked:shadow-sm text-slate-500 dark:text-slate-400 peer-checked:text-slate-900 dark:peer-checked:text-white">
                    Owed to me
                </div>
</label>
</div>
<form class="mt-8 space-y-8">
<div class="space-y-2">
<label class="text-[13px] font-medium text-primary uppercase tracking-wider ml-1" for="entity">Who</label>
<div class="relative group">
<input class="w-full text-xl bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 px-1 py-3 focus:border-primary transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600" id="entity" placeholder="Name or group" type="text"/>
<span class="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700">person</span>
</div>
<div class="flex gap-2 pt-1 overflow-x-auto no-scrollbar">
<button class="whitespace-nowrap px-3 py-1.5 bg-slate-100 dark:bg-[#2c2c2e] rounded-full text-xs font-medium" type="button">John Wick</button>
<button class="whitespace-nowrap px-3 py-1.5 bg-slate-100 dark:bg-[#2c2c2e] rounded-full text-xs font-medium" type="button">Sarah Connor</button>
<button class="whitespace-nowrap px-3 py-1.5 bg-slate-100 dark:bg-[#2c2c2e] rounded-full text-xs font-medium" type="button">Office Rent</button>
</div>
</div>
<div class="space-y-2">
<label class="text-[13px] font-medium text-primary uppercase tracking-wider ml-1" for="amount">How much</label>
<div class="flex items-end gap-3 border-b border-slate-200 dark:border-slate-800 focus-within:border-primary transition-colors">
<div class="relative min-w-[70px]">
<select class="appearance-none bg-slate-100 dark:bg-[#2c2c2e] pl-3 pr-8 py-2 rounded-lg text-sm font-bold border-none ring-0 focus:ring-0" id="currency">
<option>USD</option>
<option>EUR</option>
<option>GBP</option>
<option>JPY</option>
</select>
<span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">expand_more</span>
</div>
<input class="w-full text-4xl font-bold bg-transparent border-none p-0 pb-2 focus:ring-0 placeholder:text-slate-200 dark:placeholder:text-slate-800" id="amount" placeholder="0.00" step="0.01" type="number"/>
</div>
</div>
<div class="space-y-2">
<label class="text-[13px] font-medium text-primary uppercase tracking-wider ml-1" for="note">Note</label>
<div class="relative">
<textarea class="w-full text-lg bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 px-1 py-3 focus:border-primary transition-colors resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600" id="note" placeholder="What is this for?" rows="1"></textarea>
<span class="material-symbols-outlined absolute right-1 top-4 text-slate-300 dark:text-slate-700">notes</span>
</div>
</div>
</form>
</main>
<div class="tg-main-button">
<button class="w-full bg-primary py-4 rounded-xl text-white font-bold text-base shadow-lg active:opacity-90 transition-opacity">
            Save Transaction
        </button>
</div>
<div class="h-8"></div>

</body></html>
```

Desktop:
```
<!-- Debt Tracker Dashboard -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Debt Tracker Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                    },
                    fontFamily: {
                        "display": ["Inter"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark min-h-screen text-[#0d141b] dark:text-slate-200">
<div class="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
<div class="layout-container flex h-full grow flex-col">
<!-- Top Navigation Bar -->
<header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7edf3] dark:border-slate-800 px-6 md:px-10 py-3 bg-white dark:bg-slate-900">
<div class="flex items-center gap-8">
<div class="flex items-center gap-4 text-primary">
<div class="size-6">
<svg fill="none" viewbox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<path clip-rule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fill-rule="evenodd"></path>
</svg>
</div>
<h2 class="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">DebtTracker</h2>
</div>
<nav class="hidden md:flex items-center gap-9">
<a class="text-primary text-sm font-semibold leading-normal" href="#">Dashboard</a>
<a class="text-[#4c739a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Debts</a>
<a class="text-[#4c739a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Loans</a>
<a class="text-[#4c739a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Reports</a>
</nav>
</div>
<div class="flex flex-1 justify-end gap-4 md:gap-8">
<label class="hidden sm:flex flex-col min-w-40 !h-10 max-w-64">
<div class="flex w-full flex-1 items-stretch rounded-lg h-full">
<div class="text-[#4c739a] flex border-none bg-[#e7edf3] dark:bg-slate-800 items-center justify-center pl-4 rounded-l-lg border-r-0">
<span class="material-symbols-outlined text-[20px]">search</span>
</div>
<input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141b] dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] dark:bg-slate-800 focus:border-none h-full placeholder:text-[#4c739a] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" placeholder="Search accounts..." value=""/>
</div>
</label>
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20" data-alt="User profile photo avatar" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDQZns5A9FCxlfHqFc88Tjkf4P4LnfC_5tg1GvjRXjXWFUmsKJuzV0i7xlGhevhyK_Pywdr3FdoXeEViOTyuBSGnI-166xgTrfkcRo8xIYxtVKA35asCSVSeB2XLVCuw16wdbbxNynjZ7JE4o-dEiCJ2Kxs57QWYMPRyqOyJ2x9z6na41SqgV1jsWGzk9sR9CpKoZU75_afU1LNQGqdz8loOka9CS2LCGtYOVIgWANxtwZJmRUvBUE3FG5-6avmrhaiMjx6d-P3LEw");'></div>
</div>
</header>
<!-- Main Content Container -->
<main class="flex flex-1 justify-center py-8">
<div class="layout-content-container flex flex-col max-w-[960px] flex-1 px-4 sm:px-10">
<!-- Hero Section -->
<div class="flex flex-col items-center py-10">
<h3 class="text-[#4c739a] dark:text-slate-400 text-base font-medium mb-1">Total Net Debt</h3>
<h1 class="text-[#0d141b] dark:text-white tracking-tight text-[48px] font-extrabold leading-tight text-center">
                            $12,450.00
                        </h1>
</div>
<!-- Quick Actions -->
<div class="flex justify-center mb-10">
<div class="flex flex-1 gap-4 flex-wrap max-w-[480px] justify-center">
<button class="flex min-w-[140px] flex-1 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-14 px-6 bg-primary text-white text-base font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]">
<span class="material-symbols-outlined">add_circle</span>
<span class="truncate">Add Debt</span>
</button>
<button class="flex min-w-[140px] flex-1 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-14 px-6 bg-[#e7edf3] dark:bg-slate-800 text-[#0d141b] dark:text-white text-base font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]">
<span class="material-symbols-outlined">payments</span>
<span class="truncate">Add Loan</span>
</button>
</div>
</div>
<!-- Stats Overview -->
<div class="flex flex-wrap gap-6 mb-12">
<div class="flex min-w-[240px] flex-1 flex-col gap-2 rounded-xl p-8 bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[#078838]">arrow_downward</span>
<p class="text-[#4c739a] dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Owed to Me</p>
</div>
<p class="text-[#0d141b] dark:text-white tracking-light text-3xl font-bold leading-tight">$15,200.00</p>
<p class="text-[#078838] text-sm font-bold flex items-center gap-1">
<span class="material-symbols-outlined text-[18px]">trending_up</span>
                                +5.2% <span class="font-normal text-slate-500">this month</span>
</p>
</div>
<div class="flex min-w-[240px] flex-1 flex-col gap-2 rounded-xl p-8 bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[#e73908]">arrow_upward</span>
<p class="text-[#4c739a] dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">I Owe</p>
</div>
<p class="text-[#0d141b] dark:text-white tracking-light text-3xl font-bold leading-tight">$2,750.00</p>
<p class="text-[#e73908] text-sm font-bold flex items-center gap-1">
<span class="material-symbols-outlined text-[18px]">trending_down</span>
                                -2.1% <span class="font-normal text-slate-500">this month</span>
</p>
</div>
</div>
<!-- Recent Transactions Section -->
<div class="flex flex-col gap-4">
<div class="flex items-center justify-between px-2">
<h2 class="text-[#0d141b] dark:text-white text-xl font-bold">Recent Activity</h2>
<button class="text-primary text-sm font-semibold hover:underline">View All</button>
</div>
<div class="bg-white dark:bg-slate-900 rounded-xl border border-[#cfdbe7] dark:border-slate-800 overflow-hidden shadow-sm">
<!-- Transaction Item 1 -->
<div class="flex items-center justify-between p-4 border-b border-[#e7edf3] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<div class="flex items-center gap-4">
<div class="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">person</span>
</div>
<div>
<p class="text-[#0d141b] dark:text-white font-semibold">Alex Thompson</p>
<p class="text-[#4c739a] dark:text-slate-400 text-xs">Personal Loan • Yesterday</p>
</div>
</div>
<div class="text-right">
<p class="text-[#078838] font-bold">+$1,200.00</p>
<span class="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/20 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400 uppercase">Received</span>
</div>
</div>
<!-- Transaction Item 2 -->
<div class="flex items-center justify-between p-4 border-b border-[#e7edf3] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<div class="flex items-center gap-4">
<div class="size-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
<span class="material-symbols-outlined">shopping_cart</span>
</div>
<div>
<p class="text-[#0d141b] dark:text-white font-semibold">Best Buy Electronics</p>
<p class="text-[#4c739a] dark:text-slate-400 text-xs">Credit Card Debt • Oct 12</p>
</div>
</div>
<div class="text-right">
<p class="text-[#e73908] font-bold">-$450.00</p>
<span class="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/20 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase">Pending</span>
</div>
</div>
<!-- Transaction Item 3 -->
<div class="flex items-center justify-between p-4 border-b border-[#e7edf3] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<div class="flex items-center gap-4">
<div class="size-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
<span class="material-symbols-outlined">home</span>
</div>
<div>
<p class="text-[#0d141b] dark:text-white font-semibold">Mortgage Payment</p>
<p class="text-[#4c739a] dark:text-slate-400 text-xs">Bank Transfer • Oct 10</p>
</div>
</div>
<div class="text-right">
<p class="text-[#0d141b] dark:text-white font-bold">-$2,100.00</p>
<span class="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/20 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">Paid</span>
</div>
</div>
<!-- Transaction Item 4 -->
<div class="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<div class="flex items-center gap-4">
<div class="size-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
<span class="material-symbols-outlined">handshake</span>
</div>
<div>
<p class="text-[#0d141b] dark:text-white font-semibold">Sarah Jenkins</p>
<p class="text-[#4c739a] dark:text-slate-400 text-xs">Informal Loan • Oct 08</p>
</div>
</div>
<div class="text-right">
<p class="text-[#078838] font-bold">+$250.00</p>
<span class="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/20 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400 uppercase">Received</span>
</div>
</div>
</div>
</div>
<!-- Footer / Helper -->
<footer class="mt-16 text-center text-[#4c739a] dark:text-slate-500 text-sm pb-10">
<p>© 2023 DebtTracker Inc. All your financial data is encrypted and secure.</p>
<div class="flex justify-center gap-4 mt-2 font-medium">
<a class="hover:text-primary" href="#">Privacy Policy</a>
<span>•</span>
<a class="hover:text-primary" href="#">Terms of Service</a>
<span>•</span>
<a class="hover:text-primary" href="#">Help Center</a>
</div>
</footer>
</div>
</main>
</div>
</div>
</body></html>

<!-- Debt & Loan Reports -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>DebtTracker - Reports</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                    },
                    fontFamily: {
                        "display": ["Inter"]
                    },
                    borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                },
            },
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
<div class="flex flex-col w-full">
<!-- Top Navigation -->
<header class="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-20 py-3 sticky top-0 z-50">
<div class="max-w-[1200px] mx-auto flex items-center justify-between">
<div class="flex items-center gap-8">
<div class="flex items-center gap-2">
<div class="text-primary">
<span class="material-symbols-outlined text-3xl">payments</span>
</div>
<h2 class="text-lg font-black tracking-tight">DebtTracker</h2>
</div>
<nav class="hidden md:flex items-center gap-6">
<a class="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Dashboard</a>
<a class="text-sm font-bold text-primary border-b-2 border-primary pb-1" href="#">Reports</a>
<a class="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Entities</a>
<a class="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Settings</a>
</nav>
</div>
<div class="flex items-center gap-4">
<div class="relative hidden sm:block">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
<input class="w-64 pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50" placeholder="Search reports..."/>
</div>
<div class="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center" data-alt="User profile avatar circle" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuC2T2MKWLy3JmDyDiZWFiRi3LCjs4qZcuxYzIvSDa8xaYzkBbjbezNoxnxZ5kf63TWMPrW1KV6a7gGIVE3yaABMg9dOWYfWua5I5dbrVR9CTxlvH60L_S_lRDn6BfI_XIebGbmDUJ0hQOQFrRr5ydd50YsE251NMBH6H-kowOIoWEFMvphXUns5YUuPbmjSG2nfOgrGE4VqNvs2cBk_pBm6Fap6r58Ucq__AR-C-u4y3PCnngLjG_nsh4E_he5X6hCP59yfpcAFC48");'></div>
</div>
</div>
</header>
<main class="max-w-[1200px] mx-auto w-full px-4 md:px-20 py-8 space-y-8">
<!-- Page Heading -->
<div class="flex flex-wrap justify-between items-end gap-4">
<div class="space-y-1">
<h1 class="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Financial Insights</h1>
<p class="text-slate-500 dark:text-slate-400">Analyze your debts and loans across multiple currencies.</p>
</div>
<div class="flex gap-3">
<button class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
<span class="material-symbols-outlined text-lg">download</span>
<span>Export Report</span>
</button>
<button class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
<span class="material-symbols-outlined text-lg">add</span>
<span>New Entry</span>
</button>
</div>
</div>
<!-- Tabs Navigation -->
<div class="border-b border-slate-200 dark:border-slate-800">
<div class="flex gap-8">
<a class="pb-4 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Today</a>
<a class="pb-4 text-sm font-bold text-primary border-b-2 border-primary" href="#">Current Month</a>
<a class="pb-4 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Date Range</a>
</div>
</div>
<!-- Stats Overview -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
<p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Owed to You</p>
<p class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">$12,450.00</p>
<div class="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
<span class="material-symbols-outlined text-sm">trending_up</span>
<span>+12% from last month</span>
</div>
</div>
<div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
<p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total You Owe</p>
<p class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">-$4,200.00</p>
<div class="flex items-center gap-1 mt-2 text-rose-600 dark:text-rose-400 text-sm font-bold">
<span class="material-symbols-outlined text-sm">trending_down</span>
<span>-5% from last month</span>
</div>
</div>
<div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
<p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Net Balance</p>
<p class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">$8,250.00</p>
<div class="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
<span class="material-symbols-outlined text-sm">trending_up</span>
<span>+18% from last month</span>
</div>
</div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
<!-- Trend Chart Placeholder -->
<div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
<div class="flex justify-between items-center mb-8">
<h3 class="text-lg font-bold">Debt Trends</h3>
<div class="flex gap-2">
<span class="flex items-center gap-1 text-xs font-medium text-slate-500">
<span class="h-2 w-2 rounded-full bg-primary"></span> Receivables
                            </span>
<span class="flex items-center gap-1 text-xs font-medium text-slate-500">
<span class="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600"></span> Payables
                            </span>
</div>
</div>
<!-- Minimalist line chart simulation with svg -->
<div class="w-full h-64 relative">
<svg class="w-full h-full overflow-visible" viewbox="0 0 800 200">
<!-- Grid lines -->
<line class="stroke-slate-100 dark:stroke-slate-800" stroke-width="1" x1="0" x2="800" y1="0" y2="0"></line>
<line class="stroke-slate-100 dark:stroke-slate-800" stroke-width="1" x1="0" x2="800" y1="50" y2="50"></line>
<line class="stroke-slate-100 dark:stroke-slate-800" stroke-width="1" x1="0" x2="800" y1="100" y2="100"></line>
<line class="stroke-slate-100 dark:stroke-slate-800" stroke-width="1" x1="0" x2="800" y1="150" y2="150"></line>
<line class="stroke-slate-100 dark:stroke-slate-800" stroke-width="1" x1="0" x2="800" y1="200" y2="200"></line>
<!-- Area/Line Chart Path -->
<path d="M0,150 L100,120 L200,160 L300,80 L400,100 L500,60 L600,40 L700,90 L800,20" fill="none" stroke="#137fec" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
<!-- Area fill gradient -->
<lineargradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
<stop offset="5%" stop-color="#137fec" stop-opacity="0.1"></stop>
<stop offset="95%" stop-color="#137fec" stop-opacity="0"></stop>
</lineargradient>
<path d="M0,150 L100,120 L200,160 L300,80 L400,100 L500,60 L600,40 L700,90 L800,20 V200 H0 Z" fill="url(#chartGradient)"></path>
</svg>
<div class="flex justify-between mt-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
<span>Week 1</span>
<span>Week 2</span>
<span>Week 3</span>
<span>Week 4</span>
</div>
</div>
</div>
<!-- Calendar/DatePicker Side -->
<div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
<div class="flex items-center justify-between mb-4">
<button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
<span class="material-symbols-outlined text-lg">chevron_left</span>
</button>
<p class="font-bold">October 2023</p>
<button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
<span class="material-symbols-outlined text-lg">chevron_right</span>
</button>
</div>
<div class="grid grid-cols-7 gap-1 text-center mb-2">
<span class="text-[10px] font-bold text-slate-400">S</span>
<span class="text-[10px] font-bold text-slate-400">M</span>
<span class="text-[10px] font-bold text-slate-400">T</span>
<span class="text-[10px] font-bold text-slate-400">W</span>
<span class="text-[10px] font-bold text-slate-400">T</span>
<span class="text-[10px] font-bold text-slate-400">F</span>
<span class="text-[10px] font-bold text-slate-400">S</span>
</div>
<div class="grid grid-cols-7 gap-1">
<!-- Simplified Calendar Grid -->
<div class="h-10 flex items-center justify-center text-sm"></div>
<div class="h-10 flex items-center justify-center text-sm"></div>
<div class="h-10 flex items-center justify-center text-sm">1</div>
<div class="h-10 flex items-center justify-center text-sm">2</div>
<div class="h-10 flex items-center justify-center text-sm">3</div>
<div class="h-10 flex items-center justify-center text-sm">4</div>
<div class="h-10 flex items-center justify-center text-sm bg-primary text-white rounded-lg font-bold">5</div>
<div class="h-10 flex items-center justify-center text-sm bg-primary/10 rounded-lg">6</div>
<div class="h-10 flex items-center justify-center text-sm bg-primary/10 rounded-lg">7</div>
<div class="h-10 flex items-center justify-center text-sm bg-primary/10 rounded-lg">8</div>
<div class="h-10 flex items-center justify-center text-sm bg-primary/10 rounded-lg">9</div>
<div class="h-10 flex items-center justify-center text-sm bg-primary/10 rounded-lg">10</div>
<div class="h-10 flex items-center justify-center text-sm bg-primary/10 rounded-lg">11</div>
<div class="h-10 flex items-center justify-center text-sm bg-primary/10 rounded-lg font-bold">12</div>
<div class="h-10 flex items-center justify-center text-sm">13</div>
<div class="h-10 flex items-center justify-center text-sm">14</div>
<div class="h-10 flex items-center justify-center text-sm">15</div>
<div class="h-10 flex items-center justify-center text-sm">16</div>
<div class="h-10 flex items-center justify-center text-sm">17</div>
<div class="h-10 flex items-center justify-center text-sm">18</div>
<div class="h-10 flex items-center justify-center text-sm">19</div>
<div class="h-10 flex items-center justify-center text-sm">20</div>
<div class="h-10 flex items-center justify-center text-sm">21</div>
<div class="h-10 flex items-center justify-center text-sm">22</div>
<div class="h-10 flex items-center justify-center text-sm">23</div>
<div class="h-10 flex items-center justify-center text-sm">24</div>
<div class="h-10 flex items-center justify-center text-sm">25</div>
<div class="h-10 flex items-center justify-center text-sm">26</div>
<div class="h-10 flex items-center justify-center text-sm">27</div>
<div class="h-10 flex items-center justify-center text-sm">28</div>
<div class="h-10 flex items-center justify-center text-sm">29</div>
<div class="h-10 flex items-center justify-center text-sm">30</div>
<div class="h-10 flex items-center justify-center text-sm">31</div>
</div>
</div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
<!-- Tops Section: Debtors -->
<div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
<div class="flex justify-between items-center mb-6">
<h3 class="text-lg font-bold">Top Debtors</h3>
<span class="text-xs font-bold text-primary uppercase">Who owes you most</span>
</div>
<div class="space-y-6">
<div class="flex items-center gap-4">
<div class="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">JD</div>
<div class="flex-1 space-y-2">
<div class="flex justify-between text-sm font-bold">
<span>John Doe</span>
<span>$4,500.00</span>
</div>
<div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
<div class="h-full bg-primary" style="width: 85%"></div>
</div>
</div>
</div>
<div class="flex items-center gap-4">
<div class="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">AS</div>
<div class="flex-1 space-y-2">
<div class="flex justify-between text-sm font-bold">
<span>Alice Smith</span>
<span>$2,100.00</span>
</div>
<div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
<div class="h-full bg-primary" style="width: 45%"></div>
</div>
</div>
</div>
<div class="flex items-center gap-4">
<div class="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">ML</div>
<div class="flex-1 space-y-2">
<div class="flex justify-between text-sm font-bold">
<span>Modern Logistics Inc.</span>
<span>€1,800.00</span>
</div>
<div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
<div class="h-full bg-primary" style="width: 38%"></div>
</div>
</div>
</div>
</div>
</div>
<!-- Tops Section: Creditors -->
<div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
<div class="flex justify-between items-center mb-6">
<h3 class="text-lg font-bold">Top Creditors</h3>
<span class="text-xs font-bold text-rose-500 uppercase">Who you owe most</span>
</div>
<div class="space-y-6">
<div class="flex items-center gap-4">
<div class="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">BC</div>
<div class="flex-1 space-y-2">
<div class="flex justify-between text-sm font-bold">
<span>Bank of Central</span>
<span>$2,800.00</span>
</div>
<div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
<div class="h-full bg-rose-500" style="width: 70%"></div>
</div>
</div>
</div>
<div class="flex items-center gap-4">
<div class="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">MK</div>
<div class="flex-1 space-y-2">
<div class="flex justify-between text-sm font-bold">
<span>Marcus King</span>
<span>$900.00</span>
</div>
<div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
<div class="h-full bg-rose-500" style="width: 25%"></div>
</div>
</div>
</div>
<div class="flex items-center gap-4">
<div class="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">EL</div>
<div class="flex-1 space-y-2">
<div class="flex justify-between text-sm font-bold">
<span>Edison Lighting</span>
<span>$500.00</span>
</div>
<div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
<div class="h-full bg-rose-500" style="width: 15%"></div>
</div>
</div>
</div>
</div>
</div>
</div>
<!-- Currency Summary Footer -->
<div class="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
<h4 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Currency Breakdown</h4>
<div class="flex flex-wrap gap-12">
<div class="space-y-1">
<p class="text-xs font-bold text-slate-400">USD</p>
<p class="text-xl font-black">$6,750.00</p>
</div>
<div class="space-y-1">
<p class="text-xs font-bold text-slate-400">EUR</p>
<p class="text-xl font-black">€1,400.00</p>
</div>
<div class="space-y-1">
<p class="text-xs font-bold text-slate-400">GBP</p>
<p class="text-xl font-black">£100.00</p>
</div>
</div>
</div>
</main>
<!-- Footer -->
<footer class="max-w-[1200px] mx-auto w-full px-4 md:px-20 py-10 text-center">
<p class="text-sm text-slate-400 font-medium">© 2023 DebtTracker. All rights reserved.</p>
</footer>
</div>
</body></html>

<!-- Add New Transaction -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Add New Transaction - DebtTracker</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                    },
                    fontFamily: {
                        "display": ["Inter"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style>body {
    font-family: "Inter", sans-serif
    }
.currency-select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url(https://lh3.googleusercontent.com/aida-public/AB6AXuDQHdc-My0iWO-crQS4ZcbVVSpWXOyBhfryN8TvqxW5PN2n7j9RK-MhJtv0O4giw4vDPOcULqw8M1nppLRoNjEg8GwzLzaZk-_t4tvO0rH6vkeGovnPZY29RQR_KJiNcPQUnbhTkLP_QHt_k2iuxJxOcdgVKKb6DH7RJslB9XgZuQqgbK_lNkULTdHAQUvxJSaz0IMuSL9oXDPXXvQeM0xHSa3nDkkMjovLvt-y7qaNvVMHNcbux3ZrMhirJpxeYL_F7UkbcPjk5SA);
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1.5em 1.5em
    }</style>
</head>
<body class="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 font-display transition-colors duration-200">
<!-- Top Navigation Bar -->
<header class="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-10 py-3">
<div class="max-w-[1200px] mx-auto flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
<span class="material-symbols-outlined text-xl">account_balance_wallet</span>
</div>
<h1 class="text-lg font-bold tracking-tight">DebtTracker</h1>
</div>
<nav class="hidden md:flex items-center gap-8">
<a class="text-sm font-medium hover:text-primary transition-colors" href="#">Dashboard</a>
<a class="text-sm font-medium hover:text-primary transition-colors" href="#">Transactions</a>
<a class="text-sm font-medium hover:text-primary transition-colors" href="#">Contacts</a>
<a class="text-sm font-medium hover:text-primary transition-colors" href="#">Settings</a>
</nav>
<div class="flex items-center gap-4">
<div class="size-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-slate-100 dark:border-slate-800">
<img class="w-full h-full object-cover" data-alt="User profile avatar smiling" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGYhsutCfSq2BoKaN8V2UheMx_eVrqqKABGWBYUnuOkS7S5n8ZnoEOzzId1qjwvf4sxV_8CLseatagBS1bP1I_1HaCyPM_IbJWbBAnvlkG5gTZwUrhwpKZjGZC4OYxyXT7war3JZjp9xB6VMtDtP0VLwtnVix47oDeLlc7aHJNW8mzjsSH_07otw8AdCXUs7qCcwjF3deE97eMcdmUjNETgDkghnaUKjJYYtEggzW8VxNPP-oBQmBMosBq8zvc47jiZ8Bz0Yn1iE4"/>
</div>
</div>
</div>
</header>
<main class="max-w-[640px] mx-auto px-4 py-8 md:py-12">
<!-- Page Heading -->
<div class="mb-8">
<h2 class="text-3xl font-bold tracking-tight mb-2">Add New Transaction</h2>
<p class="text-slate-500 dark:text-slate-400">Record a new debt or loan effortlessly.</p>
</div>
<!-- Transaction Form Card -->
<div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
<form class="flex flex-col gap-6">
<!-- Transaction Type (Segmented Buttons) -->
<div class="flex flex-col gap-2">
<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Transaction Type</span>
<div class="flex h-12 w-full items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
<label class="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-4 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm has-[:checked]:text-primary text-slate-500 dark:text-slate-400 text-sm font-semibold transition-all">
<span class="flex items-center gap-2">
<span class="material-symbols-outlined text-lg">call_made</span>
                                I owe
                            </span>
<input checked="" class="invisible w-0" name="tx_type" type="radio" value="owe"/>
</label>
<label class="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-4 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm has-[:checked]:text-primary text-slate-500 dark:text-slate-400 text-sm font-semibold transition-all">
<span class="flex items-center gap-2">
<span class="material-symbols-outlined text-lg">call_received</span>
                                Owed to me
                            </span>
<input class="invisible w-0" name="tx_type" type="radio" value="owed"/>
</label>
</div>
</div>
<!-- Entity / Person -->
<div class="flex flex-col gap-2">
<label class="text-sm font-medium text-slate-700 dark:text-slate-300" for="entity">Who?</label>
<div class="relative">
<input class="w-full h-14 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600" id="entity" name="entity" placeholder="e.g., John Doe or Amazon" type="text"/>
<span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
</div>
</div>
<!-- Amount and Currency -->
<div class="flex flex-col md:flex-row gap-4">
<div class="flex flex-col gap-2 flex-1">
<label class="text-sm font-medium text-slate-700 dark:text-slate-300" for="amount">How much?</label>
<input class="w-full h-14 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600" id="amount" name="amount" placeholder="0.00" type="number"/>
</div>
<div class="flex flex-col gap-2 w-full md:w-32">
<label class="text-sm font-medium text-slate-700 dark:text-slate-300" for="currency">Currency</label>
<select class="currency-select w-full h-14 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-900 dark:text-slate-100" id="currency" name="currency">
<option value="USD">USD</option>
<option value="EUR">EUR</option>
<option value="GBP">GBP</option>
<option value="JPY">JPY</option>
<option value="CAD">CAD</option>
</select>
</div>
</div>
<!-- Note -->
<div class="flex flex-col gap-2">
<label class="text-sm font-medium text-slate-700 dark:text-slate-300" for="note">What for? (Optional)</label>
<textarea class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none" id="note" name="note" placeholder="e.g., Dinner, Office Supplies" rows="2"></textarea>
</div>
<!-- Action Buttons -->
<div class="flex flex-col md:flex-row gap-3 pt-4 mt-2">
<button class="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-md shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2" type="submit">
<span class="material-symbols-outlined">check_circle</span>
                        Save Transaction
                    </button>
<button class="flex-1 h-14 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-all active:scale-[0.98]" type="button">
                        Cancel
                    </button>
</div>
</form>
</div>
<!-- Shortcut Tip -->
<div class="mt-10 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-500 text-xs uppercase tracking-widest font-semibold">
<span class="material-symbols-outlined text-sm">keyboard</span>
<span>Press Enter to Save • ESC to Cancel</span>
</div>
</main>
<footer class="w-full py-8 text-center text-slate-400 dark:text-slate-600 text-sm">
<p>© 2023 DebtTracker Inc. Fast. Simple. Secure.</p>
</footer>
</body></html>
```