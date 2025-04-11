
import supabase from './supabase';
import { db } from './db';
import * as schema from '@shared/schema';
import bcrypt from 'bcrypt';
import {
  InsertUser, InsertServiceCategory, InsertService, InsertProfessional,
  InsertSchedule, InsertAppointment, InsertAppointmentService,
  InsertProductCategory, InsertProduct, InsertLoyaltyReward
} from '@shared/schema';
import MemoryStore from 'memorystore';
import session from 'express-session';

// Definindo o tipo de retorno das funções de autenticação do Supabase
interface SupabaseAuthResponse {
  data: {
    user: any;
    session: any;
  } | null;
  error: {
    message: string;
  } | null;
}

// Criando o Memory Store para sessões
const MemoryStoreConstructor = MemoryStore(session);

export const supabaseStorage = {
  // Métodos de autenticação do Supabase
  sessionStore: new MemoryStoreConstructor({
    checkPeriod: 86400000 // limpar sessões expiradas a cada 24h
  }),
  
  // Método para autenticar com o Supabase
  async authenticateWithSupabase(email: string, password: string): Promise<SupabaseAuthResponse> {
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return response;
    } catch (error) {
      console.error('Erro na autenticação com Supabase:', error);
      return {
        data: null,
        error: {
          message: 'Falha na autenticação'
        }
      };
    }
  },
  
  // Método para logout do Supabase
  async signOutFromSupabase() {
    try {
      return await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout do Supabase:', error);
      throw error;
    }
  },
  
  // Método para recuperar o usuário atual do Supabase Auth
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Erro ao obter usuário atual:', error);
        return null;
      }
      return data.user;
    } catch (error) {
      console.error('Exceção ao obter usuário atual:', error);
      return null;
    }
  },
  
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
    try {
      console.log('Buscando usuário com username:', username);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) {
        console.error('Erro ao buscar usuário por username:', error);
        return null;
      }
      
      if (!data) {
        console.log('Nenhum usuário encontrado com username:', username);
        return null;
      }
      
      console.log('Usuário encontrado:', data);
      return data;
    } catch (error) {
      console.error('Exceção ao buscar usuário por username:', error);
      return null;
    }
  },

  async createUser(userData: InsertUser) {
    try {
      // 1. Primeiro, criar o usuário no sistema de autenticação do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email || `${userData.username}@example.com`,
        password: userData.password,
        phone: userData.phone || undefined, // Adiciona o telefone diretamente
        options: {
          data: {
            username: userData.username,
            full_name: userData.name || "",
            display_name: userData.name || "", // Adiciona display_name explicitamente
            phone_number: userData.phone || "" // Adiciona phone_number explicitamente para metadados
          },
          emailRedirectTo: `${process.env.SITE_URL || 'http://localhost:3000'}/login`
        }
      });

      if (authError) {
        console.error('Erro ao criar usuário na autenticação do Supabase:', authError);
        throw authError;
      }

      if (!authData.user || !authData.user.id) {
        throw new Error('Falha ao criar usuário na autenticação do Supabase');
      }

      console.log('Usuário criado no Auth do Supabase com ID:', authData.user.id);

      // 2. Atualizar nome de exibição e telefone para o usuário no Supabase Auth
      const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
        phone: userData.phone ? userData.phone : undefined, // Atualiza o telefone principal (undefined se for null)
        data: { 
          full_name: userData.name || "", 
          display_name: userData.name || "",
          phone_number: userData.phone || "",
          phone: userData.phone || ""
        }
      });
      
      if (updateError) {
        console.error('Erro ao atualizar metadados do usuário no Supabase Auth:', updateError);
      } else {
        console.log('Metadados do usuário atualizados no Supabase Auth:', updatedUser?.user?.user_metadata);
      }

      // 3. Hash da senha para guardar no banco de dados local
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // 4. Inserir na tabela de usuários personalizada
      try {
        // Tentar inserir com todas as colunas incluindo auth_id e password
        const { data: user, error: userError } = await supabase
          .from('users')
          .insert({
            username: userData.username,
            email: userData.email,
            name: userData.name || null,
            phone: userData.phone || null,
            password: hashedPassword,
            auth_id: authData.user.id // Vincular com o ID de autenticação
          })
          .select()
          .single();
  
        if (userError) {
          console.error('Erro ao criar usuário na tabela users:', userError);
          
          // Tentar reverter a criação do usuário de autenticação
          try {
            await supabase.auth.admin.deleteUser(authData.user.id);
          } catch (deleteError) {
            console.error('Erro ao tentar reverter criação do usuário de autenticação:', deleteError);
          }
          
          throw userError;
        }
  
        console.log('Usuário criado com sucesso na tabela users e no Auth do Supabase');
        return user;
      } catch (insertError) {
        console.error('Erro durante inserção do usuário:', insertError);
        
        // Tentar reverter a criação do usuário de autenticação
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (deleteError) {
          console.error('Erro ao tentar reverter criação do usuário de autenticação:', deleteError);
        }
        
        throw insertError;
      }
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
    console.log(`Buscando serviço ID: ${id}`);
    
    const { data, error } = await supabase
      .from('services')
      .select('*, service_categories(*)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Erro ao buscar serviço ID ${id}:`, error);
      
      // Tentar novamente com uma consulta mais simples sem relacionamentos
      console.log(`Tentando busca alternativa para serviço ID ${id}...`);
      const { data: simpleData, error: simpleError } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();
        
      if (simpleError) {
        console.error(`Falha também na busca alternativa para serviço ID ${id}:`, simpleError);
        return null;
      }
      
      if (!simpleData) {
        console.error(`Serviço ID ${id} não encontrado mesmo na busca alternativa`);
        return null;
      }
      
      console.log(`Serviço ID ${id} recuperado via busca alternativa: ${simpleData.name}, preço: ${simpleData.price}`);
      
      // Transformar os nomes dos campos para camelCase para o frontend
      return {
        id: simpleData.id,
        name: simpleData.name,
        description: simpleData.description || '',
        price: simpleData.price,
        priceType: simpleData.price_type,
        durationMinutes: simpleData.duration_minutes,
        categoryId: simpleData.category_id,
        category: null // Não temos a categoria na busca alternativa
      };
    }
    
    console.log(`Serviço ID ${id} recuperado com sucesso: ${data.name}, preço: ${data.price}`);
    
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
  async getAppointments(options?: { userId?: number; professionalId?: number | undefined; date?: string }) {
    try {
      let query = supabase.from('appointments').select('*');
      
      if (options) {
        if (options.userId) {
          query = query.eq('user_id', options.userId);
        }
        
        if (options.professionalId) {
          query = query.eq('professional_id', options.professionalId);
        }
        
        if (options.date) {
          query = query.eq('date', options.date);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return [];
      }
      
      // Transformar os nomes dos campos para camelCase para o frontend
      return (data || []).map(appointment => ({
        id: appointment.id,
        userId: appointment.user_id,
        professionalId: appointment.professional_id,
        date: appointment.date,
        startTime: appointment.start_time,
        endTime: appointment.end_time,
        status: appointment.status,
        notes: appointment.notes,
        createdAt: appointment.created_at
      }));
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
    
    // Transformar os nomes dos campos para camelCase para o frontend
    return {
      id: data.id,
      userId: data.user_id,
      professionalId: data.professional_id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at
    };
  },

  async createAppointment(appointmentData: InsertAppointment) {
    // Converter camelCase para snake_case para o Supabase
    const supabaseData = {
      user_id: appointmentData.userId,
      professional_id: appointmentData.professionalId,
      date: appointmentData.date,
      start_time: appointmentData.startTime,
      end_time: appointmentData.endTime,
      status: appointmentData.status,
      notes: appointmentData.notes
    };
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(supabaseData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Transformar os nomes dos campos para camelCase para o frontend
    return {
      id: data.id,
      userId: data.user_id,
      professionalId: data.professional_id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at
    };
  },

  async updateAppointmentStatus(id: number, status: string, notes?: string) {
    try {
      // Preparar os dados para atualização
      const updateData: { status: string; notes?: string; completed_at?: string; total_value?: number } = { status };
      
      // Adicionar notes se fornecido
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      
      // Se o status for COMPLETED, adicionar data de conclusão e calcular o valor total
      if (status === 'COMPLETED') {
        // Adicionar data de conclusão
        updateData.completed_at = new Date().toISOString();
        
        // Calcular valor total do agendamento
        try {
          // Buscar serviços do agendamento
          const { data: appointmentServices, error: servicesError } = await supabase
            .from('appointment_services')
            .select('*')
            .eq('appointment_id', id);
          
          if (servicesError) {
            console.error('Erro ao buscar serviços do agendamento:', servicesError);
          } else if (appointmentServices && appointmentServices.length > 0) {
            // Buscar detalhes de cada serviço com logs detalhados
            let totalValue = 0;
            
            for (const as of appointmentServices) {
              console.log(`Buscando detalhes do serviço ID ${as.service_id} para o agendamento ${id}...`);
              
              const { data: service, error: serviceError } = await supabase
                .from('services')
                .select('*')
                .eq('id', as.service_id)
                .single();
              
              if (serviceError) {
                console.error(`Erro ao buscar serviço ID ${as.service_id}:`, serviceError);
                continue;
              }
              
              if (!service) {
                console.error(`Serviço ID ${as.service_id} não encontrado no banco de dados.`);
                continue;
              }
              
              totalValue += service.price || 0;
              console.log(`Adicionando valor do serviço ID ${as.service_id} (${service.name}): R$ ${(service.price/100).toFixed(2)}`);
            }
            
            // Adicionar valor total ao agendamento
            if (totalValue > 0) {
              updateData.total_value = totalValue;
              console.log(`Valor total calculado para o agendamento #${id}:`, totalValue);
            }
          }
        } catch (calcError) {
          console.error('Erro ao calcular valor total do agendamento:', calcError);
        }
      }
      
      // Atualizar o agendamento no banco de dados
      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar status do agendamento:', error);
        return null;
      }
      
      // Transformar os nomes dos campos para camelCase para o frontend
      return {
        id: data.id,
        userId: data.user_id,
        professionalId: data.professional_id,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        status: data.status,
        notes: data.notes,
        createdAt: data.created_at,
        completedAt: data.completed_at,
        totalValue: data.total_value
      };
    } catch (error) {
      console.error('Erro geral ao atualizar status do agendamento:', error);
      return null;
    }
  },

  // Serviços de Agendamento
  async getAppointmentServices(appointmentId: number) {
    const { data, error } = await supabase
      .from('appointment_services')
      .select('*')
      .eq('appointment_id', appointmentId);
    
    if (error) throw error;
    
    // Transformar os nomes dos campos para camelCase para o frontend
    return (data || []).map(service => ({
      id: service.id,
      appointmentId: service.appointment_id,
      serviceId: service.service_id
    }));
  },

  async createAppointmentService(appointmentServiceData: InsertAppointmentService) {
    // Converter camelCase para snake_case para o Supabase
    const supabaseData = {
      appointment_id: appointmentServiceData.appointmentId,
      service_id: appointmentServiceData.serviceId
    };
    
    const { data, error } = await supabase
      .from('appointment_services')
      .insert(supabaseData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Transformar os nomes dos campos para camelCase para o frontend
    return {
      id: data.id,
      appointmentId: data.appointment_id,
      serviceId: data.service_id
    };
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

  // Excluir agendamento
  async deleteAppointment(id: number) {
    try {
      // Primeiro, excluir os serviços relacionados ao agendamento
      await supabase
        .from('appointment_services')
        .delete()
        .eq('appointment_id', id);
      
      // Depois, excluir o agendamento em si
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao excluir agendamento:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Exceção ao excluir agendamento:', err);
      return false;
    }
  },
  
  // Obter profissional por ID de usuário
  async getProfessionalByUserId(userId: number) {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error || !data) return null;
      
      return {
        id: data.id,
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        specialty: data.specialty || '',
        bio: data.bio || '',
        imageUrl: data.image_url || null,
        userId: data.user_id
      };
    } catch (err) {
      console.error('Exceção ao buscar profissional por userId:', err);
      return null;
    }
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
