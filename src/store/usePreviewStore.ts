import { create } from 'zustand';
import type { TemplateMode, ServiceItem, PriceTemplate } from '@/types';
import { defaultTemplates } from '@/data/defaultData';
import { initSyncClient, onSyncMessage, type SyncMessage } from '@/sync/syncClient';

interface PreviewState {
  currentTemplate: TemplateMode;
  templates: PriceTemplate[];
  connected: boolean;
  getCurrentItems: () => ServiceItem[];
  receiveSync: (data: SyncMessage) => void;
}

initSyncClient();

export const usePreviewStore = create<PreviewState>((set, get) => ({
  currentTemplate: 'weekday',
  templates: defaultTemplates,
  connected: false,

  getCurrentItems: () => {
    const state = get();
    const template = state.templates.find((t) => t.id === state.currentTemplate);
    return template ? [...template.items].sort((a, b) => a.position - b.position) : [];
  },

  receiveSync: (data: SyncMessage) => {
    set({
      currentTemplate: data.currentTemplate,
      templates: data.templates,
      connected: true,
    });
  },
}));

onSyncMessage((data) => {
  usePreviewStore.getState().receiveSync(data);
});
