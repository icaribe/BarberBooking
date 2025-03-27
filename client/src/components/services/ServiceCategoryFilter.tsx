import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { ServiceCategory } from '@/lib/types';

interface ServiceCategoryFilterProps {
  categories: ServiceCategory[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

const ServiceCategoryFilter = ({ 
  categories, 
  selectedCategoryId, 
  onSelectCategory 
}: ServiceCategoryFilterProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  useEffect(() => {
    const checkScrollable = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowScrollButtons(scrollWidth > clientWidth);
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    
    return () => {
      window.removeEventListener('resize', checkScrollable);
    };
  }, [categories]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative px-4 py-3">
      {showScrollButtons && (
        <>
          <button 
            onClick={scrollLeft}
            className="absolute left-1 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 rounded-full p-1 shadow-md"
          >
            ◀
          </button>
          <button 
            onClick={scrollRight}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 rounded-full p-1 shadow-md"
          >
            ▶
          </button>
        </>
      )}
      
      <div 
        ref={scrollContainerRef}
        className="flex space-x-2 overflow-x-auto py-1 scrollbar-hide"
      >
        <Button
          variant={selectedCategoryId === null ? "default" : "secondary"}
          className={`rounded-full whitespace-nowrap font-medium text-sm px-4 ${
            selectedCategoryId === null ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground'
          }`}
          onClick={() => onSelectCategory(null)}
        >
          Todos
        </Button>
        
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategoryId === category.id ? "default" : "secondary"}
            className={`rounded-full whitespace-nowrap font-medium text-sm px-4 ${
              selectedCategoryId === category.id ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground'
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ServiceCategoryFilter;
