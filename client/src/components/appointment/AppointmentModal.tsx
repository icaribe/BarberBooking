import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils/format';
import ProfessionalSelector from './ProfessionalSelector';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';
import { useAppointments } from '@/lib/hooks/useAppointments';
import type { Service, Professional } from '@/lib/types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  professionals: Professional[];
}

const AppointmentModal = ({ isOpen, onClose, service, professionals }: AppointmentModalProps) => {
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const { createAppointment, isCreating } = useAppointments();

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setSelectedProfessional(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setNotes('');
    }
  }, [isOpen]);

  const handleConfirmAppointment = async () => {
    if (!service || !selectedProfessional || !selectedDate || !selectedTime) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Using a fixed user ID (1) for demo purposes
      const userId = 1;
      
      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      // Calculate end time based on service duration
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startDate = new Date(selectedDate);
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + service.durationMinutes);
      
      const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
      
      await createAppointment({
        userId,
        professionalId: selectedProfessional.id,
        date: formattedDate,
        startTime: selectedTime,
        endTime,
        status: 'scheduled',
        notes: notes,
        services: [service.id]
      });
      
      toast({
        title: "Agendamento confirmado!",
        description: `Seu agendamento com ${selectedProfessional.name} foi confirmado para ${formattedDate} às ${selectedTime}.`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao agendar",
        description: "Ocorreu um erro ao tentar confirmar seu agendamento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card text-card-foreground max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-montserrat font-semibold text-xl">Agendar Serviço</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div>
            <h3 className="font-montserrat font-medium mb-2">Serviço selecionado</h3>
            <div className="bg-secondary rounded-lg p-3">
              <div className="flex justify-between">
                <span className="font-montserrat">{service.name}</span>
                <span className="text-primary font-semibold">
                  {service.priceType === 'fixed' 
                    ? formatCurrency(service.price || 0) 
                    : 'Consultar'}
                </span>
              </div>
              <div className="flex text-muted-foreground text-sm mt-1">
                <Clock className="w-4 h-4 mr-1" />
                <span>{service.durationMinutes} min</span>
              </div>
            </div>
          </div>
          
          <ProfessionalSelector 
            professionals={professionals}
            selectedProfessional={selectedProfessional}
            onSelect={setSelectedProfessional}
          />
          
          <DateSelector 
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
          />
          
          {selectedDate && selectedProfessional && (
            <TimeSelector 
              selectedDate={selectedDate}
              professionalId={selectedProfessional.id}
              serviceDuration={service.durationMinutes}
              selectedTime={selectedTime}
              onSelect={setSelectedTime}
            />
          )}
          
          <div>
            <h3 className="font-montserrat font-medium mb-2">Observações (opcional)</h3>
            <Textarea 
              className="w-full bg-secondary text-foreground rounded-lg p-3 focus:ring-primary"
              placeholder="Alguma informação adicional?"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            className="bg-secondary hover:bg-secondary/80"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            onClick={handleConfirmAppointment}
            disabled={!selectedProfessional || !selectedDate || !selectedTime || isCreating}
          >
            {isCreating ? 'Confirmando...' : 'Confirmar Agendamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
