import { useState } from "react";
import { DateRange } from "react-day-picker";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Download, FileText, Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
// Importações para os gráficos
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, Cell, TooltipProps 
} from 'recharts';

// Definir o schema de validação para transações
const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.enum([
    "service", "product", "commission", "salary", 
    "rent", "utilities", "supplies", "marketing", "other"
  ]),
  amount: z.string().min(1, "Valor é obrigatório").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Valor deve ser maior que zero"
  ),
  description: z.string().min(1, "Descrição é obrigatória"),
  date: z.date()
});

// Mapeamento de categorias para exibição em português
const categoryLabels: Record<string, string> = {
  service: "Serviço",
  product: "Produto",
  commission: "Comissão",
  salary: "Salário",
  rent: "Aluguel",
  utilities: "Contas",
  supplies: "Suprimentos",
  marketing: "Marketing",
  other: "Outros"
};

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState("registrar");
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  
  // Handler para DateRange que lida com null/undefined
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range && range.from) {
      setDateRange({
        from: range.from,
        to: range.to || range.from
      });
      
      // Forçar atualização imediata dos dados quando o período é alterado
      setTimeout(() => {
        console.log('Período alterado. Atualizando dados financeiros...');
        refetch();
        refetchSummary();
      }, 100);
    }
  };

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "income",
      category: "service",
      amount: "",
      description: "",
      date: new Date()
    }
  });

  // Interface para transações
interface Transaction {
  id: number;
  date: string;
  type: string;
  category: string;
  description: string;
  amount: number;
}

// Carregar transações
  const { data: transactions, isLoading, refetch } = useQuery<Transaction[]>({
    queryKey: [
      '/api/admin/cash-flow', 
      dateRange.from.toISOString(), 
      dateRange.to.toISOString()
    ],
    retry: 1,
    staleTime: 0, // Não manter em cache
    gcTime: 0, // Descartar resultados após uso
    refetchOnMount: true, // Sempre recarregar ao montar
    refetchOnWindowFocus: true, // Recarregar ao retornar ao foco
    refetchInterval: 30000 // Recarregar a cada 30 segundos (para capturar novos registros)
  });

  // Interface para o resumo financeiro
interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  income?: string;
  expense?: string;
  categories?: Array<{
    category: string;
    income: number;
    expense: number;
    balance: number;
  }>;
  period?: {
    start: string;
    end: string;
  };
}

