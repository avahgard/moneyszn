import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { describe, expect, it } from 'vitest';

describe('preview server malformed requests', () => {
  it('returns 400 for invalid encoding and stays alive for valid requests', async () => {
    const child = spawn(
      process.execPath,
      [
        '--input-type=module',
        '--eval',
        `
      import { createPreviewServer } from './scripts/preview-server.mjs';
      const server = createPreviewServer('public').server;
      server.listen(0, '127.0.0.1', () => console.log(server.address().port));
    `,
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    const exited = once(child, 'exit');
    let stderr = '';
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    try {
      const [output] = await once(child.stdout, 'data');
      const origin = `http://127.0.0.1:${Number(String(output).trim())}`;
      for (const path of ['%ZZ', '%E0%A4%A', '%FF']) {
        const response = await fetch(`${origin}/moneyszn/${path}`, {
          signal: AbortSignal.timeout(3_000),
        });
        expect(response.status).toBe(400);
      }
      const response = await fetch(`${origin}/moneyszn/manifest.webmanifest`, {
        signal: AbortSignal.timeout(3_000),
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({ short_name: 'MoneySZN' });
      expect(child.exitCode).toBeNull();
      expect(stderr).toBe('');
    } finally {
      child.kill();
      await exited;
    }
  }, 10_000);
});
