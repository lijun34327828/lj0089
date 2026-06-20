import type { SyncMessage } from '@/types';

const CHARS = '风云雷电雨雪霜晨曦暮霞明辉映照光耀星辰月日天地山水江河湖海林森岩峰谷涧溪波浪潮涌澎湃浩瀚辽阔苍茫碧翠丹青紫金白银红黄蓝绿青橙粉墨桃杏梅兰竹菊松柏柳梧桐枫楠芝蓉薇蔷荷莲芹芦苇葵';
function generateNickname(): string {
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

export const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export const nickname = generateNickname();

type SyncHandler = (data: SyncMessage) => void;
type ConnectHandler = () => void;

const SYNC_URL = `ws://${window.location.hostname}:8869/ws-sync`;

let ws: WebSocket | null = null;
let handlers: SyncHandler[] = [];
let connectHandlers: ConnectHandler[] = [];
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let currentRole: 'editor' | 'preview' = 'editor';

function sendClientJoin(role: 'editor' | 'preview') {
  sendMessage({
    type: 'CLIENT_JOIN',
    clientId,
    nickname,
    role,
  });
}

function connect(role: 'editor' | 'preview') {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    return;
  }

  currentRole = role;

  try {
    ws = new WebSocket(SYNC_URL);

    ws.onopen = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      sendClientJoin(role);
      connectHandlers.forEach((handler) => handler());
    };

    ws.onmessage = (event) => {
      try {
        const data: SyncMessage = JSON.parse(event.data);
        handlers.forEach((handler) => handler(data));
      } catch {}
    };

    ws.onclose = () => {
      ws = null;
      reconnectTimer = setTimeout(() => connect(currentRole), 2000);
    };

    ws.onerror = () => {
      ws?.close();
    };
  } catch {
    reconnectTimer = setTimeout(() => connect(currentRole), 3000);
  }
}

export function initSyncClient(role: 'editor' | 'preview' = 'editor') {
  connect(role);
}

export function sendMessage(data: SyncMessage) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

export function sendSyncMessage(data: SyncMessage) {
  sendMessage(data);
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
