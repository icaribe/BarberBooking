/**
 * Rotas para geração de relatórios administrativos
 */

import { Router, Request, Response } from 'express';
import { UserRole, requireRole } from '../middleware/role-middleware';
import supabase from '../supabase';
import { storage } from '../storage';
import adminFunctions from '../storage-supabase-admin';

const router = Router();

/**
 * Relatório financeiro detalhado
 * Retorna resumo de faturamento por serviço, profissional e período
 */
router.get('/financial', 
  requireRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Converter datas para filtro
      const startDateObj = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endDateObj = endDate ? new Date(endDate as string) : new Date();
      
      console.log(`Gerando relatório financeiro de ${startDateObj.toISOString().split('T')[0]} até ${endDateObj.toISOString().split('T')[0]}`);
      
      // Buscar transações no período
      const { data: transactions, error } = await supabase
        .from('cash_flow')
        .select('*')
        .gte('date', startDateObj.toISOString().split('T')[0])
        .lte('date', endDateObj.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) {
        throw new Error(`Falha ao buscar transações: ${error.message}`);
      }
      
      // Buscar todos os agendamentos concluídos no período
      const { data: completedAppointments, error: appError } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'completed')
        .gte('date', startDateObj.toISOString().split('T')[0])
        .lte('date', endDateObj.toISOString().split('T')[0]);
        
      if (appError) {
        throw new Error(`Falha ao buscar agendamentos: ${appError.message}`);
      }
      
      // Dados detalhados de cada agendamento concluído
      const appointmentDetails = [];
      
      for (const appointment of completedAppointments || []) {
        // Buscar serviços do agendamento
        const { data: appointmentServices } = await supabase
          .from('appointment_services')
          .select('*')
          .eq('appointment_id', appointment.id);
          
        // Buscar detalhes do cliente
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('id', appointment.user_id)
          .single();
          
        // Buscar detalhes do profissional
        const { data: professional } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', appointment.professional_id)
          .single();
          
        // Obter detalhes dos serviços
        const services = [];
        let totalValue = 0;
        
        for (const svc of appointmentServices || []) {
          const { data: serviceDetails } = await supabase
            .from('services')
            .select('*')
            .eq('id', svc.service_id)
            .single();
            
          if (serviceDetails) {
            services.push(serviceDetails);
            totalValue += serviceDetails.price || 0;
          }
        }
        
        appointmentDetails.push({
          id: appointment.id,
          date: appointment.date,
          client: user ? user.name : 'Cliente não identificado',
          professional: professional ? professional.name : 'Profissional não identificado',
          services: services.map(s => ({
            id: s.id,
            name: s.name,
            price: s.price
          })),
          totalValue,
          status: appointment.status
        });
      }
      
      // Calcular total de receitas e despesas
      const totalIncome = transactions
        .filter(t => t.type === 'INCOME' || t.type === 'PRODUCT_SALE')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
      const totalExpense = transactions
        .filter(t => t.type === 'EXPENSE' || t.type === 'REFUND')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      // Agrupar por categoria
      const incomeByCategory = {};
      const expenseByCategory = {};
      
      for (const transaction of transactions) {
        if (transaction.transactionType === 'INCOME' || transaction.transactionType === 'PRODUCT_SALE') {
          incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + parseFloat(transaction.amount);
        } else if (transaction.transactionType === 'EXPENSE' || transaction.transactionType === 'REFUND') {
          expenseByCategory[transaction.category] = (expenseByCategory[transaction.category] || 0) + parseFloat(transaction.amount);
        }
      }
      
      // Formatação de valores para exibição (convertendo de centavos para reais)
      const formatCurrency = (value) => {
        return `R$ ${(value/100).toFixed(2)}`;
      };
      
      const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
      };
      
      // Preparar resposta
      res.json({
        success: true,
        data: {
          period: {
            startDate: formatDate(startDateObj),
            endDate: formatDate(endDateObj)
          },
          summary: {
            totalIncome: totalIncome,
            totalExpense: totalExpense,
            balance: totalIncome - totalExpense,
            formattedTotalIncome: formatCurrency(totalIncome),
            formattedTotalExpense: formatCurrency(totalExpense),
            formattedBalance: formatCurrency(totalIncome - totalExpense)
          },
          categorySummary: {
            income: incomeByCategory,
            expense: expenseByCategory
          },
          appointments: appointmentDetails,
          transactions: transactions.map(t => ({
            ...t,
            formattedAmount: formatCurrency(parseFloat(t.amount)),
            formattedDate: formatDate(t.date)
          }))
        }
      });
    } catch (error: any) {
      console.error('Erro ao gerar relatório financeiro:', error);
      res.status(500).json({ 
        success: false, 
        message: `Erro ao gerar relatório financeiro: ${error.message}`
      });
    }
  }
);

