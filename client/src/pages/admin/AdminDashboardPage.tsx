import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  CalendarClock, 
  ShoppingBag, 
  Calendar, 
  TrendingUp, 
  DollarSign 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/hooks/useAuth";
import { Appointment } from "@shared/schema";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Buscar estatísticas do dashboard
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/dashboard/stats'],
    enabled: !!user,
    refetchInterval: 3000 // Recarrega a cada 3 segundos
  });

  // Buscar agendamentos para hoje
  const { data: todayAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/admin/dashboard/today-appointments'],
    enabled: !!user,
    refetchInterval: 3000 // Recarrega a cada 3 segundos
  });

  const stats = dashboardStats || {
    appointments: { 
      total: 0, 
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    },
    products: { total: 0, lowStock: 0 },
    professionals: 0,
    finance: { 
      dailyRevenue: "0.00", 
      monthlyRevenue: "0.00" 
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  const formatAppointmentTime = (appointment: any) => {
    try {
      const time = appointment.startTime || appointment.start_time;
      if (!time) return '';
      const start = new Date(`2000-01-01T${time}`);
      return start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Erro ao formatar hora do agendamento:', error);
      return '';
    }
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Totais</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{stats.appointments.total}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {statsLoading || appointmentsLoading ? (
                <Skeleton className="h-4 w-[120px]" />
              ) : (
                `${todayAppointments?.length || 0} agendamentos hoje`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profissionais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{stats.professionals}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {statsLoading ? (
                <Skeleton className="h-4 w-[120px]" />
              ) : (
                `Equipe completa para atendimento`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{stats.products.total}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {statsLoading ? (
                <Skeleton className="h-4 w-[120px]" />
              ) : (
                `${stats.products.lowStock} produtos com estoque baixo`
              )}
            </p>
          </CardContent>
        </Card>

        {isAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento do Dia</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">R$ {stats.finance.dailyRevenue}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  {statsLoading ? (
                    <Skeleton className="h-4 w-[120px]" />
                  ) : (
                    `Vendas e serviços do dia`
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Mensal</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">R$ {stats.finance.monthlyRevenue}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  {statsLoading ? (
                    <Skeleton className="h-4 w-[120px]" />
                  ) : (
                    `Total acumulado no mês atual`
                  )}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Agendamentos de Hoje</h2>
        <div className="bg-card rounded-md border p-4">
          {appointmentsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 border-b">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-[180px]" />
                    <Skeleton className="h-4 w-[120px]" />
                  </div>
                  <Skeleton className="h-8 w-[80px]" />
                </div>
              ))}
            </div>
          ) : todayAppointments?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-2 text-muted-foreground/60" />
              <p>Nenhum agendamento para hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments?.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-2 border-b">
                  <div>
                    <div className="font-medium">
                      {appointment.client_name} 
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({formatAppointmentTime(appointment)})
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      com {appointment.professional_name} • {appointment.service_names.join(', ')}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {appointment.status === 'CONFIRMED' ? 'Confirmado' : 'Pendente'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}