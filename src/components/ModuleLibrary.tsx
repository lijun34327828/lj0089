import { useAppStore, moduleLibrary } from '@/store/useAppStore';
import { Target, Package, Users, Plus, GripVertical } from 'lucide-react';
import type { ItemType } from '@/types';

const ModuleLibrary = () => {
  const { addItem, setDraggedItem } = useAppStore();

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

  const getTypeLabel = (type: ItemType) => {
    switch (type) {
      case 'lane':
        return '箭道体验';
      case 'equipment':
        return '器材租赁';
      case 'package':
        return '多人套餐';
      default:
        return '服务项目';
    }
  };

  const handleDragStart = (e: React.DragEvent, module: typeof moduleLibrary[0]) => {
    setDraggedItem(module as any, 'add');
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setDraggedItem(null, null);
  };

  const handleAddClick = (module: typeof moduleLibrary[0]) => {
    addItem(module);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-green-600" />
          模块库
        </h2>
        <p className="text-xs text-gray-500 mt-1">拖拽模块到画布或点击添加</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {moduleLibrary.map((module, index) => {
          const Icon = getIcon(module.type);
          return (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, module)}
              onDragEnd={handleDragEnd}
              className="group relative bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-grab hover:border-green-400 hover:shadow-md transition-all duration-200 active:cursor-grabbing"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm">{module.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{module.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleAddClick(module)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-green-500 hover:text-white transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {getTypeLabel(module.type)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 提示：</p>
          <p>• 拖拽模块到画布添加</p>
          <p>• 在画布内拖拽调整顺序</p>
          <p>• 点击项目可编辑详情</p>
        </div>
      </div>
    </div>
  );
};

export default ModuleLibrary;