/**
 * Relatório de serviços mais populares
 */
router.get('/top-services', 
  requireRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, limit } = req.query;
      
      // Parâmetros padrão
      const startDateObj = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endDateObj = endDate ? new Date(endDate as string) : new Date();
      const resultLimit = limit ? parseInt(limit as string) : 10;
      
      console.log(`Gerando relatório de serviços mais populares de ${startDateObj.toISOString().split('T')[0]} até ${endDateObj.toISOString().split('T')[0]}`);
      
      // Buscar todos os serviços cadastrados
      const services = await storage.getServices();
      
      // Buscar agendamentos no período
      const completedAppointments = await adminFunctions.getAppointments({
        status: 'completed',
        startDate: startDateObj.toISOString().split('T')[0],
        endDate: endDateObj.toISOString().split('T')[0]
      });
      
      // Contar frequência de cada serviço
      const serviceCount = {};
      const serviceRevenue = {};
      
      for (const appointment of completedAppointments) {
        // Buscar serviços do agendamento
        const appointmentServices = await storage.getAppointmentServices(appointment.id);
        
        for (const s of appointmentServices) {
          const serviceId = s.serviceId;
          
          // Incrementar contagem
          serviceCount[serviceId] = (serviceCount[serviceId] || 0) + 1;
          
          // Buscar preço do serviço para calcular receita
          const service = services.find(s => s.id === serviceId);
          if (service && service.price) {
            serviceRevenue[serviceId] = (serviceRevenue[serviceId] || 0) + service.price;
          }
        }
      }
      
      // Transformar em array para ordenação
      const serviceCounts = Object.keys(serviceCount).map(serviceId => {
        const service = services.find(s => s.id === parseInt(serviceId));
        return {
          id: parseInt(serviceId),
          name: service ? service.name : `Serviço #${serviceId}`,
          count: serviceCount[serviceId],
          revenue: serviceRevenue[serviceId] || 0
        };
      });
      
      // Ordenar por contagem decrescente
      serviceCounts.sort((a, b) => b.count - a.count);
      
      // Limitar resultados se necessário
      const topServices = serviceCounts.slice(0, resultLimit);
      
      // Adicionar informações detalhadas de cada serviço
      const detailedTopServices = [];
      for (const service of topServices) {
        const appointmentsWithService = [];
        
        // Buscar agendamentos que incluem este serviço
        for (const appointment of completedAppointments) {
          const appSvc = await storage.getAppointmentServices(appointment.id);
          if (appSvc.some(serviceId => serviceId === service.id)) {
            appointmentsWithService.push(appointment);
          }
        }
        
        detailedTopServices.push({
          ...service,
          formattedRevenue: `R$ ${(service.revenue/100).toFixed(2)}`,
          appointments: appointmentsWithService.length,
          percentageOfTotal: (service.count / serviceCounts.reduce((sum, s) => sum + s.count, 0) * 100).toFixed(2)
        });
      }
      
      res.json({
        success: true,
        data: {
          topServices: detailedTopServices,
          totalAppointments: completedAppointments.length,
          period: {
            startDate: startDateObj.toISOString().split('T')[0],
            endDate: endDateObj.toISOString().split('T')[0]
          }
        }
      });
    } catch (error: any) {
      console.error('Erro ao gerar relatório de serviços populares:', error);
      res.status(500).json({ 
        success: false, 
        message: `Erro ao gerar relatório: ${error.message}`
      });
    }
  }
);

