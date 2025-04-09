import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimeSelectorProps {
  selectedDate: Date;
  professionalId: number;
  serviceDuration: number;
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

interface Appointment {
  id: number;
  professionalId: number;
  date: string;
  time: string;
  duration: number;
  status: string;
}

// Função para verificar disponibilidade de horários
const generateAvailableTimes = async (date: Date, professionalId: number, duration: number) => {
  try {
    // Morning slots (9:00 - 13:00)
    const morningSlots = [];
    for (let hour = 9; hour < 13; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        morningSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    
    // Afternoon slots (14:30 - 19:30)
    const afternoonSlots = [];
    for (let hour = 14; hour < 19; hour++) {
      for (let minute = (hour === 14 ? 30 : 0); minute < 60; minute += 15) {
        afternoonSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    
    // Add 19:00, 19:15 if needed
    for (let minute = 0; minute < 30; minute += 15) {
      afternoonSlots.push(`19:${minute.toString().padStart(2, '0')}`);
    }
    
    // Filter out slots that don't have enough time before closing or lunch
    const filteredMorningSlots = morningSlots.filter(slot => {
      const [hours, minutes] = slot.split(':').map(Number);
      const endMinutes = minutes + duration;
      const endHours = hours + Math.floor(endMinutes / 60);
      const remainingMinutes = endMinutes % 60;
      
      // Convert to comparable format (minutes since 00:00)
      const slotEndTime = endHours * 60 + remainingMinutes;
      const lunchTime = 13 * 60; // 13:00
      
      return slotEndTime <= lunchTime;
    });
    
    const filteredAfternoonSlots = afternoonSlots.filter(slot => {
      const [hours, minutes] = slot.split(':').map(Number);
      const endMinutes = minutes + duration;
      const endHours = hours + Math.floor(endMinutes / 60);
      const remainingMinutes = endMinutes % 60;
      
      // Convert to comparable format (minutes since 00:00)
      const slotEndTime = endHours * 60 + remainingMinutes;
      const closingTime = 19 * 60 + 30; // 19:30
      
      return slotEndTime <= closingTime;
    });
    
    // Todos os slots potenciais
    const allSlots = [...filteredMorningSlots, ...filteredAfternoonSlots];
    
    // Buscar agendamentos existentes para este profissional na data selecionada
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Adicionar timestamp para evitar cache de navegador
    const timestamp = new Date().getTime();
    const response = await fetch(`/api/appointments?professionalId=${professionalId}&date=${formattedDate}&_t=${timestamp}`);
    
    if (!response.ok) {
      throw new Error('Falha ao buscar agendamentos');
    }
    
    const appointments: Appointment[] = await response.json();
    console.log(`Agendamentos encontrados para profissional ${professionalId} em ${formattedDate}:`, appointments);
    
    // Filtrar slots que não conflitam com agendamentos existentes
    const availableSlots = allSlots.filter(slot => {
      // Início do slot proposto (em minutos desde 00:00)
      const [slotHours, slotMinutes] = slot.split(':').map(Number);
      const slotStartTime = slotHours * 60 + slotMinutes;
      
      // Fim do slot proposto (em minutos desde 00:00)
      const slotEndTime = slotStartTime + duration;
      
      // Verificar se há conflito com algum agendamento existente
      const hasConflict = appointments.some(appointment => {
        // Início do agendamento existente (em minutos desde 00:00)
        const [appHours, appMinutes] = appointment.time.split(':').map(Number);
        const appStartTime = appHours * 60 + appMinutes;
        
        // Fim do agendamento existente (em minutos desde 00:00)
        const appEndTime = appStartTime + appointment.duration;
        
        // Há conflito se:
        // (1) o início do slot está dentro do período do agendamento ou
        // (2) o fim do slot está dentro do período do agendamento ou
        // (3) o slot contém completamente o agendamento
        return (
          (slotStartTime >= appStartTime && slotStartTime < appEndTime) ||
          (slotEndTime > appStartTime && slotEndTime <= appEndTime) ||
          (slotStartTime <= appStartTime && slotEndTime >= appEndTime)
        );
      });
      
      // O slot é disponível se não há conflito
      return !hasConflict;
    });
    
    return availableSlots;
  } catch (error) {
    console.error('Erro ao gerar horários disponíveis:', error);
    return [];
  }
};

const TimeSelector = ({ 
  selectedDate, 
  professionalId, 
  serviceDuration, 
  selectedTime, 
  onSelect 
}: TimeSelectorProps) => {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Buscar horários disponíveis usando nossa nova função
    const fetchAvailableTimes = async () => {
      setIsLoading(true);
      try {
        const times = await generateAvailableTimes(selectedDate, professionalId, serviceDuration);
        setAvailableTimes(times);
      } catch (error) {
        console.error('Erro ao carregar horários disponíveis:', error);
        toast({
          title: "Erro ao carregar horários",
          description: "Não foi possível carregar os horários disponíveis. Tente novamente.",
          variant: "destructive",
        });
        setAvailableTimes([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Buscar horários disponíveis imediatamente quando o componente montar
    fetchAvailableTimes();
    
    // Configurar um intervalo para atualizar os horários disponíveis a cada 30 segundos
    // para garantir que as atualizações de outros usuários sejam refletidas
    const intervalId = setInterval(fetchAvailableTimes, 30000);
    
    // Limpar o intervalo quando o componente desmontar
    return () => clearInterval(intervalId);
  }, [selectedDate, professionalId, serviceDuration, toast]);
  
  if (isLoading) {
    return (
      <div>
        <h3 className="font-montserrat font-medium mb-2">Escolha o horário</h3>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (availableTimes.length === 0) {
    return (
      <div>
        <h3 className="font-montserrat font-medium mb-2">Escolha o horário</h3>
        <div className="bg-secondary/50 rounded-lg p-4 text-center text-muted-foreground">
          Não há horários disponíveis nesta data. Por favor, selecione outra data.
        </div>
      </div>
    );
  }
  
  // Split times into morning and afternoon
  const morningTimes = availableTimes.filter(time => parseInt(time.split(':')[0]) < 13);
  const afternoonTimes = availableTimes.filter(time => parseInt(time.split(':')[0]) >= 14);
  
  return (
    <div>
      <h3 className="font-montserrat font-medium mb-2">Escolha o horário</h3>
      
      {morningTimes.length > 0 && (
        <>
          <h4 className="text-sm text-muted-foreground mb-2">Manhã</h4>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {morningTimes.map(time => (
              <Button
                key={time}
                variant="outline"
                size="sm"
                className={`text-sm ${selectedTime === time 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
                onClick={() => onSelect(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </>
      )}
      
      {afternoonTimes.length > 0 && (
        <>
          <h4 className="text-sm text-muted-foreground mb-2">Tarde</h4>
          <div className="grid grid-cols-4 gap-2">
            {afternoonTimes.map(time => (
              <Button
                key={time}
                variant="outline"
                size="sm"
                className={`text-sm ${selectedTime === time 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
                onClick={() => onSelect(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TimeSelector;
