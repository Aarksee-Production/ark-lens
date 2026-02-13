import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

const isWatch = process.argv.includes('--watch');
const isProd = process.argv.includes('--production');

// Extension host bundle (Node context)
const extensionConfig = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  sourcemap: !isProd,
  minify: isProd,
};

// Webview bundle (browser context)
const webviewConfig = {
  entryPoints: ['src/webview/app.ts'],
  bundle: true,
  outfile: 'dist/webview.js',
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  sourcemap: !isProd,
  minify: isProd,
  define: {
    'process.env.NODE_ENV': isProd ? '"production"' : '"development"',
  },
};

async function build() {
  if (isWatch) {
    const extCtx = await esbuild.context(extensionConfig);
    const webCtx = await esbuild.context(webviewConfig);
    await Promise.all([extCtx.watch(), webCtx.watch()]);
    console.log('[ark-lens] Watching for changes...');
  } else {
    await Promise.all([
      esbuild.build(extensionConfig),
      esbuild.build(webviewConfig),
    ]);
    console.log('[ark-lens] Build complete.');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
