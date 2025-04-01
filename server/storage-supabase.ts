
import supabase from './supabase';
import { db } from './db';
import * as schema from '@shared/schema';
import bcrypt from 'bcrypt';
import {
  InsertUser, InsertServiceCategory, InsertService, InsertProfessional,
  InsertSchedule, InsertAppointment, InsertAppointmentService,
  InsertProductCategory, InsertProduct, InsertLoyaltyReward
} from '@shared/schema';

export const supabaseStorage = {
  // Usuários
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async getUser(id: number) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },

  async getUserByUsername(username: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) return null;
    return data;
  },

  async createUser(userData: InsertUser) {
    try {
      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Remover id se existir para deixar o Supabase gerar automaticamente
      const { id, ...userDataWithoutId } = userData as any;
      
      const { data, error } = await supabase
        .from('users')
        .insert({ ...userDataWithoutId, password: hashedPassword })
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar usuário no Supabase:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Exceção ao criar usuário:', error);
      throw error;
    }
  },

  async updateUser(id: number, userData: Partial<InsertUser>) {
    // Se a senha estiver sendo atualizada, fazer o hash
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Categorias de Serviços
  async getServiceCategories() {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async getServiceCategory(id: number) {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },

  async createServiceCategory(categoryData: InsertServiceCategory) {
    const { data, error } = await supabase
      .from('service_categories')
      .insert(categoryData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Serviços
  async getServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*, service_categories(*)');
    
    if (error) throw error;
    
    // Transformar os nomes dos campos para camelCase para o frontend
    return data.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description || '',
      price: service.price,
      priceType: service.price_type,
      durationMinutes: service.duration_minutes,
      categoryId: service.category_id,
      category: service.service_categories
    }));
  },

  async getServicesByCategory(categoryId: number) {
    const { data, error } = await supabase
      .from('services')
      .select('*, service_categories(*)')
      .eq('category_id', categoryId);
    
    if (error) throw error;
    
    // Transformar os nomes dos campos para camelCase para o frontend
    return data.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description || '',
      price: service.price,
      priceType: service.price_type,
      durationMinutes: service.duration_minutes,
      categoryId: service.category_id,
      category: service.service_categories
    }));
  },

  async getService(id: number) {
    const { data, error } = await supabase
      .from('services')
      .select('*, service_categories(*)')
      .eq('id', id)
      .single();
    
    if (error) return null;
    
    // Transformar os nomes dos campos para camelCase para o frontend
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      price: data.price,
      priceType: data.price_type,
      durationMinutes: data.duration_minutes,
      categoryId: data.category_id,
      category: data.service_categories
    };
  },

  async createService(serviceData: InsertService) {
    const { data, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Profissionais
  async getProfessionals() {
    const { data, error } = await supabase
      .from('professionals')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async getProfessional(id: number) {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },

  async createProfessional(professionalData: InsertProfessional) {
    const { data, error } = await supabase
      .from('professionals')
      .insert(professionalData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Agendas
  async getSchedules(professionalId: number) {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('professionalId', professionalId);
    
    if (error) throw error;
    return data;
  },

  async createSchedule(scheduleData: InsertSchedule) {
    const { data, error } = await supabase
      .from('schedules')
      .insert(scheduleData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Agendamentos
  async getAppointments(userId?: number, professionalId?: number, date?: string) {
    try {
      let query = supabase.from('appointments').select('*');
      
      if (userId) {
        query = query.eq('userId', userId);
      }
      
      if (professionalId) {
        query = query.eq('professionalId', professionalId);
      }
      
      if (date) {
        query = query.eq('date', date);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Exceção ao buscar agendamentos:', err);
      return [];
    }
  },

  async getAppointment(id: number) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },

  async createAppointment(appointmentData: InsertAppointment) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAppointmentStatus(id: number, status: string) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) return null;
    return data;
  },

  // Serviços de Agendamento
  async getAppointmentServices(appointmentId: number) {
    const { data, error } = await supabase
      .from('appointment_services')
      .select('*')
      .eq('appointmentId', appointmentId);
    
    if (error) throw error;
    return data;
  },

  async createAppointmentService(appointmentServiceData: InsertAppointmentService) {
    const { data, error } = await supabase
      .from('appointment_services')
      .insert(appointmentServiceData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Categorias de Produtos
  async getProductCategories() {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async getProductCategory(id: number) {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },

  async createProductCategory(categoryData: InsertProductCategory) {
    const { data, error } = await supabase
      .from('product_categories')
      .insert(categoryData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Produtos
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_categories(*)');
    
    if (error) throw error;
    
    // Transformar os nomes dos campos para camelCase para o frontend
    return data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      stockQuantity: product.in_stock ? 1 : 0,
      categoryId: product.category_id,
      imageUrl: product.image_url || null,
      category: product.product_categories
    }));
  },

  async getProductsByCategory(categoryId: number) {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_categories(*)')
      .eq('category_id', categoryId);
    
    if (error) throw error;
    
    // Transformar os nomes dos campos para camelCase para o frontend
    return data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      stockQuantity: product.in_stock ? 1 : 0,
      categoryId: product.category_id,
      imageUrl: product.image_url || null,
      category: product.product_categories
    }));
  },

  async getProduct(id: number) {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_categories(*)')
      .eq('id', id)
      .single();
    
    if (error) return null;
    
    // Transformar os nomes dos campos para camelCase para o frontend
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      price: data.price,
      stockQuantity: data.in_stock ? 1 : 0,
      categoryId: data.category_id,
      imageUrl: data.image_url || null,
      category: data.product_categories
    };
  },

  async createProduct(productData: InsertProduct) {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Recompensas de Fidelidade
  async getLoyaltyRewards() {
    const { data, error } = await supabase
      .from('loyalty_rewards')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async getLoyaltyReward(id: number) {
    const { data, error } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },

  async createLoyaltyReward(rewardData: InsertLoyaltyReward) {
    const { data, error } = await supabase
      .from('loyalty_rewards')
      .insert(rewardData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
