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
