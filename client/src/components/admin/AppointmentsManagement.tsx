
import { useState } from "react";
import { useAppointments } from "@/lib/hooks/useAppointments";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface Props {
  userRole: string;
  userId: number;
}

export default function AppointmentsManagement({ userRole, userId }: Props) {
  const { appointments, completeAppointment } = useAppointments();
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async (appointmentId: number) => {
    try {
      setIsLoading(true);
      await completeAppointment(appointmentId);
      toast({
        title: "Agendamento concluído",
        description: "O agendamento foi marcado como concluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível concluir o agendamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointments = appointments?.filter(appointment => {
    if (userRole === "professional") {
      return appointment.professionalId === userId;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {filteredAppointments?.map((appointment) => (
        <Card key={appointment.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{appointment.user?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(appointment.date).toLocaleDateString()} - {appointment.startTime}
                </p>
              </div>
              {appointment.status === "scheduled" && (
                <Button
                  onClick={() => handleComplete(appointment.id)}
                  disabled={isLoading}
                >
                  Concluir
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
