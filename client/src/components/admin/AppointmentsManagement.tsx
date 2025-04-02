import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAppointments, Appointment, AppointmentService } from "../../lib/hooks/useAppointments";
import { formatCurrency, AppointmentStatus } from "../../lib/constants";
import { useToast } from "../../hooks/use-toast";

export default function AppointmentsManagement() {
  const appointmentsHook = useAppointments();
  const { appointments, isLoading, completeAppointment, cancelAppointment, filterAppointments } = appointmentsHook;
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Handle filter change
  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    filterAppointments(status);
  };

  // Handle status change
  const handleStatusChange = (appointmentId: number, newStatus: AppointmentStatus) => {
    if (newStatus === AppointmentStatus.COMPLETED) {
      if (window.confirm("Deseja marcar este agendamento como concluído?")) {
        completeAppointment(appointmentId);
      }
    } else if (newStatus === AppointmentStatus.CANCELLED) {
      if (window.confirm("Deseja cancelar este agendamento?")) {
        cancelAppointment(appointmentId);
      }
    }
  };

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Format time (assuming it's stored as "HH:MM:SS")
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString.substring(0, 5); // Get HH:MM part
  };

  // Calculate total price of appointment
  const calculateTotal = (services: AppointmentService[]) => {
    return services.reduce((total, service) => total + service.price, 0);
  };

  // Get status badge style
  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case AppointmentStatus.COMPLETED:
        return "bg-green-100 text-green-800 border border-green-200";
      case AppointmentStatus.CANCELLED:
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Get status text in Portuguese
  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return "Agendado";
      case AppointmentStatus.COMPLETED:
        return "Concluído";
      case AppointmentStatus.CANCELLED:
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Agendamentos</h2>
        <div className="flex space-x-2">
          <Select value={statusFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value={AppointmentStatus.SCHEDULED}>Agendados</SelectItem>
              <SelectItem value={AppointmentStatus.COMPLETED}>Concluídos</SelectItem>
              <SelectItem value={AppointmentStatus.CANCELLED}>Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex justify-center items-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-2">Carregando agendamentos...</p>
          </CardContent>
        </Card>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onStatusChange={handleStatusChange}
              getStatusBadge={getStatusBadge}
              getStatusText={getStatusText}
              formatDate={formatDate}
              formatTime={formatTime}
              calculateTotal={calculateTotal}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusChange: (appointmentId: number, status: AppointmentStatus) => void;
  getStatusBadge: (status: AppointmentStatus) => string;
  getStatusText: (status: AppointmentStatus) => string;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  calculateTotal: (services: AppointmentService[]) => number;
}

function AppointmentCard({
  appointment,
  onStatusChange,
  getStatusBadge,
  getStatusText,
  formatDate,
  formatTime,
  calculateTotal,
}: AppointmentCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card key={appointment.id} className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{appointment.customer_name}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(appointment.status)}`}
                >
                  {getStatusText(appointment.status)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(appointment.date)} às {formatTime(appointment.time)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Profissional</p>
                <p className="font-medium">{appointment.professional_name}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? "Ocultar" : "Detalhes"}
              </Button>
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="p-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Serviços</h4>
              <div className="space-y-1">
                {appointment.services.map((service) => (
                  <div key={service.id} className="flex justify-between text-sm">
                    <span>{service.service_name}</span>
                    <span>{formatCurrency(service.price)}</span>
                  </div>
                ))}
                <div className="border-t pt-1 mt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(calculateTotal(appointment.services))}</span>
                </div>
              </div>
            </div>

            {appointment.status === AppointmentStatus.SCHEDULED && (
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusChange(appointment.id, AppointmentStatus.CANCELLED)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onStatusChange(appointment.id, AppointmentStatus.COMPLETED)}
                >
                  Marcar como Concluído
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}