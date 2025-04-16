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
import * as cashFlowManager from './cash-flow-manager';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

// Criar cliente Supabase para consultas diretas
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

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
              service_ids: appointmentServices.map(as => as.serviceId),
              service_prices: serviceDetails.map(s => s?.price || 0),
              totalValue: serviceDetails.reduce((sum, service) => sum + (service?.price || 0), 0)
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
          service_ids: appointmentServices.map(as => as.serviceId),
          service_prices: serviceDetails.map(s => s?.price || 0),
          totalValue: serviceDetails.reduce((sum, service) => sum + (service?.price || 0), 0)
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

        // Salvar o status antigo ANTES de atualizar
        const oldStatus = existingAppointment.status || '';
        console.log(`Status atual do agendamento #${id} antes da atualização: '${oldStatus}'`);

        // Verificar permissões extras
        if (req.user && (req.user as any).role !== UserRole.ADMIN) {
          const user = req.user as any;
          // Buscar o profissional vinculado ao usuário atual pelo username
          try {
            const username = user.username;
            // Map de usernames para IDs de profissionais (solução temporária)
            const professionalMap: Record<string, number> = {
              'carlos': 1,
              'jorran': 2,
              'iuri': 3,
              'mikael': 4
            };

            const professionalId = professionalMap[username.toLowerCase()];

            // Se o usuário é um profissional, só pode modificar seus próprios agendamentos
            if (professionalId && existingAppointment.professionalId !== professionalId) {
              return res.status(403).json({ message: 'Permissão negada' });
            }
          } catch (error) {
            console.error('Erro ao verificar profissional:', error);
          }
        }

        // Atualizar status do agendamento
        const updatedAppointment = await storage.updateAppointmentStatus(id, status, notes);
        console.log(`Alterando agendamento ${id} de '${oldStatus}' para '${status}'`);

        // Verificar se o status era completed anteriormente mas agora mudou
        const wasCompleted = oldStatus.toLowerCase() === 'completed';
        const isCompleted = status.toLowerCase() === 'completed';

        // Se o status foi alterado para completed, registrar no fluxo de caixa
        // Ou se estava como completed e foi alterado para outro status, 
        // remover do fluxo de caixa
        if (isCompleted || wasCompleted) {
          try {
            console.log(`\n==== Processando transação financeira para agendamento #${id} ====`);
            console.log(`Status anterior: ${oldStatus}, Novo status: ${status}`);
            
            // Buscar serviços do agendamento
            const appointmentServices = await storage.getAppointmentServices(id);
            console.log(`Serviços encontrados para agendamento #${id}: ${appointmentServices.length}`);
            
            // Logar detalhes de cada serviço
            for (const as of appointmentServices) {
              console.log(`\nVerificando serviço ID #${as.serviceId}`);
              const { data: serviceDetails } = await supabase
                .from('services')
                .select('*')
                .eq('id', as.serviceId)
                .single();
              
              if (serviceDetails) {
                console.log(`- Nome: ${serviceDetails.name}`);
                console.log(`- Preço: R$ ${(serviceDetails.price/100).toFixed(2)}`);
              } else {
                console.log(`! ALERTA: Serviço #${as.serviceId} não encontrado !`);
              }
            }
            
            // Buscar detalhes de cada serviço - método aprimorado
            let serviceDetails = [];
            
            // Primeiro, tentar buscar com o método padrão
            for (const as of appointmentServices) {
              try {
                // Primeiro, tentar buscar via storage.getService
                const service = await storage.getService(as.serviceId);
                
                if (service) {
                  serviceDetails.push(service);
                  console.log(`Serviço #${as.serviceId} (${service.name}) encontrado com valor: R$ ${(service.price/100).toFixed(2)}`);
                } else {
                  // Se não encontrou com getService, tentar buscar diretamente da tabela
                  console.log(`Serviço #${as.serviceId} não encontrado via getService, tentando busca direta...`);
                  const { data: directService, error } = await supabase
                    .from('services')
                    .select('*')
                    .eq('id', as.serviceId)
                    .single();
                    
                  if (!error && directService) {
                    // Converter para o formato esperado
                    const mappedService = {
                      id: directService.id,
                      name: directService.name,
                      description: directService.description || '',
                      price: directService.price,
                      priceType: directService.price_type,
                      durationMinutes: directService.duration_minutes,
                      categoryId: directService.category_id
                    };
                    serviceDetails.push(mappedService);
                    console.log(`Serviço #${as.serviceId} (${mappedService.name}) recuperado via busca direta com valor: R$ ${(mappedService.price/100).toFixed(2)}`);
                  } else {
                    console.error(`Serviço #${as.serviceId} não encontrado mesmo via busca direta:`, error);
                  }
                }
              } catch (serviceError) {
                console.error(`Erro ao buscar serviço #${as.serviceId}:`, serviceError);
              }
            }
            
            // Calcular o valor total dos serviços em centavos (formato original no banco)
            let totalAmount = 0;
            for (const service of serviceDetails) {
              if (service && service.price) {
                totalAmount += service.price;
                console.log(`Adicionando valor do serviço ${service.name}: R$ ${(service.price/100).toFixed(2)} ao total`);
              } else if (service) {
                console.warn(`Serviço ${service.name} (ID: ${service.id}) encontrado, mas sem preço definido`);
              }
            }

            // O agendamento não tem mais campo totalValue, então precisamos garantir que o totalAmount foi calculado corretamente
            if (totalAmount === 0) {
              console.log(`ALERTA: Nenhum valor encontrado para o agendamento #${id}`);
            }

            console.log(`Valor total do agendamento #${id}: R$ ${(totalAmount/100).toFixed(2)} baseado em ${serviceDetails.length} serviços`);

            // Gerenciar transações financeiras com base na mudança de status
            try {
              const appointmentDate = existingAppointment.date ? new Date(existingAppointment.date) : new Date();

              // AÇÃO 1: Se o agendamento foi concluído, registrar transação
              if (isCompleted && !wasCompleted) {
                console.log(`Agendamento #${id} marcado como concluído - criando registro financeiro`);
                // Converter valores para o formato esperado pela função
                // Log detalhado de cada serviço antes da formatação
                console.log('Detalhes brutos dos serviços antes da formatação:');
                serviceDetails.forEach((service, index) => {
                  if (service) {
                    console.log(`  Serviço ${index+1}: ID=${service.id}, Nome="${service.name}", Preço=${service.price ? `R$ ${(service.price/100).toFixed(2)}` : 'não definido'}`);
                  } else {
                    console.log(`  Serviço ${index+1}: NULL (não encontrado)`);
                  }
                });
                
                // Converter valores para o formato esperado pela função com tratamento aprimorado
                const formattedServiceDetails = serviceDetails
                  .filter(service => service !== null) // Garantir que não há serviços nulos
                  .map(service => ({
                    id: service?.id || 0,
                    name: service?.name || 'Serviço não identificado',
                    price: service?.price || 0
                  }));
                
                console.log(`Serviços incluídos para faturamento: ${formattedServiceDetails.map(s => `${s.name} (R$ ${(s.price/100).toFixed(2)})`).join(', ')}`);
                
                const transactionResult = await cashFlowManager.recordAppointmentTransaction(
                  id,
                  formattedServiceDetails, // Passar detalhes de serviços, não apenas o valor total
                  appointmentDate
                );

                if (transactionResult) {
                  console.log('Transação financeira registrada com sucesso:', transactionResult);
                } else {
                  console.log('Transação já existente para este agendamento ou não foi possível registrar');
                }
              } 
              // AÇÃO 2: Se o agendamento estava concluído mas mudou para outro status, remover transação
              else if (wasCompleted && !isCompleted) {
                console.log(`Agendamento #${id} desmarcado de concluído - removendo registro financeiro`);
                const removalResult = await cashFlowManager.removeAppointmentTransaction(id);

                if (removalResult) {
                  console.log('Transação financeira removida com sucesso:', removalResult);
                } else {
                  console.log('Nenhuma transação encontrada para remover ou não foi possível remover');
                }
              }

              // Forçar o recálculo do resumo financeiro
              // Isso garante que o balanço do mês na interface será atualizado
              console.log('Forçando atualização do resumo financeiro para refletir na interface');

              try {
                // Calcular o saldo atual para atualizar o cache
                const today = new Date();

                // Calcular primeiro e último dia do mês para forçar atualização do balanço mensal
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                // Forçar atualização do saldo
                const currentBalance = await cashFlowManager.calculateBalance(firstDayOfMonth, lastDayOfMonth);

                console.log(`Resumo financeiro atualizado. Novo saldo mensal: R$ ${currentBalance.toFixed(2)}`);
              } catch (summaryError) {
                console.error('Erro ao atualizar resumo financeiro:', summaryError);
              }
            } catch (cashFlowError) {
              console.error('Erro ao registrar transação financeira:', cashFlowError);
            }
          } catch (error) {
            console.error('Erro ao processar serviços do agendamento:', error);
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
          dailyRevenue: 0,
          monthlyRevenue: 0
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
            const formattedStartOfDay = startOfDay.toISOString().split('T')[0];
            const formattedEndOfDay = endOfDay.toISOString().split('T')[0];
            const formattedStartOfMonth = startOfMonth.toISOString().split('T')[0];
            const formattedEndOfMonth = endOfMonth.toISOString().split('T')[0];

            try {
              // Primeiro, tentar buscar dados da tabela cash_flow
              console.log("Buscando dados financeiros da tabela cash_flow...");

              try {
                // Verificar se a tabela cash_flow existe
                const { data: tableCheck, error: tableError } = await supabase
                  .from('cash_flow')
                  .select('id')
                  .limit(1);

                if (tableError && tableError.code === '42P01') {
                  console.log("Tabela cash_flow não existe, usando cálculo alternativo...");
                  await calculateFinancialsFromAppointments();
                } else if (tableError) {
                  console.error("Erro ao verificar tabela cash_flow:", tableError);
                  await calculateFinancialsFromAppointments();
                } else {
                  // Tabela existe, vamos usar ela
                  console.log("Tabela cash_flow encontrada, calculando a partir dela...");

                  // Data de hoje
                  const today = new Date().toISOString().split('T')[0];

                  // Buscar receitas do dia
                  const { data: todayData, error: todayError } = await supabase
                    .from('cash_flow')
                    .select('amount, type')
                    .eq('date', today);

                  if (todayError) {
                    console.error("Erro ao buscar dados diários de cash_flow:", todayError);
                    await calculateFinancialsFromAppointments();
                  } else {
                    // Calcular receita do dia (soma de INCOME e PRODUCT_SALE)
                    let dailyRevenue = 0;
                    for (const item of todayData || []) {
                      if (item.type === 'INCOME' || item.type=== 'PRODUCT_SALE') {
                        dailyRevenue += item.amount;
                      }
                    }

                    // Buscar receitas do mês
                    const startOfMonth = new Date();
                    startOfMonth.setDate(1);
                    const startOfMonthFormatted = startOfMonth.toISOString().split('T')[0];

                    const endOfMonth = new Date();
                    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
                    endOfMonth.setDate(0);
                    const endOfMonthFormatted = endOfMonth.toISOString().split('T')[0];

                    // Buscar transações do mês
                    const { data: monthData, error: monthError } = await supabase
                      .from('cash_flow')
                      .select('amount, type, appointment_id')
                      .gte('date', startOfMonthFormatted)
                      .lte('date', endOfMonthFormatted);

                    if (monthError) {
                      console.error("Erro ao buscar dados mensais de cash_flow:", monthError);
                      await calculateFinancialsFromAppointments();
                    } else {
                      // Primeiro, buscar todos os agendamentos atualmente concluídos
                      const { data: completedAppointments } = await supabase
                        .from('appointments')
                        .select('id')
                        .eq('status', 'completed');

                      // Criar um Set dos IDs de agendamentos concluídos para busca rápida
                      const completedAppointmentIds = new Set(
                        completedAppointments?.map(app => app.id) || []
                      );

                      // Calcular receita do mês apenas de agendamentos concluídos
                      let monthlyRevenue = 0;
                      for (const item of monthData || []) {
                        if (item.type === 'PRODUCT_SALE') {
                          // Vendas de produtos são sempre contabilizadas
                          monthlyRevenue += item.amount;
                        } else if (item.type === 'INCOME' && item.appointment_id) {
                          // Verificar se o agendamento ainda está concluído
                          if (completedAppointmentIds.has(item.appointment_id)) {
                            monthlyRevenue += item.amount;
                          }
                        }
                      }

                      console.log('Valores calculados da tabela cash_flow:');
                      console.log('- Faturamento diário:', dailyRevenue);
                      console.log('- Faturamento mensal:', monthlyRevenue);

                      // Os valores já estão em centavos no banco, vamos mantê-los assim
                      // e fazer a conversão na interface do usuário
                      financialData = {
                        dailyRevenue: dailyRevenue,
                        monthlyRevenue: monthlyRevenue
                      };
                    }
                  }
                }
              } catch (cashFlowError) {
                console.error("Erro ao acessar tabela cash_flow:", cashFlowError);
                await calculateFinancialsFromAppointments();
              }

              // Função interna para cálculo alternativo com base nos agendamentos
              async function calculateFinancialsFromAppointments() {
                console.log("Calculando faturamento diretamente dos agendamentos...");

                // 1. Buscar todos os agendamentos concluídos do dia
                const todayDateFormatted = new Date().toISOString().split('T')[0];
                console.log("Calculando agendamentos do dia, data:", todayDateFormatted);

                const appointmentsTodayResult = await supabase
                  .from('appointments')
                  .select('id, professional_id')
                  .eq('date', todayDateFormatted)
                  .eq('status', 'COMPLETED');

                // 2. Buscar todos os agendamentos concluídos do mês
                const startOfMonthDate = new Date();
                startOfMonthDate.setDate(1);
                const startOfMonthFormatted = startOfMonthDate.toISOString().split('T')[0];

                const endOfMonthDate = new Date();
                endOfMonthDate.setMonth(endOfMonthDate.getMonth() + 1);
                endOfMonthDate.setDate(0);
                const endOfMonthFormatted = endOfMonthDate.toISOString().split('T')[0];

                console.log("Calculando agendamentos do mês, período:", startOfMonthFormatted, "até", endOfMonthFormatted);

                const appointmentsMonthResult = await supabase
                  .from('appointments')
                  .select('id, professional_id')
                  .gte('date', startOfMonthFormatted)
                  .lte('date', endOfMonthFormatted)
                  .eq('status', 'COMPLETED');

                // Processar resultados
                if (appointmentsTodayResult.error) {
                  console.error('Erro ao buscar agendamentos do dia:', appointmentsTodayResult.error);
                }

                if (appointmentsMonthResult.error) {
                  console.error('Erro ao buscar agendamentos do mês:', appointmentsMonthResult.error);
                }

                const todayAppointments = appointmentsTodayResult.data || [];
                const monthAppointments = appointmentsMonthResult.data || [];

                console.log("Agendamentos do dia encontrados:", todayAppointments.length);
                console.log("Agendamentos do mês encontrados:", monthAppointments.length);

                // 3. Calcular valor total diário
                let dailyTotal = 0;

                for (const appointment of todayAppointments) {
                  let appointmentTotal = await calculateAppointmentValue(appointment.id);
                  dailyTotal += appointmentTotal;
                }

                // 4. Calcular valor total mensal
                let monthlyTotal = 0;

                for (const appointment of monthAppointments) {
                  let appointmentTotal = await calculateAppointmentValue(appointment.id);
                  monthlyTotal += appointmentTotal;
                }

                console.log('Valores calculados diretamente dos agendamentos:');
                console.log('- Faturamento diário:', dailyTotal);
                console.log('- Faturamento mensal:', monthlyTotal);

                // Manter os valores em centavos para que possam ser convertidos na UI
                financialData = {
                  dailyRevenue: dailyTotal * 100, // Converter de reais para centavos para manter consistência
                  monthlyRevenue: monthlyTotal * 100 // Converter de reais para centavos para manter consistência
                };
              }

              // Função auxiliar para calcular valor de um agendamento
              async function calculateAppointmentValue(appointmentId: number): Promise<number> {
                // Buscar serviços associados
                const { data: services, error: servicesError } = await supabase
                  .from('appointment_services')
                  .select('service_id')
                  .eq('appointment_id', appointmentId);

                if (servicesError) {
                  console.error(`Erro ao buscar serviços do agendamento #${appointmentId}:`, servicesError);
                  return 0;
                }

                // Para cada serviço, buscar preço
                let total = 0;
                for (const service of services || []) {
                  const { data: serviceDetails, error: serviceError } = await supabase
                    .from('services')
                    .select('price')
                    .eq('id', service.service_id)
                    .single();

                  if (serviceError) {
                    console.error(`Erro ao buscar detalhes do serviço #${service.service_id}:`, serviceError);
                    continue;
                  }

                  // Os preços são armazenados em centavos, converter para reais
                  total += (serviceDetails?.price || 0) / 100;
                }

                console.log(`Agendamento #${appointmentId}: R$ ${total}`);
                return total;
              }
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
   * Dashboard - Estatísticas e dados para análises
   */

  // Estatísticas gerais para o dashboard
  adminRouter.get('/dashboard/stats',
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (_req: Request, res: Response) => {
      try {
        // Buscar estatísticas de agendamentos usando Supabase diretamente
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*');
          
        if (appointmentsError) {
          console.error('Erro ao buscar agendamentos:', appointmentsError);
          return res.status(500).json({ message: 'Erro ao buscar agendamentos' });
        }
        
        // Contagem por status
        const appointmentsCount = appointments.length;
        const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
        const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
        const completedAppointments = appointments.filter(a => a.status === 'completed').length;
        const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
        
        // Buscar produtos
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*');
          
        if (productsError) {
          console.error('Erro ao buscar produtos:', productsError);
          return res.status(500).json({ message: 'Erro ao buscar produtos' });
        }
        
        const productsCount = products.length;
        const lowStockProducts = products.filter(p => p.stock_quantity <= 5).length;
        
        // Buscar profissionais
        const { data: professionals, error: professionalsError } = await supabase
          .from('professionals')
          .select('*');
          
        if (professionalsError) {
          console.error('Erro ao buscar profissionais:', professionalsError);
          return res.status(500).json({ message: 'Erro ao buscar profissionais' });
        }
        
        const professionalsCount = professionals.length;
        
        // Datas para estatísticas financeiras
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        
        // Faturamento diário
        const { data: dailyTransactions, error: dailyError } = await supabase
          .from('cash_flow')
          .select('amount')
          .eq('type', 'income')
          .gte('date', startOfDay.toISOString())
          .lte('date', endOfDay.toISOString());
          
        if (dailyError) {
          console.error('Erro ao buscar faturamento diário:', dailyError);
          return res.status(500).json({ message: 'Erro ao buscar faturamento diário' });
        }
        
        const dailyRevenueAmount = dailyTransactions.reduce((sum, transaction) => 
          sum + parseInt(transaction.amount || "0"), 0).toString();
        
        // Faturamento mensal
        const { data: monthlyTransactions, error: monthlyError } = await supabase
          .from('cash_flow')
          .select('amount')
          .eq('type', 'income')
          .gte('date', startOfMonth.toISOString())
          .lte('date', endOfMonth.toISOString());
          
        if (monthlyError) {
          console.error('Erro ao buscar faturamento mensal:', monthlyError);
          return res.status(500).json({ message: 'Erro ao buscar faturamento mensal' });
        }
        
        const monthlyRevenueAmount = monthlyTransactions.reduce((sum, transaction) => 
          sum + parseInt(transaction.amount || "0"), 0).toString();

        // Montar objeto de estatísticas
        const stats = {
          appointments: {
            total: appointmentsCount || 0,
            pending: pendingAppointments || 0,
            confirmed: confirmedAppointments || 0,
            completed: completedAppointments || 0,
            cancelled: cancelledAppointments || 0
          },
          products: {
            total: productsCount || 0,
            lowStock: lowStockProducts || 0
          },
          professionals: professionalsCount || 0,
          finance: {
            dailyRevenue: dailyRevenueAmount || '0',
            monthlyRevenue: monthlyRevenueAmount || '0'
          }
        };

        res.json(stats);
      } catch (error) {
        console.error('Erro ao buscar estatísticas do dashboard:', error);
        res.status(500).json({ message: 'Erro ao buscar estatísticas do dashboard' });
      }
    }
  );

  // Buscar agendamentos para hoje
  adminRouter.get('/dashboard/today-appointments',
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (_req: Request, res: Response) => {
      try {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        
        // Buscar agendamentos para hoje
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select(`
            id,
            date,
            start_time,
            status,
            client_name,
            professional_id,
            professionals(name),
            services
          `)
          .eq('date', formattedDate)
          .order('start_time');
        
        if (error) {
          console.error('Erro ao buscar agendamentos do dia:', error);
          return res.status(500).json({ message: 'Erro ao buscar agendamentos do dia' });
        }

        // Processar os dados para incluir nome do profissional e serviços
        const formattedAppointments = await Promise.all(appointments.map(async (appointment) => {
          // Buscar nomes dos serviços
          const serviceIds = appointment.services;
          let serviceNames = [];

          if (Array.isArray(serviceIds) && serviceIds.length > 0) {
            const { data: services, error: servicesError } = await supabase
              .from('services')
              .select('name')
              .in('id', serviceIds);
            
            if (!servicesError && services) {
              serviceNames = services.map(service => service.name);
            }
          }

          return {
            id: appointment.id,
            date: appointment.date,
            start_time: appointment.start_time,
            status: appointment.status,
            client_name: appointment.client_name,
            professional_id: appointment.professional_id,
            professional_name: appointment.professionals?.name || 'Profissional não encontrado',
            service_names: serviceNames
          };
        }));

        res.json(formattedAppointments);
      } catch (error) {
        console.error('Erro ao buscar agendamentos do dia:', error);
        res.status(500).json({ message: 'Erro ao buscar agendamentos do dia' });
      }
    }
  );

  // Dados para o gráfico de vendas semanais
  adminRouter.get('/dashboard/sales-chart',
    requireRole([UserRole.ADMIN]),
    async (_req: Request, res: Response) => {
      try {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
        
        // Calcular o início da semana (domingo)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Fim da semana (sábado)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        // Buscar dados de vendas para cada dia da semana
        const salesData = [];
        
        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          
          const nextDay = new Date(day);
          nextDay.setDate(day.getDate() + 1);
          
          // Buscar serviços vendidos neste dia
          const { data: servicesSales, error: servicesError } = await supabase
            .from('cash_flow')
            .select('amount')
            .eq('type', 'income')
            .eq('category', 'service')
            .gte('date', day.toISOString())
            .lt('date', nextDay.toISOString());
          
          // Buscar produtos vendidos neste dia
          const { data: productsSales, error: productsError } = await supabase
            .from('cash_flow')
            .select('amount')
            .eq('type', 'income')
            .eq('category', 'product')
            .gte('date', day.toISOString())
            .lt('date', nextDay.toISOString());
          
          if (servicesError || productsError) {
            console.error('Erro ao buscar vendas:', servicesError || productsError);
            continue;
          }
          
          // Calcular totais
          const servicosValue = servicesSales?.reduce((total, item) => total + parseInt(item.amount), 0) || 0;
          const produtosValue = productsSales?.reduce((total, item) => total + parseInt(item.amount), 0) || 0;
          
          // Nome do dia em português
          const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
          const name = dayNames[i];
          
          salesData.push({
            name,
            servicos: servicosValue,
            produtos: produtosValue,
            total: servicosValue + produtosValue
          });
        }
        
        res.json(salesData);
      } catch (error) {
        console.error('Erro ao buscar dados para o gráfico de vendas:', error);
        res.status(500).json({ message: 'Erro ao buscar dados para o gráfico de vendas' });
      }
    }
  );

  // Vendas por categoria
  adminRouter.get('/dashboard/sales-by-category',
    requireRole([UserRole.ADMIN]),
    async (_req: Request, res: Response) => {
      try {
        // Buscar as categorias de produtos
        const { data: categories, error: categoriesError } = await supabase
          .from('product_categories')
          .select('id, name');
        
        if (categoriesError) {
          console.error('Erro ao buscar categorias:', categoriesError);
          return res.status(500).json({ message: 'Erro ao buscar categorias de produtos' });
        }
        
        // Para cada categoria, buscar a soma das vendas
        const result = await Promise.all(categories.map(async (category) => {
          // Buscar produtos desta categoria
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id')
            .eq('category_id', category.id);
          
          if (productsError) {
            console.error(`Erro ao buscar produtos da categoria ${category.name}:`, productsError);
            return { name: category.name, value: 0 };
          }
          
          if (!products || products.length === 0) {
            return { name: category.name, value: 0 };
          }
          
          const productIds = products.map(p => p.id);
          
          // Buscar vendas destes produtos
          const { data: sales, error: salesError } = await supabase
            .from('cash_flow')
            .select('amount')
            .eq('type', 'income')
            .eq('category', 'product')
            .in('reference_id', productIds);
          
          if (salesError) {
            console.error(`Erro ao buscar vendas da categoria ${category.name}:`, salesError);
            return { name: category.name, value: 0 };
          }
          
          // Calcular valor total
          const value = sales?.reduce((total, item) => total + parseInt(item.amount), 0) || 0;
          
          return { name: category.name, value };
        }));
        
        // Filtrar categorias com valor zero e ordenar por valor decrescente
        const categorySalesData = result
          .filter(item => item.value > 0)
          .sort((a, b) => b.value - a.value);
        
        res.json(categorySalesData);
      } catch (error) {
        console.error('Erro ao buscar vendas por categoria:', error);
        res.status(500).json({ message: 'Erro ao buscar vendas por categoria' });
      }
    }
  );
  
  // Top serviços mais agendados
  adminRouter.get('/dashboard/top-services',
    requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
    async (_req: Request, res: Response) => {
      try {
        // Buscar todos os agendamentos com status completed
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('services')
          .eq('status', 'completed');
        
        if (appointmentsError) {
          console.error('Erro ao buscar agendamentos:', appointmentsError);
          return res.status(500).json({ message: 'Erro ao buscar agendamentos' });
        }
        
        // Contar ocorrências de cada serviço
        const serviceCount = {};
        
        appointments.forEach(appointment => {
          if (Array.isArray(appointment.services)) {
            appointment.services.forEach(serviceId => {
              serviceCount[serviceId] = (serviceCount[serviceId] || 0) + 1;
            });
          }
        });
        
        // Converter para array de { id, count }
        const serviceCountArray = Object.entries(serviceCount).map(([id, count]) => ({
          id: parseInt(id),
          count
        }));
        
        // Ordenar por contagem decrescente
        serviceCountArray.sort((a, b) => b.count - a.count);
        
        // Pegar os top 5
        const top5Services = serviceCountArray.slice(0, 5);
        
        // Buscar nomes dos serviços
        const result = await Promise.all(top5Services.map(async (service) => {
          const { data, error } = await supabase
            .from('services')
            .select('name')
            .eq('id', service.id)
            .single();
          
          if (error) {
            console.error(`Erro ao buscar nome do serviço ${service.id}:`, error);
            return { name: `Serviço ${service.id}`, value: service.count };
          }
          
          return { name: data.name, value: service.count };
        }));
        
        res.json(result);
      } catch (error) {
        console.error('Erro ao buscar top serviços:', error);
        res.status(500).json({ message: 'Erro ao buscar top serviços' });
      }
    }
  );
  
  // Desempenho dos profissionais
  adminRouter.get('/dashboard/professional-performance',
    requireRole([UserRole.ADMIN]),
    async (_req: Request, res: Response) => {
      try {
        // Buscar todos os profissionais
        const { data: professionals, error: professionalsError } = await supabase
          .from('professionals')
          .select('id, name');
        
        if (professionalsError) {
          console.error('Erro ao buscar profissionais:', professionalsError);
          return res.status(500).json({ message: 'Erro ao buscar profissionais' });
        }
        
        // Para cada profissional, buscar agendamentos completados e cancelados
        const result = await Promise.all(professionals.map(async (professional) => {
          // Agendamentos completados
          const { data: completed, error: completedError } = await supabase
            .from('appointments')
            .select('id')
            .eq('professional_id', professional.id)
            .eq('status', 'completed');
          
          // Agendamentos cancelados
          const { data: cancelled, error: cancelledError } = await supabase
            .from('appointments')
            .select('id')
            .eq('professional_id', professional.id)
            .eq('status', 'cancelled');
          
          if (completedError || cancelledError) {
            console.error(`Erro ao buscar agendamentos do profissional ${professional.name}:`, completedError || cancelledError);
            return { name: professional.name, completados: 0, cancelados: 0 };
          }
          
          return {
            name: professional.name,
            completados: completed?.length || 0,
            cancelados: cancelled?.length || 0
          };
        }));
        
        // Ordenar por número de atendimentos completados (decrescente)
        result.sort((a, b) => b.completados - a.completados);
        
        res.json(result);
      } catch (error) {
        console.error('Erro ao buscar desempenho dos profissionais:', error);
        res.status(500).json({ message: 'Erro ao buscar desempenho dos profissionais' });
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