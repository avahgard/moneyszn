import './style.css';

declare const __APP_VERSION__: string;
declare const __BUILD_ID__: string;

function element(id: string): HTMLElement {
  const result = document.getElementById(id);
  if (!result) throw new Error(`Missing status element: ${id}`);
  return result;
}

element('build').textContent = `${__APP_VERSION__} / ${__BUILD_ID__}`;
function updateConnectivity(): void {
  element('connectivity').textContent = navigator.onLine ? 'Online' : 'Offline';
}
updateConnectivity();
window.addEventListener('online', updateConnectivity);
window.addEventListener('offline', updateConnectivity);

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
    await navigator.serviceWorker.ready;
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
