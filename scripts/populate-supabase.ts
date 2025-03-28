
import { db } from '../server/db';
import { supabase } from '../server/supabase';
import * as schema from '../shared/schema';

async function populateTables() {
  console.log('Iniciando população das tabelas no Supabase...');

  try {
    // 1. Migrar usuários
    console.log('Migrando usuários...');
    const users = await db.select().from(schema.users);
    
    if (users.length > 0) {
      // Transformar dados para corresponder às colunas da tabela no Supabase
      const supabaseUsers = users.map(user => {
        // Mapear loyaltyPoints para loyalty_points (nome correto no Supabase)
        const { loyaltyPoints, ...userData } = user;
        return {
          ...userData,
          loyalty_points: loyaltyPoints
        };
      });
      
      const { error } = await supabase
        .from('users')
        .upsert(supabaseUsers);
      
      if (error) throw error;
      console.log(`✅ ${users.length} usuários migrados com sucesso.`);
    } else {
      console.log('Nenhum usuário encontrado para migrar.');
    }

    // 2. Migrar categorias de serviços
    console.log('Migrando categorias de serviços...');
    const serviceCategories = await db.select().from(schema.serviceCategories);
    
    if (serviceCategories.length > 0) {
      const { error } = await supabase
        .from('service_categories')
        .upsert(serviceCategories);
      
      if (error) throw error;
      console.log(`✅ ${serviceCategories.length} categorias de serviços migradas com sucesso.`);
    } else {
      console.log('Nenhuma categoria de serviço encontrada para migrar.');
    }

    // 3. Migrar serviços
    console.log('Migrando serviços...');
    const services = await db.select().from(schema.services);
    
    if (services.length > 0) {
      const { error } = await supabase
        .from('services')
        .upsert(services);
      
      if (error) throw error;
      console.log(`✅ ${services.length} serviços migrados com sucesso.`);
    } else {
      console.log('Nenhum serviço encontrado para migrar.');
    }

    // 4. Migrar profissionais
    console.log('Migrando profissionais...');
    const professionals = await db.select().from(schema.professionals);
    
    if (professionals.length > 0) {
      const { error } = await supabase
        .from('professionals')
        .upsert(professionals);
      
      if (error) throw error;
      console.log(`✅ ${professionals.length} profissionais migrados com sucesso.`);
    } else {
      console.log('Nenhum profissional encontrado para migrar.');
    }

    // 5. Migrar horários
    console.log('Migrando horários...');
    const schedules = await db.select().from(schema.schedules);
    
    if (schedules.length > 0) {
      const { error } = await supabase
        .from('schedules')
        .upsert(schedules);
      
      if (error) throw error;
      console.log(`✅ ${schedules.length} horários migrados com sucesso.`);
    } else {
      console.log('Nenhum horário encontrado para migrar.');
    }

    // 6. Migrar agendamentos
    console.log('Migrando agendamentos...');
    const appointments = await db.select().from(schema.appointments);
    
    if (appointments.length > 0) {
      const { error } = await supabase
        .from('appointments')
        .upsert(appointments);
      
      if (error) throw error;
      console.log(`✅ ${appointments.length} agendamentos migrados com sucesso.`);
    } else {
      console.log('Nenhum agendamento encontrado para migrar.');
    }

    // 7. Migrar serviços de agendamento
    console.log('Migrando serviços de agendamento...');
    const appointmentServices = await db.select().from(schema.appointmentServices);
    
    if (appointmentServices.length > 0) {
      const { error } = await supabase
        .from('appointment_services')
        .upsert(appointmentServices);
      
      if (error) throw error;
      console.log(`✅ ${appointmentServices.length} serviços de agendamento migrados com sucesso.`);
    } else {
      console.log('Nenhum serviço de agendamento encontrado para migrar.');
    }

    // 8. Migrar categorias de produtos
    console.log('Migrando categorias de produtos...');
    const productCategories = await db.select().from(schema.productCategories);
    
    if (productCategories.length > 0) {
      const { error } = await supabase
        .from('product_categories')
        .upsert(productCategories);
      
      if (error) throw error;
      console.log(`✅ ${productCategories.length} categorias de produtos migradas com sucesso.`);
    } else {
      console.log('Nenhuma categoria de produto encontrada para migrar.');
    }

    // 9. Migrar produtos
    console.log('Migrando produtos...');
    const products = await db.select().from(schema.products);
    
    if (products.length > 0) {
      const { error } = await supabase
        .from('products')
        .upsert(products);
      
      if (error) throw error;
      console.log(`✅ ${products.length} produtos migrados com sucesso.`);
    } else {
      console.log('Nenhum produto encontrado para migrar.');
    }

    // 10. Migrar recompensas de fidelidade
    console.log('Migrando recompensas de fidelidade...');
    const loyaltyRewards = await db.select().from(schema.loyaltyRewards);
    
    if (loyaltyRewards.length > 0) {
      const { error } = await supabase
        .from('loyalty_rewards')
        .upsert(loyaltyRewards);
      
      if (error) throw error;
      console.log(`✅ ${loyaltyRewards.length} recompensas de fidelidade migradas com sucesso.`);
    } else {
      console.log('Nenhuma recompensa de fidelidade encontrada para migrar.');
    }

    console.log('✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a migração de dados:', error);
    // Exibir mensagem de erro mais detalhada
    if (error.message) {
      console.error('Mensagem de erro:', error.message);
    }
    if (error.code) {
      console.error('Código de erro:', error.code);
    }
  }
}

// Executar função de migração
populateTables();
