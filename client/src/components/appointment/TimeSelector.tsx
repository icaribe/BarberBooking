import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface TimeSelectorProps {
  selectedDate: Date;
  professionalId: number;
  serviceDuration: number;
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

// Mock available times - in a real app, these would come from an API
const generateAvailableTimes = (date: Date, professionalId: number, duration: number) => {
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
  
  // For demo purposes, randomly mark some slots as unavailable
  const availableSlots = [...filteredMorningSlots, ...filteredAfternoonSlots].filter(() => 
    Math.random() > 0.3 // 30% chance of being unavailable
  );
  
  return availableSlots;
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
    // Fetch available times from the API
    setIsLoading(true);
    
    // For demo purposes, we're generating mock data
    // In a real app, this would be an API call
    setTimeout(() => {
      const times = generateAvailableTimes(selectedDate, professionalId, serviceDuration);
      setAvailableTimes(times);
      setIsLoading(false);
    }, 500);
  }, [selectedDate, professionalId, serviceDuration]);
  
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
