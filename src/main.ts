import './style.css';

declare const __APP_VERSION__: string;
declare const __BUILD_ID__: string;

function element(id: string): HTMLElement {
  const result = document.getElementById(id);
  if (!result) throw new Error(`Missing status element: ${id}`);
  return result;
}

element('build').textContent = `${__APP_VERSION__} / ${__BUILD_ID__}`;
function updateConnectivity(online: boolean): void {
  const status = element('connectivity');
  const text = online ? 'Online' : 'Offline';
  if (status.textContent !== text) status.textContent = text;
}
updateConnectivity(navigator.onLine);
window.addEventListener('online', () => updateConnectivity(true));
window.addEventListener('offline', () => updateConnectivity(false));
document.addEventListener('visibilitychange', () =>
  updateConnectivity(navigator.onLine),
);
window.addEventListener('pageshow', () => updateConnectivity(navigator.onLine));
// Firefox can miss a reconnect event after offline worker-served navigation.
// Read only the local browser flag; do not probe servers or repeatedly announce
// unchanged status. Hidden pages refresh when they become visible again.
window.setInterval(() => {
  if (!document.hidden) updateConnectivity(navigator.onLine);
}, 1_000);

function waitForShellActivation(
  registration: ServiceWorkerRegistration,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const observed = new Set<ServiceWorker>();
    const finish = (error?: Error) => {
      registration.removeEventListener('updatefound', inspect);
      for (const worker of observed)
        worker.removeEventListener('statechange', inspect);
      if (error) reject(error);
      else resolve();
    };
    const inspect = () => {
      const workers = [
        registration.installing,
        registration.waiting,
        registration.active,
      ].filter((worker): worker is ServiceWorker => worker !== null);
      for (const worker of workers) {
        if (!observed.has(worker)) {
          observed.add(worker);
          worker.addEventListener('statechange', inspect);
        }
      }
      if (registration.active?.state === 'activated') finish();
      else if (workers.every((worker) => worker.state === 'redundant')) {
        // Includes a failed candidate already removed before register resolved.
        finish(new Error('Offline shell installation failed'));
      }
    };
    registration.addEventListener('updatefound', inspect);
    // Read states after subscribing: activation/failure may have already happened.
    inspect();
  });
}

async function installOfflineShell(): Promise<void> {
  const status = element('offline-shell');
  if (!('serviceWorker' in navigator)) {
    status.textContent = 'Unavailable in this browser';
    return;
  }
  // An existing controlled page reloads once the replacement shell is active.
  // Initial installation does not reload and disrupt the first visit.
  let controlled = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (controlled) window.location.reload();
    controlled = true;
  });
  try {
    const registration = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}sw.js`,
      { scope: import.meta.env.BASE_URL, updateViaCache: 'none' },
    );
    await waitForShellActivation(registration);
    status.textContent = 'Ready for offline use';
    // Check on each online visit, including an already-controlled page.
    if (navigator.onLine) await registration.update();
  } catch {
    status.textContent =
      'Installation or update failed; reconnect and reload to retry';
  }
}

if (import.meta.env.PROD) void installOfflineShell();
else element('offline-shell').textContent = 'Production build only';
