
import { db } from '../server/db';
import { supabase } from '../server/supabase';
import * as schema from '../shared/schema';

async function migrateData() {
  console.log('Iniciando migração para o Supabase...');

  try {
    // 1. Migrar usuários
    console.log('Migrando usuários...');
    const users = await db.select().from(schema.users);
    
    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .upsert(user);
      
      if (error) throw error;
    }
    console.log(`${users.length} usuários migrados com sucesso.`);

    // 2. Migrar categorias de serviços
    console.log('Migrando categorias de serviços...');
    const serviceCategories = await db.select().from(schema.serviceCategories);
    
    for (const category of serviceCategories) {
      const { error } = await supabase
        .from('service_categories')
        .upsert(category);
      
      if (error) throw error;
    }
    console.log(`${serviceCategories.length} categorias de serviços migradas com sucesso.`);

    // 3. Migrar serviços
    console.log('Migrando serviços...');
    const services = await db.select().from(schema.services);
    
    for (const service of services) {
      const { error } = await supabase
        .from('services')
        .upsert(service);
      
      if (error) throw error;
    }
    console.log(`${services.length} serviços migrados com sucesso.`);

    // 4. Migrar profissionais
    console.log('Migrando profissionais...');
    const professionals = await db.select().from(schema.professionals);
    
    for (const professional of professionals) {
      const { error } = await supabase
        .from('professionals')
        .upsert(professional);
      
      if (error) throw error;
    }
    console.log(`${professionals.length} profissionais migrados com sucesso.`);

    // 5. Migrar agendas
    console.log('Migrando agendas...');
    const schedules = await db.select().from(schema.schedules);
    
    for (const schedule of schedules) {
      const { error } = await supabase
        .from('schedules')
        .upsert(schedule);
      
      if (error) throw error;
    }
    console.log(`${schedules.length} agendas migradas com sucesso.`);

    // 6. Migrar agendamentos
    console.log('Migrando agendamentos...');
    const appointments = await db.select().from(schema.appointments);
    
    for (const appointment of appointments) {
      const { error } = await supabase
        .from('appointments')
        .upsert(appointment);
      
      if (error) throw error;
    }
    console.log(`${appointments.length} agendamentos migrados com sucesso.`);

    // 7. Migrar serviços de agendamentos
    console.log('Migrando serviços de agendamentos...');
    const appointmentServices = await db.select().from(schema.appointmentServices);
    
    for (const appointmentService of appointmentServices) {
      const { error } = await supabase
        .from('appointment_services')
        .upsert(appointmentService);
      
      if (error) throw error;
    }
    console.log(`${appointmentServices.length} serviços de agendamentos migrados com sucesso.`);

    // 8. Migrar categorias de produtos
    console.log('Migrando categorias de produtos...');
    const productCategories = await db.select().from(schema.productCategories);
    
    for (const category of productCategories) {
      const { error } = await supabase
        .from('product_categories')
        .upsert(category);
      
      if (error) throw error;
    }
    console.log(`${productCategories.length} categorias de produtos migradas com sucesso.`);

    // 9. Migrar produtos
    console.log('Migrando produtos...');
    const products = await db.select().from(schema.products);
    
    for (const product of products) {
      const { error } = await supabase
        .from('products')
        .upsert(product);
      
      if (error) throw error;
    }
    console.log(`${products.length} produtos migrados com sucesso.`);

    // 10. Migrar recompensas de fidelidade
    console.log('Migrando recompensas de fidelidade...');
    const loyaltyRewards = await db.select().from(schema.loyaltyRewards);
    
    for (const reward of loyaltyRewards) {
      const { error } = await supabase
        .from('loyalty_rewards')
        .upsert(reward);
      
      if (error) throw error;
    }
    console.log(`${loyaltyRewards.length} recompensas de fidelidade migradas com sucesso.`);

    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error);
  }
}

// Executar migração
migrateData();
