import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X } from 'lucide-react';
import { Professional, Service } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AppointmentConfirmationProps {
  date: Date;
  time: string;
  professional: Professional;
  service: Service;
  notes: string;
  onNotesChange: (notes: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  onAddToCart?: () => void;
}

const AppointmentConfirmation = ({
  date,
  time,
  professional,
  service,
  notes,
  onNotesChange,
  onClose,
  onConfirm,
  onAddToCart
}: AppointmentConfirmationProps) => {
  // Calculate end time based on service duration
  const calculateEndTime = () => {
    const [hours, minutes] = time.split(':').map(Number);
    const startDate = new Date(date);
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + service.durationMinutes);
    
    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
  };

  const formattedDate = format(date, "EEEE, dd MMM yyyy", { locale: ptBR });
  const formattedDay = format(date, "dd", { locale: ptBR });
  const formattedMonth = format(date, "MMM", { locale: ptBR }).toUpperCase();

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <img 
                src="/logo-small.png" 
                alt="Los Barbeiros CBS" 
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/40?text=LB';
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold">Los Barbeiros CBS</h3>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">{service.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-300">
                  <img 
                    src={professional.avatar || ''} 
                    alt={professional.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/40?text=P';
                    }}
                  />
                </div>
                <span>{professional.name}</span>
              </div>
              <p className="text-primary text-lg font-medium mt-2">
                R$ {(service.price || 0).toFixed(2).replace('.', ',')}
              </p>
              <p className="text-sm text-muted-foreground">
                {time} - {calculateEndTime()} ({service.durationMinutes} min)
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{formattedDay}</div>
              <div className="text-sm uppercase">{formattedMonth}</div>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <span>Alguma observação?</span>
            </label>
            <Textarea
              placeholder="Ex: Não precisa lavar, etc.."
              className="mt-1"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>

          <div className="mt-6 space-y-2">
            <Button 
              className="w-full py-6" 
              onClick={onConfirm}
            >
              Confirmar agendamento
            </Button>
            
            {onAddToCart && (
              <Button 
                variant="outline" 
                className="w-full py-6 bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200"
                onClick={onAddToCart}
              >
                Adicionar ao carrinho
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;