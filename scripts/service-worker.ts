import { readFileSync } from 'node:fs';

export interface WorkerConfig {
  base: string;
  prefix: string;
  cacheName: string;
  assets: string[];
}

export function generateWorker(config: WorkerConfig): string {
  return readFileSync(
    new URL('./sw-template.js', import.meta.url),
    'utf8',
  ).replace('/* CONFIG */', `const config = ${JSON.stringify(config)};`);
}
