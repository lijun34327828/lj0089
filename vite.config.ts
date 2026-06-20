import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';
import { WebSocketServer } from 'ws';

function syncWebSocketPlugin(): Plugin {
  let wss: WebSocketServer | null = null;
  const clients = new Set<any>();
  let lastState: string | null = null;

  return {
    name: 'vite-plugin-sync-ws',
    configureServer(server) {
      server.httpServer?.on('upgrade', (req, socket, head) => {
        if (req.url !== '/ws-sync') return;

        if (!wss) {
          wss = new WebSocketServer({ noServer: true });

          wss.on('connection', (ws) => {
            clients.add(ws);
            if (lastState && ws.readyState === 1) {
              ws.send(lastState);
            }
            ws.on('message', (data) => {
              const message = data.toString();
              try {
                const parsed = JSON.parse(message);
                if (parsed.type === 'STATE_SYNC') {
                  lastState = message;
                }
              } catch {}
              clients.forEach((client) => {
                if (client !== ws && client.readyState === 1) {
                  client.send(message);
                }
              });
            });
            ws.on('close', () => {
              clients.delete(ws);
            });
          });
        }

        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req);
        });
      });
    },
  };
}

import type { Plugin } from 'vite';

export default defineConfig({
  server: {
    port: 8869,
    host: true,
  },
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      input: {
        main: '/index.html',
      },
    },
  },
  plugins: [
    syncWebSocketPlugin(),
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }),
    tsconfigPaths()
  ],
})
