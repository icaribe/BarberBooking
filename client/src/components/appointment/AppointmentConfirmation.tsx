import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/format';
import { Service, Professional } from '@/lib/types';

interface AppointmentConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  service: Service;
  selectedProfessional: Professional | null;
  selectedDate: Date;
  selectedTime: string | null;
  notes?: string;
  isSubmitting: boolean;
}

const AppointmentConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  service,
  selectedProfessional,
  selectedDate,
  selectedTime,
  notes,
  isSubmitting
}: AppointmentConfirmationProps) => {
  if (!selectedProfessional || !selectedTime) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Confirmação de Agendamento</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-medium">Serviço</h3>
              <p>{service.name}</p>
              <p className="text-sm text-muted-foreground">{service.durationMinutes} min</p>
            </div>
            
            <div className="border-b pb-2">
              <h3 className="font-medium">Profissional</h3>
              <p>{selectedProfessional.name}</p>
            </div>
            
            <div className="border-b pb-2">
              <h3 className="font-medium">Data e Horário</h3>
              <p>{format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })} às {selectedTime}</p>
            </div>
            
            {notes && (
              <div className="border-b pb-2">
                <h3 className="font-medium">Observações</h3>
                <p className="text-sm">{notes}</p>
              </div>
            )}
            
            <div className="border-b pb-2">
              <h3 className="font-medium">Valor</h3>
              <p className="text-primary font-semibold">
                {service.priceType === 'fixed' ? formatCurrency(service.price || 0) : 'Consultar'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-between mt-6 space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={onConfirm} className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Confirmando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentConfirmation;