// Desktop persistence control only; this does not emulate an installed iOS PWA.
import { chromium, firefox, webkit } from 'playwright';
import { createServer } from 'node:http';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import {
  loadBuild,
  campaignDirectory,
  launchOptions,
  deadline,
  closeHost,
} from './harness-support.mjs';

const { files } = await loadBuild('b');
const results = [];
const output = await campaignDirectory('restart');
console.log(`Evidence output: ${output}`);
for (const engine of ['chromium', 'webkit', 'firefox']) {
  let offline = false;
  const host = createServer((request, response) => {
    if (offline) {
      request.socket.destroy();
      return;
    }
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const path = pathname === '/moneyszn/' ? '/moneyszn/index.html' : pathname;
    const bytes = files.get(path);
    const type = path.endsWith('.html')
      ? 'text/html'
      : path.endsWith('.js')
        ? 'text/javascript'
        : path.endsWith('.css')
          ? 'text/css'
          : path.endsWith('.png')
            ? 'image/png'
            : 'application/json';
    response
      .writeHead(bytes ? 200 : 404, {
        'Content-Type': type,
        'Cache-Control': 'no-store',
      })
      .end(bytes ?? 'Fictional missing asset');
  });
  const profile = `${output}/profiles/${engine}`;
  const runtime = { chromium, firefox, webkit }[engine];
  const options = {
    serviceWorkers: 'allow',
    ...launchOptions(engine),
  };
  let context;
  const entry = { engine, profile };
  try {
    await deadline(
      new Promise((resolve, reject) => {
        host.once('error', reject);
        host.listen(0, '127.0.0.1', resolve);
      }),
      'server listen',
    );
    const url = `http://127.0.0.1:${host.address().port}/moneyszn/`;
    entry.url = url;
    context = await runtime.launchPersistentContext(profile, options);
    context.setDefaultTimeout(10000);
    context.setDefaultNavigationTimeout(10000);
    let page = await context.newPage();
    await page.goto(url);
    await page.waitForFunction(
      () =>
        document.getElementById('offline-shell')?.textContent ===
          'Ready for offline use' &&
        navigator.serviceWorker.controller?.state === 'activated',
    );
    entry.beforeBuild = await page.locator('#build').textContent();
    await deadline(context.close(), 'first process close');
    context = undefined;
    offline = true;
    context = await runtime.launchPersistentContext(profile, options);
    context.setDefaultTimeout(10000);
    context.setDefaultNavigationTimeout(10000);
    await context.setOffline(true);
    page = await context.newPage();
    await page.goto(url, { timeout: 10000 });
    await page.waitForFunction(
      () =>
        document.getElementById('offline-shell')?.textContent ===
        'Ready for offline use',
    );
    entry.after = await deadline(
      page.evaluate(async () => ({
        build: document.getElementById('build')?.textContent,
        connectivity: document.getElementById('connectivity')?.textContent,
        readiness: document.getElementById('offline-shell')?.textContent,
        controller: navigator.serviceWorker.controller?.state,
        caches: await window.caches.keys(),
      })),
      'restart cache inspection',
    );
    assert.match(entry.after.build, /b413446/);
    assert.equal(entry.after.connectivity, 'Offline');
    entry.outcome = 'PASS desktop persistent-profile browser-process restart';
    await page.screenshot({
      path: `${output}/probes/${engine}-cold-process.png`,
    });
  } catch (error) {
    entry.outcome = `FAILED: ${String(error)}`;
  } finally {
    try {
      if (context) await deadline(context.close(), 'context close');
    } finally {
      await closeHost(host);
    }
  }
  results.push(entry);
  await writeFile(
    `${output}/cold-process-results.json`,
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(entry));
}
if (results.some((entry) => entry.outcome.startsWith('FAILED')))
  process.exitCode = 1;
