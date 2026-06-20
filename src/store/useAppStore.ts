import { create } from 'zustand';
import type { TemplateMode, ServiceItem, OrderState, CalculatedPrice, PriceTemplate } from '@/types';
import { defaultTemplates, moduleLibrary } from '@/data/defaultData';
import { sendSyncMessage, initSyncClient, onSyncConnect, type SyncMessage } from '@/sync/syncClient';

interface AppState {
  currentTemplate: TemplateMode;
  templates: PriceTemplate[];
  selectedItemId: string | null;
  orderState: OrderState;
  draggedItem: ServiceItem | null;
  dragType: 'move' | 'add' | null;
  dragIndex: number;
  setCurrentTemplate: (template: TemplateMode) => void;
  getCurrentItems: () => ServiceItem[];
  selectItem: (id: string | null) => void;
  updateItem: (id: string, updates: Partial<ServiceItem>) => void;
  addItem: (item: Omit<ServiceItem, 'id' | 'position'>) => void;
  removeItem: (id: string) => void;
  reorderItems: (fromIndex: number, toIndex: number) => void;
  setOrderState: (updates: Partial<OrderState>) => void;
  calculatePrice: () => CalculatedPrice;
  setDraggedItem: (item: ServiceItem | null, type: 'move' | 'add' | null, index?: number) => void;
}

let itemIdCounter = 100;
const generateId = () => `item-new-${itemIdCounter++}`;

const broadcastState = (currentTemplate: TemplateMode, templates: PriceTemplate[]) => {
  sendSyncMessage({
    type: 'STATE_SYNC',
    currentTemplate,
    templates,
  });
};

initSyncClient();

onSyncConnect(() => {
  const state = useAppStore.getState();
  broadcastState(state.currentTemplate, state.templates);
});

export const useAppStore = create<AppState>((set, get) => ({
  currentTemplate: 'weekday',
  templates: defaultTemplates,
  selectedItemId: null,
  orderState: {
    selectedItemId: null,
    duration: 1,
    selectedEquipmentIds: [],
    discountAmount: 0,
  },
  draggedItem: null,
  dragType: null,
  dragIndex: -1,

  setCurrentTemplate: (template) => {
    set({ currentTemplate: template, selectedItemId: null });
    broadcastState(template, get().templates);
  },

  getCurrentItems: () => {
    const state = get();
    const template = state.templates.find((t) => t.id === state.currentTemplate);
    return template ? [...template.items].sort((a, b) => a.position - b.position) : [];
  },

  selectItem: (id) => set({ selectedItemId: id }),

  updateItem: (id, updates) => {
    set((state) => {
      const newTemplates = state.templates.map((template) => {
        if (template.id !== state.currentTemplate) return template;
        return {
          ...template,
          items: template.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        };
      });
      broadcastState(state.currentTemplate, newTemplates);
      return { templates: newTemplates };
    });
  },

  addItem: (itemData) => {
    const newItem: ServiceItem = {
      ...itemData,
      id: generateId(),
      position: get().getCurrentItems().length,
    };
    set((state) => {
      const newTemplates = state.templates.map((template) => {
        if (template.id !== state.currentTemplate) return template;
        return {
          ...template,
          items: [...template.items, newItem],
        };
      });
      broadcastState(state.currentTemplate, newTemplates);
      return {
        templates: newTemplates,
        selectedItemId: newItem.id,
      };
    });
  },

  removeItem: (id) => {
    set((state) => {
      const newTemplates = state.templates.map((template) => {
        if (template.id !== state.currentTemplate) return template;
        return {
          ...template,
          items: template.items.filter((item) => item.id !== id),
        };
      });
      broadcastState(state.currentTemplate, newTemplates);
      return {
        templates: newTemplates,
        selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
      };
    });
  },

  reorderItems: (fromIndex, toIndex) => {
    set((state) => {
      const items = state.getCurrentItems();
      const [removed] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, removed);
      const reorderedItems = items.map((item, index) => ({ ...item, position: index }));
      const newTemplates = state.templates.map((template) => {
        if (template.id !== state.currentTemplate) return template;
        return { ...template, items: reorderedItems };
      });
      broadcastState(state.currentTemplate, newTemplates);
      return { templates: newTemplates };
    });
  },

  setOrderState: (updates) => {
    set((state) => {
      const newOrderState = { ...state.orderState, ...updates };
      if (updates.selectedItemId && updates.selectedItemId !== state.orderState.selectedItemId) {
        newOrderState.selectedEquipmentIds = [];
        newOrderState.discountAmount = 0;
      }
      return { orderState: newOrderState };
    });
  },

  calculatePrice: () => {
    const state = get();
    const { selectedItemId, duration, selectedEquipmentIds, discountAmount } = state.orderState;

    if (!selectedItemId) {
      return {
        basePrice: 0,
        equipmentPrice: 0,
        originalTotal: 0,
        discountAmount: 0,
        finalPrice: 0,
      };
    }

    const items = state.getCurrentItems();
    const item = items.find((i) => i.id === selectedItemId);

    if (!item) {
      return {
        basePrice: 0,
        equipmentPrice: 0,
        originalTotal: 0,
        discountAmount: 0,
        finalPrice: 0,
      };
    }

    let basePrice = item.basePrice;
    if (item.unit === 'hour') {
      basePrice = item.basePrice * duration;
    }

    const equipmentPrice = item.equipmentOptions
      .filter((eq) => selectedEquipmentIds.includes(eq.id))
      .reduce((sum, eq) => sum + eq.price, 0);

    const originalTotal = basePrice + equipmentPrice;
    const validDiscount = Math.min(discountAmount, originalTotal);
    const finalPrice = Math.max(0, originalTotal - validDiscount);

    return {
      basePrice,
      equipmentPrice,
      originalTotal,
      discountAmount: validDiscount,
      finalPrice,
    };
  },

  setDraggedItem: (item, type, index = -1) => {
    set({ draggedItem: item, dragType: type, dragIndex: index });
  },
}));

export { moduleLibrary };
