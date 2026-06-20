import { usePreviewStore } from '@/store/usePreviewStore';
import PreviewPriceCard from '@/components/PreviewPriceCard';
import { Sparkles, Target, Wifi, WifiOff } from 'lucide-react';

const PreviewApp = () => {
  const { currentTemplate, getCurrentItems, connected } = usePreviewStore();
  const items = getCurrentItems();
  const templateName = currentTemplate === 'weekday' ? '日常价目表' : '周末价目表';

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 flex items-center justify-center p-8 overflow-hidden">
      <div className="relative">
        <div className="absolute -inset-5 bg-gradient-to-b from-gray-400 to-gray-500 rounded-2xl shadow-2xl" />
        <div className="absolute -inset-4 bg-gradient-to-b from-gray-300 to-gray-400 rounded-xl" />

        <div className="relative w-[420px] h-[630px] bg-gradient-to-b from-amber-50 to-orange-50 rounded-lg shadow-inner overflow-hidden border-[10px] border-amber-800">
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-800 via-green-700 to-green-800 text-white py-5 px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <Target className="w-6 h-6 text-yellow-400" />
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <h2 className="text-2xl font-bold tracking-widest">{templateName}</h2>
            <div className="text-sm text-green-200 mt-1">射箭馆服务项目</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-yellow-500 rounded-t-full" />
          </div>

          <div className="pt-28 pb-8 px-5 h-full overflow-y-auto">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10" />
                </div>
                <p className="text-base">暂无服务项目</p>
                <p className="text-sm mt-2">请在编辑器中添加项目</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <PreviewPriceCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-100 to-transparent pt-10 pb-4 text-center">
            <p className="text-sm text-amber-700/70 font-medium">
              {currentTemplate === 'weekday' ? '周一至周五' : '周六周日及节假日'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-5 text-sm text-gray-600 font-medium tracking-wide">
          <span>立式公示牌 · 只读预览</span>
          <span className="flex items-center gap-1 ml-3">
            {connected ? (
              <Wifi className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-gray-400" />
            )}
            <span className={connected ? 'text-green-600' : 'text-gray-400'}>
              {connected ? '已同步' : '等待连接'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PreviewApp;