// Obter resumo financeiro
  const { data: summary, isLoading: isLoadingSummary, refetch: refetchSummary } = useQuery<FinancialSummary>({
    queryKey: [
      '/api/admin/cash-flow/summary', 
      dateRange.from.toISOString(), 
      dateRange.to.toISOString()
    ],
    retry: 1,
    // Garantir que o resumo será sempre atualizado
    staleTime: 0, 
    refetchOnWindowFocus: true,
    gcTime: 0, // Não manter em cache
    refetchOnMount: true // Sempre recarregar ao montar
  }) as { data: FinancialSummary | undefined, isLoading: boolean, refetch: () => void };

  // Lidar com o envio de uma nova transação
  const handleSubmit = async (values: z.infer<typeof transactionSchema>) => {
    try {
      const formattedData = {
        ...values,
        amount: parseFloat(values.amount).toString(), // Garante que o valor está em formato numérico
      };
      
      await apiRequest('POST', '/api/admin/cash-flow', formattedData);
      
      toast({
        title: "Transação registrada",
        description: `A transação foi registrada com sucesso.`
      });
      
      // Limpar formulário e recarregar todos os dados
      form.reset({
        type: "income",
        category: "service",
        amount: "",
        description: "",
        date: new Date()
      });
      
      // Recarregar tanto as transações quanto o resumo financeiro
      refetch();
      refetchSummary();
      
      // Log para depuração
      console.log('Solicitando atualização do resumo financeiro após registrar nova transação');
    } catch (error) {
      console.error("Erro ao registrar transação:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar a transação. Tente novamente."
      });
    }
  };

  return (
    <AdminLayout title="Gestão Financeira">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="registrar">Registrar Transação</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="registrar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Nova Transação</CardTitle>
                <CardDescription>
                  Registre entradas e saídas do seu caixa
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <FormProvider {...form}>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="income">Entrada</SelectItem>
                                  <SelectItem value="expense">Saída</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categoria</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a categoria" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="service">Serviço</SelectItem>
                                  <SelectItem value="product">Produto</SelectItem>
                                  <SelectItem value="commission">Comissão</SelectItem>
                                  <SelectItem value="salary">Salário</SelectItem>
                                  <SelectItem value="rent">Aluguel</SelectItem>
                                  <SelectItem value="utilities">Contas</SelectItem>
                                  <SelectItem value="supplies">Suprimentos</SelectItem>
                                  <SelectItem value="marketing">Marketing</SelectItem>
                                  <SelectItem value="other">Outros</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valor (R$)</FormLabel>
                              <FormControl>
                                <Input placeholder="0,00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Data</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP", {
                                          locale: ptBR,
                                        })
                                      ) : (
                                        <span>Selecione uma data</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Detalhes da transação" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full md:w-auto">
                        Registrar Transação
                      </Button>
                    </form>
                  </Form>
                </FormProvider>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle>Balanço do Mês</CardTitle>
                  <CardDescription>
                    Resumo financeiro do mês atual
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {isLoadingSummary ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : summary ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">Entradas</span>
                        <span className="font-medium text-green-600">
                          R$ {summary && 'totalIncome' in summary && summary.totalIncome !== undefined 
                              ? Number(summary.totalIncome).toFixed(2).replace('.', ',') 
                              : '0,00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">Saídas</span>
                        <span className="font-medium text-red-600">
                          R$ {summary && 'totalExpense' in summary && summary.totalExpense !== undefined 
                              ? Number(summary.totalExpense).toFixed(2).replace('.', ',') 
                              : '0,00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-medium">Saldo</span>
                        <span className={cn(
                          "font-bold",
                          (summary && 'balance' in summary && summary.balance !== undefined)
                            ? (Number(summary.balance) >= 0 ? "text-green-600" : "text-red-600")
                            : "text-gray-600"
                        )}>
                          R$ {summary && 'balance' in summary && summary.balance !== undefined 
                              ? Number(summary.balance).toFixed(2).replace('.', ',') 
                              : '0,00'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Dicas</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <p>✓ Registre todas as transações para manter seu fluxo de caixa atualizado</p>
                    <p>✓ Categorize corretamente para gerar relatórios precisos</p>
                    <p>✓ Monitore seu balanço diariamente para melhor controle financeiro</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                Visualize e filtre seu histórico financeiro
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
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
                          onSelect={handleDateRangeChange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <Button variant="outline" onClick={() => refetch()}>
                    <Search className="mr-2 h-4 w-4" />
                    Filtrar
                  </Button>
                </div>
                
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Valor
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
                              <Skeleton className="h-4 w-16" />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Skeleton className="h-4 w-20" />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Skeleton className="h-4 w-32" />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right">
                              <Skeleton className="h-4 w-16 ml-auto" />
                            </td>
                          </tr>
                        ))
                      ) : transactions && transactions.length > 0 ? (
                        transactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {format(new Date(transaction.date), "dd/MM/yyyy")}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                transaction.type === "income" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                              )}>
                                {transaction.type === "income" ? "Entrada" : "Saída"}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {categoryLabels[transaction.category as keyof typeof categoryLabels] || transaction.category}
                            </td>
                            <td className="px-4 py-4 text-sm max-w-xs truncate">
                              {transaction.description}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium">
                              R$ {Number(transaction.amount).toFixed(2).replace('.', ',')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                            Nenhuma transação encontrada no período selecionado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="relatorios">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Relatórios Financeiros</CardTitle>
                <CardDescription>
                  Visualize o desempenho financeiro do seu negócio
                </CardDescription>
              </div>
              
              <div className="flex space-x-2">
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                              {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                            </>
                          ) : (
                            format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
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
                        onSelect={handleDateRangeChange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.open('/api/admin/reports/financial?format=pdf', '_blank')}
                    className="ml-2"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </Button>
                </div>
                
                {/* Adicionar um botão para sincronizar as transações com agendamentos concluídos */}
                <div className="flex justify-end mt-2">
                  <SyncTransactionsButton refetchData={() => {
                    refetch();
                    refetchSummary();
                  }} />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg">Receita Total</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3 pt-0">
                    <div className="text-2xl font-bold text-green-600">
                      R$ {summary ? Number(summary.totalIncome).toFixed(2).replace('.', ',') : '0,00'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      No período selecionado
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg">Despesas</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3 pt-0">
                    <div className="text-2xl font-bold text-red-600">
                      R$ {summary ? Number(summary.totalExpense).toFixed(2).replace('.', ',') : '0,00'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      No período selecionado
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg">Lucro</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3 pt-0">
                    <div className="text-2xl font-bold">
                      R$ {summary ? Number(summary.balance).toFixed(2).replace('.', ',') : '0,00'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      No período selecionado
                    </div>
                  </CardContent>
                </Card>
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Transações por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    {isLoadingSummary ? (
                      <div className="h-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : summary && summary.categories && summary.categories.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={summary.categories.map(cat => ({
                              name: categoryLabels[cat.category] || cat.category,
                              value: cat.income
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => 
                              percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                            }
                          >
                            {summary.categories.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={[
                                  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe',
                                  '#00C49F', '#FFBB28', '#FF8042', '#a4de6c'
                                ][index % 9]} 
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} 
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Fluxo de Caixa</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : transactions && transactions.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Entradas', valor: summary?.totalIncome || 0, fill: '#10b981' },
                            { name: 'Saídas', valor: summary?.totalExpense || 0, fill: '#ef4444' },
                            { name: 'Saldo', valor: summary?.balance || 0, fill: '#3b82f6' }
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip 
                            formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
                          />
                          <Bar dataKey="valor" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => window.open('/api/admin/reports/financial?format=excel', '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar Dados
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

// Componente para o botão de sincronização de transações
function SyncTransactionsButton({ refetchData }: { refetchData: () => void }) {
  const queryClient = useQueryClient();
  
  // Mutation para sincronizar transações
  const syncMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/admin/cash-flow/sync-appointments');
    },
    onSuccess: (data) => {
      // Mostrar mensagem de sucesso
      toast({
        title: "Sincronização concluída",
        description: "Os serviços concluídos foram sincronizados com o fluxo de caixa.",
        variant: "default"
      });
      
      // Atualizar dados
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cash-flow'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cash-flow/summary'] });
      refetchData();
    },
    onError: (error: any) => {
      console.error("Erro ao sincronizar transações:", error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os agendamentos. Tente novamente.",
        variant: "destructive"
      });
    }
  });
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => syncMutation.mutate()}
      disabled={syncMutation.isPending}
    >
      <RefreshCw className="mr-2 h-4 w-4" />
      {syncMutation.isPending ? 'Sincronizando...' : 'Sincronizar Agendamentos'}
    </Button>
  );
}