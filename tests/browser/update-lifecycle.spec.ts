import { test, expect } from '@playwright/test';
import {
  createServer,
  request,
  type Server,
  type ServerResponse,
} from 'node:http';
import { readFile } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { createPreviewServer } from '../../scripts/preview-server.mjs';

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

for (const scenario of ['held activation', 'interrupted precache'] as const) {
  test(`update survives ${scenario} and restarts offline`, async ({
    page,
    context,
  }) => {
    const host = createPreviewServer('.test-builds/a');
    const upstream = await listen(host.server);
    const workerB = await readFile('.test-builds/b/sw.js', 'utf8');
    let updating = false;
    let interrupted = scenario === 'interrupted precache';
    let failedAssets = 0;
    let networkUnavailable = false;
    let activationGate: ServerResponse | undefined;
    const proxy = createServer((incoming, outgoing) => {
      // Firefox's worker fetch can still reach the host with the Playwright
      // context offline. Cut that transport too, so this scenario actually
      // exercises the installed worker's fallback rather than online HTML B.
      if (networkUnavailable) {
        incoming.socket.destroy();
        return;
      }
      if (incoming.url === '/moneyszn/ci01-activation-gate') {
        activationGate = outgoing;
        return;
      }
      if (updating && incoming.url === '/moneyszn/sw.js') {
        const script =
          scenario === 'held activation'
            ? workerB.replace(
                'await self.clients.claim();',
                `await self.clients.claim();
                await fetch('/moneyszn/ci01-activation-gate');`,
              )
            : workerB;
        outgoing.writeHead(200, {
          'Content-Type': 'text/javascript',
          'Cache-Control': 'no-store',
        });
        outgoing.end(script);
        return;
      }
      if (
        updating &&
        interrupted &&
        incoming.url === '/moneyszn/icons/icon-512.png'
      ) {
        failedAssets++;
        outgoing.writeHead(503).end('Fictional interrupted deployment');
        return;
      }
      const forwarding = request(
        new URL(incoming.url ?? '/', upstream),
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
      await page.goto(`${origin}/moneyszn/`);
      await expect(page.locator('#offline-shell')).toHaveText(
        'Ready for offline use',
      );
      await page.waitForFunction(
        () => navigator.serviceWorker.controller?.state === 'activated',
      );
      host.setRoot('.test-builds/b');
      updating = true;
      await page.reload();
      await expect(page.locator('#build')).toHaveText('0.1.0 / fixture-b');
      if (scenario === 'held activation') {
        await expect.poll(() => Boolean(activationGate)).toBe(true);
        await page.waitForFunction(
          () => navigator.serviceWorker.controller?.state === 'activating',
        );
        // The real worker holds activate.waitUntil after claiming this page.
        // A premature takeover reload is observable even if fixture B is visible.
        expect(navigations).toBe(2);
        const takeover = page.waitForEvent('framenavigated', {
          predicate: (frame) => frame === page.mainFrame(),
        });
        activationGate!.writeHead(200).end('Activation released');
        await takeover;
        await page.waitForLoadState('load');
        expect(navigations).toBe(3);
      } else {
        await expect.poll(() => failedAssets).toBeGreaterThan(0);
        await page.waitForFunction(async () => {
          const registration = await navigator.serviceWorker.getRegistration();
          return (
            registration?.installing === null && registration.waiting === null
          );
        });
        expect(navigations).toBe(2);
        // Failed replacement must leave the last complete shell usable offline.
        networkUnavailable = true;
        await context.setOffline(true);
        await page.reload();
        await expect(page.locator('#build')).toHaveText('0.1.0 / fixture-a');
        await expect(page.locator('#offline-shell')).toHaveText(
          'Ready for offline use',
        );
        networkUnavailable = false;
        await context.setOffline(false);
        interrupted = false;
        const takeover = page.waitForEvent('framenavigated', {
          predicate: (frame) => frame === page.mainFrame() && navigations === 5,
        });
        await page.reload();
        await takeover;
        await page.waitForLoadState('load');
      }
      await expect(page.locator('#build')).toHaveText('0.1.0 / fixture-b');
      await expect(page.locator('#offline-shell')).toHaveText(
        'Ready for offline use',
      );
      await page.waitForFunction(
        () => navigator.serviceWorker.controller?.state === 'activated',
      );
      networkUnavailable = true;
      await context.setOffline(true);
      await page.reload();
      await expect(page.locator('#build')).toHaveText('0.1.0 / fixture-b');
      await expect(page.locator('#offline-shell')).toHaveText(
        'Ready for offline use',
      );
      expect(errors).toEqual([]);
    } finally {
      networkUnavailable = false;
      activationGate?.end();
      await context.setOffline(false);
      for (const server of [proxy, host.server])
        await new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        );
    }
  });
}
