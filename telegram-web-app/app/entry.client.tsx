import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';
import { TOKEN_STORAGE_KEY } from '~/lib/telegram-auth';

async function prepareApp() {
  if (import.meta.env.VITE_MOCK === 'true') {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });

    // Auto-set a valid mock JWT so we skip login
    if (!sessionStorage.getItem(TOKEN_STORAGE_KEY)) {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: 1,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      }));
      const signature = btoa('mock-signature');
      sessionStorage.setItem(TOKEN_STORAGE_KEY, `${header}.${payload}.${signature}`);
    }
  }
}

prepareApp().then(() => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>,
    );
  });
});
