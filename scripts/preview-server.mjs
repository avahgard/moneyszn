// Test-only static host: no SPA fallback, no cache, exactly the Pages subpath.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.json': 'application/json',
};

export function createPreviewServer(initialRoot) {
  let root = resolve(initialRoot);
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    if (!url.pathname.startsWith('/moneyszn/')) {
      response.writeHead(404).end();
      return;
    }
    const relative =
      decodeURIComponent(url.pathname.slice('/moneyszn/'.length)) ||
      'index.html';
    const file = resolve(root, relative);
    if (!file.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end();
      return;
    }
    try {
      const data = await readFile(file);
      const extension = file.slice(file.lastIndexOf('.'));
      response.writeHead(200, {
        'Content-Type': mime[extension] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      response.end(data);
    } catch {
      response.writeHead(404).end();
    }
  });
  return {
    server,
    setRoot: (nextRoot) => {
      root = resolve(nextRoot);
    },
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  createPreviewServer('dist').server.listen(4173, '127.0.0.1');
}
