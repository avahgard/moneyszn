import { test, expect } from '@playwright/test';
import { createServer, request, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createPreviewServer } from '../../scripts/preview-server.mjs';

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

for (const lateRegistration of [false, true]) {
  test(`failed first precache reports retry guidance and recovers${lateRegistration ? ' when registration resolves after failure' : ''}`, async ({
    page,
    context,
  }) => {
    const upstream = createPreviewServer('dist').server;
    const upstreamURL = await listen(upstream);
    let failAsset = true;
    let failures = 0;
    const proxy = createServer((incoming, outgoing) => {
      if (failAsset && incoming.url === '/moneyszn/icons/icon-512.png') {
        failures++;
        outgoing.writeHead(503).end('Temporary test failure');
        return;
      }
      const forwarding = request(
        new URL(incoming.url ?? '/', upstreamURL),
        (response) => {
          outgoing.writeHead(response.statusCode ?? 502, response.headers);
          response.pipe(outgoing);
        },
      );
      forwarding.on('error', () => outgoing.writeHead(502).end());
      forwarding.end();
    });
    const origin = await listen(proxy);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    let navigations = 0;
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) navigations++;
    });
    try {
      if (lateRegistration) {
        // Exercise the race in which the failed worker is already redundant and
        // registration.installing has been cleared before the app sees it.
        await page.addInitScript(() => {
          const container = navigator.serviceWorker;
          const register = container.register.bind(container);
          container.register = async (...args) => {
            const registration = await register(...args);
            const worker = registration.installing;
            if (worker)
              await new Promise<void>((resolve) => {
                const check = () => {
                  if (
                    worker.state === 'redundant' ||
                    worker.state === 'activated'
                  ) {
                    worker.removeEventListener('statechange', check);
                    resolve();
                  }
                };
                worker.addEventListener('statechange', check);
                check();
              });
            return registration;
          };
        });
      }
      await page.goto(`${origin}/moneyszn/`);
      await expect.poll(() => failures).toBeGreaterThan(0);
      await expect(page.locator('#offline-shell')).toHaveText(
        'Installation or update failed; reconnect and reload to retry',
      );
      expect(
        await page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
      ).toBe(false);
      expect(
        await page.evaluate(async () =>
          (await caches.keys()).filter((name) =>
            name.startsWith('moneyszn-shell-v1-'),
          ),
        ),
      ).toEqual([]);
      expect(navigations).toBe(1);

      failAsset = false;
      await page.reload();
      await expect(page.locator('#offline-shell')).toHaveText(
        'Ready for offline use',
      );
      await page.waitForFunction(() =>
        Boolean(navigator.serviceWorker.controller),
      );
      expect(navigations).toBe(2);
      await context.setOffline(true);
      await page.reload();
      await expect(
        page.getByRole('heading', { name: 'MoneySZN', exact: true }),
      ).toBeVisible();
      await expect(page.locator('#connectivity')).toHaveText('Offline');
      expect(errors).toEqual([]);
    } finally {
      await context.setOffline(false);
      for (const server of [proxy, upstream]) {
        await new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        );
      }
    }
  });
}
