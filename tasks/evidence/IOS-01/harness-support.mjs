// Local evidence harness utilities. No production imports or public requests.
import { readFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { setTimeout, clearTimeout } from 'node:timers';
import assert from 'node:assert/strict';

const audit = JSON.parse(
  await readFile(new URL('./artifact-audit.json', import.meta.url), 'utf8'),
);
export async function loadBuild(id) {
  const expected = audit[id];
  const root = `.cache/ios01/${id}`;
  const build = JSON.parse(await readFile(`${root}/build-info.json`, 'utf8'));
  assert.deepEqual(build, expected.build, `Expected exact Pages build ${id}`);
  const worker = await readFile(`${root}/sw.js`, 'utf8');
  const config = JSON.parse(worker.match(/^const config = (.*);/)[1]);
  assert.deepEqual(config, expected.config, 'Unexpected worker configuration');
  const files = new Map();
  for (const asset of expected.assets) {
    assert.ok(
      asset.path.startsWith('/moneyszn/') && !asset.path.includes('..'),
    );
    const bytes = await readFile(
      `${root}/${asset.path.slice(config.base.length)}`,
    );
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      asset.sha256,
      `Artifact bytes differ: ${asset.path}`,
    );
    files.set(asset.path, bytes);
  }
  const hash = createHash('sha256').update(
    worker.replace(/^const config = .*;/, '/* CONFIG */'),
  );
  for (const path of config.assets
    .filter((path) => path.endsWith('.html') || path.includes('/assets/'))
    .sort())
    hash.update(path.slice(config.base.length)).update(files.get(path));
  for (const name of [
    'manifest.webmanifest',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/apple-touch-icon.png',
  ])
    hash.update(name).update(files.get(`${config.base}${name}`));
  assert.equal(
    `${config.prefix}${hash.digest('hex')}`,
    config.cacheName,
    'Worker/cache content hash differs from original artifact',
  );
  files.set('/moneyszn/sw.js', worker);
  return { config, files };
}

export async function campaignDirectory(kind) {
  // A new directory is mandatory: never overwrite prior evidence/profiles.
  const parent = '.cache/ios01/campaigns';
  await mkdir(parent, { recursive: true });
  const path = `${parent}/${kind}-${Date.now()}-${process.pid}`;
  await mkdir(path);
  await mkdir(`${path}/probes`);
  return path;
}

export function launchOptions(engine) {
  return {
    timeout: 10000,
    ...(engine === 'firefox' && process.env.MONEYSZN_IOS01_FIREFOX_EXECUTABLE
      ? { executablePath: process.env.MONEYSZN_IOS01_FIREFOX_EXECUTABLE }
      : {}),
  };
}

export async function deadline(promise, label, ms = 10000) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Diagnostic harness timeout: ${label}`)),
          ms,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export async function closeHost(host) {
  host.closeAllConnections();
  await deadline(
    new Promise((resolve, reject) =>
      host.close((error) => (error ? reject(error) : resolve())),
    ),
    'server close',
  );
}
