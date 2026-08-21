import { createServer } from 'vite';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import electronPath from 'electron';
import * as esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function start() {
  console.log('Building Electron main process and preload for dev...');

  // Build main and preload
  await esbuild.build({
    entryPoints: [path.join(rootDir, 'src/main/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: path.join(rootDir, 'dist-electron/main.js'),
    external: ['electron'],
    sourcemap: true,
    format: 'cjs'
  });

  await esbuild.build({
    entryPoints: [path.join(rootDir, 'src/main/preload.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: path.join(rootDir, 'dist-electron/preload.js'),
    external: ['electron'],
    sourcemap: true,
    format: 'cjs'
  });

  const fs = await import('fs');
  fs.writeFileSync(
    path.join(rootDir, 'dist-electron/package.json'),
    JSON.stringify({ type: 'commonjs' }, null, 2)
  );

  // Start Vite dev server
  const server = await createServer({
    configFile: path.join(rootDir, 'vite.config.ts'),
    server: { port: 5173 }
  });

  await server.listen();
  console.log('Vite dev server running at http://localhost:5173');

  // Launch Electron
  const electronProcess = spawn(
    electronPath,
    [path.join(rootDir, 'dist-electron/main.js')],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        VITE_DEV_SERVER_URL: 'http://localhost:5173'
      }
    }
  );

  electronProcess.on('close', () => {
    server.close();
    process.exit(0);
  });
}

start().catch((err) => {
  console.error('Failed to start dev environment:', err);
  process.exit(1);
});
