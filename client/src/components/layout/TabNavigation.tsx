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
    <div className="flex justify-between text-center text-sm border-b border-border bg-background sticky top-14 z-20 shadow-sm px-4">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`py-4 px-3 font-montserrat font-medium flex items-center justify-center mx-2 ${
            activeTab === tab.id 
              ? 'tab-active' 
              : 'text-muted-foreground'
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon}
          <span className="ml-1">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
