import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { generateWorker } from '../../scripts/service-worker.ts';

const config = {
  base: '/moneyszn/',
  prefix: 'moneyszn-shell-v1-',
  cacheName: 'moneyszn-shell-v1-new',
  assets: ['/moneyszn/index.html', '/moneyszn/assets/app.js'],
};
type WorkerEvent = {
  waitUntil: (work: Promise<void>) => void;
  request?: object;
  respondWith?: (work: Promise<Response>) => void;
};

function harness(failInstall = false) {
  const listeners = new Map<string, (event: WorkerEvent) => void>();
  const cachedShell = new Response('cached shell');
  const cache = {
    addAll: vi.fn(async (requests: Request[]) => {
      if (requests.length === 0) throw new Error('empty precache');
      if (failInstall) throw new Error('asset unavailable');
    }),
    match: vi.fn(async () => cachedShell),
  };
  const caches = {
    open: vi.fn(async () => cache),
    keys: vi.fn(async () => [
      'other-app',
      'moneyszn-shell-v1-old',
      config.cacheName,
    ]),
    delete: vi.fn(async () => true),
  };
  const self = {
    location: { origin: 'https://example.test' },
    addEventListener: (name: string, callback: (event: WorkerEvent) => void) =>
      listeners.set(name, callback),
    skipWaiting: vi.fn(async () => {}),
    clients: { claim: vi.fn(async () => {}) },
  };
  // Requests in a worker resolve relative URLs against the worker's origin.
  class WorkerRequest extends Request {
    constructor(url: string, init: RequestInit) {
      super(new URL(url, self.location.origin), init);
    }
  }
  runInNewContext(generateWorker(config), {
    self,
    caches,
    Request: WorkerRequest,
    Response,
    URL,
    fetch: vi.fn(async () => {
      throw new Error('offline');
    }),
  });
  async function lifecycle(name: string) {
    let work: Promise<void> | undefined;
    listeners.get(name)?.({
      waitUntil: (promise) => {
        work = promise;
      },
    });
    await work;
  }
  return { listeners, cache, caches, self, lifecycle, cachedShell };
}

describe('offline shell lifecycle', () => {
  it('precaches every required asset before replacing the worker', async () => {
    const h = harness();
    await h.lifecycle('install');
    const requests = h.cache.addAll.mock.calls[0]?.[0];
    if (!requests) throw new Error('precache was not called');
    expect(requests.map((request) => new URL(request.url).pathname)).toEqual(
      config.assets,
    );
    expect(requests.every((request) => request.cache === 'reload')).toBe(true);
    expect(h.self.skipWaiting).toHaveBeenCalledOnce();
  });
  it('failed installation removes the partial candidate and never activates it', async () => {
    const h = harness(true);
    await expect(h.lifecycle('install')).rejects.toThrow('asset unavailable');
    expect(h.caches.delete).toHaveBeenCalledWith(config.cacheName);
    expect(h.self.skipWaiting).not.toHaveBeenCalled();
  });
  it('activation retires only older MoneySZN shell caches', async () => {
    const h = harness();
    await h.lifecycle('activate');
    expect(h.caches.delete.mock.calls).toEqual([['moneyszn-shell-v1-old']]);
    expect(h.self.clients.claim).toHaveBeenCalledOnce();
  });
  it('falls back to the installed shell for offline navigation', async () => {
    const h = harness();
    let work: Promise<Response> | undefined;
    h.listeners.get('fetch')?.({
      waitUntil: () => {},
      request: {
        url: 'https://example.test/moneyszn/',
        method: 'GET',
        mode: 'navigate',
      },
      respondWith: (promise) => {
        work = promise;
      },
    });
    expect(await (await work)?.text()).toBe('cached shell');
    expect(h.cache.match).toHaveBeenCalledWith('/moneyszn/index.html');
  });
  it.each([
    ['https://example.test/another-app/', 'GET', 'navigate'],
    ['https://other.test/moneyszn/index.html', 'GET', 'navigate'],
    ['https://example.test/moneyszn/missing.js', 'GET', 'cors'],
    ['https://example.test/moneyszn/', 'POST', 'navigate'],
  ])('leaves unrelated requests to the browser: %s', (url, method, mode) => {
    const h = harness();
    const respondWith = vi.fn();
    h.listeners.get('fetch')?.({
      waitUntil: () => {},
      request: { url, method, mode },
      respondWith,
    });
    expect(respondWith).not.toHaveBeenCalled();
  });
});
