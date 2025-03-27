import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { Professional } from '@/lib/types';

interface ProfessionalSelectorProps {
  professionals: Professional[];
  selectedProfessional: Professional | null;
  onSelect: (professional: Professional) => void;
}

const ProfessionalSelector = ({ 
  professionals, 
  selectedProfessional, 
  onSelect 
}: ProfessionalSelectorProps) => {
  return (
    <div>
      <h3 className="font-montserrat font-medium mb-2">Escolha um profissional</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center">
        {professionals.map(professional => (
          <div 
            key={professional.id}
            className={`rounded-lg p-2 cursor-pointer transition-colors duration-200 ${
              selectedProfessional?.id === professional.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
            onClick={() => onSelect(professional)}
          >
            <Avatar className="w-12 h-12 mx-auto mb-1 overflow-hidden">
              <AvatarImage src={professional.avatar} alt={professional.name} />
              <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className={`text-sm ${selectedProfessional?.id === professional.id ? 'font-medium' : ''}`}>
              {professional.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfessionalSelector;
