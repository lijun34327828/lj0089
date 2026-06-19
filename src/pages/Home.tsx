import Header from '@/components/Header';
import ModuleLibrary from '@/components/ModuleLibrary';
import PriceCanvas from '@/components/PriceCanvas';
import ConfigPanel from '@/components/ConfigPanel';
import OrderCalculator from '@/components/OrderCalculator';

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <ModuleLibrary />
        <PriceCanvas />
        <ConfigPanel />
      </div>
      
      <OrderCalculator />
    </div>
  );
}
