import { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'wouter';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { format, addDays, isSameDay, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
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
  const { user } = useAuth();
  const { toast } = useToast();

  // Inicializa estados com valores padrão
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [notes, setNotes] = useState('');
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { services, isLoadingServices } = useServices();
  const { professionals, isLoadingProfessionals } = useProfessionals();
  const { 
    createAppointment, 
    isCreating,
    appointments,
    isLoading: isLoadingAppointments 
  } = useAppointments(
    undefined,
    selectedProfessional?.id,
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined
  );

  // Get the service from ID
  const service = services.find(s => s.id === serviceId);

  // Load pendingAppointment from sessionStorage on mount
  useEffect(() => {
    // Only try to restore if we have professionals loaded and a serviceId
    if (professionals.length > 0 && serviceId) {
      const pendingAppointmentStr = sessionStorage.getItem('pendingAppointment');

      if (pendingAppointmentStr) {
        try {
          const pendingAppointment = JSON.parse(pendingAppointmentStr);

          // Only restore if for the same service
          if (pendingAppointment.serviceId === serviceId) {
            // Restore date
            if (pendingAppointment.selectedDate) {
              setSelectedDate(new Date(pendingAppointment.selectedDate));
            }

            // Restore time
            if (pendingAppointment.selectedTime) {
              setSelectedTime(pendingAppointment.selectedTime);
            }

            // Restore professional
            if (pendingAppointment.selectedProfessionalId) {
              const prof = professionals.find(p => p.id === pendingAppointment.selectedProfessionalId);
              if (prof) {
                setSelectedProfessional(prof);
              }
            }
          }
        } catch (e) {
          console.error('Error parsing pending appointment:', e);
        }
      }
    }
  }, [professionals, serviceId]);

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

  // Appointments são obtidos no início do componente

  // Generate time slots for selected professional and date
  const generateTimeSlots = () => {
    if (!selectedProfessional || !selectedDate) return [];

    const slots = [];
    const startHour = 9;
    const endHour = 18;
    const interval = 15; // minutes

    // Create a Map to track blocked time slots based on existing appointments
    const blockedTimeSlots = new Map();

    // Mark blocked time slots from existing appointments
    if (appointments && appointments.length > 0) {
      appointments.forEach(appointment => {
        // For each appointment, block all slots within its duration
        if (appointment.startTime && appointment.endTime) {
          const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
          const [endHour, endMinute] = appointment.endTime.split(':').map(Number);

          let currentHour = startHour;
          let currentMinute = startMinute;

          // Block all slots from start time to end time
          while (
            currentHour < endHour || 
            (currentHour === endHour && currentMinute < endMinute)
          ) {
            const timeKey = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
            blockedTimeSlots.set(timeKey, true);

            // Move to the next slot
            currentMinute += interval;
            if (currentMinute >= 60) {
              currentHour++;
              currentMinute = 0;
            }
          }
        }
      });
    }

    // Generate all possible time slots
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        // Skip lunch time (13:00 - 14:30)
        if ((hour === 13 && minute >= 0) || (hour === 14 && minute < 30)) {
          continue;
        }

        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const timeSlot = `${formattedHour}:${formattedMinute}`;

        // Check if this slot is available
        if (!blockedTimeSlots.has(timeSlot)) {
          // Also need to check if there's enough time for the service before the next blocked slot
          // or before closing time
          const slotDate = new Date(selectedDate);
          slotDate.setHours(hour, minute, 0, 0);

          const endTime = new Date(slotDate);
          endTime.setMinutes(endTime.getMinutes() + (service?.durationMinutes || 0));

          // If the end time is after closing time, skip this slot
          if (endTime.getHours() >= endHour) {
            continue;
          }

          // Check if the service would overlap with any blocked slots
          let hasOverlap = false;
          let currentCheck = new Date(slotDate);

          while (currentCheck < endTime) {
            const checkHour = currentCheck.getHours().toString().padStart(2, '0');
            const checkMinute = currentCheck.getMinutes().toString().padStart(2, '0');
            const checkKey = `${checkHour}:${checkMinute}`;

            if (blockedTimeSlots.has(checkKey)) {
              hasOverlap = true;
              break;
            }

            // Move to the next interval to check
            currentCheck.setMinutes(currentCheck.getMinutes() + interval);
          }

          // If there's no overlap, this slot is available
          if (!hasOverlap) {
            slots.push(timeSlot);
          }
        }
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

    // Check if the user is logged in
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa fazer login para confirmar o agendamento.",
      });
      // Save the current state in session storage for return after login
      const appointmentState = {
        serviceId,
        selectedDate: selectedDate.toISOString(),
        selectedProfessionalId: selectedProfessional.id,
        selectedTime
      };
      sessionStorage.setItem('pendingAppointment', JSON.stringify(appointmentState));

      // Redirect to auth page
      navigate('/auth?returnTo=/appointment/' + serviceId);
      return;
    }

    try {
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
        userId: user.id,
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

      // Clear the pending appointment from session storage
      sessionStorage.removeItem('pendingAppointment');

      navigate('/appointments');
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro ao agendar",
        description: error?.message || "Ocorreu um erro ao tentar confirmar seu agendamento. Tente novamente.",
        variant: "destructive"
      });
      setShowConfirmation(false);
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

  // Show confirmation dialog
  const handleShowConfirmation = () => {
    if (!selectedProfessional || !selectedTime) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, selecione profissional e horário.",
        variant: "destructive"
      });
      return;
    }
    setShowConfirmation(true);
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
                <div 
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`flex flex-col items-center justify-center w-12 h-16 rounded-lg cursor-pointer ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-secondary'
                  }`}
                >
                  <span className="text-xs">{dayName}</span>
                  <span className="text-lg font-medium">{dayNumber}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <h3 className="font-medium mb-2">Escolha o profissional</h3>
        <div className="grid grid-cols-2 gap-2">
          {professionals.map(professional => (
            <div 
              key={professional.id}
              onClick={() => setSelectedProfessional(professional)}
              className={`rounded-lg p-3 cursor-pointer ${
                selectedProfessional?.id === professional.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'border border-border hover:bg-secondary'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                {professional.avatar ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-1">
                    <img src={professional.avatar} alt={professional.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-1">
                    <span className="text-2xl uppercase">{professional.name.charAt(0)}</span>
                  </div>
                )}
                <span className="font-medium text-center">{professional.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProfessional && (
        <div className="p-4 border-b border-border">
          <h3 className="font-medium mb-2">Escolha o horário</h3>

          {isLoadingAppointments ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {generateTimeSlots().length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Não há horários disponíveis para este profissional nesta data.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {generateTimeSlots().map((timeSlot, index) => (
                    <div 
                      key={index}
                      onClick={() => setSelectedTime(timeSlot)}
                      className={`rounded-lg py-2 text-center cursor-pointer ${
                        selectedTime === timeSlot 
                          ? 'bg-primary text-primary-foreground' 
                          : 'border border-border hover:bg-secondary'
                      }`}
                    >
                      {timeSlot}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {selectedTime && (
        <div className="p-4 border-b border-border">
          <h3 className="font-medium mb-2">Observações (opcional)</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alguma observação adicional para o profissional?"
            className="w-full p-2 border border-border rounded-md h-24 resize-none"
          />
        </div>
      )}

      <div className="p-4 mt-auto">
        <Button 
          onClick={handleShowConfirmation} 
          className="w-full"
          disabled={!selectedProfessional || !selectedTime || isCreating}
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Confirmando...
            </>
          ) : (
            'Confirmar Agendamento'
          )}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-md">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4 text-center">Confirmação de Agendamento</h2>

              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-medium">Serviço</h3>
                  <p>{service.name}</p>
                  <p className="text-sm text-muted-foreground">{service.durationMinutes} min</p>
                </div>

                <div className="border-b pb-2">
                  <h3 className="font-medium">Profissional</h3>
                  <p>{selectedProfessional?.name}</p>
                </div>

                <div className="border-b pb-2">
                  <h3 className="font-medium">Data e Horário</h3>
                  <p>{format(selectedDate, 'dd/MM/yyyy')} às {selectedTime}</p>
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
                <Button variant="outline" onClick={() => setShowConfirmation(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleConfirmAppointment} className="flex-1">
                  Confirmar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {renderCalendarDialog()}
    </div>
  );
};

export default AppointmentPage;