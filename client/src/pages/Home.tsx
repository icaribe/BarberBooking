import { useState } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import TabNavigation from '@/components/layout/TabNavigation';
import ServicesTab from '@/pages/ServicesTab';
import DetailsTab from '@/pages/DetailsTab';
import ProfessionalsTab from '@/pages/ProfessionalsTab';
import ProductsTab from '@/pages/ProductsTab';
import LoyaltyTab from '@/pages/LoyaltyTab';

const Home = () => {
  const [activeTab, setActiveTab] = useState('services');

  return (
    <div className="flex flex-col min-h-screen bg-secondary pb-16">
      <Header />
      
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'services' && <ServicesTab />}
        {activeTab === 'details' && <DetailsTab />}
        {activeTab === 'professionals' && <ProfessionalsTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'loyalty' && <LoyaltyTab />}
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Home;
