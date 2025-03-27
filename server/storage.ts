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
    // Create demo user
    if (this.users.size === 0) {
      await this.createUser({
        username: "demo",
        password: "password",
        name: "Demo User",
        email: "demo@example.com",
        phone: "123-456-7890"
      });

      // Update user with loyalty points
      await this.updateUser(1, { loyaltyPoints: 125 });
    }

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
          name: "Foxidil minoxidil para barba (fox) 120 ml", 
          price: 9000, 
          description: "Minoxidil para crescimento de barba", 
          imageUrl: "https://images.unsplash.com/photo-1669155309185-9d61617694ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
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
          name: "Óleo de Barba Lenhador Kerafyto", 
          price: 3000, 
          description: "Óleo para barba com aroma amadeirado", 
          imageUrl: "https://images.unsplash.com/photo-1632863341020-e96fd96ab2d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 1,
          inStock: true 
        },
        
        // Pomadas e Produtos para Estilização
        { 
          name: "Pomada Modeladora Caramelo", 
          price: 3000, 
          description: "Pomada modeladora com acabamento natural", 
          imageUrl: "https://images.unsplash.com/photo-1631112426993-460fa457c4d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
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
          name: "Cera Red Neck Vermelha", 
          price: 2000, 
          description: "Cera modeladora com fixação média", 
          imageUrl: "https://images.unsplash.com/photo-1626784215021-2e39ccf641a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
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
          name: "DOSE WHISKEY JACK DANIELS", 
          price: 1600, 
          description: "Dose de whiskey Jack Daniel's", 
          imageUrl: "https://images.unsplash.com/photo-1541795795328-f073b763494e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 3,
          inStock: true 
        },
        
        // Bebidas Não Alcoólicas
        { 
          name: "Monster Tradicional 473ml", 
          price: 1000, 
          description: "Energético Monster sabor tradicional", 
          imageUrl: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        { 
          name: "COCA-COLA LATA 310ML", 
          price: 450, 
          description: "Refrigerante Coca-Cola em lata", 
          imageUrl: "https://images.unsplash.com/photo-1629654613528-5d0a2e4223e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 4,
          inStock: true 
        },
        
        // Lanches e Snacks
        { 
          name: "Chocolate Lacta ao leite 34g", 
          price: 400, 
          description: "Chocolate ao leite em barra", 
          imageUrl: "https://images.unsplash.com/photo-1621424093419-eeadd568272b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        { 
          name: "Trident (menta verde) 8g", 
          price: 300, 
          description: "Chiclete sabor menta", 
          imageUrl: "https://images.unsplash.com/photo-1582389435979-5933765215db?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 5,
          inStock: true 
        },
        
        // Acessórios e Outros
        { 
          name: "Navalha", 
          price: 3000, 
          description: "Navalha profissional", 
          imageUrl: "https://images.unsplash.com/photo-1617792945864-4a5cb3b3c6e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
          categoryId: 6,
          inStock: true 
        },
        { 
          name: "Pente", 
          price: 2500, 
          description: "Pente profissional para cabelo", 
          imageUrl: "https://images.unsplash.com/photo-1635368675936-8f126a662fb2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300", 
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
          pointsCost: 200, 
          icon: "cut",
          isActive: true 
        },
        { 
          name: "15% de Desconto", 
          description: "15% de desconto em qualquer serviço", 
          pointsCost: 100, 
          icon: "percentage",
          isActive: true 
        },
        { 
          name: "Cerveja Grátis", 
          description: "Uma cerveja long neck grátis", 
          pointsCost: 50, 
          icon: "beer",
          isActive: true 
        },
        { 
          name: "Barba Grátis", 
          description: "Um serviço de barba grátis", 
          pointsCost: 150, 
          icon: "razor",
          isActive: true 
        },
        { 
          name: "Produto com 20% OFF", 
          description: "20% de desconto em qualquer produto", 
          pointsCost: 75, 
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

export const storage = new MemStorage();
