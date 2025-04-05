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