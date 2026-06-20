export type ItemType = 'lane' | 'equipment' | 'package';
export type PriceUnit = 'hour' | 'set' | 'person' | 'item';
export type DiscountType = 'sale' | 'hot' | 'new' | 'custom';
export type TemplateMode = 'weekday' | 'weekend';

export interface EquipmentOption {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export interface DiscountTag {
  enabled: boolean;
  text: string;
  type: DiscountType;
  color: string;
}

export interface ServiceItem {
  id: string;
  type: ItemType;
  name: string;
  basePrice: number;
  unit: PriceUnit;
  description: string;
  equipmentOptions: EquipmentOption[];
  discountTag: DiscountTag;
  position: number;
}

export interface PriceTemplate {
  id: TemplateMode;
  name: string;
  items: ServiceItem[];
}

export interface OrderState {
  selectedItemId: string | null;
  duration: number;
  selectedEquipmentIds: string[];
  discountAmount: number;
}

export interface CalculatedPrice {
  basePrice: number;
  equipmentPrice: number;
  originalTotal: number;
  discountAmount: number;
  finalPrice: number;
}

export type EditableField = 'name' | 'basePrice' | 'description';

export interface EditingUser {
  clientId: string;
  nickname: string;
  itemId: string;
  field: EditableField;
  timestamp: number;
}

export interface ConflictInfo {
  conflictId: string;
  itemId: string;
  field: EditableField;
  localValue: string | number;
  localNickname: string;
  remoteValue: string | number;
  remoteNickname: string;
}

export interface OnlineUser {
  clientId: string;
  nickname: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  timestamp: number;
}

export type SyncMessageType =
  | 'STATE_SYNC'
  | 'CLIENT_JOIN'
  | 'CLIENT_LEAVE'
  | 'USER_LIST'
  | 'FIELD_EDIT'
  | 'FIELD_EDIT_NOTIFY'
  | 'CONFLICT_DETECTED'
  | 'CONFLICT_RESOLVE'
  | 'REORDER'
  | 'REORDER_REJECTED'
  | 'CONFIRMED_SYNC';

export interface BaseSyncMessage {
  type: SyncMessageType;
}

export interface StateSyncMessage extends BaseSyncMessage {
  type: 'STATE_SYNC';
  currentTemplate: TemplateMode;
  templates: PriceTemplate[];
  clientId?: string;
}

export interface ClientJoinMessage extends BaseSyncMessage {
  type: 'CLIENT_JOIN';
  clientId: string;
  nickname: string;
  role: 'editor' | 'preview';
}

export interface ClientLeaveMessage extends BaseSyncMessage {
  type: 'CLIENT_LEAVE';
  clientId: string;
}

export interface UserListMessage extends BaseSyncMessage {
  type: 'USER_LIST';
  users: OnlineUser[];
}

export interface FieldEditMessage extends BaseSyncMessage {
  type: 'FIELD_EDIT';
  clientId: string;
  nickname: string;
  itemId: string;
  field: EditableField;
  value: string | number;
  currentTemplate: TemplateMode;
  templates: PriceTemplate[];
}

export interface FieldEditNotifyMessage extends BaseSyncMessage {
  type: 'FIELD_EDIT_NOTIFY';
  clientId: string;
  nickname: string;
  itemId: string;
  field: EditableField;
  value: string | number;
  currentTemplate: TemplateMode;
  templates: PriceTemplate[];
}

export interface ConflictDetectedMessage extends BaseSyncMessage {
  type: 'CONFLICT_DETECTED';
  conflictId: string;
  itemId: string;
  field: EditableField;
  initiatorClientId: string;
  initiatorNickname: string;
  initiatorValue: string | number;
  challengerClientId: string;
  challengerNickname: string;
  challengerValue: string | number;
  currentTemplate: TemplateMode;
  templates: PriceTemplate[];
}

export interface ConflictResolveMessage extends BaseSyncMessage {
  type: 'CONFLICT_RESOLVE';
  clientId: string;
  conflictId: string;
  itemId: string;
  field: EditableField;
  resolvedValue: string | number;
  currentTemplate: TemplateMode;
  templates: PriceTemplate[];
}

export interface ReorderMessage extends BaseSyncMessage {
  type: 'REORDER';
  clientId: string;
  nickname: string;
  fromIndex: number;
  toIndex: number;
  currentTemplate: TemplateMode;
  templates: PriceTemplate[];
}

export interface ReorderRejectedMessage extends BaseSyncMessage {
  type: 'REORDER_REJECTED';
  clientId: string;
  nickname: string;
}

export interface ConfirmedSyncMessage extends BaseSyncMessage {
  type: 'CONFIRMED_SYNC';
  currentTemplate: TemplateMode;
  templates: PriceTemplate[];
}

export type SyncMessage =
  | StateSyncMessage
  | ClientJoinMessage
  | ClientLeaveMessage
  | UserListMessage
  | FieldEditMessage
  | FieldEditNotifyMessage
  | ConflictDetectedMessage
  | ConflictResolveMessage
  | ReorderMessage
  | ReorderRejectedMessage
  | ConfirmedSyncMessage;
