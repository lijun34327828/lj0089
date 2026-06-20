import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import fs from 'node:fs';
import path from 'node:path';

function previewEntryPlugin(): Plugin {
  return {
    name: 'vite-plugin-preview-entry',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/' || req.url === '/index.html') {
          const filePath = path.resolve(server.config.root, 'preview.html');
          let content = fs.readFileSync(filePath, 'utf-8');
          content = await server.transformIndexHtml('/preview.html', content, req.originalUrl);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(content);
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  server: {
    port: 3861,
    host: true,
  },
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      input: {
        preview: '/preview.html',
      },
    },
  },
  plugins: [
    previewEntryPlugin(),
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths()
  ],
})
