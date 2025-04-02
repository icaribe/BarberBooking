import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "../../lib/constants";

// Types for financial data
interface Appointment {
  id: number;
  date: string;
  status: "scheduled" | "completed" | "cancelled";
  services: {
    id: number;
    name: string;
    price: number;
  }[];
  professional: {
    id: number;
    name: string;
  };
  customer: {
    id: number;
    name: string;
  };
}

interface Sale {
  id: number;
  date: string;
  total: number;
  items: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    type: "product" | "service";
  }[];
  customer?: {
    id: number;
    name: string;
  };
}

// FinancialManagement component
export default function FinancialManagement() {
  const [period, setPeriod] = useState("month");
  const [professionalFilter, setProfessionalFilter] = useState("all");

  // Fetch all appointments and sales
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["appointments", { status: "completed" }],
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["sales"],
  });

  const { data: professionals = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["professionals"],
  });

  // Filter appointments by period
  const getStartDate = () => {
    const now = new Date();
    switch (period) {
      case "week":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return startOfWeek;
      case "month":
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case "year":
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(0); // all time
    }
  };

  // Filter data by period and professional
  const filterByPeriod = (date: string) => {
    const startDate = getStartDate();
    const itemDate = new Date(date);
    return itemDate >= startDate;
  };

  const filterByProfessional = (appointment: Appointment) => {
    if (professionalFilter === "all") return true;
    return appointment.professional.id.toString() === professionalFilter;
  };

  const filteredAppointments = appointments.filter(
    (appointment) => filterByPeriod(appointment.date) && filterByProfessional(appointment)
  );

  const filteredSales = sales.filter((sale) => filterByPeriod(sale.date));

  // Calculate financial metrics
  const totalAppointmentsRevenue = filteredAppointments.reduce((total, appointment) => {
    const appointmentTotal = appointment.services.reduce(
      (sum, service) => sum + service.price,
      0
    );
    return total + appointmentTotal;
  }, 0);

  const totalProductsRevenue = filteredSales.reduce((total, sale) => {
    const productTotal = sale.items
      .filter((item) => item.type === "product")
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
    return total + productTotal;
  }, 0);

  const totalRevenue = totalAppointmentsRevenue + totalProductsRevenue;

  // Count total completed appointments and products sold
  const appointmentsCount = filteredAppointments.length;
  
  const productsSold = filteredSales.reduce((total, sale) => {
    const productCount = sale.items
      .filter((item) => item.type === "product")
      .reduce((sum, item) => sum + item.quantity, 0);
    return total + productCount;
  }, 0);

  // Group appointments by date for the timeline view
  const timelineData = filteredAppointments.reduce<Record<string, Appointment[]>>(
    (acc, appointment) => {
      const date = appointment.date.split("T")[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(appointment);
      return acc;
    },
    {}
  );

  // Get formatted period label
  const getPeriodLabel = () => {
    const now = new Date();
    switch (period) {
      case "week":
        return `Semana atual (${format(getStartDate(), "dd/MM", { locale: ptBR })} - ${format(
          now,
          "dd/MM",
          { locale: ptBR }
        )})`;
      case "month":
        return `${format(now, "MMMM 'de' yyyy", { locale: ptBR })}`;
      case "year":
        return `${now.getFullYear()}`;
      default:
        return "Todo o período";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão Financeira</h2>
        <div className="flex space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
              <SelectItem value="all">Todo o período</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os profissionais</SelectItem>
              {professionals.map(professional => (
                <SelectItem key={professional.id} value={professional.id.toString()}>
                  {professional.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{getPeriodLabel()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Serviços Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de {formatCurrency(totalAppointmentsRevenue)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produtos Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsSold}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de {formatCurrency(totalProductsRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="space-y-4">
          {Object.keys(timelineData).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum atendimento encontrado no período selecionado.
            </p>
          ) : (
            Object.entries(timelineData)
              .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
              .map(([date, dayAppointments]) => (
                <Card key={date}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {format(new Date(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {dayAppointments.map((appointment) => {
                        const total = appointment.services.reduce(
                          (sum, service) => sum + service.price,
                          0
                        );
                        
                        return (
                          <div key={appointment.id} className="border-b pb-2 last:border-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{appointment.customer.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Profissional: {appointment.professional.name}
                                </p>
                                <div className="text-sm mt-1">
                                  {appointment.services.map((service) => (
                                    <div key={service.id} className="flex justify-between">
                                      <span>{service.name}</span>
                                      <span>{formatCurrency(service.price)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <p className="font-semibold">{formatCurrency(total)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardContent className="pt-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Data</th>
                    <th className="text-left pb-2">Cliente</th>
                    <th className="text-left pb-2">Profissional</th>
                    <th className="text-left pb-2">Serviços</th>
                    <th className="text-right pb-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted-foreground">
                        Nenhum atendimento encontrado no período selecionado.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appointment) => {
                      const total = appointment.services.reduce(
                        (sum, service) => sum + service.price,
                        0
                      );
                      
                      return (
                        <tr key={appointment.id} className="border-b last:border-0">
                          <td className="py-3">
                            {format(new Date(appointment.date), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </td>
                          <td className="py-3">{appointment.customer.name}</td>
                          <td className="py-3">{appointment.professional.name}</td>
                          <td className="py-3">
                            {appointment.services
                              .map((service) => service.name)
                              .join(", ")}
                          </td>
                          <td className="text-right py-3">{formatCurrency(total)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="text-right font-semibold pt-4">
                      Total:
                    </td>
                    <td className="text-right font-bold pt-4">
                      {formatCurrency(totalAppointmentsRevenue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}