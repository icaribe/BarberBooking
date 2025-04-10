import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { registerAdminRoutes } from "./admin-routes";
import cashFlowRouter from './routes/cash-flow-routes';
import { 
  insertUserSchema, 
  insertServiceCategorySchema, 
  insertServiceSchema,
  insertProfessionalSchema,
  insertScheduleSchema,
  insertAppointmentSchema,
  insertAppointmentServiceSchema,
  insertProductCategorySchema,
  insertProductSchema,
  insertLoyaltyRewardSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar autenticação
  setupAuth(app);
  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Nome de usuário já existe" });
      }
      
      const newUser = await storage.createUser(userData);
      if (!newUser) {
        return res.status(500).json({ message: "Erro ao criar usuário no banco de dados" });
      }

      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados de usuário inválidos", 
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        message: "Erro ao criar usuário. Por favor, tente novamente.",
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(id, req.body);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Service category routes
  app.get("/api/service-categories", async (_req: Request, res: Response) => {
    const categories = await storage.getServiceCategories();
    res.json(categories);
  });

  app.get("/api/service-categories/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    const category = await storage.getServiceCategory(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(category);
  });

  app.post("/api/service-categories", async (req: Request, res: Response) => {
    try {
      const categoryData = insertServiceCategorySchema.parse(req.body);
      const newCategory = await storage.createServiceCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Service routes
  app.get("/api/services", async (req: Request, res: Response) => {
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    
    if (categoryId) {
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const services = await storage.getServicesByCategory(categoryId);
      return res.json(services);
    }
    
    const services = await storage.getServices();
    res.json(services);
  });

  app.get("/api/services/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }
    
    const service = await storage.getService(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    res.json(service);
  });

  app.post("/api/services", async (req: Request, res: Response) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const newService = await storage.createService(serviceData);
      res.status(201).json(newService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  // Professional routes
  app.get("/api/professionals", async (_req: Request, res: Response) => {
    const professionals = await storage.getProfessionals();
    res.json(professionals);
  });

  app.get("/api/professionals/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid professional ID" });
    }
    
    const professional = await storage.getProfessional(id);
    if (!professional) {
      return res.status(404).json({ message: "Professional not found" });
    }
    
    res.json(professional);
  });

  app.post("/api/professionals", async (req: Request, res: Response) => {
    try {
      const professionalData = insertProfessionalSchema.parse(req.body);
      const newProfessional = await storage.createProfessional(professionalData);
      res.status(201).json(newProfessional);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid professional data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create professional" });
    }
  });

  // Schedule routes
  app.get("/api/professionals/:professionalId/schedules", async (req: Request, res: Response) => {
    const professionalId = parseInt(req.params.professionalId);
    if (isNaN(professionalId)) {
      return res.status(400).json({ message: "Invalid professional ID" });
    }
    
    const schedules = await storage.getSchedules(professionalId);
    res.json(schedules);
  });

  app.post("/api/schedules", async (req: Request, res: Response) => {
    try {
      const scheduleData = insertScheduleSchema.parse(req.body);
      const newSchedule = await storage.createSchedule(scheduleData);
      res.status(201).json(newSchedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid schedule data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create schedule" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const professionalId = req.query.professionalId ? parseInt(req.query.professionalId as string) : undefined;
      const date = req.query.date as string | undefined;
      
      if ((userId && isNaN(userId)) || (professionalId && isNaN(professionalId))) {
        return res.status(400).json({ message: "Invalid user or professional ID" });
      }
      
      console.log('Buscando agendamentos com:', { userId, professionalId, date });
      
      // Criar objeto de opções para filtro
      const options: { userId?: number; professionalId?: number; date?: string } = {};
      if (userId) options.userId = userId;
      if (professionalId) options.professionalId = professionalId;
      if (date) options.date = date;
      
      const appointments = await storage.getAppointments(options);
      return res.json(appointments);
    } catch (error) {
      console.error('Erro na rota /api/appointments:', error);
      return res.status(500).json({ message: "Erro ao buscar agendamentos", error: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  });

  app.get("/api/appointments/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }
    
    const appointment = await storage.getAppointment(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    res.json(appointment);
  });

  app.post("/api/appointments", async (req: Request, res: Response) => {
    try {
      // Verificar autenticação
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Você precisa estar autenticado para criar um agendamento" });
      }
      
      // Obter o ID do usuário atual da sessão
      const currentUserId = (req.user as any).id;
      console.log('Criando agendamento para o usuário autenticado ID:', currentUserId);
      
      // Garantir que o userId no agendamento corresponda ao usuário autenticado
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        userId: currentUserId // Sobrescrever com o ID do usuário autenticado
      });
      
      console.log('Dados do agendamento validados:', appointmentData);
      const newAppointment = await storage.createAppointment(appointmentData);
      console.log('Agendamento criado com ID:', newAppointment.id);
      
      // Add services to the appointment if provided
      if (req.body.services && Array.isArray(req.body.services)) {
        console.log('Adicionando serviços ao agendamento:', req.body.services);
        for (const serviceId of req.body.services) {
          const appointmentService = await storage.createAppointmentService({
            appointmentId: newAppointment.id,
            serviceId: parseInt(serviceId)
          });
          console.log('Serviço adicionado ao agendamento:', appointmentService);
        }
      }
      
      // Buscar o agendamento recém-criado para confirmar que foi salvo
      const savedAppointment = await storage.getAppointment(newAppointment.id);
      console.log('Agendamento verificado após salvar:', savedAppointment);
      
      res.status(201).json(newAppointment);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de agendamento inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Falha ao criar agendamento" });
    }
  });

  app.patch("/api/appointments/:id/status", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }
    
    const { status } = req.body;
    if (!status || !["scheduled", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const updatedAppointment = await storage.updateAppointmentStatus(id, status);
    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    res.json(updatedAppointment);
  });

  app.get("/api/appointments/:appointmentId/services", async (req: Request, res: Response) => {
    const appointmentId = parseInt(req.params.appointmentId);
    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }
    
    const appointmentServices = await storage.getAppointmentServices(appointmentId);
    res.json(appointmentServices);
  });

  app.post("/api/appointment-services", async (req: Request, res: Response) => {
    try {
      const appointmentServiceData = insertAppointmentServiceSchema.parse(req.body);
      const newAppointmentService = await storage.createAppointmentService(appointmentServiceData);
      res.status(201).json(newAppointmentService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment service" });
    }
  });

  // Product category routes
  app.get("/api/product-categories", async (_req: Request, res: Response) => {
    const categories = await storage.getProductCategories();
    res.json(categories);
  });

  app.get("/api/product-categories/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    const category = await storage.getProductCategory(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(category);
  });

  app.post("/api/product-categories", async (req: Request, res: Response) => {
    try {
      const categoryData = insertProductCategorySchema.parse(req.body);
      const newCategory = await storage.createProductCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Product routes
  app.get("/api/products", async (req: Request, res: Response) => {
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    
    if (categoryId) {
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const products = await storage.getProductsByCategory(categoryId);
      return res.json(products);
    }
    
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  });

  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(productData);
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Loyalty reward routes
  app.get("/api/loyalty-rewards", async (_req: Request, res: Response) => {
    const rewards = await storage.getLoyaltyRewards();
    res.json(rewards);
  });

  app.get("/api/loyalty-rewards/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid reward ID" });
    }
    
    const reward = await storage.getLoyaltyReward(id);
    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }
    
    res.json(reward);
  });

  app.post("/api/loyalty-rewards", async (req: Request, res: Response) => {
    try {
      const rewardData = insertLoyaltyRewardSchema.parse(req.body);
      const newReward = await storage.createLoyaltyReward(rewardData);
      res.status(201).json(newReward);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reward data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reward" });
    }
  });

  // Registrar rotas do sistema administrativo
  registerAdminRoutes(app);
  
  // Registrar rotas de fluxo de caixa
  app.use('/api/cash-flow', cashFlowRouter);

  const httpServer = createServer(app);
  return httpServer;
}
