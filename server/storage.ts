import {
  User, InsertUser,
  ServiceCategory, InsertServiceCategory,
  Service, InsertService,
  Professional, InsertProfessional,
  Schedule, InsertSchedule,
  Appointment, InsertAppointment,
  AppointmentService, InsertAppointmentService,
  ProductCategory, InsertProductCategory,
  Product, InsertProduct,
  LoyaltyReward, InsertLoyaltyReward
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import pg from "pg";
import { sql, eq } from "drizzle-orm";
import * as schema from "@shared/schema";

const { Pool } = pg;

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Service Category methods
  getServiceCategories(): Promise<ServiceCategory[]>;
  getServiceCategory(id: number): Promise<ServiceCategory | undefined>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;
  
  // Service methods
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  getServicesByCategory(categoryId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  
  // Professional methods
  getProfessionals(): Promise<Professional[]>;
  getProfessional(id: number): Promise<Professional | undefined>;
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  
  // Schedule methods
  getSchedules(professionalId: number): Promise<Schedule[]>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  
  // Appointment methods
  getAppointments(userId?: number, professionalId?: number, date?: string): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  
  // Appointment Service methods
  getAppointmentServices(appointmentId: number): Promise<AppointmentService[]>;
  createAppointmentService(appointmentService: InsertAppointmentService): Promise<AppointmentService>;
  
  // Product Category methods
  getProductCategories(): Promise<ProductCategory[]>;
  getProductCategory(id: number): Promise<ProductCategory | undefined>;
  createProductCategory(category: InsertProductCategory): Promise<ProductCategory>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Loyalty Reward methods
  getLoyaltyRewards(): Promise<LoyaltyReward[]>;
  getLoyaltyReward(id: number): Promise<LoyaltyReward | undefined>;
  createLoyaltyReward(reward: InsertLoyaltyReward): Promise<LoyaltyReward>;
  
  // Initialize demo data
  initializeDemoData(): Promise<void>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private serviceCategories: Map<number, ServiceCategory>;
  private services: Map<number, Service>;
  private professionals: Map<number, Professional>;
  private schedules: Map<number, Schedule>;
  private appointments: Map<number, Appointment>;
  private appointmentServices: Map<number, AppointmentService>;
  private productCategories: Map<number, ProductCategory>;
  private products: Map<number, Product>;
  private loyaltyRewards: Map<number, LoyaltyReward>;
  
  private userIdCounter: number;
  private serviceCategoryIdCounter: number;
  private serviceIdCounter: number;
  private professionalIdCounter: number;
  private scheduleIdCounter: number;
  private appointmentIdCounter: number;
  private appointmentServiceIdCounter: number;
  private productCategoryIdCounter: number;
  private productIdCounter: number;
  private loyaltyRewardIdCounter: number;
  
  sessionStore: session.Store;
  
  constructor() {
    this.users = new Map();
    this.serviceCategories = new Map();
    this.services = new Map();
    this.professionals = new Map();
    this.schedules = new Map();
    this.appointments = new Map();
    this.appointmentServices = new Map();
    this.productCategories = new Map();
    this.products = new Map();
    this.loyaltyRewards = new Map();
    
    this.userIdCounter = 1;
    this.serviceCategoryIdCounter = 1;
    this.serviceIdCounter = 1;
    this.professionalIdCounter = 1;
    this.scheduleIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.appointmentServiceIdCounter = 1;
    this.productCategoryIdCounter = 1;
    this.productIdCounter = 1;
    this.loyaltyRewardIdCounter = 1;
    
    // Criar uma memoria para sessões
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // limpar sessões expiradas a cada 24h
    });
    
    // Initialize demo data
    this.initializeDemoData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      loyaltyPoints: 0,
      name: insertUser.name || null,
      email: insertUser.email || null,
      phone: insertUser.phone || null 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Service Category methods
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return Array.from(this.serviceCategories.values());
  }

  async getServiceCategory(id: number): Promise<ServiceCategory | undefined> {
    return this.serviceCategories.get(id);
  }

  async createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory> {
    const id = this.serviceCategoryIdCounter++;
    const newCategory: ServiceCategory = { ...category, id };
    this.serviceCategories.set(id, newCategory);
    return newCategory;
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServicesByCategory(categoryId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.categoryId === categoryId,
    );
  }

  async createService(service: InsertService): Promise<Service> {
    const id = this.serviceIdCounter++;
    const newService: Service = { 
      ...service, 
      id, 
      price: service.price ?? null,
      priceType: service.priceType ?? null,
      description: service.description ?? null
    };
    this.services.set(id, newService);
    return newService;
  }

  // Professional methods
  async getProfessionals(): Promise<Professional[]> {
    return Array.from(this.professionals.values());
  }

  async getProfessional(id: number): Promise<Professional | undefined> {
    return this.professionals.get(id);
  }

  async createProfessional(professional: InsertProfessional): Promise<Professional> {
    const id = this.professionalIdCounter++;
    const newProfessional: Professional = { 
      ...professional, 
      id, 
      reviewCount: 0,
      avatar: professional.avatar ?? null,
      rating: professional.rating ?? null,
      specialties: professional.specialties ?? null,
      bio: professional.bio ?? null
    };
    this.professionals.set(id, newProfessional);
    return newProfessional;
  }

  // Schedule methods
  async getSchedules(professionalId: number): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter(
      (schedule) => schedule.professionalId === professionalId,
    );
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const id = this.scheduleIdCounter++;
    const newSchedule: Schedule = { 
      ...schedule, 
      id,
      isAvailable: schedule.isAvailable ?? null
    };
    this.schedules.set(id, newSchedule);
    return newSchedule;
  }

  // Appointment methods
  async getAppointments(userId?: number, professionalId?: number, date?: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter((appointment) => {
      let match = true;
      if (userId !== undefined) match = match && appointment.userId === userId;
      if (professionalId !== undefined) match = match && appointment.professionalId === professionalId;
      if (date !== undefined) match = match && appointment.date === date;
      return match;
    });
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const newAppointment: Appointment = { 
      ...appointment, 
      id, 
      createdAt: new Date(),
      status: appointment.status ?? null,
      notes: appointment.notes ?? null
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, status };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Appointment Service methods
  async getAppointmentServices(appointmentId: number): Promise<AppointmentService[]> {
    return Array.from(this.appointmentServices.values()).filter(
      (as) => as.appointmentId === appointmentId,
    );
  }

  async createAppointmentService(appointmentService: InsertAppointmentService): Promise<AppointmentService> {
    const id = this.appointmentServiceIdCounter++;
    const newAppointmentService: AppointmentService = { ...appointmentService, id };
    this.appointmentServices.set(id, newAppointmentService);
    return newAppointmentService;
  }

  // Product Category methods
  async getProductCategories(): Promise<ProductCategory[]> {
    return Array.from(this.productCategories.values());
  }

  async getProductCategory(id: number): Promise<ProductCategory | undefined> {
    return this.productCategories.get(id);
  }

  async createProductCategory(category: InsertProductCategory): Promise<ProductCategory> {
    const id = this.productCategoryIdCounter++;
    const newCategory: ProductCategory = { ...category, id };
    this.productCategories.set(id, newCategory);
    return newCategory;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId,
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const newProduct: Product = { 
      ...product, 
      id,
      description: product.description ?? null,
      imageUrl: product.imageUrl ?? null,
      inStock: product.inStock ?? null
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  // Loyalty Reward methods
  async getLoyaltyRewards(): Promise<LoyaltyReward[]> {
    return Array.from(this.loyaltyRewards.values());
  }

  async getLoyaltyReward(id: number): Promise<LoyaltyReward | undefined> {
    return this.loyaltyRewards.get(id);
  }

  async createLoyaltyReward(reward: InsertLoyaltyReward): Promise<LoyaltyReward> {
    const id = this.loyaltyRewardIdCounter++;
    const newReward: LoyaltyReward = { 
      ...reward, 
      id,
      icon: reward.icon ?? null,
      description: reward.description ?? null,
      isActive: reward.isActive ?? null
    };
    this.loyaltyRewards.set(id, newReward);
    return newReward;
  }

  // Initialize demo data
  async initializeDemoData(): Promise<void> {
    // Não criar usuário de demonstração

    // Create service categories
    if (this.serviceCategories.size === 0) {
      const categories = [
        { name: "Cortes", icon: "cut" },
        { name: "Barba e Acabamentos", icon: "razor" },
        { name: "Tratamentos Faciais", icon: "spa" },
        { name: "Sobrancelha", icon: "eye" },
        { name: "Serviços Capilares", icon: "pump-soap" },
        { name: "Coloração e Tratamentos Especiais", icon: "paint-brush" }
      ];

      for (const category of categories) {
        await this.createServiceCategory(category);
      }
    }

    // Create services
    if (this.services.size === 0) {
      const servicesList = [
        // Cortes
        { name: "Corte Masculino", price: 3000, priceType: "fixed", durationMinutes: 30, categoryId: 1, description: "Corte masculino completo" },
        { name: "Corte + Barba", price: 5000, priceType: "fixed", durationMinutes: 60, categoryId: 1, description: "Corte masculino com barba" },
        { name: "Corte + Barba + Sobrancelha na Navalha", price: null, priceType: "variable", durationMinutes: 60, categoryId: 1, description: "Corte, barba e sobrancelha" },
        { name: "Corte + Barba + Sobrancelha na Pinça", price: null, priceType: "variable", durationMinutes: 60, categoryId: 1, description: "Corte, barba e sobrancelha na pinça" },
        { name: "Corte + Pigmentação", price: 6000, priceType: "fixed", durationMinutes: 60, categoryId: 1, description: "Corte com pigmentação" },
        { name: "Corte + Sobrancelha na Navalha", price: null, priceType: "variable", durationMinutes: 30, categoryId: 1, description: "Corte com sobrancelha na navalha" },
        { name: "Corte + Sobrancelha na Pinça", price: 4500, priceType: "fixed", durationMinutes: 60, categoryId: 1, description: "Corte com sobrancelha na pinça" },
        { name: "Corte 1 e 2 pente", price: 2000, priceType: "fixed", durationMinutes: 15, categoryId: 1, description: "Corte simples com máquina" },
        
        // Barba e Acabamentos
        { name: "Barba", price: 2500, priceType: "fixed", durationMinutes: 30, categoryId: 2, description: "Barba completa" },
        { name: "Barba + Pezinho", price: 3200, priceType: "fixed", durationMinutes: 30, categoryId: 2, description: "Barba com acabamento no pezinho" },
        { name: "Acabamento (Pezinho)", price: 700, priceType: "fixed", durationMinutes: 15, categoryId: 2, description: "Acabamento no pezinho" },
        
        // Tratamentos Faciais
        { name: "Hidratação", price: 2000, priceType: "fixed", durationMinutes: 15, categoryId: 3, description: "Hidratação facial" },
        { name: "BOTOX", price: 4000, priceType: "fixed", durationMinutes: 30, categoryId: 3, description: "Tratamento facial com botox" },
        { name: "Depilação Nasal", price: 1000, priceType: "fixed", durationMinutes: 15, categoryId: 3, description: "Depilação nasal" },
        
        // Sobrancelha
        { name: "Sobrancelha Navalha", price: 1000, priceType: "fixed", durationMinutes: 15, categoryId: 4, description: "Sobrancelha com navalha" },
        { name: "Sobrancelha Pinça", price: 1000, priceType: "fixed", durationMinutes: 15, categoryId: 4, description: "Sobrancelha com pinça" },
        
        // Serviços Capilares
        { name: "Lavagem + Penteado", price: 2000, priceType: "variable", durationMinutes: 15, categoryId: 5, description: "Lavagem e penteado" },
        { name: "Relaxamento Capilar", price: 2000, priceType: "fixed", durationMinutes: 15, categoryId: 5, description: "Relaxamento capilar" },
        { name: "Relaxamento Capilar (Graxa)", price: 2000, priceType: "fixed", durationMinutes: 30, categoryId: 5, description: "Relaxamento capilar com graxa" },
        { name: "Relaxamento Capilar + Hidratação", price: 3000, priceType: "fixed", durationMinutes: 30, categoryId: 5, description: "Relaxamento capilar com hidratação" },
        { name: "Pigmentação", price: 3000, priceType: "variable", durationMinutes: 15, categoryId: 5, description: "Pigmentação capilar" },
        { name: "Pintura", price: 3000, priceType: "variable", durationMinutes: 15, categoryId: 5, description: "Pintura capilar" },
        
        // Coloração e Tratamentos Especiais
        { name: "Progressiva", price: 5000, priceType: "fixed", durationMinutes: 30, categoryId: 6, description: "Progressiva completa" },
        { name: "Selagem", price: 5000, priceType: "fixed", durationMinutes: 30, categoryId: 6, description: "Selagem capilar" },
        { name: "Platinado", price: 14000, priceType: "variable", durationMinutes: 30, categoryId: 6, description: "Coloração platinada" },
        { name: "Luzes", price: 14000, priceType: "variable", durationMinutes: 30, categoryId: 6, description: "Luzes no cabelo" }
      ];

      for (const service of servicesList) {
        await this.createService(service);
      }
    }

    // Create professionals
    if (this.professionals.size === 0) {
      const professionalsList = [
        { 
          name: "Carlos", 
          avatar: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?ixlib=rb-4.0.3&auto=format&fit=crop&w=150", 
          rating: 45,
          reviewCount: 120,
          specialties: ["Cortes modernos", "Barba"],
          bio: "Especialista em cortes modernos e barba" 
        },
        { 
          name: "Iuri", 
          avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150", 
          rating: 50,
          reviewCount: 98,
          specialties: ["Barba", "Acabamentos"],
          bio: "Especialista em barba e acabamentos" 
        },
        { 
          name: "Johnata", 
          avatar: "https://images.unsplash.com/photo-1580365246210-8e4e94d9858d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150", 
          rating: 40,
          reviewCount: 76,
          specialties: ["Tratamentos capilares"],
          bio: "Especialista em tratamentos capilares" 
        },
        { 
          name: "Jorran", 
          avatar: "https://images.unsplash.com/photo-1570158268183-d296b2892211?ixlib=rb-4.0.3&auto=format&fit=crop&w=150", 
          rating: 48,
          reviewCount: 90,
          specialties: ["Cortes clássicos", "Sobrancelha"],
          bio: "Especialista em cortes clássicos e cuidados com sobrancelha" 
        },
        { 
          name: "Mikael", 
          avatar: "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=150", 
          rating: 47,
          reviewCount: 85,
          specialties: ["Coloração", "Tratamentos Especiais"],
          bio: "Especialista em coloração e tratamentos especiais" 
        },
        { 
          name: "Oséias", 
          avatar: "https://images.unsplash.com/photo-1549062572-544a64fb0c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=150", 
          rating: 46,
          reviewCount: 110,
          specialties: ["Cortes degradê", "Barba completa"],
          bio: "Especialista em cortes degradê e barba completa" 
        },
        { 
          name: "Rodrigo", 
          avatar: "https://images.unsplash.com/photo-1565464027194-7957a2295fb7?ixlib=rb-4.0.3&auto=format&fit=crop&w=150", 
          rating: 49,
          reviewCount: 105,
          specialties: ["Penteados", "Relaxamento"],
          bio: "Especialista em penteados e relaxamento capilar" 
        }
      ];

      for (const professional of professionalsList) {
        await this.createProfessional(professional);
      }
    }

    // Create schedules for each professional
    if (this.schedules.size === 0) {
      // Loop through all professionals
      for (let i = 1; i <= 7; i++) {
        // Add schedule for each day (Monday-Saturday)
        for (let day = 1; day <= 6; day++) {
          await this.createSchedule({
            professionalId: i,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "13:00",
            isAvailable: true
          });
          
          await this.createSchedule({
            professionalId: i,
            dayOfWeek: day,
            startTime: "14:30",
            endTime: "19:30",
            isAvailable: true
          });
        }
      }
    }

    // Create product categories
    if (this.productCategories.size === 0) {
      const categories = [
        { name: "Produtos para Barba e Cabelo", icon: "beard" },
        { name: "Pomadas e Produtos para Estilização", icon: "magic" },
        { name: "Bebidas Alcoólicas", icon: "wine-glass" },
        { name: "Bebidas Não Alcoólicas", icon: "coffee" },
        { name: "Lanches e Snacks", icon: "cookie" },
        { name: "Acessórios e Outros", icon: "shopping-bag" }
      ];

      for (const category of categories) {
        await this.createProductCategory(category);
      }
    }

    // Create products
    if (this.products.size === 0) {
      const productsList = [
        // Produtos para Barba e Cabelo
        { 
          name: "Foxidil minoxidil para barba (fox) 120ml", 
          price: 9000, 
          description: "Minoxidil para crescimento de barba", 
          imageUrl: "https://images.unsplash.com/photo-1669155309185-9d61617694ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Bal fox", 
          price: 4000, 
          description: "Balm para hidratação de barba", 
          imageUrl: "https://images.unsplash.com/photo-1597852075234-fd721ac361d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Balm B.URB para barba", 
          price: 3500, 
          description: "Balm para hidratação da barba", 
          imageUrl: "https://images.unsplash.com/photo-1664478711535-fd3cc5d1a99a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Balm Red Nek para barba", 
          price: 3500, 
          description: "Balm para hidratação de barba", 
          imageUrl: "https://images.unsplash.com/photo-1664478711535-fd3cc5d1a99a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Derma Roller", 
          price: 4000, 
          description: "Estimulador de crescimento de barba", 
          imageUrl: "https://images.unsplash.com/photo-1571875257727-256c39da42af?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Condicionador 3 em 1", 
          price: 3000, 
          description: "Condicionador multiuso para cabelo", 
          imageUrl: "https://images.unsplash.com/photo-1594125312188-408748807de5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Condicionador Ice Fresh Fox 240ml", 
          price: 2500, 
          description: "Condicionador refrescante para cabelo", 
          imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Escova anti estática", 
          price: 4500, 
          description: "Escova que reduz o frizz e estática", 
          imageUrl: "https://images.unsplash.com/photo-1576520709426-23faee40a4b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Esponja de Nudred", 
          price: 3000, 
          description: "Esponja para modelar cabelo", 
          imageUrl: "https://images.unsplash.com/photo-1531579929639-cc31ff9359a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Loção Hidratante Balm Barba 4 em 1", 
          price: 3500, 
          description: "Loção multiuso para hidratação", 
          imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Loção Spray Pós Barba Lenhador", 
          price: 3000, 
          description: "Loção para aplicar após fazer a barba", 
          imageUrl: "https://images.unsplash.com/photo-1521731978332-9e9e714bdd20?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Maquina Itan", 
          price: 6000, 
          description: "Máquina de cortar cabelo profissional", 
          imageUrl: "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Minoxidil Kirkland Signature 05% 60ml", 
          price: 9000, 
          description: "Minoxidil para crescimento de barba e cabelo", 
          imageUrl: "https://images.unsplash.com/photo-1669155309185-9d61617694ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Navalha", 
          price: 3000, 
          description: "Navalha para barbear", 
          imageUrl: "https://images.unsplash.com/photo-1518019671582-55004f1bc9ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Óleo de Barba Lenhador Kerafyto", 
          price: 3000, 
          description: "Óleo para barba com aroma amadeirado", 
          imageUrl: "https://images.unsplash.com/photo-1632863341020-e96fd96ab2d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Pente", 
          price: 2500, 
          description: "Pente profissional para cabelo", 
          imageUrl: "https://images.unsplash.com/photo-1621607512495-5e76ff6a53a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Pente de mão", 
          price: 300, 
          description: "Pente pequeno portátil", 
          imageUrl: "https://images.unsplash.com/photo-1635368563577-257a39bb00c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Perfume de barba", 
          price: 2500, 
          description: "Perfume específico para barba", 
          imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Perfumes", 
          price: 3000, 
          description: "Perfumes variados masculinos", 
          imageUrl: "https://images.unsplash.com/photo-1543422655-ac1c6ca993ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Shampoo 3 em 1", 
          price: 3000, 
          description: "Shampoo multiuso para cabelo", 
          imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Shampoo anti-caspa", 
          price: 3000, 
          description: "Shampoo para controle de caspa", 
          imageUrl: "https://images.unsplash.com/photo-1607242792481-37f27e1901b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Shampoo com minoxidill", 
          price: 3000, 
          description: "Shampoo com minoxidil para fortalecimento", 
          imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Shampoo Ice Fresh Fox 240ml", 
          price: 2500, 
          description: "Shampoo refrescante para cabelo", 
          imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Shampoo preto", 
          price: 3000, 
          description: "Shampoo com pigmento para cabelos escuros", 
          imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        { 
          name: "Tonico capilar", 
          price: 3000, 
          description: "Tônico para estimular o couro cabeludo", 
          imageUrl: "https://images.unsplash.com/photo-1634643836960-c345569c4d08?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        
        // Pomadas e Produtos para Estilização
        { 
          name: "Cera Red Neck Cinza", 
          price: 2000, 
          description: "Cera modeladora cinza", 
          imageUrl: "https://images.unsplash.com/photo-1626784215021-2e39ccf641a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Cera Red Neck Laranja", 
          price: 2000, 
          description: "Cera modeladora laranja", 
          imageUrl: "https://images.unsplash.com/photo-1626784215021-2e39ccf641a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Cera Red Neck Roxa", 
          price: 2000, 
          description: "Cera modeladora roxa", 
          imageUrl: "https://images.unsplash.com/photo-1626784215021-2e39ccf641a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Cera Red Neck Verde", 
          price: 2000, 
          description: "Cera modeladora verde", 
          imageUrl: "https://images.unsplash.com/photo-1626784215021-2e39ccf641a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Cera Red Neck Vermelha", 
          price: 2000, 
          description: "Cera modeladora vermelha", 
          imageUrl: "https://images.unsplash.com/photo-1626784215021-2e39ccf641a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada efeito teia lenhador 120g", 
          price: 3000, 
          description: "Pomada com efeito teia para penteados estruturados", 
          imageUrl: "https://images.unsplash.com/photo-1627798133922-271e43e6e1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada fox verde 120g", 
          price: 3000, 
          description: "Pomada modeladora verde", 
          imageUrl: "https://images.unsplash.com/photo-1627798133922-271e43e6e1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada 60g Pequena (Máxima e Lenhador)", 
          price: 2000, 
          description: "Pomada modeladora tamanho pequeno", 
          imageUrl: "https://images.unsplash.com/photo-1627798133922-271e43e6e1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada black Fox 120g", 
          price: 3000, 
          description: "Pomada black fosca", 
          imageUrl: "https://images.unsplash.com/photo-1627798133922-271e43e6e1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada black lenhador 120g", 
          price: 3000, 
          description: "Pomada black fosca", 
          imageUrl: "https://images.unsplash.com/photo-1627798133922-271e43e6e1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada caramelo fox 120g", 
          price: 3000, 
          description: "Pomada modeladora caramelo", 
          imageUrl: "https://images.unsplash.com/photo-1627798133922-271e43e6e1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada Conhaque", 
          price: 3000, 
          description: "Pomada modeladora conhaque", 
          imageUrl: "https://images.unsplash.com/photo-1627798133922-271e43e6e1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada Efeito teia Fox 120g", 
          price: 3000, 
          description: "Pomada com efeito teia", 
          imageUrl: "https://images.unsplash.com/photo-1627798133922-271e43e6e1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada em pó", 
          price: 3000, 
          description: "Pomada em pó para volume", 
          imageUrl: "https://images.unsplash.com/photo-1627798133922-271e43e6e1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada hair fox laranja 120g", 
          price: 3000, 
          description: "Pomada modeladora laranja", 
          imageUrl: "https://images.unsplash.com/photo-1627798133922-271e43e6e1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada matte lenhador 120g", 
          price: 3000, 
          description: "Pomada com acabamento matte", 
          imageUrl: "https://images.unsplash.com/photo-1627798133922-271e43e6e1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada Modeladora Caramelo", 
          price: 3000, 
          description: "Pomada modeladora com acabamento natural", 
          imageUrl: "https://images.unsplash.com/photo-1631112426993-460fa457c4d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada pequena CREAM", 
          price: 2500, 
          description: "Pomada modeladora cream tamanho pequeno", 
          imageUrl: "https://images.unsplash.com/photo-1627798133922-271e43e6e1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada Pequena", 
          price: 2000, 
          description: "Pomada modeladora tamanho pequeno", 
          imageUrl: "https://images.unsplash.com/photo-1627798133922-271e43e6e1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada toque seco fox 120g", 
          price: 3000, 
          description: "Pomada com toque seco", 
          imageUrl: "https://images.unsplash.com/photo-1627798133922-271e43e6e1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        { 
          name: "Pomada Tradicional lenhador 120g", 
          price: 3000, 
          description: "Pomada modeladora tradicional", 
          imageUrl: "https://images.unsplash.com/photo-1627798133922-271e43e6e1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 2,
          inStock: true 
        },
        
        // Bebidas Alcoólicas
        { 
          name: "BUDWEISER LONG NECK", 
          price: 700, 
          description: "Cerveja Budweiser Long Neck 330ml", 
          imageUrl: "https://images.unsplash.com/photo-1613618948923-e25be7fc4e3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "Campari", 
          price: 600, 
          description: "Dose de Campari", 
          imageUrl: "https://images.unsplash.com/photo-1599021456807-1d9407298761?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "CORONA LONG NECK", 
          price: 800, 
          description: "Cerveja Corona Long Neck 330ml", 
          imageUrl: "https://images.unsplash.com/photo-1607644536940-6c300b5784c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "Coronita", 
          price: 700, 
          description: "Cerveja Corona pequena", 
          imageUrl: "https://images.unsplash.com/photo-1622748055122-5402bcb0be3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE ALAMBIQUE MURICI", 
          price: 200, 
          description: "Dose de cachaça artesanal", 
          imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE CACHAÇA 51", 
          price: 400, 
          description: "Dose de cachaça 51", 
          imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE CORTEZANO", 
          price: 200, 
          description: "Dose de cachaça Cortezano", 
          imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE MONTILLA", 
          price: 300, 
          description: "Dose de conhaque Montilla", 
          imageUrl: "https://images.unsplash.com/photo-1583873483341-e80a48dae5ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE OLD PARR 12 ANOS", 
          price: 1800, 
          description: "Dose de whiskey Old Parr 12 anos", 
          imageUrl: "https://images.unsplash.com/photo-1541975902809-3f494f095b59?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE ORLOFF VODKA", 
          price: 600, 
          description: "Dose de vodka Orloff", 
          imageUrl: "https://images.unsplash.com/photo-1594096412531-6b041c96d6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE PARATUDO", 
          price: 500, 
          description: "Dose de cachaça Paratudo", 
          imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE SÃO JOÃO DA BARRA", 
          price: 400, 
          description: "Dose de cachaça São João da Barra", 
          imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE SELETA", 
          price: 500, 
          description: "Dose de cachaça Seleta", 
          imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE TEQUILA OURO (JOSE CUERVO)", 
          price: 1000, 
          description: "Dose de tequila ouro José Cuervo", 
          imageUrl: "https://images.unsplash.com/photo-1622349906830-3ea9aeca57e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE TEQUILA PRATA (JOSE CUERVO)", 
          price: 900, 
          description: "Dose de tequila prata José Cuervo", 
          imageUrl: "https://images.unsplash.com/photo-1622349861342-f5b942646c17?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE VELHO BARREIRO", 
          price: 400, 
          description: "Dose de cachaça Velho Barreiro", 
          imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE VODKA SKYY", 
          price: 800, 
          description: "Dose de vodka Skyy", 
          imageUrl: "https://images.unsplash.com/photo-1594096412531-6b041c96d6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE Vodka SMIRNOFFF", 
          price: 700, 
          description: "Dose de vodka Smirnoff", 
          imageUrl: "https://images.unsplash.com/photo-1594096412531-6b041c96d6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE WHISKEY BLACK LABEL", 
          price: 1800, 
          description: "Dose de whiskey Black Label", 
          imageUrl: "https://images.unsplash.com/photo-1541795795328-f073b763494e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE WHISKEY CHIVAS 12 ANOS", 
          price: 1800, 
          description: "Dose de whiskey Chivas 12 anos", 
          imageUrl: "https://images.unsplash.com/photo-1523008985256-62f119de1f40?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE WHISKEY JACK DANIELS", 
          price: 1600, 
          description: "Dose de whiskey Jack Daniel's", 
          imageUrl: "https://images.unsplash.com/photo-1541795795328-f073b763494e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE WHISKEY RED LABEL", 
          price: 1100, 
          description: "Dose de whiskey Red Label", 
          imageUrl: "https://images.unsplash.com/photo-1541795795328-f073b763494e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "DOSE WHITE HORSE", 
          price: 1000, 
          description: "Dose de whiskey White Horse", 
          imageUrl: "https://images.unsplash.com/photo-1541795795328-f073b763494e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "MONSTER ABSOLUT", 
          price: 1000, 
          description: "Energético Monster com Absolut", 
          imageUrl: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "RIBEIRAO COLORADO LONG NECK", 
          price: 1000, 
          description: "Cerveja Colorado long neck", 
          imageUrl: "https://images.unsplash.com/photo-1612528443702-f6741f70a049?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "SPATEN 600ML", 
          price: 1300, 
          description: "Cerveja Spaten 600ml", 
          imageUrl: "https://images.unsplash.com/photo-1618885472179-5e474019f2a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "SPATEN LONG NECK", 
          price: 700, 
          description: "Cerveja Spaten long neck", 
          imageUrl: "https://images.unsplash.com/photo-1618885472179-5e474019f2a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "STELLA ARTOIS LONG NECK 330ml", 
          price: 700, 
          description: "Cerveja Stella Artois long neck", 
          imageUrl: "https://images.unsplash.com/photo-1613902564622-276a034d0102?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        { 
          name: "Patagônia IPA 355ml", 
          price: 800, 
          description: "Cerveja Patagônia IPA long neck", 
          imageUrl: "https://images.unsplash.com/photo-1617666623842-bd554a3a5c13?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        
        // Bebidas Não Alcoólicas
        { 
          name: "AGUA COM GAS", 
          price: 350, 
          description: "Água mineral com gás 500ml", 
          imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "Agua com gas + Limão", 
          price: 350, 
          description: "Água com gás e limão 500ml", 
          imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "AGUA MINERAL", 
          price: 300, 
          description: "Água mineral sem gás 500ml", 
          imageUrl: "https://images.unsplash.com/photo-1606168094336-48f8f3302a2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "Antarctica Lata", 
          price: 350, 
          description: "Refrigerante Antarctica lata", 
          imageUrl: "https://images.unsplash.com/photo-1622766815178-641bef2b4630?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "ANTARCTICA ORIGINAL 600ml", 
          price: 1300, 
          description: "Cerveja Antarctica Original 600ml", 
          imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "APPIA COLORADO 300ML", 
          price: 700, 
          description: "Cerveja Colorado Appia 300ml", 
          imageUrl: "https://images.unsplash.com/photo-1612528443702-f6741f70a049?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "Chopp Stadt", 
          price: 600, 
          description: "Chopp Stadt", 
          imageUrl: "https://images.unsplash.com/photo-1583744515834-2ce2a528d5d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "COCA 310ML", 
          price: 450, 
          description: "Coca-Cola lata 310ml", 
          imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "COCA ZERO LATA 310ML", 
          price: 400, 
          description: "Coca-Cola Zero lata 310ml", 
          imageUrl: "https://images.unsplash.com/photo-1570526427001-9d80d114054d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "COCA-COLA KS", 
          price: 500, 
          description: "Coca-Cola garrafa 290ml", 
          imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "HEINEKEN ZERO ALCOOL 330ml", 
          price: 700, 
          description: "Cerveja Heineken sem álcool 330ml", 
          imageUrl: "https://images.unsplash.com/photo-1613733895930-4ce5f8a1bb8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "Monster de goiaba", 
          price: 1000, 
          description: "Energético Monster sabor goiaba", 
          imageUrl: "https://images.unsplash.com/photo-1605548218558-bebb534edab9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "Monster de Laranja", 
          price: 1000, 
          description: "Energético Monster sabor laranja", 
          imageUrl: "https://images.unsplash.com/photo-1605548218558-bebb534edab9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "MONSTER MANGO LOKO", 
          price: 1000, 
          description: "Energético Monster sabor manga", 
          imageUrl: "https://images.unsplash.com/photo-1605548218558-bebb534edab9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "Monster Melancia", 
          price: 1000, 
          description: "Energético Monster sabor melancia", 
          imageUrl: "https://images.unsplash.com/photo-1605548218558-bebb534edab9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "Monster Tradicional 473ml", 
          price: 1000, 
          description: "Energético Monster sabor tradicional", 
          imageUrl: "https://images.unsplash.com/photo-1581684322015-5a833940f714?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "GATORADE (MoRANGO)", 
          price: 600, 
          description: "Isotônico Gatorade sabor morango", 
          imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "GATOREDE(limão)", 
          price: 600, 
          description: "Isotônico Gatorade sabor limão", 
          imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "GATOREDE(MARACUJA)", 
          price: 600, 
          description: "Isotônico Gatorade sabor maracujá", 
          imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "POWERADE SABORES 500ML", 
          price: 500, 
          description: "Isotônico Powerade 500ml", 
          imageUrl: "https://images.unsplash.com/photo-1567710845236-e3a90b61ca63?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "RED BULL ENERGETICO", 
          price: 1000, 
          description: "Energético Red Bull", 
          imageUrl: "https://images.unsplash.com/photo-1613476798408-0f495bfd8058?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "Suco de Manga", 
          price: 450, 
          description: "Suco de manga 290ml", 
          imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "Suco de maracuja", 
          price: 450, 
          description: "Suco de maracujá 290ml", 
          imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "SUCO GOIABA 290ML", 
          price: 450, 
          description: "Suco de goiaba 290ml", 
          imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "SUCO UVA 290 ML", 
          price: 450, 
          description: "Suco de uva 290ml", 
          imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        
        // Lanches e Snacks
        { 
          name: "Barra de Cereal", 
          price: 250, 
          description: "Barra de cereal variados sabores", 
          imageUrl: "https://images.unsplash.com/photo-1590005354167-6da97870c757?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        { 
          name: "Barra de cereal banana", 
          price: 300, 
          description: "Barra de cereal sabor banana", 
          imageUrl: "https://images.unsplash.com/photo-1590005354167-6da97870c757?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        { 
          name: "Barra de cereal coco + frutas", 
          price: 300, 
          description: "Barra de cereal coco com frutas", 
          imageUrl: "https://images.unsplash.com/photo-1590005354167-6da97870c757?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        { 
          name: "Chocolate 5 Star 40g", 
          price: 400, 
          description: "Chocolate 5 Star 40g", 
          imageUrl: "https://images.unsplash.com/photo-1621437806128-2993fece3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        { 
          name: "Chocolate branco Laka 34g", 
          price: 400, 
          description: "Chocolate branco Lacta 34g", 
          imageUrl: "https://images.unsplash.com/photo-1621437806128-2993fece3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        { 
          name: "Chocolate Diamante Negro 34g", 
          price: 400, 
          description: "Chocolate meio amargo 34g", 
          imageUrl: "https://images.unsplash.com/photo-1621437806128-2993fece3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        { 
          name: "Chocolate Lacta ao leite 34g", 
          price: 400, 
          description: "Barra de chocolate ao leite", 
          imageUrl: "https://images.unsplash.com/photo-1600146278955-c3252aefd006?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        { 
          name: "Trident (cereja) 8g", 
          price: 300, 
          description: "Goma de mascar sabor cereja", 
          imageUrl: "https://images.unsplash.com/photo-1576377402254-9617d7a55eeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        { 
          name: "Trident (Intense Black) 8g", 
          price: 300, 
          description: "Goma de mascar sabor black", 
          imageUrl: "https://images.unsplash.com/photo-1576377402254-9617d7a55eeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        { 
          name: "Trident (menta verde) 8g", 
          price: 300, 
          description: "Goma de mascar sabor menta", 
          imageUrl: "https://images.unsplash.com/photo-1576377402254-9617d7a55eeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        { 
          name: "Trident (morango) 8g", 
          price: 300, 
          description: "Goma de mascar sabor morango", 
          imageUrl: "https://images.unsplash.com/photo-1576377402254-9617d7a55eeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        { 
          name: "TRIDENT (senses blueberry) 8g", 
          price: 300, 
          description: "Goma de mascar sabor blueberry", 
          imageUrl: "https://images.unsplash.com/photo-1576377402254-9617d7a55eeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        { 
          name: "Trident melancia 8g", 
          price: 300, 
          description: "Goma de mascar sabor melancia", 
          imageUrl: "https://images.unsplash.com/photo-1576377402254-9617d7a55eeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        { 
          name: "Trident(tutti fruiti)8g", 
          price: 300, 
          description: "Goma de mascar sabor tutti frutti", 
          imageUrl: "https://images.unsplash.com/photo-1576377402254-9617d7a55eeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        
        // Acessórios e Outros
        { 
          name: "CARTEIRA PAIOL OURO", 
          price: 1800, 
          description: "Carteira de tabaco premium", 
          imageUrl: "https://images.unsplash.com/photo-1589829545856-4cc9ef138be4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 6,
          inStock: true 
        },
        { 
          name: "CARTEIRA TRADICIONAL E MAMA CADELA", 
          price: 1500, 
          description: "Carteira de tabaco tradicional", 
          imageUrl: "https://images.unsplash.com/photo-1589829545856-4cc9ef138be4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 6,
          inStock: true 
        },
        { 
          name: "Tabaco", 
          price: 200, 
          description: "Tabaco a granel", 
          imageUrl: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 6,
          inStock: true 
        },
        { 
          name: "UND PAIOL OURO", 
          price: 150, 
          description: "Unidade de paiol ouro", 
          imageUrl: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 6,
          inStock: true 
        },
        { 
          name: "UND PAIOL TRADICIONAL E MAMA CADELA", 
          price: 100, 
          description: "Unidade de paiol tradicional", 
          imageUrl: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 6,
          inStock: true 
        }
      ];

      for (const product of productsList) {
        await this.createProduct(product);
      }
    }

    // Create loyalty rewards
    if (this.loyaltyRewards.size === 0) {
      const rewardsList = [
        { 
          name: "Corte Grátis", 
          description: "Um corte masculino grátis", 
          pointsRequired: 200, 
          icon: "cut",
          isActive: true 
        },
        { 
          name: "15% de Desconto", 
          description: "15% de desconto em qualquer serviço", 
          pointsRequired: 100, 
          icon: "percentage",
          isActive: true 
        },
        { 
          name: "Cerveja Grátis", 
          description: "Uma cerveja long neck grátis", 
          pointsRequired: 50, 
          icon: "beer",
          isActive: true 
        },
        { 
          name: "Barba Grátis", 
          description: "Um serviço de barba grátis", 
          pointsRequired: 150, 
          icon: "razor",
          isActive: true 
        },
        { 
          name: "Produto com 20% OFF", 
          description: "20% de desconto em qualquer produto", 
          pointsRequired: 75, 
          icon: "tag",
          isActive: true 
        }
      ];

      for (const reward of rewardsList) {
        await this.createLoyaltyReward(reward);
      }
    }
  }
}

// PostgreSQL Database Storage Implementation
export class DatabaseStorage implements IStorage {
  private pool: any;
  sessionStore: session.Store;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool: this.pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id)
    });
    return result || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username)
    });
    return result || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(schema.users)
      .values({
        ...user,
        loyaltyPoints: 0,
        name: user.name || null,
        email: user.email || null,
        phone: user.phone || null
      })
      .returning();
    return result;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [result] = await db.update(schema.users)
      .set(userData)
      .where(eq(schema.users.id, id))
      .returning();
    return result || undefined;
  }

  // Service Category methods
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return await db.query.serviceCategories.findMany();
  }

  async getServiceCategory(id: number): Promise<ServiceCategory | undefined> {
    const result = await db.query.serviceCategories.findFirst({
      where: (serviceCategories, { eq }) => eq(serviceCategories.id, id)
    });
    return result || undefined;
  }

  async createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory> {
    const [result] = await db.insert(schema.serviceCategories)
      .values(category)
      .returning();
    return result;
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return await db.query.services.findMany();
  }

  async getService(id: number): Promise<Service | undefined> {
    const result = await db.query.services.findFirst({
      where: (services, { eq }) => eq(services.id, id)
    });
    return result || undefined;
  }

  async getServicesByCategory(categoryId: number): Promise<Service[]> {
    return await db.query.services.findMany({
      where: (services, { eq }) => eq(services.categoryId, categoryId)
    });
  }

  async createService(service: InsertService): Promise<Service> {
    const [result] = await db.insert(schema.services)
      .values({
        ...service,
        price: service.price ?? null,
        priceType: service.priceType ?? null,
        description: service.description ?? null
      })
      .returning();
    return result;
  }

  // Professional methods
  async getProfessionals(): Promise<Professional[]> {
    return await db.query.professionals.findMany();
  }

  async getProfessional(id: number): Promise<Professional | undefined> {
    const result = await db.query.professionals.findFirst({
      where: (professionals, { eq }) => eq(professionals.id, id)
    });
    return result || undefined;
  }

  async createProfessional(professional: InsertProfessional): Promise<Professional> {
    const [result] = await db.insert(schema.professionals)
      .values({
        ...professional,
        reviewCount: 0,
        avatar: professional.avatar ?? null,
        rating: professional.rating ?? null,
        specialties: professional.specialties ?? null,
        bio: professional.bio ?? null
      })
      .returning();
    return result;
  }

  // Schedule methods
  async getSchedules(professionalId: number): Promise<Schedule[]> {
    return await db.query.schedules.findMany({
      where: (schedules, { eq }) => eq(schedules.professionalId, professionalId)
    });
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const [result] = await db.insert(schema.schedules)
      .values({
        ...schedule,
        isAvailable: schedule.isAvailable ?? null
      })
      .returning();
    return result;
  }

  // Appointment methods
  async getAppointments(userId?: number, professionalId?: number, date?: string): Promise<Appointment[]> {
    let query = db.query.appointments.findMany();

    // Aplicar filtros se necessário
    if (userId !== undefined || professionalId !== undefined || date !== undefined) {
      query = db.query.appointments.findMany({
        where: (appointments, { eq, and }) => {
          const conditions = [];
          if (userId !== undefined) conditions.push(eq(appointments.userId, userId));
          if (professionalId !== undefined) conditions.push(eq(appointments.professionalId, professionalId));
          if (date !== undefined) conditions.push(eq(appointments.date, date));
          return and(...conditions);
        }
      });
    }

    return await query;
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const result = await db.query.appointments.findFirst({
      where: (appointments, { eq }) => eq(appointments.id, id)
    });
    return result || undefined;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [result] = await db.insert(schema.appointments)
      .values({
        ...appointment,
        createdAt: new Date(),
        status: appointment.status ?? null,
        notes: appointment.notes ?? null
      })
      .returning();
    return result;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const [result] = await db.update(schema.appointments)
      .set({ status })
      .where(eq(schema.appointments.id, id))
      .returning();
    return result || undefined;
  }

  // Appointment Service methods
  async getAppointmentServices(appointmentId: number): Promise<AppointmentService[]> {
    return await db.query.appointmentServices.findMany({
      where: (appointmentServices, { eq }) => eq(appointmentServices.appointmentId, appointmentId)
    });
  }

  async createAppointmentService(appointmentService: InsertAppointmentService): Promise<AppointmentService> {
    const [result] = await db.insert(schema.appointmentServices)
      .values(appointmentService)
      .returning();
    return result;
  }

  // Product Category methods
  async getProductCategories(): Promise<ProductCategory[]> {
    return await db.query.productCategories.findMany();
  }

  async getProductCategory(id: number): Promise<ProductCategory | undefined> {
    const result = await db.query.productCategories.findFirst({
      where: (productCategories, { eq }) => eq(productCategories.id, id)
    });
    return result || undefined;
  }

  async createProductCategory(category: InsertProductCategory): Promise<ProductCategory> {
    const [result] = await db.insert(schema.productCategories)
      .values(category)
      .returning();
    return result;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.query.products.findMany();
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.id, id)
    });
    return result || undefined;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db.query.products.findMany({
      where: (products, { eq }) => eq(products.categoryId, categoryId)
    });
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [result] = await db.insert(schema.products)
      .values({
        ...product,
        description: product.description ?? null,
        imageUrl: product.imageUrl ?? null,
        inStock: product.inStock ?? null
      })
      .returning();
    return result;
  }

  // Loyalty Reward methods
  async getLoyaltyRewards(): Promise<LoyaltyReward[]> {
    return await db.query.loyaltyRewards.findMany();
  }

  async getLoyaltyReward(id: number): Promise<LoyaltyReward | undefined> {
    const result = await db.query.loyaltyRewards.findFirst({
      where: (loyaltyRewards, { eq }) => eq(loyaltyRewards.id, id)
    });
    return result || undefined;
  }

  async createLoyaltyReward(reward: InsertLoyaltyReward): Promise<LoyaltyReward> {
    const [result] = await db.insert(schema.loyaltyRewards)
      .values({
        ...reward,
        icon: reward.icon ?? null,
        description: reward.description ?? null,
        isActive: reward.isActive ?? null
      })
      .returning();
    return result;
  }

  // Initialize demo data
  async initializeDemoData(): Promise<void> {
    try {
      // Verificar se já existem dados
      const userCount = await db.select({ count: sql<number>`count(*)` }).from(schema.users);
      if (userCount[0].count > 0) {
        console.log('Dados já existem, pulando inicialização de dados de demonstração');
        return;
      }

      // Create demo user
      const [user] = await db.insert(schema.users)
        .values({
          username: "demo",
          password: "password",
          name: "Demo User",
          email: "demo@example.com",
          phone: "123-456-7890",
          loyaltyPoints: 125
        })
        .returning();

      // Create service categories
      const categoryData = [
        { name: "Cortes", icon: "cut" },
        { name: "Barba e Acabamentos", icon: "razor" },
        { name: "Tratamentos Faciais", icon: "spa" },
        { name: "Sobrancelha", icon: "eye" },
        { name: "Serviços Capilares", icon: "pump-soap" },
        { name: "Coloração e Tratamentos Especiais", icon: "paint-brush" }
      ];

      const categories = await db.insert(schema.serviceCategories)
        .values(categoryData)
        .returning();

      // Criar serviços
      const servicesData = [
        // Cortes
        { name: "Corte Masculino", price: 3000, priceType: "fixed", durationMinutes: 30, categoryId: 1, description: "Corte masculino completo" },
        { name: "Corte + Barba", price: 5000, priceType: "fixed", durationMinutes: 60, categoryId: 1, description: "Corte masculino com barba" },
        { name: "Corte + Barba + Sobrancelha na Navalha", price: null, priceType: "variable", durationMinutes: 60, categoryId: 1, description: "Corte, barba e sobrancelha" },
        // Mais serviços podem ser adicionados aqui...
      ];
      
      await db.insert(schema.services).values(servicesData);

      // Criar profissionais
      const professionalsData = [
        { 
          name: "Carlos", 
          avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80", 
          rating: 48, 
          reviewCount: 124, 
          specialties: ["Cortes", "Barba"], 
          bio: "Especialista em cortes modernos e barba tradicional." 
        },
        { 
          name: "Ricardo", 
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80", 
          rating: 49, 
          reviewCount: 89, 
          specialties: ["Degradê", "Coloração"], 
          bio: "Especialista em cortes degradê e técnicas de coloração." 
        }
        // Mais profissionais podem ser adicionados aqui...
      ];
      
      await db.insert(schema.professionals).values(professionalsData);

      // Criar categorias de produtos
      const productCategoriesData = [
        { name: "Barba e Cabelo", icon: "scissors" },
        { name: "Pomadas", icon: "disc" },
        { name: "Bebidas Alcoólicas", icon: "wine" },
        { name: "Bebidas Não Alcoólicas", icon: "coffee" },
        { name: "Lanches", icon: "burger" },
        { name: "Acessórios", icon: "tool" }
      ];
      
      await db.insert(schema.productCategories).values(productCategoriesData);

      // Criar produtos
      const productsData = [
        { 
          name: "Pomada Modeladora", 
          price: 4500, 
          categoryId: 2, 
          description: "Pomada modeladora de fixação forte", 
          imageUrl: "https://images.unsplash.com/photo-1581084349663-9c6d4d866e39?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80", 
          inStock: true 
        },
        { 
          name: "Óleo para Barba", 
          price: 3500, 
          categoryId: 1, 
          description: "Óleo hidratante para barba", 
          imageUrl: "https://images.unsplash.com/photo-1621607512292-08572ed1e481?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80", 
          inStock: true 
        }
        // Mais produtos podem ser adicionados aqui...
      ];
      
      await db.insert(schema.products).values(productsData);

      // Criar recompensas de fidelidade
      const loyaltyRewardsData = [
        { 
          name: "Corte Gratuito", 
          pointsRequired: 500, 
          description: "Um corte de cabelo gratuito", 
          icon: "cut", 
          isActive: true 
        },
        { 
          name: "Barba Gratuita", 
          pointsRequired: 300, 
          description: "Um serviço de barba gratuito", 
          icon: "razor", 
          isActive: true 
        },
        { 
          name: "Desconto de 15%", 
          pointsRequired: 200, 
          description: "15% de desconto em qualquer serviço", 
          icon: "percent", 
          isActive: true 
        }
      ];
      
      await db.insert(schema.loyaltyRewards).values(loyaltyRewardsData);

      console.log('Dados de demonstração inicializados com sucesso!');
    } catch (error) {
      console.error('Erro ao inicializar dados de demonstração:', error);
    }
  }
}

// Usar DatabaseStorage em vez de MemStorage para armazenamento permanente
export const storage = new DatabaseStorage();
