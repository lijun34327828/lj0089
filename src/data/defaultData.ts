import type { ServiceItem, PriceTemplate, EquipmentOption } from '@/types';

const equipmentOptionsLane: EquipmentOption[] = [
  { id: 'eq-1', name: '反曲弓', price: 30, unit: '把' },
  { id: 'eq-2', name: '复合弓', price: 50, unit: '把' },
  { id: 'eq-3', name: '护臂护指', price: 10, unit: '套' },
  { id: 'eq-4', name: '箭支', price: 2, unit: '支' },
];

const equipmentOptionsPackage: EquipmentOption[] = [
  { id: 'eq-p1', name: '升级复合弓', price: 20, unit: '人' },
  { id: 'eq-p2', name: '专业教练指导', price: 80, unit: '小时' },
];

export const defaultWeekdayItems: ServiceItem[] = [
  {
    id: 'item-1',
    type: 'lane',
    name: '标准箭道',
    basePrice: 60,
    unit: 'hour',
    description: '10米标准箭道，适合初学者',
    equipmentOptions: equipmentOptionsLane,
    discountTag: { enabled: false, text: '', type: 'custom', color: '#ef4444' },
    position: 0,
  },
  {
    id: 'item-2',
    type: 'lane',
    name: '专业箭道',
    basePrice: 100,
    unit: 'hour',
    description: '18米专业箭道，配备专业设备',
    equipmentOptions: equipmentOptionsLane,
    discountTag: { enabled: true, text: '热卖', type: 'hot', color: '#f59e0b' },
    position: 1,
  },
  {
    id: 'item-3',
    type: 'equipment',
    name: '器材租赁套装',
    basePrice: 40,
    unit: 'set',
    description: '包含弓、箭、护具全套',
    equipmentOptions: [
      { id: 'eq-s1', name: '儿童套装', price: 30, unit: '套' },
      { id: 'eq-s2', name: '成人套装', price: 40, unit: '套' },
    ],
    discountTag: { enabled: false, text: '', type: 'custom', color: '#ef4444' },
    position: 2,
  },
  {
    id: 'item-4',
    type: 'package',
    name: '双人体验套餐',
    basePrice: 168,
    unit: 'person',
    description: '双人1小时射箭体验，含基础器材',
    equipmentOptions: equipmentOptionsPackage,
    discountTag: { enabled: true, text: '超值', type: 'sale', color: '#ef4444' },
    position: 3,
  },
  {
    id: 'item-5',
    type: 'package',
    name: '团建套餐',
    basePrice: 888,
    unit: 'person',
    description: '6人团队2小时体验，含专业教练',
    equipmentOptions: equipmentOptionsPackage,
    discountTag: { enabled: false, text: '', type: 'custom', color: '#ef4444' },
    position: 4,
  },
];

export const defaultWeekendItems: ServiceItem[] = [
  {
    id: 'item-w1',
    type: 'lane',
    name: '标准箭道',
    basePrice: 80,
    unit: 'hour',
    description: '10米标准箭道，适合初学者',
    equipmentOptions: equipmentOptionsLane,
    discountTag: { enabled: false, text: '', type: 'custom', color: '#ef4444' },
    position: 0,
  },
  {
    id: 'item-w2',
    type: 'lane',
    name: '专业箭道',
    basePrice: 130,
    unit: 'hour',
    description: '18米专业箭道，配备专业设备',
    equipmentOptions: equipmentOptionsLane,
    discountTag: { enabled: true, text: '热卖', type: 'hot', color: '#f59e0b' },
    position: 1,
  },
  {
    id: 'item-w3',
    type: 'equipment',
    name: '器材租赁套装',
    basePrice: 50,
    unit: 'set',
    description: '包含弓、箭、护具全套',
    equipmentOptions: [
      { id: 'eq-s1', name: '儿童套装', price: 35, unit: '套' },
      { id: 'eq-s2', name: '成人套装', price: 50, unit: '套' },
    ],
    discountTag: { enabled: false, text: '', type: 'custom', color: '#ef4444' },
    position: 2,
  },
  {
    id: 'item-w4',
    type: 'package',
    name: '双人体验套餐',
    basePrice: 198,
    unit: 'person',
    description: '双人1小时射箭体验，含基础器材',
    equipmentOptions: equipmentOptionsPackage,
    discountTag: { enabled: true, text: '周末特惠', type: 'sale', color: '#ef4444' },
    position: 3,
  },
  {
    id: 'item-w5',
    type: 'package',
    name: '亲子套餐',
    basePrice: 258,
    unit: 'person',
    description: '一大一小1小时体验，含儿童器材',
    equipmentOptions: equipmentOptionsPackage,
    discountTag: { enabled: true, text: '新品', type: 'new', color: '#22c55e' },
    position: 4,
  },
];

export const defaultTemplates: PriceTemplate[] = [
  { id: 'weekday', name: '日常价目', items: defaultWeekdayItems },
  { id: 'weekend', name: '周末价目', items: defaultWeekendItems },
];

export const moduleLibrary: Omit<ServiceItem, 'id' | 'position'>[] = [
  {
    type: 'lane',
    name: '箭道体验',
    basePrice: 0,
    unit: 'hour',
    description: '箭道使用费用',
    equipmentOptions: equipmentOptionsLane,
    discountTag: { enabled: false, text: '', type: 'custom', color: '#ef4444' },
  },
  {
    type: 'equipment',
    name: '器材租赁',
    basePrice: 0,
    unit: 'set',
    description: '射箭器材租赁',
    equipmentOptions: equipmentOptionsLane,
    discountTag: { enabled: false, text: '', type: 'custom', color: '#ef4444' },
  },
  {
    type: 'package',
    name: '多人套餐',
    basePrice: 0,
    unit: 'person',
    description: '多人体验套餐',
    equipmentOptions: equipmentOptionsPackage,
    discountTag: { enabled: false, text: '', type: 'custom', color: '#ef4444' },
  },
];
