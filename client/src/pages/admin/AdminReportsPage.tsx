import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState("financeiro");
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  
  const [reportType, setReportType] = useState("financial");

  // Carregar dados do relatório
  const { data: reportData, isLoading } = useQuery({
    queryKey: [
      `/api/admin/reports/${reportType}`, 
      dateRange.from.toISOString(), 
      dateRange.to.toISOString()
    ],
    retry: 1
  });

  return (
    <AdminLayout title="Relatórios">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financeiro">
          <Card>
            <CardHeader>
              <CardTitle>Relatório Financeiro</CardTitle>
              <CardDescription>
                Análise detalhada do desempenho financeiro
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 items-end">
                  <div>
                    <div className="mb-2 text-sm font-medium">Período</div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "P", { locale: ptBR })} -{" "}
                                {format(dateRange.to, "P", { locale: ptBR })}
                              </>
                            ) : (
                              format(dateRange.from, "P", { locale: ptBR })
                            )
                          ) : (
                            <span>Selecione um período</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <div className="mb-2 text-sm font-medium">Tipo</div>
                    <Select
                      value={reportType}
                      onValueChange={setReportType}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tipo de relatório" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="financial">Financeiro</SelectItem>
                        <SelectItem value="services">Serviços</SelectItem>
                        <SelectItem value="professionals">Profissionais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button className="mb-2" variant="default">
                    <Search className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </Button>
                  
                  <Button className="mb-2" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {isLoading ? (
                    Array(3).fill(0).map((_, idx) => (
                      <Card key={idx}>
                        <CardHeader className="pb-2">
                          <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-10 w-20" />
                          <Skeleton className="h-3 w-full mt-2" />
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <>
                      <Card className="bg-primary/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            R$ {reportData?.revenue ? parseFloat(reportData.revenue).toFixed(2).replace('.', ',') : '0,00'}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            No período selecionado
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-red-50 dark:bg-red-500/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            R$ {reportData?.expenses ? parseFloat(reportData.expenses).toFixed(2).replace('.', ',') : '0,00'}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            No período selecionado
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-green-50 dark:bg-green-500/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Lucro</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            R$ {reportData?.profit ? parseFloat(reportData.profit).toFixed(2).replace('.', ',') : '0,00'}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            No período selecionado
                          </p>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Transações por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80 flex items-center justify-center">
                    {isLoading ? (
                      <div className="w-full space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        Gráfico de transações por categoria será exibido aqui
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="servicos">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Serviços</CardTitle>
              <CardDescription>
                Análise detalhada dos serviços mais populares
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 items-end">
                  <div>
                    <div className="mb-2 text-sm font-medium">Período</div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "P", { locale: ptBR })} -{" "}
                                {format(dateRange.to, "P", { locale: ptBR })}
                              </>
                            ) : (
                              format(dateRange.from, "P", { locale: ptBR })
                            )
                          ) : (
                            <span>Selecione um período</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <Button className="mb-2" variant="default">
                    <Search className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </Button>
                  
                  <Button className="mb-2" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
                
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Serviço
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Agendamentos
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Receita
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {isLoading ? (
                        Array(5).fill(0).map((_, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Skeleton className="h-4 w-24" />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Skeleton className="h-4 w-20" />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <Skeleton className="h-4 w-12 mx-auto" />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right">
                              <Skeleton className="h-4 w-16 ml-auto" />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                            Selecione um período e gere o relatório para visualizar os dados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Desempenho de Serviços</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      Gráfico de desempenho de serviços será exibido aqui
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profissionais">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Profissionais</CardTitle>
              <CardDescription>
                Desempenho dos profissionais da equipe
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 items-end">
                  <div>
                    <div className="mb-2 text-sm font-medium">Período</div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "P", { locale: ptBR })} -{" "}
                                {format(dateRange.to, "P", { locale: ptBR })}
                              </>
                            ) : (
                              format(dateRange.from, "P", { locale: ptBR })
                            )
                          ) : (
                            <span>Selecione um período</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <Button className="mb-2" variant="default">
                    <Search className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </Button>
                  
                  <Button className="mb-2" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
                
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Profissional
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Agendamentos
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Avaliação
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Faturamento
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {isLoading ? (
                        Array(5).fill(0).map((_, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Skeleton className="h-4 w-24" />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <Skeleton className="h-4 w-12 mx-auto" />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <Skeleton className="h-4 w-12 mx-auto" />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right">
                              <Skeleton className="h-4 w-16 ml-auto" />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                            Selecione um período e gere o relatório para visualizar os dados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Desempenho da Equipe</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      Gráfico de desempenho da equipe será exibido aqui
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="produtos">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Produtos</CardTitle>
              <CardDescription>
                Análise de vendas e estoque de produtos
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 items-end">
                  <div>
                    <div className="mb-2 text-sm font-medium">Período</div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "P", { locale: ptBR })} -{" "}
                                {format(dateRange.to, "P", { locale: ptBR })}
                              </>
                            ) : (
                              format(dateRange.from, "P", { locale: ptBR })
                            )
                          ) : (
                            <span>Selecione um período</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <Button className="mb-2" variant="default">
                    <Search className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </Button>
                  
                  <Button className="mb-2" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Produtos</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        Gráfico dos produtos mais vendidos será exibido aqui
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Estoque Baixo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <table className="min-w-full divide-y divide-border">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Produto
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Estoque
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-background divide-y divide-border">
                            {isLoading ? (
                              Array(5).fill(0).map((_, idx) => (
                                <tr key={idx}>
                                  <td className="px-4 py-4">
                                    <Skeleton className="h-4 w-32" />
                                  </td>
                                  <td className="px-4 py-4 text-right">
                                    <Skeleton className="h-4 w-12 ml-auto" />
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                                  Selecione um período e gere o relatório para visualizar os dados.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}