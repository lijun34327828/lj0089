import { useAppStore } from '@/store/useAppStore';
import { Calculator, Clock, Package, Tag, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const OrderCalculator = () => {
  const {
    orderState,
    setOrderState,
    getCurrentItems,
    calculatePrice,
  } = useAppStore();

  const items = getCurrentItems();
  const price = calculatePrice();
  const [isExpanded, setIsExpanded] = useState(true);

  const selectedItem = items.find((item) => item.id === orderState.selectedItemId);
  const discountExceedsOriginal = orderState.discountAmount > price.originalTotal && price.originalTotal > 0;

  const toggleEquipment = (equipmentId: string) => {
    const currentSelected = orderState.selectedEquipmentIds;
    if (currentSelected.includes(equipmentId)) {
      setOrderState({
        selectedEquipmentIds: currentSelected.filter((id) => id !== equipmentId),
      });
    } else {
      setOrderState({
        selectedEquipmentIds: [...currentSelected, equipmentId],
      });
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

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      <div
        className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-md">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">订单计算器</h3>
            <p className="text-xs text-gray-500">模拟计算服务总价</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">应付总价</p>
            <p className="text-xl font-bold text-green-600">
              ¥{price.finalPrice.toFixed(2)}
            </p>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-4 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">选择服务项目</label>
              <select
                value={orderState.selectedItemId || ''}
                onChange={(e) => setOrderState({ selectedItemId: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="">请选择项目</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - ¥{item.basePrice}/{getUnitLabel(item.unit)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  使用时长
                </span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={orderState.duration}
                  onChange={(e) => setOrderState({ duration: Number(e.target.value) })}
                  disabled={!selectedItem || selectedItem.unit !== 'hour'}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                />
                <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg text-sm text-gray-600">
                  小时
                </span>
              </div>
            </div>

            <div className="col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  租赁器材
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {selectedItem && selectedItem.equipmentOptions.length > 0 ? (
                  selectedItem.equipmentOptions.map((eq) => {
                    const isSelected = orderState.selectedEquipmentIds.includes(eq.id);
                    return (
                      <button
                        key={eq.id}
                        onClick={() => toggleEquipment(eq.id)}
                        className={`
                          px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all
                          ${isSelected
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        {eq.name} (+¥{eq.price})
                      </button>
                    );
                  })
                ) : (
                  <span className="text-xs text-gray-400 py-1.5">
                    {selectedItem ? '暂无附加器材' : '请先选择项目'}
                  </span>
                )}
              </div>
            </div>

            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  优惠减免
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                <input
                  type="number"
                  min={0}
                  value={orderState.discountAmount}
                  onChange={(e) => setOrderState({ discountAmount: Number(e.target.value) })}
                  className={`
                    w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent
                    ${discountExceedsOriginal
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-200 focus:ring-green-500'
                    }
                  `}
                />
              </div>
              {discountExceedsOriginal && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  优惠金额不能超过原价
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end gap-8">
            <div className="text-right">
              <p className="text-xs text-gray-500">基础费用</p>
              <p className="text-sm font-medium text-gray-700">¥{price.basePrice.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">器材费用</p>
              <p className="text-sm font-medium text-gray-700">¥{price.equipmentPrice.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">原价合计</p>
              <p className="text-sm font-medium text-gray-700 line-through">
                ¥{price.originalTotal.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">优惠减免</p>
              <p className="text-sm font-medium text-red-500">-¥{price.discountAmount.toFixed(2)}</p>
            </div>
            <div className="text-right pl-4 border-l border-gray-200">
              <p className="text-xs text-gray-500">应付总价</p>
              <p className="text-2xl font-bold text-green-600">
                ¥{price.finalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCalculator;
