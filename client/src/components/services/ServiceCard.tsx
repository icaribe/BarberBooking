import { Clock, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/format';
import type { Service } from '@/lib/types';

interface ServiceCardProps {
  service: Service;
  onSchedule: (service: Service) => void;
}

const ServiceCard = ({ service, onSchedule }: ServiceCardProps) => {
  const { name, price, priceType, durationMinutes } = service;
  
  return (
    <div className="bg-card rounded-lg mb-4 shadow-lg overflow-hidden">
      <div className="flex items-center p-4">
        <div className="rounded-full bg-secondary p-3 mr-4">
          <Scissors className="text-primary text-xl" />
        </div>
        <div className="flex-1">
          <h3 className="font-montserrat font-semibold text-card-foreground">{name}</h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            {priceType === 'fixed' ? (
              <>
                <span>A partir de</span>
                <span className="font-medium text-primary ml-1">{formatCurrency(price || 0)}</span>
              </>
            ) : (
              <>
                <span>Preço sujeito a</span>
                <span className="font-medium text-primary ml-1">consulta</span>
              </>
            )}
            <span className="mx-2">•</span>
            <Clock className="w-4 h-4 mr-1" />
            <span>{durationMinutes} min</span>
          </div>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-montserrat font-medium"
          onClick={() => onSchedule(service)}
        >
          Agendar
        </Button>
      </div>
    </div>
  );
};

export default ServiceCard;
