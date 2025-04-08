/**
 * Rotas administrativas para o sistema
 * 
 * Este arquivo contém as rotas administrativas do sistema,
 * incluindo gerenciamento de serviços, profissionais, produtos,
 * fluxo de caixa e programa de fidelidade.
 */

import { Express, Request, Response, Router } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import adminFunctions from './storage-supabase-admin';
import * as schema from '@shared/schema';
import { requireRole, ownProfessionalOrAdmin, UserRole } from './middleware/role-middleware';
import { supabaseStorage } from './storage-supabase';

/**
 * Registra as rotas administrativas na aplicação
 */
export function registerAdminRoutes(app: Express): void {
  // Criar um router para as rotas administrativas
  const adminRouter = Router();

  /**
   * Serviços - CRUD
   */
  adminRouter.get('/services', 
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (_req: Request, res: Response) => {
      try {
        const services = await storage.getServices();
        res.json(services);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        res.status(500).json({ message: 'Erro ao buscar serviços' });
      }
    }
  );
  
  adminRouter.get('/services/:id', 
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const service = await storage.getService(id);
        
        if (!service) {
          return res.status(404).json({ message: 'Serviço não encontrado' });
        }
        
        res.json(service);
      } catch (error) {
        console.error('Erro ao buscar serviço:', error);
        res.status(500).json({ message: 'Erro ao buscar serviço' });
      }
    }
  );
  
  adminRouter.post('/services', 
    requireRole([UserRole.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const data = req.body;
        const service = await storage.createService(data);
        res.status(201).json(service);
      } catch (error) {
        console.error('Erro ao criar serviço:', error);
        res.status(500).json({ message: 'Erro ao criar serviço' });
      }
    }
  );
  
  adminRouter.put('/services/:id', 
    requireRole([UserRole.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const data = req.body;
        
        // Verificar se o serviço existe
        const existingService = await storage.getService(id);
        if (!existingService) {
          return res.status(404).json({ message: 'Serviço não encontrado' });
        }
        
        // Atualizar serviço
        const updatedService = await adminFunctions.updateService(id, data);
        res.json(updatedService);
      } catch (error) {
        console.error('Erro ao atualizar serviço:', error);
        res.status(500).json({ message: 'Erro ao atualizar serviço' });
      }
    }
  );
  
  adminRouter.delete('/services/:id', 
    requireRole([UserRole.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        
        // Verificar se o serviço existe
        const existingService = await storage.getService(id);
        if (!existingService) {
          return res.status(404).json({ message: 'Serviço não encontrado' });
        }
        
        // Excluir serviço
        const result = await adminFunctions.deleteService(id);
        
        if (result) {
          res.status(204).send();
        } else {
          res.status(500).json({ message: 'Erro ao excluir serviço' });
        }
      } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        res.status(500).json({ message: 'Erro ao excluir serviço' });
      }
    }
  );
  
  /**
   * Profissionais - CRUD
   */
  adminRouter.get('/professionals', 
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (_req: Request, res: Response) => {
      try {
        const professionals = await storage.getProfessionals();
        res.json(professionals);
      } catch (error) {
        console.error('Erro ao buscar profissionais:', error);
        res.status(500).json({ message: 'Erro ao buscar profissionais' });
      }
    }
  );
  
  adminRouter.get('/professionals/:id', 
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const professional = await storage.getProfessional(id);
        
        if (!professional) {
          return res.status(404).json({ message: 'Profissional não encontrado' });
        }
        
        res.json(professional);
      } catch (error) {
        console.error('Erro ao buscar profissional:', error);
        res.status(500).json({ message: 'Erro ao buscar profissional' });
      }
    }
  );
  
  adminRouter.post('/professionals', 
    requireRole([UserRole.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const data = req.body;
        const professional = await storage.createProfessional(data);
        res.status(201).json(professional);
      } catch (error) {
        console.error('Erro ao criar profissional:', error);
        res.status(500).json({ message: 'Erro ao criar profissional' });
      }
    }
  );
  
  adminRouter.put('/professionals/:id', 
    requireRole([UserRole.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const data = req.body;
        
        // Verificar se o profissional existe
        const existingProfessional = await storage.getProfessional(id);
        if (!existingProfessional) {
          return res.status(404).json({ message: 'Profissional não encontrado' });
        }
        
        // Atualizar profissional
        const updatedProfessional = await adminFunctions.updateProfessional(id, data);
        res.json(updatedProfessional);
      } catch (error) {
        console.error('Erro ao atualizar profissional:', error);
        res.status(500).json({ message: 'Erro ao atualizar profissional' });
      }
    }
  );
  
  adminRouter.delete('/professionals/:id', 
    requireRole([UserRole.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        
        // Verificar se o profissional existe
        const existingProfessional = await storage.getProfessional(id);
        if (!existingProfessional) {
          return res.status(404).json({ message: 'Profissional não encontrado' });
        }
        
        // Excluir profissional
        const result = await adminFunctions.deleteProfessional(id);
        
        if (result) {
          res.status(204).send();
        } else {
          res.status(500).json({ message: 'Erro ao excluir profissional' });
        }
      } catch (error) {
        console.error('Erro ao excluir profissional:', error);
        res.status(500).json({ message: 'Erro ao excluir profissional' });
      }
    }
  );
  
  /**
   * Produtos - CRUD
   */
  adminRouter.get('/products', 
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (_req: Request, res: Response) => {
      try {
        const products = await storage.getProducts();
        res.json(products);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ message: 'Erro ao buscar produtos' });
      }
    }
  );
  
  adminRouter.get('/products/:id', 
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const product = await storage.getProduct(id);
        
        if (!product) {
          return res.status(404).json({ message: 'Produto não encontrado' });
        }
        
        res.json(product);
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ message: 'Erro ao buscar produto' });
      }
    }
  );
  
  adminRouter.post('/products', 
    requireRole([UserRole.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const data = req.body;
        const product = await storage.createProduct(data);
        res.status(201).json(product);
      } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ message: 'Erro ao criar produto' });
      }
    }
  );
  
  adminRouter.put('/products/:id', 
    requireRole([UserRole.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const data = req.body;
        
        // Verificar se o produto existe
        const existingProduct = await storage.getProduct(id);
        if (!existingProduct) {
          return res.status(404).json({ message: 'Produto não encontrado' });
        }
        
        // Atualizar produto
        const updatedProduct = await adminFunctions.updateProduct(id, data);
        res.json(updatedProduct);
      } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ message: 'Erro ao atualizar produto' });
      }
    }
  );
  
  adminRouter.delete('/products/:id', 
    requireRole([UserRole.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        
        // Verificar se o produto existe
        const existingProduct = await storage.getProduct(id);
        if (!existingProduct) {
          return res.status(404).json({ message: 'Produto não encontrado' });
        }
        
        // Excluir produto
        const result = await adminFunctions.deleteProduct(id);
        
        if (result) {
          res.status(204).send();
        } else {
          res.status(500).json({ message: 'Erro ao excluir produto' });
        }
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ message: 'Erro ao excluir produto' });
      }
    }
  );
  
  /**
   * Programa de Fidelidade
   */
  adminRouter.post('/loyalty/add-points', 
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (req: Request, res: Response) => {
      try {
        const { userId, points } = req.body;
        
        if (!userId || !points) {
          return res.status(400).json({ message: 'ID do usuário e pontos são obrigatórios' });
        }
        
        // Adicionar pontos de fidelidade
        const result = await adminFunctions.addLoyaltyPoints(userId, points);
        
        if (result) {
          res.json(result);
        } else {
          res.status(500).json({ message: 'Erro ao adicionar pontos de fidelidade' });
        }
      } catch (error) {
        console.error('Erro ao adicionar pontos de fidelidade:', error);
        res.status(500).json({ message: 'Erro ao adicionar pontos de fidelidade' });
      }
    }
  );
  
  /**
   * Fluxo de Caixa
   */
  adminRouter.post('/cash-flow', 
    requireRole([UserRole.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const data = req.body;
        const createdById = (req.user as any).id;
        
        // Criar transação de fluxo de caixa
        const result = await adminFunctions.createCashFlowTransaction({
          ...data,
          createdById
        });
        
        if (result) {
          res.status(201).json(result);
        } else {
          res.status(500).json({ message: 'Erro ao criar transação de fluxo de caixa' });
        }
      } catch (error) {
        console.error('Erro ao criar transação de fluxo de caixa:', error);
        res.status(500).json({ message: 'Erro ao criar transação de fluxo de caixa' });
      }
    }
  );
  
  adminRouter.get('/cash-flow', 
    requireRole([UserRole.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const { startDate, endDate, type, category } = req.query;
        
        // Buscar transações de fluxo de caixa
        const transactions = await adminFunctions.getCashFlowTransactions(
          startDate as string,
          endDate as string,
          type as string,
          category as string
        );
        
        res.json(transactions);
      } catch (error) {
        console.error('Erro ao buscar transações de fluxo de caixa:', error);
        res.status(500).json({ message: 'Erro ao buscar transações de fluxo de caixa' });
      }
    }
  );
  
  adminRouter.get('/cash-flow/summary', 
    requireRole([UserRole.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const { startDate, endDate } = req.query;
        
        // Buscar resumo do fluxo de caixa
        const summary = await adminFunctions.getCashFlowSummary(
          startDate as string,
          endDate as string
        );
        
        res.json(summary);
      } catch (error) {
        console.error('Erro ao buscar resumo do fluxo de caixa:', error);
        res.status(500).json({ message: 'Erro ao buscar resumo do fluxo de caixa' });
      }
    }
  );
  
  /**
   * Gerenciamento de serviços por profissional
   */
  adminRouter.get('/professionals/:professionalId/services', 
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    ownProfessionalOrAdmin,
    async (req: Request, res: Response) => {
      try {
        const professionalId = parseInt(req.params.professionalId);
        
        // Buscar serviços do profissional
        const services = await adminFunctions.getProfessionalServices(professionalId);
        
        res.json(services);
      } catch (error) {
        console.error('Erro ao buscar serviços do profissional:', error);
        res.status(500).json({ message: 'Erro ao buscar serviços do profissional' });
      }
    }
  );
  
  adminRouter.post('/professionals/:professionalId/services', 
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    ownProfessionalOrAdmin,
    async (req: Request, res: Response) => {
      try {
        const professionalId = parseInt(req.params.professionalId);
        const { serviceId } = req.body;
        
        if (!serviceId) {
          return res.status(400).json({ message: 'ID do serviço é obrigatório' });
        }
        
        // Adicionar serviço ao profissional
        const result = await adminFunctions.addServiceToProfessional(professionalId, serviceId);
        
        if (result) {
          res.status(201).json(result);
        } else {
          res.status(500).json({ message: 'Erro ao adicionar serviço ao profissional' });
        }
      } catch (error) {
        console.error('Erro ao adicionar serviço ao profissional:', error);
        res.status(500).json({ message: 'Erro ao adicionar serviço ao profissional' });
      }
    }
  );
  
  adminRouter.delete('/professionals/:professionalId/services/:serviceId', 
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    ownProfessionalOrAdmin,
    async (req: Request, res: Response) => {
      try {
        const professionalId = parseInt(req.params.professionalId);
        const serviceId = parseInt(req.params.serviceId);
        
        // Remover serviço do profissional
        const result = await adminFunctions.removeServiceFromProfessional(professionalId, serviceId);
        
        if (result) {
          res.status(204).send();
        } else {
          res.status(500).json({ message: 'Erro ao remover serviço do profissional' });
        }
      } catch (error) {
        console.error('Erro ao remover serviço do profissional:', error);
        res.status(500).json({ message: 'Erro ao remover serviço do profissional' });
      }
    }
  );
  
  /**
   * Gerenciamento de agendamentos
   */
  adminRouter.get('/appointments',
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (req: Request, res: Response) => {
      try {
        // Parâmetros opcionais para filtrar agendamentos
        const { date, professionalId } = req.query;
        
        // Definir as opções de filtro
        const options: { date?: string; professionalId?: number } = {};
        
        if (date) {
          options.date = date as string;
        }
        
        if (professionalId) {
          options.professionalId = parseInt(professionalId as string);
        }
        
        // Buscar todos os agendamentos
        let appointments = await supabaseStorage.getAppointments(options);
        
        // Buscar dados complementares para cada agendamento
        const enhancedAppointments = await Promise.all(
          appointments.map(async (appointment) => {
            // Buscar nome do cliente
            const client = await storage.getUser(appointment.userId);
            
            // Buscar nome do profissional
            const professional = await storage.getProfessional(appointment.professionalId);
            
            // Buscar serviços do agendamento
            const appointmentServices = await storage.getAppointmentServices(appointment.id);
            
            // Buscar detalhes de cada serviço
            const serviceDetails = await Promise.all(
              appointmentServices.map(async (as) => {
                const service = await storage.getService(as.serviceId);
                return service;
              })
            );
            
            // Retornar agendamento com dados complementares
            return {
              ...appointment,
              client_name: client?.name || client?.username || 'Cliente',
              client_email: client?.email,
              professional_name: professional?.name || 'Profissional',
              service_names: serviceDetails.map(s => s?.name || 'Serviço').filter(Boolean),
              service_ids: appointmentServices.map(as => as.serviceId)
            };
          })
        );
        
        res.json(enhancedAppointments);
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        res.status(500).json({ message: 'Erro ao buscar agendamentos' });
      }
    }
  );

  adminRouter.get('/appointments/:id',
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const appointment = await storage.getAppointment(id);
        
        if (!appointment) {
          return res.status(404).json({ message: 'Agendamento não encontrado' });
        }
        
        // Buscar dados complementares
        const client = await storage.getUser(appointment.userId);
        const professional = await storage.getProfessional(appointment.professionalId);
        const appointmentServices = await storage.getAppointmentServices(id);
        const serviceDetails = await Promise.all(
          appointmentServices.map(async (as) => {
            const service = await storage.getService(as.serviceId);
            return service;
          })
        );
        
        // Retornar agendamento com dados complementares
        const enhancedAppointment = {
          ...appointment,
          client_name: client?.name || client?.username || 'Cliente',
          client_email: client?.email,
          professional_name: professional?.name || 'Profissional',
          service_names: serviceDetails.map(s => s?.name || 'Serviço').filter(Boolean),
          service_ids: appointmentServices.map(as => as.serviceId)
        };
        
        res.json(enhancedAppointment);
      } catch (error) {
        console.error('Erro ao buscar agendamento:', error);
        res.status(500).json({ message: 'Erro ao buscar agendamento' });
      }
    }
  );

  adminRouter.put('/appointments/:id/status',
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const { status, notes } = req.body;
        
        // Verificar se o agendamento existe
        const existingAppointment = await storage.getAppointment(id);
        if (!existingAppointment) {
          return res.status(404).json({ message: 'Agendamento não encontrado' });
        }
        
        // Verificar permissões extras
        if (req.user && (req.user as any).role !== UserRole.ADMIN) {
          const user = req.user as any;
          const professional = await storage.getProfessionalByUserId(user.id);
          
          // Se o usuário é um profissional, só pode modificar seus próprios agendamentos
          if (professional && existingAppointment.professionalId !== professional.id) {
            return res.status(403).json({ message: 'Permissão negada' });
          }
        }
        
        // Atualizar status do agendamento
        const updatedAppointment = await storage.updateAppointmentStatus(id, status, notes);
        
        // Se o status foi alterado para COMPLETED, registrar no fluxo de caixa
        if (status === 'COMPLETED') {
          try {
            // Buscar serviços do agendamento para calcular valor total
            const appointmentServices = await storage.getAppointmentServices(id);
            const serviceDetails = await Promise.all(
              appointmentServices.map(as => storage.getService(as.serviceId))
            );
            
            const totalAmount = serviceDetails.reduce((sum, service) => sum + (service?.price || 0), 0);
            
            // Registrar no fluxo de caixa
            const result = await supabaseStorage.db
              .insert(schema.cashFlow)
              .values({
                date: new Date(),
                amount: totalAmount,
                description: `Pagamento do agendamento #${id}`,
                type: 'income',
                category: 'service',
                appointmentId: id,
                professionalId: updatedAppointment.professionalId,
                createdById: (req.user as any).id
              })
              .returning();
            
            console.log('Transação financeira registrada:', result);
          } catch (error) {
            console.error('Erro ao registrar transação financeira:', error);
            // Não impedir a conclusão do agendamento se houver erro no registro financeiro
          }
        }
        
        res.json(updatedAppointment);
      } catch (error) {
        console.error('Erro ao atualizar status do agendamento:', error);
        res.status(500).json({ message: 'Erro ao atualizar status do agendamento' });
      }
    }
  );

  adminRouter.delete('/appointments/:id',
    requireRole([UserRole.ADMIN]),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        
        // Verificar se o agendamento existe
        const existingAppointment = await storage.getAppointment(id);
        if (!existingAppointment) {
          return res.status(404).json({ message: 'Agendamento não encontrado' });
        }
        
        // Excluir agendamento
        await storage.deleteAppointment(id);
        
        res.status(204).send();
      } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        res.status(500).json({ message: 'Erro ao excluir agendamento' });
      }
    }
  );

  /**
   * Dashboard stats
   */
  adminRouter.get('/dashboard/stats',
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (req: Request, res: Response) => {
      try {
        console.log('Obtendo estatísticas do dashboard para o usuário:', (req.user as any).id, 'com papel:', (req.user as any).role);
        
        // Obter data de hoje (no formato que o banco espera)
        const today = new Date().toISOString().split('T')[0];
        console.log('Data de hoje:', today);
        
        // Filtrar por profissional se não for admin
        let professionalId = undefined;
        if ((req.user as any).role !== UserRole.ADMIN) {
          // Buscar o profissional vinculado ao usuário atual
          try {
            // Verificar nos logs qual é o ID do profissional baseado no email/username
            const username = (req.user as any).username;
            console.log('Buscando profissional por username:', username);
            
            // Map de usernames para IDs de profissionais
            const professionalMap: Record<string, number> = {
              'carlos': 1,
              'jorran': 2,
              'iuri': 3,
              'mikael': 4
            };
            
            professionalId = professionalMap[username.toLowerCase()];
            console.log('ID do profissional encontrado:', professionalId);
          } catch (profError) {
            console.error('Erro ao buscar profissional para o usuário:', profError);
          }
        }
        
        // Buscar agendamentos de hoje (aplicando filtro de profissional se necessário)
        console.log('Buscando agendamentos com filtros:', { date: today, professionalId });
        const todayAppointments = await supabaseStorage.getAppointments({ 
          date: today,
          professionalId
        });
        console.log('Agendamentos encontrados:', todayAppointments.length);
        
        // Buscar totais de cada entidade
        let professionals = await storage.getProfessionals();
        console.log('Total de profissionais:', professionals.length);
        
        // Se for profissional, filtrar apenas o próprio profissional
        if (professionalId) {
          professionals = professionals.filter(p => p.id === professionalId);
        }
        
        // Buscar produtos (apenas para admin)
        let products = [];
        let lowStockProducts = [];
        
        if ((req.user as any).role === UserRole.ADMIN) {
          products = await storage.getProducts();
          console.log('Total de produtos:', products.length);
          
          // Verificar produtos com estoque baixo
          // Alguns produtos usam stockQuantity, outros usam inStock
          lowStockProducts = products.filter(p => {
            if ('stockQuantity' in p && typeof p.stockQuantity === 'number') {
              return p.stockQuantity <= 0;
            }
            return p.inStock === false;
          });
          console.log('Produtos com estoque baixo:', lowStockProducts.length);
        }
        
        // Dados para estatísticas financeiras
        let financialData = {
          dailyRevenue: "0.00",
          monthlyRevenue: "0.00"
        };
        
        // Se for admin, adicionar dados financeiros
        if ((req.user as any).role === UserRole.ADMIN) {
          try {
            // Obter dados financeiros do dia
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            
            // Obter dados financeiros do mês
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            
            const endOfMonth = new Date();
            
            // Formatação para o banco
            const formattedStartOfDay = startOfDay.toISOString();
            const formattedEndOfDay = endOfDay.toISOString();
            const formattedStartOfMonth = startOfMonth.toISOString();
            const formattedEndOfMonth = endOfMonth.toISOString();
            
            // Calcular faturamento diário e mensal com base nos agendamentos concluídos
            try {
              const startOfDay = new Date();
              startOfDay.setHours(0, 0, 0, 0);
              
              const startOfMonth = new Date();
              startOfMonth.setDate(1);
              startOfMonth.setHours(0, 0, 0, 0);
              
              const dailyTransactions = await supabaseStorage.db
                .select({ amount: schema.cashFlow.amount })
                .from(schema.cashFlow)
                .where(
                  and(
                    gte(schema.cashFlow.date, startOfDay),
                    eq(schema.cashFlow.type, 'income'),
                    eq(schema.cashFlow.category, 'service')
                  )
                );

              const monthlyTransactions = await supabaseStorage.db
                .select({ amount: schema.cashFlow.amount })
                .from(schema.cashFlow)
                .where(
                  and(
                    gte(schema.cashFlow.date, startOfMonth),
                    eq(schema.cashFlow.type, 'income'),
                    eq(schema.cashFlow.category, 'service')
                  )
                );

              const dailyTotal = dailyTransactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
              const monthlyTotal = monthlyTransactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

              financialData = {
                dailyRevenue: (dailyTotal / 100).toFixed(2),
                monthlyRevenue: (monthlyTotal / 100).toFixed(2)
              };
            } catch (err) {
              console.error('Erro específico ao obter dados financeiros:', err);
            }
          } catch (financialError) {
            console.error('Erro ao obter dados financeiros:', financialError);
            // Continuar com os outros dados mesmo se os financeiros falharem
          }
        }
        
        // Montar estatísticas
        const stats = {
          appointments: {
            total: todayAppointments.length,
            pending: todayAppointments.filter(a => a.status === 'PENDING').length,
            confirmed: todayAppointments.filter(a => a.status === 'CONFIRMED').length,
            completed: todayAppointments.filter(a => a.status === 'COMPLETED').length,
            cancelled: todayAppointments.filter(a => a.status === 'CANCELLED').length
          },
          professionals: professionals.length,
          products: {
            total: products.length,
            lowStock: lowStockProducts.length
          },
          finance: financialData
        };
        
        console.log('Estatísticas geradas:', stats);
        res.json(stats);
      } catch (error) {
        console.error('Erro ao buscar estatísticas do dashboard:', error);
        res.status(500).json({ message: 'Erro ao buscar estatísticas' });
      }
    }
  );

  adminRouter.get('/dashboard/today-appointments',
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (req: Request, res: Response) => {
      try {
        console.log('Obtendo agendamentos de hoje para o usuário:', (req.user as any).id, 'com papel:', (req.user as any).role);
        
        // Obter data de hoje (no formato que o banco espera)
        const today = new Date().toISOString().split('T')[0];
        console.log('Data de hoje:', today);
        
        // Filtrar por profissional se não for admin
        let professionalId = undefined;
        if ((req.user as any).role !== UserRole.ADMIN) {
          // Buscar o profissional vinculado ao usuário atual pelo username
          try {
            const username = (req.user as any).username;
            console.log('Buscando profissional por username:', username);
            
            // Map de usernames para IDs de profissionais
            const professionalMap: Record<string, number> = {
              'carlos': 1,
              'jorran': 2,
              'iuri': 3,
              'mikael': 4
            };
            
            professionalId = professionalMap[username.toLowerCase()];
            console.log('ID do profissional encontrado:', professionalId);
          } catch (profError) {
            console.error('Erro ao buscar profissional para o usuário:', profError);
          }
        }
        
        // Buscar agendamentos de hoje com filtro de profissional, se necessário
        console.log('Buscando agendamentos com filtros:', { date: today, professionalId });
        let appointments = await supabaseStorage.getAppointments({ 
          date: today,
          professionalId
        });
        console.log('Agendamentos encontrados:', appointments.length);
        
        // Buscar dados complementares para cada agendamento
        const enhancedAppointments = await Promise.all(
          appointments.map(async (appointment) => {
            console.log('Processando agendamento ID:', appointment.id);
            
            // Buscar nome do cliente
            const client = await storage.getUser(appointment.userId);
            console.log('Cliente:', client?.name || client?.username);
            
            // Buscar nome do profissional
            const professional = await storage.getProfessional(appointment.professionalId);
            console.log('Profissional:', professional?.name);
            
            // Buscar serviços do agendamento
            const appointmentServices = await storage.getAppointmentServices(appointment.id);
            console.log('Serviços encontrados:', appointmentServices.length);
            
            // Buscar detalhes de cada serviço
            const serviceDetails = await Promise.all(
              appointmentServices.map(async (as) => {
                const service = await storage.getService(as.serviceId);
                return service;
              })
            );
            
            console.log('Serviços detalhados:', serviceDetails.map(s => s?.name));
            
            // Retornar agendamento com dados complementares
            return {
              ...appointment,
              client_name: client?.name || client?.username || 'Cliente',
              client_email: client?.email,
              professional_name: professional?.name || 'Profissional',
              service_names: serviceDetails.map(s => s?.name || 'Serviço').filter(Boolean)
            };
          })
        );
        
        // Ordenar por horário
        enhancedAppointments.sort((a, b) => {
          return a.startTime.localeCompare(b.startTime);
        });
        
        console.log('Agendamentos hoje (após processamento):', enhancedAppointments.length);
        res.json(enhancedAppointments);
      } catch (error) {
        console.error('Erro ao buscar agendamentos do dia:', error);
        res.status(500).json({ message: 'Erro ao buscar agendamentos do dia' });
      }
    }
  );

  /**
   * Gerenciamento de bloqueios de agenda
   */
  adminRouter.post('/professionals/:professionalId/blocked-times', 
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    ownProfessionalOrAdmin,
    async (req: Request, res: Response) => {
      try {
        const professionalId = parseInt(req.params.professionalId);
        const { date, startTime, endTime } = req.body;
        
        if (!date || !startTime || !endTime) {
          return res.status(400).json({ message: 'Data, hora de início e hora de fim são obrigatórios' });
        }
        
        // Bloquear horário na agenda
        const result = await adminFunctions.blockTime(professionalId, date, startTime, endTime);
        
        if (result) {
          res.status(201).json(result);
        } else {
          res.status(500).json({ message: 'Erro ao bloquear horário na agenda' });
        }
      } catch (error) {
        console.error('Erro ao bloquear horário na agenda:', error);
        res.status(500).json({ message: 'Erro ao bloquear horário na agenda' });
      }
    }
  );
  
  adminRouter.delete('/blocked-times/:id', 
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        
        // Desbloquear horário na agenda
        const result = await adminFunctions.unblockTime(id);
        
        if (result) {
          res.status(204).send();
        } else {
          res.status(500).json({ message: 'Erro ao desbloquear horário na agenda' });
        }
      } catch (error) {
        console.error('Erro ao desbloquear horário na agenda:', error);
        res.status(500).json({ message: 'Erro ao desbloquear horário na agenda' });
      }
    }
  );
  
  /**
   * Inicialização do sistema administrativo - para o primeiro usuário
   * Esta rota não requer autenticação para permitir a configuração inicial
   */
  adminRouter.post('/initialize', 
    async (req: Request, res: Response) => {
      try {
        const { userId } = req.body;
        
        if (!userId) {
          return res.status(400).json({ 
            success: false, 
            message: 'ID do usuário é obrigatório' 
          });
        }
        
        // Inicializar sistema administrativo
        const result = await adminFunctions.initializeAdminSystem(userId);
        
        if (result.success) {
          res.status(200).json(result);
        } else {
          res.status(500).json(result);
        }
      } catch (error) {
        console.error('Erro ao inicializar sistema administrativo:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Erro ao inicializar sistema administrativo' 
        });
      }
    }
  );

  // Montar as rotas na aplicação principal
  app.use('/api/admin', adminRouter);
  console.log("[Admin Routes] Rotas administrativas registradas com sucesso.");
}