// IOS-01 local fault investigation. Never deploy; only isolated fictional profiles.
// Inputs: exact Pages artifacts unpacked to .cache/ios01/a and .cache/ios01/b.
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

const builds = {};
for (const id of ['a', 'b']) builds[id] = await loadBuild(id);
const scenarios = [
  'coherent-cold-page-offline',
  'mixed-precache-html-a-worker-b',
  'stale-online-html-a-controller-b',
  'network-html-b-new-js-unavailable-controller-a',
  'missing-cached-js-offline',
  'missing-cached-html-offline',
];
const result = [];
const output = await campaignDirectory('faults');
console.log(`Evidence output: ${output}`);
for (const engine of ['chromium', 'webkit', 'firefox']) {
  const runtime = { chromium, firefox, webkit }[engine];
  const browser = await runtime.launch(launchOptions(engine));
  try {
    for (const scenario of scenarios) {
      let root = scenario.includes('controller-a') ? 'a' : 'b';
      let offline = false;
      let stale = false;
      const requests = [];
      const host = createServer((request, response) => {
        const path = new URL(request.url, 'http://localhost').pathname;
        requests.push({ path, root, offline, stale });
        if (offline) {
          request.socket.destroy();
          return;
        }
        let file = path === '/moneyszn/' ? '/moneyszn/index.html' : path;
        let bytes = builds[root].files.get(file);
        if (
          scenario === 'mixed-precache-html-a-worker-b' &&
          path === '/moneyszn/index.html'
        )
          bytes = builds.a.files.get(file);
        if (stale && path === '/moneyszn/') bytes = builds.a.files.get(file);
        if (
          scenario.includes('new-js-unavailable') &&
          root === 'b' &&
          path.endsWith('.js') &&
          path !== '/moneyszn/sw.js'
        )
          bytes = undefined;
        if (!bytes) {
          response.writeHead(404).end('Fictional missing asset');
          return;
        }
        const mime = file.endsWith('.js')
          ? 'text/javascript'
          : file.endsWith('.css')
            ? 'text/css'
            : file.endsWith('.html')
              ? 'text/html'
              : file.endsWith('.png')
                ? 'image/png'
                : 'application/json';
        response
          .writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-store' })
          .end(bytes);
      });
      let context;
      let page;
      const entry = { engine, scenario };
      const consoleErrors = [];
      const pageErrors = [];
      const observe = (page) => {
        page.on('console', (message) => {
          if (['error', 'warning'].includes(message.type()))
            consoleErrors.push(message.text());
        });
        page.on('pageerror', (error) => pageErrors.push(error.message));
      };
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
        context = await deadline(
          browser.newContext({ serviceWorkers: 'allow' }),
          'new context',
        );
        context.setDefaultTimeout(10000);
        context.setDefaultNavigationTimeout(10000);
        await deadline(
          context.tracing.start({
            screenshots: true,
            snapshots: true,
            sources: true,
          }),
          'trace start',
        );
        page = await context.newPage();
        observe(page);
        await page.goto(url);
        await page.waitForFunction(
          () =>
            document.getElementById('offline-shell')?.textContent ===
              'Ready for offline use' &&
            navigator.serviceWorker.controller?.state === 'activated',
        );
        entry.before = await deadline(
          page.evaluate(async () => ({
            build: document.getElementById('build')?.textContent,
            controller: navigator.serviceWorker.controller?.state,
            caches: await window.caches.keys(),
          })),
          'initial cache inspection',
        );
        if (
          scenario === 'missing-cached-js-offline' ||
          scenario === 'missing-cached-html-offline'
        ) {
          const path = scenario.includes('cached-js')
            ? builds.b.config.assets.find((p) => p.endsWith('.js'))
            : '/moneyszn/index.html';
          entry.deletedForSimulation = await deadline(
            page.evaluate(
              async ({ name, path }) =>
                (await window.caches.open(name)).delete(path),
              { name: builds.b.config.cacheName, path },
            ),
            'fictional cache deletion',
          );
          assert.equal(entry.deletedForSimulation, true);
        }
        if (scenario.includes('controller-a')) root = 'b';
        else if (scenario.includes('stale-online')) stale = true;
        else {
          offline = true;
          await context.setOffline(true);
        }
        await page.close();
        page = await context.newPage();
        observe(page);
        entry.navigationError = null;
        try {
          await page.goto(url, { timeout: 10000 });
        } catch (error) {
          entry.navigationError = String(error);
        }
        entry.after = await deadline(
          page.evaluate(async () => {
            const keys = await window.caches.keys();
            const shells = [];
            for (const name of keys) {
              const cache = await window.caches.open(name);
              const response = await cache.match('/moneyszn/index.html');
              shells.push({
                name,
                entries: (await cache.keys()).map(
                  (r) => new URL(r.url).pathname,
                ),
                shell: response && (await response.text()),
              });
            }
            const registration =
              await navigator.serviceWorker.getRegistration();
            return {
              heading: document.querySelector('h1')?.textContent ?? null,
              build: document.getElementById('build')?.textContent ?? null,
              connectivity:
                document.getElementById('connectivity')?.textContent ?? null,
              status:
                document.getElementById('offline-shell')?.textContent ?? null,
              controller: navigator.serviceWorker.controller?.state ?? null,
              active: registration?.active?.state ?? null,
              shells,
            };
          }),
          'post-navigation inspection',
        ).catch((error) => ({ inspectionError: String(error) }));
        if (scenario === 'coherent-cold-page-offline')
          assert.match(entry.after.build, /b413446/);
        else if (scenario === 'missing-cached-html-offline')
          assert.ok(entry.navigationError);
        else {
          assert.equal(entry.after.build, '');
          assert.equal(entry.after.connectivity, '');
          assert.equal(entry.after.status, 'Preparing…');
        }
        entry.probeAssertion = 'confirmed expected outcome';
      } catch (error) {
        entry.probeAssertion = `FAILED: ${String(error)}`;
      } finally {
        await page
          ?.screenshot({ path: `${output}/probes/${engine}-${scenario}.png` })
          .catch(() => {});
        entry.consoleErrors = consoleErrors;
        entry.pageErrors = pageErrors;
        entry.requests = requests;
        try {
          if (context)
            await deadline(
              context.tracing.stop({
                path: `${output}/probes/${engine}-${scenario}.zip`,
              }),
              'trace stop',
            );
        } finally {
          try {
            if (context) await deadline(context.close(), 'context close');
          } finally {
            await closeHost(host);
          }
        }
      }
      result.push(entry);
      await writeFile(
        `${output}/probe-results.json`,
        JSON.stringify(result, null, 2),
      );
      console.log(
        engine,
        scenario,
        entry.probeAssertion,
        JSON.stringify({
          build: entry.after?.build,
          heading: entry.after?.heading,
          navigationFailed: Boolean(entry.navigationError),
        }),
      );
    }
  } finally {
    await deadline(browser.close(), 'browser close');
  }
}
if (result.some((entry) => entry.probeAssertion.startsWith('FAILED')))
  process.exitCode = 1;
