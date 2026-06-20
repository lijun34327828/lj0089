import { useAppStore } from '@/store/useAppStore';
import { moduleLibrary } from '@/store/useAppStore';
import PriceCard from './PriceCard';
import { Sparkles, Target } from 'lucide-react';
import { useState } from 'react';

const PriceCanvas = () => {
  const {
    currentTemplate,
    getCurrentItems,
    selectedItemId,
    selectItem,
    reorderItems,
    addItem,
    draggedItem,
    dragType,
    setDraggedItem,
    toasts,
  } = useAppStore();

  const items = getCurrentItems();
  const [dragOverIndex, setDragOverIndex] = useState<number>(-1);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(items[index], 'move', index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null, null);
    setDragOverIndex(-1);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = dragType === 'add' ? 'copy' : 'move';
    setDragOverIndex(index);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = dragType === 'add' ? 'copy' : 'move';
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (dragType === 'move' && draggedItem) {
      const fromIndex = items.findIndex((item) => item.id === draggedItem.id);
      if (fromIndex !== -1 && fromIndex !== index) {
        reorderItems(fromIndex, index);
      }
    } else if (dragType === 'add' && draggedItem) {
      const moduleData = moduleLibrary.find((m) => m.type === draggedItem.type);
      if (moduleData) {
        addItem({
          ...moduleData,
          name: draggedItem.name || moduleData.name,
        });
      }
    }
    
    setDraggedItem(null, null);
    setDragOverIndex(-1);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (dragType === 'add' && draggedItem) {
      const moduleData = moduleLibrary.find((m) => m.type === draggedItem.type);
      if (moduleData) {
        addItem({
          ...moduleData,
          name: draggedItem.name || moduleData.name,
        });
      }
    }
    
    setDraggedItem(null, null);
    setDragOverIndex(-1);
  };

  const templateName = currentTemplate === 'weekday' ? '日常价目表' : '周末价目表';

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 p-6 overflow-auto flex items-center justify-center relative">
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-b from-gray-300 to-gray-400 rounded-2xl shadow-2xl" />
        <div className="absolute -inset-3 bg-gradient-to-b from-gray-200 to-gray-300 rounded-xl" />
        
        <div
          className="relative w-[360px] h-[540px] bg-gradient-to-b from-amber-50 to-orange-50 rounded-lg shadow-inner overflow-hidden border-8 border-amber-800"
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
        >
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-800 via-green-700 to-green-800 text-white py-4 px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="w-5 h-5 text-yellow-400" />
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </div>
            <h2 className="text-xl font-bold tracking-wider">{templateName}</h2>
            <div className="text-xs text-green-200 mt-0.5">射箭馆服务项目</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-yellow-500 rounded-t-full" />
          </div>

          <div className="pt-24 pb-6 px-4 h-full overflow-y-auto">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                  <Sparkles className="w-8 h-8" />
                </div>
                <p className="text-sm">拖拽左侧模块到这里</p>
                <p className="text-xs mt-1">开始设计你的价目表</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="relative">
                    {dragOverIndex === index && dragType === 'move' && (
                      <div className="absolute -top-1.5 left-0 right-0 h-1 bg-green-500 rounded-full z-10" />
                    )}
                    <PriceCard
                      item={item}
                      index={index}
                      isSelected={selectedItemId === item.id}
                      onSelect={() => selectItem(item.id)}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDelete={() => {
                        const { removeItem } = useAppStore.getState();
                        removeItem(item.id);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-100 to-transparent pt-8 pb-3 text-center">
            <p className="text-xs text-amber-700/60">
              {currentTemplate === 'weekday' ? '周一至周五' : '周六周日及节假日'}
            </p>
          </div>
        </div>

        <div className="text-center mt-4 text-sm text-gray-500">
          立式公示牌预览 · 2:3 比例
        </div>
      </div>

      {toasts.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="animate-toast-in px-4 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg whitespace-nowrap"
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriceCanvas;
