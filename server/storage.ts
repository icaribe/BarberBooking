import { db } from './db';
import { supabase } from './supabase';
import { supabaseStorage } from './storage-supabase';
import * as schema from '@shared/schema';
import bcrypt from 'bcrypt';
import {
  InsertUser, InsertServiceCategory, InsertService, InsertProfessional,
  InsertSchedule, InsertAppointment, InsertAppointmentService,
  InsertProductCategory, InsertProduct, InsertLoyaltyReward
} from '@shared/schema';

// Verificar se devemos usar Supabase ou o banco de dados local
// Definido como true para forçar o uso do Supabase
const useSupabase = process.env.USE_SUPABASE === 'true' || true; // Sempre usar Supabase

// Exportar o armazenamento do Supabase se for para usar o Supabase
export const storage = useSupabase ? supabaseStorage : {
  // Usuários
  async getUsers() {
    return db.select().from(schema.users);
  },

  async getUser(id: number) {
    const result = await db.select().from(schema.users).where(({ id: userId }) => userId.eq(id));
    return result.length > 0 ? result[0] : null;
  },

  async getUserByUsername(username: string) {
    const result = await db.select().from(schema.users).where(({ username: u }) => u.eq(username));
    return result.length > 0 ? result[0] : null;
  },

  async createUser(userData: InsertUser) {
    // Hash da senha
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const result = await db.insert(schema.users).values({
      ...userData,
      password: hashedPassword
    }).returning();

    return result[0];
  },

  async updateUser(id: number, userData: Partial<InsertUser>) {
    // Se a senha estiver sendo atualizada, fazer o hash
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const result = await db.update(schema.users)
      .set(userData)
      .where(({ id: userId }) => userId.eq(id))
      .returning();

    return result.length > 0 ? result[0] : null;
  },

  // Categorias de Serviços
  async getServiceCategories() {
    return db.select().from(schema.serviceCategories);
  },

  async getServiceCategory(id: number) {
    const result = await db.select().from(schema.serviceCategories).where(({ id: categoryId }) => categoryId.eq(id));
    return result.length > 0 ? result[0] : null;
  },

  async createServiceCategory(categoryData: InsertServiceCategory) {
    const result = await db.insert(schema.serviceCategories).values(categoryData).returning();
    return result[0];
  },

  // Serviços
  async getServices() {
    return db.select().from(schema.services);
  },

  async getServicesByCategory(categoryId: number) {
    return db.select().from(schema.services).where(({ categoryId: id }) => id.eq(categoryId));
  },

  async getService(id: number) {
    const result = await db.select().from(schema.services).where(({ id: serviceId }) => serviceId.eq(id));
    return result.length > 0 ? result[0] : null;
  },

  async createService(serviceData: InsertService) {
    const result = await db.insert(schema.services).values(serviceData).returning();
    return result[0];
  },

  // Profissionais
  async getProfessionals() {
    return db.select().from(schema.professionals);
  },

  async getProfessional(id: number) {
    const result = await db.select().from(schema.professionals).where(({ id: professionalId }) => professionalId.eq(id));
    return result.length > 0 ? result[0] : null;
  },

  async createProfessional(professionalData: InsertProfessional) {
    const result = await db.insert(schema.professionals).values(professionalData).returning();
    return result[0];
  },

  // Agendas
  async getSchedules(professionalId: number) {
    return db.select().from(schema.schedules).where(({ professionalId: id }) => id.eq(professionalId));
  },

  async createSchedule(scheduleData: InsertSchedule) {
    const result = await db.insert(schema.schedules).values(scheduleData).returning();
    return result[0];
  },

  // Agendamentos
  async getAppointments(userId?: number, professionalId?: number, date?: string) {
    let query = db.select().from(schema.appointments);

    if (userId) {
      query = query.where(({ userId: id }) => id.eq(userId));
    }

    if (professionalId) {
      query = query.where(({ professionalId: id }) => id.eq(professionalId));
    }

    if (date) {
      query = query.where(({ date: d }) => d.eq(date));
    }

    return query;
  },

  async getAppointment(id: number) {
    const result = await db.select().from(schema.appointments).where(({ id: appointmentId }) => appointmentId.eq(id));
    return result.length > 0 ? result[0] : null;
  },

  async createAppointment(appointmentData: InsertAppointment) {
    const result = await db.insert(schema.appointments).values(appointmentData).returning();
    return result[0];
  },

  async updateAppointmentStatus(id: number, status: string) {
    const result = await db.update(schema.appointments)
      .set({ status })
      .where(({ id: appointmentId }) => appointmentId.eq(id))
      .returning();

    return result.length > 0 ? result[0] : null;
  },

  // Serviços de Agendamento
  async getAppointmentServices(appointmentId: number) {
    return db.select().from(schema.appointmentServices).where(({ appointmentId: id }) => id.eq(appointmentId));
  },

  async createAppointmentService(appointmentServiceData: InsertAppointmentService) {
    const result = await db.insert(schema.appointmentServices).values(appointmentServiceData).returning();
    return result[0];
  },

  // Categorias de Produtos
  async getProductCategories() {
    return db.select().from(schema.productCategories);
  },

  async getProductCategory(id: number) {
    const result = await db.select().from(schema.productCategories).where(({ id: categoryId }) => categoryId.eq(id));
    return result.length > 0 ? result[0] : null;
  },

  async createProductCategory(categoryData: InsertProductCategory) {
    const result = await db.insert(schema.productCategories).values(categoryData).returning();
    return result[0];
  },

  // Produtos
  async getProducts() {
    return db.select().from(schema.products);
  },

  async getProductsByCategory(categoryId: number) {
    return db.select().from(schema.products).where(({ categoryId: id }) => id.eq(categoryId));
  },

  async getProduct(id: number) {
    const result = await db.select().from(schema.products).where(({ id: productId }) => productId.eq(id));
    return result.length > 0 ? result[0] : null;
  },

  async createProduct(productData: InsertProduct) {
    const result = await db.insert(schema.products).values(productData).returning();
    return result[0];
  },

  // Recompensas de Fidelidade
  async getLoyaltyRewards() {
    return db.select().from(schema.loyaltyRewards);
  },

  async getLoyaltyReward(id: number) {
    const result = await db.select().from(schema.loyaltyRewards).where(({ id: rewardId }) => rewardId.eq(id));
    return result.length > 0 ? result[0] : null;
  },

  async createLoyaltyReward(rewardData: InsertLoyaltyReward) {
    const result = await db.insert(schema.loyaltyRewards).values(rewardData).returning();
    return result[0];
  },
  sessionStore: null, // Placeholder - Session store needs to be handled separately
  initializeDemoData: () => {} // Placeholder -  Demo data initialization is not handled here
};