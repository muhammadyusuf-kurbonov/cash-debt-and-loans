import { init } from '@tma.js/sdk-react';

// `init()` attaches the Telegram WebApp script and is not idempotent; running it
// on every render is pure overhead, and running it twice is worse than that.
//
// The guard has to live in a module that is evaluated exactly once for the whole
// app. React Router 7 SPA mode lazy-loads each route as its own module, so a
// module-level flag declared inside a route file is `false` again the moment the
// user navigates to a route that has never been loaded — `/home` → `/contacts`
// would call `init()` a second time. Keep this the single owner of that state.
let telegramInitialised = false;

export function ensureTelegramInitialised() {
  if (telegramInitialised) return;
  telegramInitialised = true;
  init();
}
