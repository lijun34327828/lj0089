import { useAppStore } from '@/store/useAppStore';
import { Settings, Tag, DollarSign, Package, X, Plus, Trash2 } from 'lucide-react';
import type { PriceUnit, DiscountType, EquipmentOption } from '@/types';
import { useState } from 'react';

const ConfigPanel = () => {
  const { selectedItemId, getCurrentItems, updateItem } = useAppStore();
  const items = getCurrentItems();
  const selectedItem = items.find((item) => item.id === selectedItemId);

  const [activeTab, setActiveTab] = useState<'basic' | 'equipment' | 'discount'>('basic');

  if (!selectedItem) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-green-600" />
            项目配置
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Settings className="w-8 h-8" />
          </div>
          <p className="text-sm text-center">请在画布中选择一个项目</p>
          <p className="text-xs text-center mt-1">以编辑其详细配置</p>
        </div>
      </div>
    );
  }

  const handleBasicChange = (field: string, value: string | number) => {
    updateItem(selectedItem.id, { [field]: value });
  };

  const handleEquipmentChange = (index: number, field: string, value: string | number) => {
    const newEquipment = [...selectedItem.equipmentOptions];
    newEquipment[index] = { ...newEquipment[index], [field]: value };
    updateItem(selectedItem.id, { equipmentOptions: newEquipment });
  };

  const addEquipment = () => {
    const newEquipment: EquipmentOption = {
      id: `eq-${Date.now()}`,
      name: '新器材',
      price: 0,
      unit: '件',
    };
    updateItem(selectedItem.id, {
      equipmentOptions: [...selectedItem.equipmentOptions, newEquipment],
    });
  };

  const removeEquipment = (index: number) => {
    const newEquipment = selectedItem.equipmentOptions.filter((_, i) => i !== index);
    updateItem(selectedItem.id, { equipmentOptions: newEquipment });
  };

  const handleDiscountChange = (field: string, value: boolean | string) => {
    updateItem(selectedItem.id, {
      discountTag: { ...selectedItem.discountTag, [field]: value },
    });
  };

  const unitOptions: { value: PriceUnit; label: string }[] = [
    { value: 'hour', label: '小时' },
    { value: 'set', label: '套' },
    { value: 'person', label: '人' },
    { value: 'item', label: '件' },
  ];

  const discountTypeOptions: { value: DiscountType; label: string; color: string }[] = [
    { value: 'sale', label: '促销', color: 'bg-red-500' },
    { value: 'hot', label: '热卖', color: 'bg-amber-500' },
    { value: 'new', label: '新品', color: 'bg-green-500' },
    { value: 'custom', label: '自定义', color: 'bg-gray-500' },
  ];

  const tabs = [
    { id: 'basic', label: '基础设置', icon: DollarSign },
    { id: 'equipment', label: '附加器材', icon: Package },
    { id: 'discount', label: '优惠标签', icon: Tag },
  ] as const;

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-green-600" />
          项目配置
        </h2>
        <p className="text-xs text-gray-500 mt-1 truncate">{selectedItem.name}</p>
      </div>

      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors
                ${activeTab === tab.id
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">项目名称</label>
              <input
                type="text"
                value={selectedItem.name}
                onChange={(e) => handleBasicChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">基础价格</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                <input
                  type="number"
                  value={selectedItem.basePrice}
                  onChange={(e) => handleBasicChange('basePrice', Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">计价单位</label>
              <div className="grid grid-cols-4 gap-2">
                {unitOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleBasicChange('unit', option.value)}
                    className={`
                      py-2 text-xs font-medium rounded-lg transition-all
                      ${selectedItem.unit === option.value
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">项目描述</label>
              <textarea
                value={selectedItem.description}
                onChange={(e) => handleBasicChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">附加器材列表</span>
              <button
                onClick={addEquipment}
                className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                添加
              </button>
            </div>

            {selectedItem.equipmentOptions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">暂无附加器材</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedItem.equipmentOptions.map((eq, index) => (
                  <div
                    key={eq.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="text"
                        value={eq.name}
                        onChange={(e) => handleEquipmentChange(index, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                      <button
                        onClick={() => removeEquipment(index)}
                        className="ml-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">¥</span>
                        <input
                          type="number"
                          value={eq.price}
                          onChange={(e) => handleEquipmentChange(index, 'price', Number(e.target.value))}
                          className="w-full pl-5 pr-2 py-1 text-sm bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <span className="text-xs text-gray-500">/</span>
                      <input
                        type="text"
                        value={eq.unit}
                        onChange={(e) => handleEquipmentChange(index, 'unit', e.target.value)}
                        className="w-12 px-2 py-1 text-sm text-center bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'discount' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">启用优惠标签</span>
              <button
                onClick={() => handleDiscountChange('enabled', !selectedItem.discountTag.enabled)}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${selectedItem.discountTag.enabled ? 'bg-green-500' : 'bg-gray-300'}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform
                    ${selectedItem.discountTag.enabled ? 'translate-x-7' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {selectedItem.discountTag.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">标签类型</label>
                  <div className="grid grid-cols-4 gap-2">
                    {discountTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleDiscountChange('type', option.value)}
                        className={`
                          py-2 text-xs font-medium rounded-lg transition-all flex flex-col items-center gap-1
                          ${selectedItem.discountTag.type === option.value
                            ? 'ring-2 ring-green-500 ring-offset-1'
                            : ''
                          }
                        `}
                      >
                        <span className={`w-3 h-3 rounded-full ${option.color}`} />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">标签文字</label>
                  <input
                    type="text"
                    value={selectedItem.discountTag.text}
                    onChange={(e) => handleDiscountChange('text', e.target.value)}
                    placeholder="如：热卖、特惠"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                {selectedItem.discountTag.type === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">标签颜色</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedItem.discountTag.color}
                        onChange={(e) => handleDiscountChange('color', e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedItem.discountTag.color}
                        onChange={(e) => handleDiscountChange('color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">预览效果</label>
                  <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-bold text-white shadow-md"
                      style={{ backgroundColor: selectedItem.discountTag.color }}
                    >
                      {selectedItem.discountTag.text || '标签'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigPanel;
