/**
 * Rotas para geração de relatórios
 * 
 * Este arquivo define as rotas da API para geração de relatórios de diferentes tipos,
 * como relatórios financeiros, de serviços, profissionais, etc.
 */

import { Router } from 'express';
import { requireRole, UserRole } from '../middleware/role-middleware';
import * as storage from '../storage';
import * as supabaseStorage from '../storage-supabase-admin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as cashFlowManager from '../cash-flow-manager';

const router = Router();

/**
 * GET /api/admin/reports/financial
 * Gera um relatório financeiro com base nos parâmetros fornecidos
 */
router.get('/financial', requireRole([UserRole.ADMIN]), async (req, res) => {
  try {
    // Parâmetros de consulta
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    const format = req.query.format as string || 'json'; // Formato de saída (json, pdf, excel)

    // Formatar as datas para consulta no banco
    const startDateISO = startDate.toISOString().split('T')[0];
    const endDateISO = endDate.toISOString().split('T')[0];

    // Obter transações no período
    const transactions = await supabaseStorage.getCashFlowTransactions(startDateISO, endDateISO);
    
    // Obter resumo financeiro
    const summary = await supabaseStorage.getCashFlowSummary(startDateISO, endDateISO);

    // Obter agendamentos no período
    const appointments = await supabaseStorage.getAppointments({
      startDate: startDateISO,
      endDate: endDateISO,
      status: 'completed'
    });

    // Obter detalhes dos agendamentos
    const appointmentDetails = await Promise.all(
      appointments.map(async (appointment) => {
        const services = await storage.getAppointmentServices(appointment.id);
        const client = await storage.getUser(appointment.userId);
        const professional = await storage.getProfessional(appointment.professionalId);
        
        const serviceDetails = await Promise.all(
          services.map(async (svc) => {
            const service = await storage.getService(svc.serviceId);
            return {
              id: service.id,
              name: service.name,
              price: service.price
            };
          })
        );
        
        return {
          ...appointment,
          clientName: client?.name || 'Cliente Desconhecido',
          professionalName: professional?.name || 'Profissional Desconhecido',
          services: serviceDetails,
          total: serviceDetails.reduce((sum, s) => sum + (s.price || 0), 0)
        };
      })
    );

    // Agrupar transações por dia
    const transactionsByDate: Record<string, { income: number, expense: number, balance: number }> = {};
    
    for (const tx of transactions) {
      if (!transactionsByDate[tx.date]) {
        transactionsByDate[tx.date] = { income: 0, expense: 0, balance: 0 };
      }
      
      if (tx.transactionType === 'income') {
        transactionsByDate[tx.date].income += tx.amount;
      } else if (tx.transactionType === 'expense') {
        transactionsByDate[tx.date].expense += tx.amount;
      }
      
      transactionsByDate[tx.date].balance = 
        transactionsByDate[tx.date].income - transactionsByDate[tx.date].expense;
    }
    
    // Dados do relatório
    const reportData = {
      title: 'Relatório Financeiro',
      period: {
        from: format(startDate, 'dd/MM/yyyy', { locale: ptBR }),
        to: format(endDate, 'dd/MM/yyyy', { locale: ptBR })
      },
      summary,
      transactions,
      transactionsByDate: Object.entries(transactionsByDate).map(([date, values]) => ({
        date,
        ...values
      })),
      appointments: appointmentDetails,
      generatedAt: new Date().toISOString()
    };

    // Responder com base no formato solicitado
    if (format === 'json') {
      res.json(reportData);
    } else if (format === 'pdf') {
      // No momento, retornamos apenas os dados em JSON
      // No futuro, podemos implementar a geração real de PDF
      res.json({
        ...reportData,
        message: 'Geração de PDF será implementada em breve'
      });
    } else if (format === 'excel') {
      // No momento, retornamos apenas os dados em JSON
      // No futuro, podemos implementar a exportação para Excel
      res.json({
        ...reportData,
        message: 'Exportação para Excel será implementada em breve'
      });
    } else {
      res.status(400).json({ message: 'Formato inválido' });
    }
  } catch (error: any) {
    console.error('Erro ao gerar relatório financeiro:', error);
    res.status(500).json({ message: `Erro ao gerar relatório: ${error.message}` });
  }
});

/**
 * GET /api/admin/reports/services
 * Gera um relatório de serviços com base nos parâmetros fornecidos
 */
