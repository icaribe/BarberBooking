import { Star, StarHalf, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Professional } from '@/lib/types';

interface ProfessionalCardProps {
  professional: Professional;
  onViewSchedule: (professionalId: number) => void;
}

const ProfessionalCard = ({ professional, onViewSchedule }: ProfessionalCardProps) => {
  const { id, name, avatar, rating, reviewCount, bio } = professional;
  
  // Generate star ratings (each star is worth 10 points)
  const fullStars = Math.floor(rating / 10);
  const hasHalfStar = (rating % 10) >= 5;
  
  return (
    <div className="bg-card rounded-lg p-4 mb-4 flex items-center">
      <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
        <img 
          src={avatar || '/default-avatar.png'} 
          className="w-full h-full object-cover" 
          alt={`Barbeiro ${name}`} 
        />
      </div>
      <div className="flex-1">
        <h3 className="font-montserrat font-semibold text-lg">{name}</h3>
        <div className="flex items-center text-sm">
          <div className="flex text-primary">
            {[...Array(fullStars)].map((_, i) => (
              <Star key={`star-${i}`} className="w-4 h-4 fill-primary" />
            ))}
            {hasHalfStar && <StarHalf className="w-4 h-4 fill-primary" />}
          </div>
          <span className="text-muted-foreground ml-2">
            {(rating / 10).toFixed(1)} ({reviewCount} avaliações)
          </span>
        </div>
        <p className="text-muted-foreground text-sm mt-1">{bio}</p>
      </div>
      <Button 
        variant="secondary"
        className="hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
        onClick={() => onViewSchedule(id)}
      >
        <Calendar className="w-4 h-4 mr-1" /> 
        Ver agenda
      </Button>
    </div>
  );
};

export default ProfessionalCard;
