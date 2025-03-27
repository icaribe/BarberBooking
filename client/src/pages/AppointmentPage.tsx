import { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'wouter';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { format, addDays, isSameDay, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAppointments } from '@/lib/hooks/useAppointments';
import { useProfessionals } from '@/lib/hooks/useProfessionals';
import { useServices } from '@/lib/hooks/useServices';
import { formatCurrency } from '@/lib/utils/format';
import { DAYS_OF_WEEK } from '@/lib/constants';
import AppointmentConfirmation from '@/components/appointment/AppointmentConfirmation';
import type { Professional } from '@/lib/types';

const AppointmentPage = () => {
  const params = useParams();
  const [, navigate] = useLocation();
  const serviceId = params.serviceId ? parseInt(params.serviceId) : null;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { services, isLoadingServices } = useServices();
  const { professionals, isLoadingProfessionals } = useProfessionals();
  const { createAppointment, isCreating } = useAppointments();

  // Get the service from ID
  const service = services.find(s => s.id === serviceId);

  // Mark today as selected date by default
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
  }, []);

  if (isLoadingServices || isLoadingProfessionals) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="flex items-center justify-between p-4 bg-background">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-montserrat font-semibold ml-2">Agendamento</h1>
          </div>
        </header>
        <div className="flex justify-center items-center flex-grow">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="flex items-center justify-between p-4 bg-background">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-montserrat font-semibold ml-2">Agendamento</h1>
          </div>
        </header>
        <div className="p-4 text-center">
          <h2 className="font-montserrat font-medium">Serviço não encontrado</h2>
          <p className="text-muted-foreground mt-2">O serviço que você está tentando agendar não existe ou foi removido.</p>
          <Button className="mt-4" onClick={() => navigate('/')}>Voltar para Início</Button>
        </div>
      </div>
    );
  }

  // Generate the next 7 days for the horizontal date picker
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      // Skip Sundays (0 = Sunday)
      if (getDay(date) !== 0) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time selection when date changes
  };

  // Generate time slots for selected professional and date
  const generateTimeSlots = () => {
    // Simple time slot generation for demonstration
    // In a real application, you would fetch from backend based on professional availability
    const slots = [];
    const startHour = 9;
    const endHour = 18;
    const interval = 15; // minutes
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        // Skip lunch time (13:00 - 14:30)
        if ((hour === 13 && minute >= 0) || (hour === 14 && minute < 30)) {
          continue;
        }
        
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    
    return slots;
  };

  const handleConfirmAppointment = async () => {
    if (!selectedProfessional || !selectedDate || !selectedTime) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, selecione profissional, data e horário.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Using a fixed user ID (1) for demo purposes
      const userId = 1;
      
      // Format date as YYYY-MM-DD
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
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
        description: `Seu agendamento com ${selectedProfessional.name} foi confirmado para ${format(selectedDate, 'dd/MM/yyyy')} às ${selectedTime}.`,
      });
      
      navigate('/appointments');
    } catch (error) {
      toast({
        title: "Erro ao agendar",
        description: "Ocorreu um erro ao tentar confirmar seu agendamento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Render full calendar dialog
  const renderCalendarDialog = () => {
    // Generate next 12 months to display in the calendar
    const generateMonths = () => {
      const months = [];
      const today = new Date();
      const startMonth = today.getMonth();
      const startYear = today.getFullYear();
      
      for (let i = 0; i < 12; i++) {
        let year = startYear;
        let month = startMonth + i;
        
        if (month > 11) {
          month = month - 12;
          year = startYear + 1;
        }
        
        months.push({ month, year });
      }
      
      return months;
    };

    const renderMonthCalendar = (month: number, year: number) => {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      
      // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
      let firstDayIndex = firstDay.getDay();
      if (firstDayIndex === 0) firstDayIndex = 7; // Move Sunday to end
      
      const days = [];
      
      // Create days array
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const isDisabled = date < new Date() || date.getDay() === 0; // Disable past dates and Sundays
        
        days.push({
          date,
          isDisabled
        });
      }
      
      return (
        <div key={`${month}-${year}`} className="mb-8">
          <h3 className="text-center text-lg font-medium mb-2">
            {format(new Date(year, month), 'MMMM yyyy', { locale: ptBR })}
          </h3>
          
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => (
              <div key={index} className="text-xs py-1 text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Empty cells for days before first day of month */}
            {Array.from({ length: firstDayIndex - 1 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {/* Calendar days */}
            {days.map(({ date, isDisabled }, i) => (
              <button
                key={i}
                className={`h-9 w-9 rounded-full flex items-center justify-center text-sm ${
                  isSameDay(date, selectedDate)
                    ? 'bg-primary text-primary-foreground'
                    : isDisabled
                    ? 'text-muted-foreground opacity-50'
                    : 'hover:bg-secondary'
                }`}
                disabled={isDisabled}
                onClick={() => {
                  setSelectedDate(date);
                  setShowCalendarDialog(false);
                }}
              >
                {date.getDate()}
              </button>
            ))}
          </div>
        </div>
      );
    };

    return (
      <Dialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
        <DialogContent className="bg-background max-w-md max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-2 top-2"
              onClick={() => setShowCalendarDialog(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-center font-medium text-lg mt-1">Selecione uma data</h2>
          </div>
          
          <div className="px-4 pb-4">
            {generateMonths().map(({ month, year }) => renderMonthCalendar(month, year))}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 bg-background border-b border-border">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-montserrat font-semibold ml-2">Agendamento</h1>
        </div>
      </header>
      
      <div className="p-4 border-b border-border">
        <h2 className="font-montserrat font-semibold text-lg">{service.name}</h2>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-muted-foreground">{service.durationMinutes} min</span>
          <span className="font-semibold text-primary">
            {service.priceType === 'fixed' ? formatCurrency(service.price || 0) : 'Consultar'}
          </span>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-medium">
            {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
          </h3>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowCalendarDialog(true)}
          >
            <Calendar className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Horizontal date picker */}
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4 mt-2">
          <div className="flex space-x-2">
            {generateDateOptions().map((date, index) => {
              const isSelected = isSameDay(date, selectedDate);
              const dayNumber = date.getDate();
              const dayName = format(date, 'EEE', { locale: ptBR });
              
              return (
                <button
                  key={index}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground border-2 border-primary' 
                      : 'bg-secondary text-foreground'
                  }`}
                  onClick={() => handleDateClick(date)}
                >
                  <span className="text-xs uppercase">{dayName}</span>
                  <span className="text-lg font-medium">{dayNumber}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <h3 className="font-medium mb-3">Selecione o profissional</h3>
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
          <div className="flex space-x-3">
            {professionals.map((professional) => (
              <button
                key={professional.id}
                className={`flex flex-col items-center min-w-[80px] ${
                  selectedProfessional?.id === professional.id ? 'text-primary' : 'text-foreground'
                }`}
                onClick={() => setSelectedProfessional(professional)}
              >
                <div className={`w-16 h-16 rounded-full overflow-hidden mb-1 ${
                  selectedProfessional?.id === professional.id ? 'border-2 border-primary' : 'border border-border'
                }`}>
                  <img
                    src={professional.avatar || "https://via.placeholder.com/100"}
                    alt={professional.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm">{professional.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedProfessional && (
        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="font-medium mb-3">Horários disponíveis</h3>
          <div className="grid grid-cols-3 gap-2">
            {generateTimeSlots().map((time, index) => (
              <button
                key={index}
                className={`py-2 border rounded-md text-sm ${
                  selectedTime === time
                    ? 'border-primary text-primary'
                    : 'border-border text-foreground'
                }`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-border">
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6"
          disabled={!selectedProfessional || !selectedDate || !selectedTime || isCreating}
          onClick={() => setShowConfirmation(true)}
        >
          {isCreating ? 'Confirmando...' : 'Revisar Agendamento'}
        </Button>
      </div>

      {renderCalendarDialog()}
      
      {showConfirmation && selectedProfessional && selectedTime && service && (
        <AppointmentConfirmation
          date={selectedDate}
          time={selectedTime}
          professional={selectedProfessional}
          service={service}
          notes={notes}
          onNotesChange={setNotes}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmAppointment}
        />
      )}
    </div>
  );
};

export default AppointmentPage;