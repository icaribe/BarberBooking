import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  CalendarClock, 
  ShoppingBag, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  AlertCircle,
  ChevronsUp,
  BarChart3,
  Activity
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/hooks/useAuth";
import { Appointment } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Interfaces para os dados que recebemos da API
interface DashboardStats {
  appointments: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  products: {
    total: number;
    lowStock: number;
  };
  professionals: number;
  finance: {
    dailyRevenue: string;
    monthlyRevenue: string;
  };
}

interface TodayAppointment {
  id: number;
  client_name: string;
  professional_name: string;
  service_names: string[];
  status: string;
  startTime?: string;
  start_time?: string;
}

// Interfaces para os dados dos gráficos
interface SalesChartData {
  name: string;
  servicos: number;
  produtos: number;
  total: number;
}

interface CategorySalesData {
  name: string;
  value: number;
}

interface ProfessionalPerformanceData {
  name: string;
  completados: number;
  cancelados: number;
}

// Tipagem para o formatter do Tooltip
type TooltipFormatter = (value: number, name?: string, props?: any) => string;

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Buscar estatísticas do dashboard
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard/stats'],
    enabled: !!user,
    refetchInterval: 1000, // Recarrega a cada 1 segundo
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0, // Sempre considerar os dados desatualizados
    gcTime: 0 // Tempo para garbage collection (no TanStack v5 substitui cacheTime)
  });

  // Buscar agendamentos para hoje
  const { data: todayAppointments, isLoading: appointmentsLoading } = useQuery<TodayAppointment[]>({
    queryKey: ['/api/admin/dashboard/today-appointments'],
    enabled: !!user,
    refetchInterval: 1000, // Recarrega a cada 1 segundo
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0, // Sempre considerar os dados desatualizados
    gcTime: 0 // Tempo para garbage collection (no TanStack v5 substitui cacheTime)
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

  const formatAppointmentTime = (appointment: TodayAppointment) => {
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
  
  // Dados de exemplo para os gráficos
  const salesChartData: SalesChartData[] = [
    { name: 'Seg', servicos: 2400, produtos: 1400, total: 3800 },
    { name: 'Ter', servicos: 1980, produtos: 2000, total: 3980 },
    { name: 'Qua', servicos: 2780, produtos: 1800, total: 4580 },
    { name: 'Qui', servicos: 1890, produtos: 2300, total: 4190 },
    { name: 'Sex', servicos: 2390, produtos: 2500, total: 4890 },
    { name: 'Sab', servicos: 3490, produtos: 2100, total: 5590 },
    { name: 'Dom', servicos: 1490, produtos: 1000, total: 2490 },
  ];
  
  const categorySalesData: CategorySalesData[] = [
    { name: 'Cuidados Capilares', value: 4000 },
    { name: 'Barba', value: 3000 },
    { name: 'Pele', value: 2000 },
    { name: 'Acessórios', value: 2780 },
    { name: 'Kits', value: 1890 },
  ];
  
  const topServicesData: CategorySalesData[] = [
    { name: 'Corte Masculino', value: 24 },
    { name: 'Barba Completa', value: 18 },
    { name: 'Corte + Barba', value: 15 },
    { name: 'Acabamento', value: 12 },
    { name: 'Pigmentação', value: 8 },
  ];

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
                  <div className="text-2xl font-bold">R$ {(Number(stats.finance.dailyRevenue) / 100).toFixed(2)}</div>
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
                  <div className="text-2xl font-bold">R$ {(Number(stats.finance.monthlyRevenue) / 100).toFixed(2)}</div>
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

      {isAdmin && (
        <div className="mt-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="sales">Vendas</TabsTrigger>
              <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
              <TabsTrigger value="performance">Desempenho</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Vendas e Agendamentos</CardTitle>
                  <CardDescription>Visão geral das operações dos últimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesChartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${(value/100).toFixed(2)}`} />
                      <Legend />
                      <Line type="monotone" dataKey="servicos" stroke="#8884d8" activeDot={{ r: 8 }} name="Serviços" />
                      <Line type="monotone" dataKey="produtos" stroke="#82ca9d" name="Produtos" />
                      <Line type="monotone" dataKey="total" stroke="#ff7300" name="Total" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Status dos Agendamentos</CardTitle>
                    <CardDescription>Distribuição por status</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Pendentes', value: stats.appointments.pending || 0, color: '#F59E0B' },
                            { name: 'Confirmados', value: stats.appointments.confirmed || 0, color: '#10B981' },
                            { name: 'Concluídos', value: stats.appointments.completed || 0, color: '#3B82F6' },
                            { name: 'Cancelados', value: stats.appointments.cancelled || 0, color: '#EF4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Pendentes', value: stats.appointments.pending || 0, color: '#F59E0B' },
                            { name: 'Confirmados', value: stats.appointments.confirmed || 0, color: '#10B981' },
                            { name: 'Concluídos', value: stats.appointments.completed || 0, color: '#3B82F6' },
                            { name: 'Cancelados', value: stats.appointments.cancelled || 0, color: '#EF4444' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} agendamento(s)`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Alertas e Notificações</CardTitle>
                    <CardDescription>Itens que requerem sua atenção</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.products.lowStock > 0 && (
                        <div className="flex items-start space-x-2 p-2 bg-amber-50 text-amber-800 rounded-md">
                          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Estoque baixo</p>
                            <p className="text-sm">{stats.products.lowStock} produtos precisam de reposição</p>
                          </div>
                        </div>
                      )}
                      
                      {stats.appointments.pending > 0 && (
                        <div className="flex items-start space-x-2 p-2 bg-blue-50 text-blue-800 rounded-md">
                          <CalendarClock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Agendamentos pendentes</p>
                            <p className="text-sm">{stats.appointments.pending} agendamentos aguardam confirmação</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start space-x-2 p-2 bg-green-50 text-green-800 rounded-md">
                        <Activity className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Atividade recente</p>
                          <p className="text-sm">O sistema está funcionando normalmente</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="sales" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Vendas</CardTitle>
                  <CardDescription>Receita por categoria de produto</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Cuidados Capilares', value: 4000 },
                        { name: 'Barba', value: 3000 },
                        { name: 'Pele', value: 2000 },
                        { name: 'Acessórios', value: 2780 },
                        { name: 'Kits', value: 1890 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${(value/100).toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="value" name="Receita" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
                <div className="p-4 border-t">
                  <Button variant="outline" className="w-full">Ver Relatório Completo</Button>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Serviços Mais Populares</CardTitle>
                  <CardDescription>Top 5 serviços mais agendados</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { name: 'Corte Masculino', value: 24 },
                        { name: 'Barba Completa', value: 18 },
                        { name: 'Corte + Barba', value: 15 },
                        { name: 'Acabamento', value: 12 },
                        { name: 'Pigmentação', value: 8 },
                      ]}
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Agendamentos" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho dos Profissionais</CardTitle>
                  <CardDescription>Número de atendimentos por profissional</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Carlos', completados: 18, cancelados: 2 },
                        { name: 'Bruno', completados: 12, cancelados: 1 },
                        { name: 'Sérgio', completados: 15, cancelados: 3 },
                        { name: 'Rafael', completados: 20, cancelados: 0 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completados" name="Atendimentos Concluídos" stackId="a" fill="#8884d8" />
                      <Bar dataKey="cancelados" name="Atendimentos Cancelados" stackId="a" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

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
                  <div className={`text-xs px-2 py-1 rounded ${
                    appointment.status?.trim().toUpperCase() === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                    appointment.status?.trim().toUpperCase() === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                    appointment.status?.trim().toUpperCase() === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status?.trim().toUpperCase() === 'COMPLETED' ? 'Concluído' :
                     appointment.status?.trim().toUpperCase() === 'CONFIRMED' ? 'Confirmado' :
                     appointment.status?.trim().toUpperCase() === 'CANCELLED' ? 'Cancelado' :
                     'Pendente'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" className="mr-2">Ver Todos</Button>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}