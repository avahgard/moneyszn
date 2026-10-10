import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import { generateWorker } from './scripts/service-worker.ts';
import pkg from './package.json' with { type: 'json' };

const base = '/moneyszn/';
const buildId =
  process.env.MONEYSZN_BUILD_ID ??
  execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_ID__: JSON.stringify(buildId),
  },
  plugins: [
    {
      name: 'moneyszn-offline-shell',
      apply: 'build',
      generateBundle: {
        order: 'post',
        handler(_options, bundle) {
          if (!bundle['index.html'])
            this.error('The offline shell requires generated index.html');
          const publicFiles = [
            'manifest.webmanifest',
            'icons/icon-192.png',
            'icons/icon-512.png',
            'icons/apple-touch-icon.png',
          ];
          const hash = createHash('sha256');
          hash.update(readFileSync('scripts/sw-template.js'));
          for (const key of Object.keys(bundle).sort()) {
            const asset = bundle[key];
            if (asset)
              hash
                .update(key)
                .update(asset.type === 'chunk' ? asset.code : asset.source);
          }
          for (const file of publicFiles)
            hash.update(file).update(readFileSync(`public/${file}`));
          const prefix = 'moneyszn-shell-v1-';
          const cacheName = `${prefix}${hash.digest('hex')}`;
          const assets = [...Object.keys(bundle), ...publicFiles].map(
            (file) => `${base}${file}`,
          );
          this.emitFile({
            type: 'asset',
            fileName: 'sw.js',
            source: generateWorker({ base, prefix, cacheName, assets }),
          });
          this.emitFile({
            type: 'asset',
            fileName: 'build-info.json',
            source: JSON.stringify({ version: pkg.version, commit: buildId }),
          });
        },
      },
    },
  ],
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
});