/**
 * Relatório de desempenho dos profissionais
 */
router.get('/professional-performance', 
  requireRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Converter datas para filtro
      const startDateObj = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endDateObj = endDate ? new Date(endDate as string) : new Date();
      
      console.log(`Gerando relatório de desempenho de profissionais de ${startDateObj.toISOString().split('T')[0]} até ${endDateObj.toISOString().split('T')[0]}`);
      
      // Buscar todos os profissionais
      const professionals = await storage.getProfessionals();
      
      // Buscar agendamentos no período
      const appointments = await adminFunctions.getAppointments({
        startDate: startDateObj.toISOString().split('T')[0],
        endDate: endDateObj.toISOString().split('T')[0]
      });
      
      // Agrupar por profissional
      const professionalStats = {};
      
      for (const p of professionals) {
        professionalStats[p.id] = {
          id: p.id,
          name: p.name,
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          revenue: 0,
          services: []
        };
      }
      
      // Processar cada agendamento
      for (const appointment of appointments) {
        const professionalId = appointment.professionalId;
        
        if (!professionalStats[professionalId]) {
          console.log(`Profissional #${professionalId} não encontrado, pulando agendamento #${appointment.id}`);
          continue;
        }
        
        // Incrementar contadores
        professionalStats[professionalId].totalAppointments++;
        
        if (appointment.status.toLowerCase() === 'completed') {
          professionalStats[professionalId].completedAppointments++;
          
          // Calcular receita gerada
          // Buscar serviços do agendamento
          const appointmentServices = await storage.getAppointmentServices(appointment.id);
          let appointmentRevenue = 0;
          
          for (const serviceObj of appointmentServices) {
            const service = await storage.getService(serviceObj.serviceId);
            if (service && service.price) {
              appointmentRevenue += service.price;
              
              // Registrar serviço realizado pelo profissional
              const existingService = professionalStats[professionalId].services.find(s => s.id === service.id);
              if (existingService) {
                existingService.count++;
                existingService.revenue += service.price;
              } else {
                professionalStats[professionalId].services.push({
                  id: service.id,
                  name: service.name,
                  count: 1,
                  revenue: service.price
                });
              }
            }
          }
          
          professionalStats[professionalId].revenue += appointmentRevenue;
        } else if (appointment.status.toLowerCase() === 'cancelled') {
          professionalStats[professionalId].cancelledAppointments++;
        }
      }
      
      // Transformar em array e adicionar métricas calculadas
      const professionalReports = Object.values(professionalStats).map((prof: any) => {
        return {
          ...prof,
          completionRate: prof.totalAppointments > 0 
            ? ((prof.completedAppointments / prof.totalAppointments) * 100).toFixed(2) 
            : "0.00",
          cancellationRate: prof.totalAppointments > 0 
            ? ((prof.cancelledAppointments / prof.totalAppointments) * 100).toFixed(2) 
            : "0.00",
          formattedRevenue: `R$ ${(prof.revenue/100).toFixed(2)}`,
          averageTicket: prof.completedAppointments > 0 
            ? `R$ ${(prof.revenue / prof.completedAppointments / 100).toFixed(2)}` 
            : "R$ 0.00",
          // Ordenar serviços por contagem
          services: prof.services
            .sort((a, b) => b.count - a.count)
            .map(s => ({
              ...s,
              formattedRevenue: `R$ ${(s.revenue/100).toFixed(2)}`
            }))
        };
      });
      
      // Ordenar por receita gerada (decrescente)
      professionalReports.sort((a, b) => b.revenue - a.revenue);
      
      res.json({
        success: true,
        data: {
          professionals: professionalReports,
          period: {
            startDate: startDateObj.toISOString().split('T')[0],
            endDate: endDateObj.toISOString().split('T')[0]
          }
        }
      });
    } catch (error: any) {
      console.error('Erro ao gerar relatório de desempenho dos profissionais:', error);
      res.status(500).json({ 
        success: false, 
        message: `Erro ao gerar relatório: ${error.message}`
      });
    }
  }
);

export default router;