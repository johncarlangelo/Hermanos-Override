import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function build() {
  console.log('Building Electron main process and preload...');
  
  // Build main process
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

  // Build preload script
  await esbuild.build({
    entryPoints: [path.join(rootDir, 'src/main/preload.ts')],
    bundle: true,
    outfile: path.join(rootDir, 'dist-electron/preload.js'),
    external: ['electron'],
    sourcemap: true,
    format: 'cjs'
  });

  // Ensure dist-electron is treated as CommonJS
  const fs = await import('fs');
  fs.writeFileSync(
    path.join(rootDir, 'dist-electron/package.json'),
    JSON.stringify({ type: 'commonjs' }, null, 2)
  );

  console.log('Electron build complete.');
}

build().catch((err) => {
  console.error('Build error:', err);
  process.exit(1);
});
