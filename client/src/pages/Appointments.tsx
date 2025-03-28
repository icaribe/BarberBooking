import { useState, useEffect } from 'react';
import { format, parseISO, isBefore, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, User, XCircle, CheckCircle } from 'lucide-react';
import { useAppointments } from '@/lib/hooks/useAppointments';
import { useServices } from '@/lib/hooks/useServices';
import { useProfessionals } from '@/lib/hooks/useProfessionals';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { APPOINTMENT_STATUS } from '@/lib/constants';
import { formatDate } from '@/lib/utils/date';
import type { Appointment } from '@/lib/types';

const AppointmentsPage = () => {
  const [tabValue, setTabValue] = useState("upcoming");
  const { user } = useAuth();
  
  const { appointments, isLoading, updateAppointmentStatus } = useAppointments(user?.id);
  const { getServiceById } = useServices();
  const { getProfessionalById } = useProfessionals();
  const { toast } = useToast();
  
  // Split appointments into upcoming and past
  const now = new Date();
  const upcomingAppointments = appointments.filter(appointment => {
    const appointmentDate = parseISO(`${appointment.date}T${appointment.startTime}`);
    return (
      appointment.status === APPOINTMENT_STATUS.SCHEDULED && 
      (isToday(appointmentDate) || !isBefore(appointmentDate, now))
    );
  });
  
  const pastAppointments = appointments.filter(appointment => {
    const appointmentDate = parseISO(`${appointment.date}T${appointment.startTime}`);
    return (
      appointment.status !== APPOINTMENT_STATUS.SCHEDULED || 
      (!isToday(appointmentDate) && isBefore(appointmentDate, now))
    );
  });
  
  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      await updateAppointmentStatus({
        id: appointmentId,
        status: APPOINTMENT_STATUS.CANCELLED
      });
      
      toast({
        title: "Agendamento cancelado",
        description: "Seu agendamento foi cancelado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao cancelar",
        description: "Ocorreu um erro ao tentar cancelar o agendamento. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-secondary pb-16">
      <Header />
      
      <main className="flex-1 p-4">
        <h1 className="font-montserrat font-bold text-2xl mb-4">Meus Agendamentos</h1>
        
        <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upcoming" className="font-montserrat">
              Próximos
            </TabsTrigger>
            <TabsTrigger value="past" className="font-montserrat">
              Histórico
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Você não possui agendamentos futuros.
                <Button className="mt-4 bg-primary text-primary-foreground mx-auto block" asChild>
                  <a href="/">Agendar um serviço</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    getServiceById={getServiceById}
                    getProfessionalById={getProfessionalById}
                    onCancel={handleCancelAppointment}
                    showCancelButton
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pastAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Você não possui histórico de agendamentos.
              </div>
            ) : (
              <div className="space-y-4">
                {pastAppointments.map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    getServiceById={getServiceById}
                    getProfessionalById={getProfessionalById}
                    onCancel={handleCancelAppointment}
                    showCancelButton={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNav />
    </div>
  );
};

interface AppointmentCardProps {
  appointment: Appointment;
  getServiceById: (id: number) => any;
  getProfessionalById: (id: number) => any;
  onCancel: (id: number) => void;
  showCancelButton: boolean;
}

const AppointmentCard = ({ 
  appointment, 
  getServiceById, 
  getProfessionalById,
  onCancel,
  showCancelButton
}: AppointmentCardProps) => {
  const [appointmentServices, setAppointmentServices] = useState<any[]>([]);
  const { getAppointmentServices } = useAppointments();
  
  const professional = getProfessionalById(appointment.professionalId);
  
  // Get the services for this appointment
  const { data: servicesData, isLoading } = getAppointmentServices(appointment.id);
  
  useEffect(() => {
    if (servicesData) {
      const services = servicesData.map(as => getServiceById(as.serviceId)).filter(Boolean);
      setAppointmentServices(services);
    }
  }, [servicesData, getServiceById]);
  
  // Format date and time
  const formattedDate = formatDate(appointment.date, 'EEEE, dd/MM/yyyy');
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  
  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case APPOINTMENT_STATUS.SCHEDULED:
        return "bg-blue-600 text-white";
      case APPOINTMENT_STATUS.COMPLETED:
        return "bg-green-600 text-white";
      case APPOINTMENT_STATUS.CANCELLED:
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };
  
  // Status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case APPOINTMENT_STATUS.SCHEDULED:
        return <Calendar className="w-4 h-4" />;
      case APPOINTMENT_STATUS.COMPLETED:
        return <CheckCircle className="w-4 h-4" />;
      case APPOINTMENT_STATUS.CANCELLED:
        return <XCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };
  
  // Status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case APPOINTMENT_STATUS.SCHEDULED:
        return "Agendado";
      case APPOINTMENT_STATUS.COMPLETED:
        return "Concluído";
      case APPOINTMENT_STATUS.CANCELLED:
        return "Cancelado";
      default:
        return status;
    }
  };
  
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-montserrat font-semibold">
              {isLoading ? "Carregando..." : 
                appointmentServices.length > 0 
                  ? appointmentServices.map(s => s.name).join(", ") 
                  : "Serviço não encontrado"
              }
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {capitalize(formattedDate)}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
            {getStatusIcon(appointment.status)}
            {getStatusLabel(appointment.status)}
          </span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{appointment.startTime} - {appointment.endTime}</span>
          </div>
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            <span>{professional?.name || "Profissional não encontrado"}</span>
          </div>
        </div>
        
        {appointment.notes && (
          <div className="mt-2 text-sm border-t border-border pt-2">
            <span className="text-muted-foreground">Observações:</span>
            <p>{appointment.notes}</p>
          </div>
        )}
        
        {showCancelButton && appointment.status === APPOINTMENT_STATUS.SCHEDULED && (
          <Button 
            variant="destructive" 
            size="sm" 
            className="mt-3 w-full"
            onClick={() => onCancel(appointment.id)}
          >
            Cancelar Agendamento
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsPage;
