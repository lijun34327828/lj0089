import { useAppStore } from '@/store/useAppStore';
import { Target, Package, Users, GripVertical, Trash2, AlertTriangle } from 'lucide-react';
import type { ServiceItem, ItemType, DiscountType, EditableField } from '@/types';

interface PriceCardProps {
  item: ServiceItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDelete: () => void;
}

const FIELD_LABELS: Record<EditableField, string> = {
  name: '名称',
  basePrice: '价格',
  description: '描述',
};

const PriceCard = ({
  item,
  index,
  isSelected,
  onSelect,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onDelete,
}: PriceCardProps) => {
  const { editingUsers, conflicts, resolveConflict } = useAppStore();

  const itemEditingUsers = editingUsers.filter((eu) => eu.itemId === item.id);
  const itemConflicts = conflicts.filter((c) => c.itemId === item.id);

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

  const Icon = getIcon(item.type);
  const discountStyle = item.discountTag?.enabled
    ? getDiscountStyle(item.discountTag.type, item.discountTag.color)
    : null;

  const editingNickname = itemEditingUsers.length > 0 ? itemEditingUsers[0].nickname : null;

  return (
    <div
      draggable
      onClick={onSelect}
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className={`
        relative bg-white rounded-xl p-4 cursor-pointer transition-all duration-200
        border-2 select-none group
        ${isSelected
          ? 'border-green-500 shadow-lg shadow-green-200 scale-[1.02]'
          : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
        }
        ${itemConflicts.length > 0 ? 'border-orange-400' : ''}
      `}
    >
      {itemConflicts.length > 0 && (
        <div className="absolute -top-1 left-0 right-0 z-20 animate-slide-down">
          {itemConflicts.map((conflict) => (
            <div
              key={conflict.conflictId}
              className="bg-orange-50 border border-orange-300 rounded-t-lg p-2 shadow-md"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-xs font-bold text-orange-700">
                  {FIELD_LABELS[conflict.field]}冲突
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resolveConflict(conflict.conflictId, conflict.itemId, conflict.field, conflict.localValue);
                  }}
                  className="flex-1 p-2 bg-blue-50 border-2 border-blue-300 rounded-lg text-center hover:bg-blue-100 transition-colors"
                >
                  <div className="text-[10px] text-blue-500 mb-0.5">本地值 · {conflict.localNickname}</div>
                  <div className="text-sm font-bold text-blue-700 truncate">
                    {String(conflict.localValue)}
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resolveConflict(conflict.conflictId, conflict.itemId, conflict.field, conflict.remoteValue);
                  }}
                  className="flex-1 p-2 bg-purple-50 border-2 border-purple-300 rounded-lg text-center hover:bg-purple-100 transition-colors"
                >
                  <div className="text-[10px] text-purple-500 mb-0.5">远端值 · {conflict.remoteNickname}</div>
                  <div className="text-sm font-bold text-purple-700 truncate">
                    {String(conflict.remoteValue)}
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {item.discountTag?.enabled && (
        <div
          className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold shadow-md transform rotate-3 z-10"
          style={{ backgroundColor: discountStyle?.bg, color: discountStyle?.text }}
        >
          {item.discountTag.text}
        </div>
      )}

      {editingNickname && (
        <div className="absolute top-1 right-1 z-10 animate-bubble-in">
          <div className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-medium rounded-full shadow-lg whitespace-nowrap">
            {editingNickname}正在编辑
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-100 text-green-600 flex items-center justify-center">
              <Icon className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm truncate">{item.name}</h3>
          </div>
          
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
          
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xs text-gray-500">¥</span>
            <span className="text-xl font-bold text-green-700">{item.basePrice}</span>
            <span className="text-xs text-gray-400">/ {getUnitLabel(item.unit)}</span>
          </div>

          {item.equipmentOptions && item.equipmentOptions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.equipmentOptions.slice(0, 3).map((eq) => (
                <span
                  key={eq.id}
                  className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded"
                >
                  {eq.name}
                </span>
              ))}
              {item.equipmentOptions.length > 3 && (
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                  +{item.equipmentOptions.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default PriceCard;
