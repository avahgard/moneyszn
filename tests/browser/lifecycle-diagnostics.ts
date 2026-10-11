import { test } from '@playwright/test';

// Opt-in investigation only; never included in the production bundle.
test.beforeEach(async ({ page }) => {
  if (!process.env.CI01_DIAGNOSTICS) return;
  page.on('console', (message) => console.log('CI01 console', message.text()));
  page.on('pageerror', (error) => console.log('CI01 pageerror', error.message));
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) console.log('CI01 navigation', frame.url());
  });
  await page.addInitScript(() => {
    const id = `${Date.now()}-${Math.random()}`;
    const container = navigator.serviceWorker;
    if (!container) return;
    const worker = (value: ServiceWorker | null) =>
      value && { url: value.scriptURL, state: value.state };
    const emit = (event: string, registration?: ServiceWorkerRegistration) =>
      console.log(
        'CI01',
        JSON.stringify({
          id,
          time: performance.now(),
          event,
          readyState: document.readyState,
          visibility: document.visibilityState,
          build: document.getElementById('build')?.textContent,
          status: document.getElementById('offline-shell')?.textContent,
          controller: worker(container.controller),
          installing: registration && worker(registration.installing),
          waiting: registration && worker(registration.waiting),
          active: registration && worker(registration.active),
        }),
      );
    let current: ServiceWorkerRegistration | undefined;
    const seen = new Set<ServiceWorker>();
    const observe = (registration: ServiceWorkerRegistration) => {
      current = registration;
      for (const value of [
        registration.installing,
        registration.waiting,
        registration.active,
      ]) {
        if (value && !seen.has(value)) {
          seen.add(value);
          value.addEventListener('statechange', () => {
            emit(`statechange:${value.state}`, registration);
            observe(registration);
          });
        }
      }
    };
    const register = container.register.bind(container);
    container.register = async (...args) => {
      emit('register:start');
      try {
        const registration = await register(...args);
        emit('register:resolved', registration);
        observe(registration);
        registration.addEventListener('updatefound', () => {
          emit('updatefound', registration);
          observe(registration);
        });
        const update = registration.update.bind(registration);
        registration.update = async () => {
          emit('update:start', registration);
          try {
            const result = await update();
            emit('update:resolved', registration);
            return result;
          } catch (error) {
            emit(`update:rejected:${String(error)}`, registration);
            throw error;
          }
        };
        return registration;
      } catch (error) {
        emit(`register:rejected:${String(error)}`);
        throw error;
      }
    };
    container.addEventListener('controllerchange', () =>
      emit('controllerchange', current),
    );
    window.addEventListener('pageshow', () => emit('pageshow', current));
    document.addEventListener('visibilitychange', () =>
      emit('visibilitychange', current),
    );
    window.setInterval(() => {
      emit('snapshot', current);
      // An independent lookup distinguishes a stuck register promise from no registration.
      void container.getRegistration().then((registration) => {
        emit('getRegistration:resolved', registration);
        if (registration) observe(registration);
      });
    }, 1_000);
    emit('document:start');
  });
});
