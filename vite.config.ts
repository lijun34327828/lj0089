import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';
import { WebSocketServer } from 'ws';
import type { Plugin } from 'vite';

interface ClientInfo {
  ws: any;
  clientId: string;
  nickname: string;
  role: 'editor' | 'preview';
}

interface RecentEdit {
  clientId: string;
  nickname: string;
  itemId: string;
  field: string;
  value: any;
  timestamp: number;
}

interface RecentReorder {
  clientId: string;
  nickname: string;
  targetIndex: number;
  timestamp: number;
}

function syncWebSocketPlugin(): Plugin {
  let wss: WebSocketServer | null = null;
  const clients = new Map<any, ClientInfo>();
  let lastConfirmedState: string | null = null;
  let lastLiveState: string | null = null;
  const recentEdits: RecentEdit[] = [];
  const recentReorders: RecentReorder[] = [];
  const activeConflicts = new Map<string, { itemId: string; field: string }>();
  const CONFLICT_WINDOW = 500;
  const REORDER_WINDOW = 500;

  function broadcastToEditors(data: string, excludeWs?: any) {
    clients.forEach((info, ws) => {
      if (ws !== excludeWs && info.role === 'editor' && ws.readyState === 1) {
        ws.send(data);
      }
    });
  }

  function broadcastToAll(data: string, excludeWs?: any) {
    clients.forEach((info, ws) => {
      if (ws !== excludeWs && ws.readyState === 1) {
        ws.send(data);
      }
    });
  }

  function sendToPreviewClients(data: string) {
    clients.forEach((info, ws) => {
      if (info.role === 'preview' && ws.readyState === 1) {
        ws.send(data);
      }
    });
  }

  function sendUserList(excludeWs?: any) {
    const editors: { clientId: string; nickname: string }[] = [];
    clients.forEach((info) => {
      if (info.role === 'editor') {
        editors.push({ clientId: info.clientId, nickname: info.nickname });
      }
    });
    const msg = JSON.stringify({ type: 'USER_LIST', users: editors });
    broadcastToEditors(msg, excludeWs);
  }

  function sendConfirmedToPreview() {
    if (lastConfirmedState) {
      const parsed = JSON.parse(lastConfirmedState);
      const confirmedMsg = JSON.stringify({
        type: 'CONFIRMED_SYNC',
        currentTemplate: parsed.currentTemplate,
        templates: parsed.templates,
      });
      sendToPreviewClients(confirmedMsg);
    }
  }

  function cleanupRecentEdits() {
    const now = Date.now();
    while (recentEdits.length > 0 && now - recentEdits[0].timestamp > CONFLICT_WINDOW) {
      recentEdits.shift();
    }
  }

  function cleanupRecentReorders() {
    const now = Date.now();
    while (recentReorders.length > 0 && now - recentReorders[0].timestamp > REORDER_WINDOW) {
      recentReorders.shift();
    }
  }

  return {
    name: 'vite-plugin-sync-ws',
    configureServer(server) {
      server.httpServer?.on('upgrade', (req, socket, head) => {
        if (req.url !== '/ws-sync') return;

        if (!wss) {
          wss = new WebSocketServer({ noServer: true });

          wss.on('connection', (ws) => {
            clients.set(ws, { ws, clientId: '', nickname: '', role: 'editor' });

            if (lastLiveState && ws.readyState === 1) {
              ws.send(lastLiveState);
            }

            ws.on('message', (data) => {
              const message = data.toString();
              try {
                const parsed = JSON.parse(message);

                if (parsed.type === 'CLIENT_JOIN') {
                  const info = clients.get(ws);
                  if (info) {
                    info.clientId = parsed.clientId;
                    info.nickname = parsed.nickname;
                    info.role = parsed.role || 'editor';
                  }
                  sendUserList(ws);
                  if (lastLiveState && ws.readyState === 1) {
                    ws.send(lastLiveState);
                  }
                  if (lastConfirmedState && parsed.role === 'preview' && ws.readyState === 1) {
                    const cs = JSON.parse(lastConfirmedState);
                    ws.send(JSON.stringify({
                      type: 'CONFIRMED_SYNC',
                      currentTemplate: cs.currentTemplate,
                      templates: cs.templates,
                    }));
                  }
                  return;
                }

                if (parsed.type === 'FIELD_EDIT') {
                  const now = Date.now();
                  cleanupRecentEdits();

                  const conflictKey = `${parsed.itemId}::${parsed.field}`;
                  const existingConflict = activeConflicts.get(conflictKey);

                  if (existingConflict) {
                    return;
                  }

                  const conflicting = recentEdits.find(
                    (e) =>
                      e.itemId === parsed.itemId &&
                      e.field === parsed.field &&
                      e.clientId !== parsed.clientId &&
                      now - e.timestamp < CONFLICT_WINDOW
                  );

                  if (conflicting) {
                    const conflictId = `conflict-${now}-${Math.random().toString(36).slice(2, 6)}`;
                    activeConflicts.set(conflictKey, { itemId: parsed.itemId, field: parsed.field });

                    const conflictMsg = JSON.stringify({
                      type: 'CONFLICT_DETECTED',
                      conflictId,
                      itemId: parsed.itemId,
                      field: parsed.field,
                      initiatorClientId: conflicting.clientId,
                      initiatorNickname: conflicting.nickname,
                      initiatorValue: conflicting.value,
                      challengerClientId: parsed.clientId,
                      challengerNickname: parsed.nickname,
                      challengerValue: parsed.value,
                      currentTemplate: parsed.currentTemplate,
                      templates: parsed.templates,
                    });
                    broadcastToEditors(conflictMsg);
                    return;
                  }

                  recentEdits.push({
                    clientId: parsed.clientId,
                    nickname: parsed.nickname,
                    itemId: parsed.itemId,
                    field: parsed.field,
                    value: parsed.value,
                    timestamp: now,
                  });

                  lastLiveState = JSON.stringify({
                    type: 'STATE_SYNC',
                    currentTemplate: parsed.currentTemplate,
                    templates: parsed.templates,
                  });
                  lastConfirmedState = lastLiveState;

                  const notifyMsg = JSON.stringify({
                    type: 'FIELD_EDIT_NOTIFY',
                    clientId: parsed.clientId,
                    nickname: parsed.nickname,
                    itemId: parsed.itemId,
                    field: parsed.field,
                    value: parsed.value,
                    currentTemplate: parsed.currentTemplate,
                    templates: parsed.templates,
                  });
                  broadcastToEditors(notifyMsg, ws);

                  sendConfirmedToPreview();
                  return;
                }

                if (parsed.type === 'CONFLICT_RESOLVE') {
                  const conflictKey = `${parsed.itemId}::${parsed.field}`;
                  activeConflicts.delete(conflictKey);

                  const idx = recentEdits.findIndex(
                    (e) => e.itemId === parsed.itemId && e.field === parsed.field
                  );
                  if (idx !== -1) recentEdits.splice(idx, 1);

                  lastLiveState = JSON.stringify({
                    type: 'STATE_SYNC',
                    currentTemplate: parsed.currentTemplate,
                    templates: parsed.templates,
                  });
                  lastConfirmedState = lastLiveState;

                  const resolveMsg = JSON.stringify({
                    type: 'CONFLICT_RESOLVE',
                    clientId: parsed.clientId,
                    conflictId: parsed.conflictId,
                    itemId: parsed.itemId,
                    field: parsed.field,
                    resolvedValue: parsed.resolvedValue,
                    currentTemplate: parsed.currentTemplate,
                    templates: parsed.templates,
                  });
                  broadcastToAll(resolveMsg);

                  sendConfirmedToPreview();
                  return;
                }

                if (parsed.type === 'REORDER') {
                  const now = Date.now();
                  cleanupRecentReorders();

                  const reorderConflict = recentReorders.find(
                    (r) =>
                      r.targetIndex === parsed.toIndex &&
                      r.clientId !== parsed.clientId &&
                      now - r.timestamp < REORDER_WINDOW
                  );

                  if (reorderConflict) {
                    const rejectMsg = JSON.stringify({
                      type: 'REORDER_REJECTED',
                      clientId: parsed.clientId,
                      nickname: parsed.nickname,
                    });
                    if (ws.readyState === 1) {
                      ws.send(rejectMsg);
                    }
                    return;
                  }

                  recentReorders.push({
                    clientId: parsed.clientId,
                    nickname: parsed.nickname,
                    targetIndex: parsed.toIndex,
                    timestamp: now,
                  });

                  lastLiveState = JSON.stringify({
                    type: 'STATE_SYNC',
                    currentTemplate: parsed.currentTemplate,
                    templates: parsed.templates,
                  });
                  lastConfirmedState = lastLiveState;

                  broadcastToAll(message, ws);
                  sendConfirmedToPreview();
                  return;
                }

                if (parsed.type === 'STATE_SYNC') {
                  lastLiveState = message;
                  lastConfirmedState = message;
                  broadcastToAll(message, ws);
                  sendConfirmedToPreview();
                  return;
                }

                broadcastToAll(message, ws);
              } catch {}
            });

            ws.on('close', () => {
              const info = clients.get(ws);
              clients.delete(ws);
              if (info && info.role === 'editor') {
                sendUserList();
              }
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
