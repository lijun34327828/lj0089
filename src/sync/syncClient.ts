import type { TemplateMode, PriceTemplate } from '@/types';

export interface SyncMessage {
  type: 'STATE_SYNC';
  currentTemplate: TemplateMode;
  templates: PriceTemplate[];
}

type SyncHandler = (data: SyncMessage) => void;
type ConnectHandler = () => void;

const SYNC_URL = `ws://${window.location.hostname}:8869/ws-sync`;

let ws: WebSocket | null = null;
let handlers: SyncHandler[] = [];
let connectHandlers: ConnectHandler[] = [];
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function connect() {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    return;
  }

  try {
    ws = new WebSocket(SYNC_URL);

    ws.onopen = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      connectHandlers.forEach((handler) => handler());
    };

    ws.onmessage = (event) => {
      try {
        const data: SyncMessage = JSON.parse(event.data);
        if (data.type === 'STATE_SYNC') {
          handlers.forEach((handler) => handler(data));
        }
      } catch {}
    };

    ws.onclose = () => {
      ws = null;
      reconnectTimer = setTimeout(connect, 2000);
    };

    ws.onerror = () => {
      ws?.close();
    };
  } catch {
    reconnectTimer = setTimeout(connect, 3000);
  }
}

export function initSyncClient() {
  connect();
}

export function sendSyncMessage(data: SyncMessage) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

export function onSyncMessage(handler: SyncHandler) {
  handlers.push(handler);
  return () => {
    handlers = handlers.filter((h) => h !== handler);
  };
}

export function onSyncConnect(handler: ConnectHandler) {
  connectHandlers.push(handler);
  return () => {
    connectHandlers = connectHandlers.filter((h) => h !== handler);
  };
}
