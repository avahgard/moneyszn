import { test, expect, type Page } from '@playwright/test';
import { createPreviewServer } from '../../scripts/preview-server.mjs';
import type { AddressInfo } from 'node:net';
import './lifecycle-diagnostics';

async function installed(page: Page): Promise<void> {
  await expect(page.locator('#offline-shell')).toHaveText(
    'Ready for offline use',
  );
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
}

test('production shell loads, uses the subpath, and survives offline repeat navigation', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto('./');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('MoneySZN — Technical Preview');
  await expect(
    page.getByRole('heading', { name: 'MoneySZN', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Technical Preview', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/This is not yet a financial application/),
  ).toBeVisible();
  await expect(page.locator('#build')).toContainText('0.1.0 /');
  await expect(page.locator('#connectivity')).toHaveText('Online');
  await installed(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      async () => (await navigator.serviceWorker.getRegistration())?.scope,
    ),
  ).toBe('http://127.0.0.1:4173/moneyszn/');
  const manifestURL = await page
    .locator('link[rel="manifest"]')
    .evaluate((element: HTMLLinkElement) => element.href);
  expect(manifestURL).toBe(
    'http://127.0.0.1:4173/moneyszn/manifest.webmanifest',
  );
  const manifestResponse = await page.request.get(manifestURL);
  expect(manifestResponse.ok()).toBe(true);
  const manifest = (await manifestResponse.json()) as {
    start_url: string;
    scope: string;
    icons: { src: string; sizes: string }[];
  };
  expect(new URL(manifest.start_url, manifestURL).pathname).toBe('/moneyszn/');
  expect(new URL(manifest.scope, manifestURL).pathname).toBe('/moneyszn/');
  for (const icon of manifest.icons) {
    const result = await page.request.get(new URL(icon.src, manifestURL).href);
    expect(result.ok()).toBe(true);
    expect(result.headers()['content-type']).toBe('image/png');
    const bytes = await result.body();
    expect(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`).toBe(
      icon.sizes,
    );
  }
  const assetPaths = await page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>(
        'script[src], link[rel="stylesheet"]',
      ),
    ].map((element) => ('src' in element ? element.src : element.href)),
  );
  expect(assetPaths.length).toBeGreaterThanOrEqual(2);
  for (const path of assetPaths)
    expect(new URL(path).pathname).toMatch(/^\/moneyszn\/assets\//);

  await context.setOffline(true);
  await expect(page.locator('#connectivity')).toHaveText('Offline');
  await context.setOffline(false);
  await expect(page.locator('#connectivity')).toHaveText('Online');
  await context.setOffline(true);
  await expect(page.locator('#connectivity')).toHaveText('Offline');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'MoneySZN', exact: true }),
  ).toBeVisible();
  await expect(page.locator('#connectivity')).toHaveText('Offline');
  expect(
    await page
      .locator('main')
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe('rgb(255, 255, 255)');
  await page.goto('./index.html');
  await expect(
    page.getByRole('heading', { name: 'MoneySZN', exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
  await expect
    .poll(() =>
      page.evaluate(() => ({
        online: navigator.onLine,
        indicator: document.getElementById('connectivity')?.textContent,
      })),
    )
    .toEqual({ online: true, indicator: 'Online' });
  await page.goto('./');
  await expect(
    page.getByRole('heading', { name: 'MoneySZN', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('new deployment replaces the offline shell and preserves unrelated origin caches', async ({
  page,
  context,
}) => {
  const host = createPreviewServer('.test-builds/a');
  await new Promise<void>((resolve) =>
    host.server.listen(0, '127.0.0.1', resolve),
  );
  const address = host.server.address() as AddressInfo;
  const url = `http://127.0.0.1:${address.port}/moneyszn/`;
  try {
    await page.goto(url);
    await installed(page);
    await expect(page.locator('#build')).toHaveText('0.1.0 / fixture-a');
    await page.evaluate(async () => {
      const cache = await caches.open('unrelated-application');
      await cache.put('/unrelated-marker', new Response('preserve me'));
    });
    const previous = await page.evaluate(async () =>
      (await caches.keys()).filter((name) =>
        name.startsWith('moneyszn-shell-v1-'),
      ),
    );
    expect(previous).toHaveLength(1);
    host.setRoot('.test-builds/b');
    // A normal online revisit must trigger the application's own update path.
    // Wait for both that navigation and the controller-change reload before
    // inspecting caches, so assertions cannot race the replacement document.
    let navigations = 0;
    const takeoverReload = page.waitForEvent('framenavigated', {
      predicate: (frame) => frame === page.mainFrame() && ++navigations === 2,
    });
    await page.reload();
    await takeoverReload;
    await page.waitForLoadState('load');
    await expect(page.locator('#build')).toHaveText('0.1.0 / fixture-b');
    await installed(page);
    await expect
      .poll(() => page.evaluate(() => caches.keys()))
      .not.toContain(previous[0]);
    const names = await page.evaluate(() => caches.keys());
    expect(
      names.filter((name) => name.startsWith('moneyszn-shell-v1-')),
    ).toHaveLength(1);
    expect(
      await page.evaluate(async () =>
        (
          await (
            await caches.open('unrelated-application')
          ).match('/unrelated-marker')
        )?.text(),
      ),
    ).toBe('preserve me');
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#build')).toHaveText('0.1.0 / fixture-b');
    await expect(page.locator('#connectivity')).toHaveText('Offline');
  } finally {
    await context.setOffline(false);
    await new Promise<void>((resolve, reject) =>
      host.server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
