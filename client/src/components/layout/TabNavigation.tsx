import { Scissors, Info, Users, ShoppingBag, Award } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  const tabs = [
    { id: 'services', icon: <Scissors className="w-4 h-4 mr-1" />, label: 'Serviços' },
    { id: 'details', icon: <Info className="w-4 h-4 mr-1" />, label: 'Detalhes' },
    { id: 'professionals', icon: <Users className="w-4 h-4 mr-1" />, label: 'Profissionais' },
    { id: 'products', icon: <ShoppingBag className="w-4 h-4 mr-1" />, label: 'Produtos' },
    { id: 'loyalty', icon: <Award className="w-4 h-4 mr-1" />, label: 'Fidelidade' }
  ];

  return (
    <div className="flex text-center text-sm border-b border-border bg-background sticky top-14 z-20 shadow-sm">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`flex-1 py-4 font-montserrat font-medium flex items-center justify-center ${
            activeTab === tab.id 
              ? 'tab-active' 
              : 'text-muted-foreground'
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