router.get('/services', requireRole([UserRole.ADMIN]), async (req, res) => {
  try {
    // Parâmetros de consulta
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    // Formatar as datas para consulta no banco
    const startDateISO = startDate.toISOString().split('T')[0];
    const endDateISO = endDate.toISOString().split('T')[0];

    // Obter todos os serviços
    const services = await storage.getServices();
    
    // Obter agendamentos no período
    const appointments = await supabaseStorage.getAppointments({
      startDate: startDateISO,
      endDate: endDateISO
    });
    
    // Obter serviços agendados 
    const appointmentServices = await Promise.all(
      appointments.map(async (appointment) => {
        const services = await storage.getAppointmentServices(appointment.id);
        return {
          appointmentId: appointment.id,
          appointmentDate: appointment.date,
          appointmentStatus: appointment.status,
          services: services.map(s => s.serviceId)
        };
      })
    );
    
    // Contar ocorrências de cada serviço
    const serviceCounts: Record<number, { count: number, revenue: number }> = {};
    
    services.forEach(s => {
      serviceCounts[s.id] = { count: 0, revenue: 0 };
    });
    
    appointmentServices.forEach(appSvc => {
      appSvc.services.forEach(serviceId => {
        if (serviceCounts[serviceId]) {
          serviceCounts[serviceId].count += 1;
          
          // Adicionar receita apenas para agendamentos concluídos
          if (appSvc.appointmentStatus.toLowerCase() === 'completed') {
            const service = services.find(s => s.id === serviceId);
            if (service) {
              serviceCounts[serviceId].revenue += service.price;
            }
          }
        }
      });
    });
    
    // Dados do relatório
    const reportData = {
      title: 'Relatório de Serviços',
      period: {
        from: format(startDate, 'dd/MM/yyyy', { locale: ptBR }),
        to: format(endDate, 'dd/MM/yyyy', { locale: ptBR })
      },
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        price: service.price,
        count: serviceCounts[service.id]?.count || 0,
        revenue: serviceCounts[service.id]?.revenue || 0
      })),
      totalAppointments: appointments.length,
      totalServices: Object.values(serviceCounts).reduce((sum, s) => sum + s.count, 0),
      totalRevenue: Object.values(serviceCounts).reduce((sum, s) => sum + s.revenue, 0),
      generatedAt: new Date().toISOString()
    };
    
    res.json(reportData);
  } catch (error: any) {
    console.error('Erro ao gerar relatório de serviços:', error);
    res.status(500).json({ message: `Erro ao gerar relatório: ${error.message}` });
  }
});

/**
 * GET /api/admin/reports/professionals
 * Gera um relatório de desempenho dos profissionais
 */
router.get('/professionals', requireRole([UserRole.ADMIN]), async (req, res) => {
  try {
    // Parâmetros de consulta
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    // Formatar as datas para consulta no banco
    const startDateISO = startDate.toISOString().split('T')[0];
    const endDateISO = endDate.toISOString().split('T')[0];

    // Obter todos os profissionais
    const professionals = await storage.getProfessionals();
    
    // Obter agendamentos no período
    const appointments = await supabaseStorage.getAppointments({
      startDate: startDateISO,
      endDate: endDateISO
    });
    
    // Calcular estatísticas para cada profissional
    const professionalStats: Record<number, {
      completed: number;
      cancelled: number;
      pending: number;
      confirmed: number;
      revenue: number;
    }> = {};
    
    professionals.forEach(p => {
      professionalStats[p.id] = {
        completed: 0,
        cancelled: 0,
        pending: 0,
        confirmed: 0,
        revenue: 0
      };
    });
    
    // Processar agendamentos para cada profissional
    await Promise.all(
      appointments.map(async (appointment) => {
        const profId = appointment.professionalId;
        if (!professionalStats[profId]) return;
        
        const status = appointment.status.toLowerCase();
        
        switch (status) {
          case 'completed':
            professionalStats[profId].completed += 1;
            
            // Calcular receita dos serviços
            const services = await storage.getAppointmentServices(appointment.id);
            let appointmentRevenue = 0;
            
            for (const svc of services) {
              const service = await storage.getService(svc.serviceId);
              appointmentRevenue += service.price;
            }
            
            professionalStats[profId].revenue += appointmentRevenue;
            break;
          case 'cancelled':
            professionalStats[profId].cancelled += 1;
            break;
          case 'pending':
            professionalStats[profId].pending += 1;
            break;
          case 'confirmed':
            professionalStats[profId].confirmed += 1;
            break;
        }
      })
    );
    
    // Dados do relatório
    const reportData = {
      title: 'Relatório de Desempenho dos Profissionais',
      period: {
        from: format(startDate, 'dd/MM/yyyy', { locale: ptBR }),
        to: format(endDate, 'dd/MM/yyyy', { locale: ptBR })
      },
      professionals: professionals.map(prof => ({
        id: prof.id,
        name: prof.name,
        stats: professionalStats[prof.id] || {
          completed: 0,
          cancelled: 0,
          pending: 0,
          confirmed: 0,
          revenue: 0
        },
        totalAppointments: 
          (professionalStats[prof.id]?.completed || 0) + 
          (professionalStats[prof.id]?.cancelled || 0) + 
          (professionalStats[prof.id]?.pending || 0) + 
          (professionalStats[prof.id]?.confirmed || 0)
      })),
      generatedAt: new Date().toISOString()
    };
    
    res.json(reportData);
  } catch (error: any) {
    console.error('Erro ao gerar relatório de profissionais:', error);
    res.status(500).json({ message: `Erro ao gerar relatório: ${error.message}` });
  }
});

export default router;