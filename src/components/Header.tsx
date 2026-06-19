import { useAppStore } from '@/store/useAppStore';
import { Sun, Moon, Target } from 'lucide-react';
import type { TemplateMode } from '@/types';

const Header = () => {
  const { currentTemplate, setCurrentTemplate } = useAppStore();

  const templates: { id: TemplateMode; label: string; icon: typeof Sun }[] = [
    { id: 'weekday', label: '日常价目', icon: Sun },
    { id: 'weekend', label: '周末价目', icon: Moon },
  ];

  return (
    <header className="h-16 bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white flex items-center justify-between px-6 shadow-lg border-b-4 border-yellow-600">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
          <Target className="w-6 h-6 text-green-900" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide">射箭馆价目配置器</h1>
          <p className="text-xs text-green-200">可视化价目表设计与订单计算</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-green-950/50 rounded-xl p-1">
        {templates.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setCurrentTemplate(id)}
            className={`
              px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 text-sm font-medium
              ${currentTemplate === id
                ? 'bg-yellow-500 text-green-900 shadow-md'
                : 'text-green-200 hover:bg-green-800/50 hover:text-white'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="text-sm text-green-200">
        当前显示：<span className="text-yellow-400 font-semibold">
          {currentTemplate === 'weekday' ? '日常模式' : '周末模式'}
        </span>
      </div>
    </header>
  );
};

export default Header;
