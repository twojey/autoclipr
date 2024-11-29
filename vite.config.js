import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    exclude: [
      '@remotion/bundler',
      '@remotion/renderer',
      '@remotion/media-utils',
      '@remotion/compositor-darwin-x64',
    ],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [
        '@remotion/compositor-win32-x64-msvc',
        '@remotion/compositor-darwin-arm64',
        '@remotion/compositor-linux-x64-musl',
        '@remotion/compositor-linux-x64-gnu',
        '@remotion/compositor-linux-arm64-musl',
        '@remotion/compositor-linux-arm64-gnu',
        'uglify-js',
        '@swc/wasm',
      ],
    },
  },
});
