import { spawnSync } from 'node:child_process';

for (const id of ['a', 'b']) {
  const result = spawnSync(
    process.execPath,
    [
      'node_modules/vite/bin/vite.js',
      'build',
      '--outDir',
      `.test-builds/${id}`,
    ],
    {
      stdio: 'inherit',
      env: { ...process.env, MONEYSZN_BUILD_ID: `fixture-${id}` },
    },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}
