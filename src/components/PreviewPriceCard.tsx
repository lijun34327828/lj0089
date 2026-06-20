import { usePreviewStore } from '@/store/usePreviewStore';
import type { ServiceItem, ItemType, DiscountType } from '@/types';
import { Target, Package, Users, Sparkles } from 'lucide-react';

interface PreviewPriceCardProps {
  item: ServiceItem;
}

const getIcon = (type: ItemType) => {
  switch (type) {
    case 'lane':
      return Target;
    case 'equipment':
      return Package;
    case 'package':
      return Users;
    default:
      return Target;
  }
};

const getUnitLabel = (unit: string) => {
  switch (unit) {
    case 'hour':
      return '小时';
    case 'set':
      return '套';
    case 'person':
      return '人';
    case 'item':
      return '件';
    default:
      return '';
  }
};

const getDiscountStyle = (type: DiscountType, color: string) => {
  switch (type) {
    case 'sale':
      return { bg: '#ef4444', text: 'white' };
    case 'hot':
      return { bg: '#f59e0b', text: 'white' };
    case 'new':
      return { bg: '#22c55e', text: 'white' };
    default:
      return { bg: color, text: 'white' };
  }
};

const PreviewPriceCard = ({ item }: PreviewPriceCardProps) => {
  const Icon = getIcon(item.type);
  const discountStyle = item.discountTag?.enabled
    ? getDiscountStyle(item.discountTag.type, item.discountTag.color)
    : null;

  return (
    <div className="relative bg-white rounded-xl p-5 border-2 border-amber-100 shadow-sm">
      {item.discountTag?.enabled && (
        <div
          className="absolute -top-2.5 -right-2.5 px-3 py-1 rounded-full text-xs font-bold shadow-lg transform rotate-3 z-10"
          style={{ backgroundColor: discountStyle?.bg, color: discountStyle?.text }}
        >
          {item.discountTag.text}
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-gray-800 text-base">{item.name}</h3>
      </div>

      <p className="text-sm text-gray-500 mb-3">{item.description}</p>

      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-sm text-gray-500">¥</span>
        <span className="text-2xl font-bold text-green-700">{item.basePrice}</span>
        <span className="text-sm text-gray-400">/ {getUnitLabel(item.unit)}</span>
      </div>

      {item.equipmentOptions && item.equipmentOptions.length > 0 && (
        <div className="pt-3 border-t border-amber-100">
          <p className="text-xs text-gray-400 mb-2">附加器材</p>
          <div className="flex flex-wrap gap-1.5">
            {item.equipmentOptions.map((eq) => (
              <span
                key={eq.id}
                className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100"
              >
                {eq.name} ¥{eq.price}/{eq.unit}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewPriceCard;
