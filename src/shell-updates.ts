export function observeShellUpdates(
  container: ServiceWorkerContainer,
  reload: () => void,
): void {
  let controlled = Boolean(container.controller);
  let pending: ServiceWorker | null = null;
  let reloading = false;
  const clear = () => {
    pending?.removeEventListener('statechange', inspect);
    pending = null;
  };
  const inspect = () => {
    if (!pending) return;
    if (container.controller !== pending || pending.state === 'redundant') {
      clear();
    } else if (pending.state === 'activated') {
      clear();
      reloading = true;
      reload();
    }
  };
  container.addEventListener('controllerchange', () => {
    clear();
    if (controlled && !reloading && container.controller) {
      // clients.claim() can notify the document while activation is still in
      // progress. Reloading then can strand WebKit's replacement document with
      // an activating controller. Wait for this controller to finish first.
      pending = container.controller;
      pending.addEventListener('statechange', inspect);
      inspect();
    }
    controlled = Boolean(container.controller);
  });
}
