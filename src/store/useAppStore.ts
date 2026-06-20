import { create } from 'zustand';
import type { TemplateMode, ServiceItem, OrderState, CalculatedPrice, PriceTemplate, EditingUser, ConflictInfo, OnlineUser, ToastMessage, EditableField } from '@/types';
import { defaultTemplates, moduleLibrary } from '@/data/defaultData';
import { sendSyncMessage, initSyncClient, onSyncConnect, onSyncMessage, clientId, nickname } from '@/sync/syncClient';

interface AppState {
  currentTemplate: TemplateMode;
  templates: PriceTemplate[];
  selectedItemId: string | null;
  orderState: OrderState;
  draggedItem: ServiceItem | null;
  dragType: 'move' | 'add' | null;
  dragIndex: number;
  editingUsers: EditingUser[];
  conflicts: ConflictInfo[];
  onlineUsers: OnlineUser[];
  toasts: ToastMessage[];
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
  resolveConflict: (conflictId: string, itemId: string, field: EditableField, resolvedValue: string | number) => void;
  addToast: (message: string) => void;
  removeToast: (id: string) => void;
  applyRemoteState: (currentTemplate: TemplateMode, templates: PriceTemplate[]) => void;
}

let itemIdCounter = 100;
const generateId = () => `item-new-${itemIdCounter++}`;

const broadcastFieldEdit = (
  itemId: string,
  field: EditableField,
  value: string | number,
  currentTemplate: TemplateMode,
  templates: PriceTemplate[]
) => {
  sendSyncMessage({
    type: 'FIELD_EDIT',
    clientId,
    nickname,
    itemId,
    field,
    value,
    currentTemplate,
    templates,
  });
};

const broadcastReorder = (
  fromIndex: number,
  toIndex: number,
  currentTemplate: TemplateMode,
  templates: PriceTemplate[]
) => {
  sendSyncMessage({
    type: 'REORDER',
    clientId,
    nickname,
    fromIndex,
    toIndex,
    currentTemplate,
    templates,
  });
};

const broadcastState = (currentTemplate: TemplateMode, templates: PriceTemplate[]) => {
  sendSyncMessage({
    type: 'STATE_SYNC',
    currentTemplate,
    templates,
    clientId,
  });
};

initSyncClient('editor');

onSyncConnect(() => {
  const state = useAppStore.getState();
  broadcastState(state.currentTemplate, state.templates);
});

onSyncMessage((data) => {
  const state = useAppStore.getState();

  if (data.type === 'FIELD_EDIT_NOTIFY') {
    const editingUser: EditingUser = {
      clientId: data.clientId,
      nickname: data.nickname,
      itemId: data.itemId,
      field: data.field,
      timestamp: Date.now(),
    };

    useAppStore.setState((s) => {
      const filtered = s.editingUsers.filter(
        (eu) => !(eu.itemId === data.itemId && eu.field === data.field && eu.clientId === data.clientId)
      );
      return {
        editingUsers: [...filtered, editingUser],
      };
    });

    useAppStore.getState().applyRemoteState(data.currentTemplate, data.templates);

    setTimeout(() => {
      useAppStore.setState((s) => ({
        editingUsers: s.editingUsers.filter(
          (eu) => !(eu.itemId === data.itemId && eu.field === data.field && eu.clientId === data.clientId && eu.timestamp === editingUser.timestamp)
        ),
      }));
    }, 3000);
    return;
  }

  if (data.type === 'CONFLICT_DETECTED') {
    const myClientId = clientId;

    let localValue: string | number = '';
    let localNickname = '';
    let remoteValue: string | number = '';
    let remoteNickname = '';

    if (data.initiatorClientId === myClientId) {
      localValue = data.initiatorValue;
      localNickname = data.initiatorNickname;
      remoteValue = data.challengerValue;
      remoteNickname = data.challengerNickname;
    } else if (data.challengerClientId === myClientId) {
      localValue = data.challengerValue;
      localNickname = data.challengerNickname;
      remoteValue = data.initiatorValue;
      remoteNickname = data.initiatorNickname;
    } else {
      localValue = data.initiatorValue;
      localNickname = data.initiatorNickname;
      remoteValue = data.challengerValue;
      remoteNickname = data.challengerNickname;
    }

    const conflict: ConflictInfo = {
      conflictId: data.conflictId,
      itemId: data.itemId,
      field: data.field,
      localValue,
      localNickname,
      remoteValue,
      remoteNickname,
    };

    useAppStore.setState((s) => {
      const existing = s.conflicts.find(
        (c) => c.itemId === data.itemId && c.field === data.field
      );
      if (existing) return s;
      return { conflicts: [...s.conflicts, conflict] };
    });
    return;
  }

  if (data.type === 'CONFLICT_RESOLVE') {
    useAppStore.setState((s) => ({
      conflicts: s.conflicts.filter((c) => c.conflictId !== data.conflictId),
    }));

    useAppStore.getState().applyRemoteState(data.currentTemplate, data.templates);
    return;
  }

  if (data.type === 'REORDER_REJECTED') {
    if (data.clientId === clientId) {
      useAppStore.getState().addToast('排序冲突，已恢复原位置');
    }
    return;
  }

  if (data.type === 'USER_LIST') {
    useAppStore.setState({ onlineUsers: data.users.filter((u: OnlineUser) => u.clientId !== clientId) });
    return;
  }

  if (data.type === 'STATE_SYNC') {
    if (data.clientId === clientId) return;
    useAppStore.getState().applyRemoteState(data.currentTemplate, data.templates);
    return;
  }

  if (data.type === 'REORDER') {
    useAppStore.getState().applyRemoteState(data.currentTemplate, data.templates);
    return;
  }
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
  editingUsers: [],
  conflicts: [],
  onlineUsers: [],
  toasts: [],

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

      const editableFields: EditableField[] = ['name', 'basePrice', 'description'];
      for (const field of editableFields) {
        if (field in updates) {
          broadcastFieldEdit(id, field, updates[field] as string | number, state.currentTemplate, newTemplates);
        }
      }

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
      broadcastReorder(fromIndex, toIndex, state.currentTemplate, newTemplates);
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

  resolveConflict: (conflictId, itemId, field, resolvedValue) => {
    const state = get();
    const newTemplates = state.templates.map((template) => {
      if (template.id !== state.currentTemplate) return template;
      return {
        ...template,
        items: template.items.map((item) =>
          item.id === itemId ? { ...item, [field]: resolvedValue } : item
        ),
      };
    });

    sendSyncMessage({
      type: 'CONFLICT_RESOLVE',
      clientId,
      conflictId,
      itemId,
      field,
      resolvedValue,
      currentTemplate: state.currentTemplate,
      templates: newTemplates,
    });

    set({
      templates: newTemplates,
      conflicts: state.conflicts.filter((c) => c.conflictId !== conflictId),
    });
  },

  addToast: (message) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const toast: ToastMessage = { id, message, timestamp: Date.now() };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    setTimeout(() => {
      useAppStore.setState((s) => ({
        toasts: s.toasts.filter((t) => t.id !== id),
      }));
    }, 2000);
  },

  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  applyRemoteState: (currentTemplate, templates) => {
    set({ currentTemplate, templates });
  },
}));

export { moduleLibrary };
