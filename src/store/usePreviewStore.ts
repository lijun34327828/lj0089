import { create } from 'zustand';
import type { TemplateMode, ServiceItem, PriceTemplate } from '@/types';
import { defaultTemplates } from '@/data/defaultData';
import { initSyncClient, onSyncMessage } from '@/sync/syncClient';

interface PreviewState {
  currentTemplate: TemplateMode;
  templates: PriceTemplate[];
  connected: boolean;
  getCurrentItems: () => ServiceItem[];
}

initSyncClient('preview');

export const usePreviewStore = create<PreviewState>((set, get) => ({
  currentTemplate: 'weekday',
  templates: defaultTemplates,
  connected: false,

  getCurrentItems: () => {
    const state = get();
    const template = state.templates.find((t) => t.id === state.currentTemplate);
    return template ? [...template.items].sort((a, b) => a.position - b.position) : [];
  },
}));

onSyncMessage((data) => {
  if (data.type === 'CONFIRMED_SYNC') {
    usePreviewStore.setState({
      currentTemplate: data.currentTemplate,
      templates: data.templates,
      connected: true,
    });
  } else if (data.type === 'STATE_SYNC') {
    usePreviewStore.setState({
      currentTemplate: data.currentTemplate,
      templates: data.templates,
      connected: true,
    });
  }
});
