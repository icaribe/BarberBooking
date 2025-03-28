
import { db } from '../server/db';
import { supabase } from '../server/supabase';
import * as schema from '../shared/schema';

async function createTables() {
  console.log('Criando tabelas no Supabase...');

  try {
    // Criar tabela users
    const { error: usersError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'client',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    if (usersError) console.error('Erro ao criar tabela users:', usersError);
    else console.log('✅ Tabela users criada');

    // Criar tabela service_categories
    const { error: serviceCategoriesError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.service_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    if (serviceCategoriesError) console.error('Erro ao criar tabela service_categories:', serviceCategoriesError);
    else console.log('✅ Tabela service_categories criada');

    // Criar tabela services
    const { error: servicesError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.services (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        duration INTEGER NOT NULL,
        image TEXT,
        categoryId INTEGER REFERENCES public.service_categories(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    if (servicesError) console.error('Erro ao criar tabela services:', servicesError);
    else console.log('✅ Tabela services criada');

    // Criar tabela professionals
    const { error: professionalsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.professionals (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        bio TEXT,
        avatar TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    if (professionalsError) console.error('Erro ao criar tabela professionals:', professionalsError);
    else console.log('✅ Tabela professionals criada');

    // Criar tabela schedules
    const { error: schedulesError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.schedules (
        id SERIAL PRIMARY KEY,
        professionalId INTEGER REFERENCES public.professionals(id),
        dayOfWeek INTEGER NOT NULL,
        startTime TIME NOT NULL,
        endTime TIME NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    if (schedulesError) console.error('Erro ao criar tabela schedules:', schedulesError);
    else console.log('✅ Tabela schedules criada');

    // Criar tabela appointments
    const { error: appointmentsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.appointments (
        id SERIAL PRIMARY KEY,
        userId INTEGER REFERENCES public.users(id),
        professionalId INTEGER REFERENCES public.professionals(id),
        date DATE NOT NULL,
        startTime TIME NOT NULL,
        endTime TIME NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    if (appointmentsError) console.error('Erro ao criar tabela appointments:', appointmentsError);
    else console.log('✅ Tabela appointments criada');

    // Criar tabela appointment_services
    const { error: appointmentServicesError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.appointment_services (
        id SERIAL PRIMARY KEY,
        appointmentId INTEGER REFERENCES public.appointments(id),
        serviceId INTEGER REFERENCES public.services(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    if (appointmentServicesError) console.error('Erro ao criar tabela appointment_services:', appointmentServicesError);
    else console.log('✅ Tabela appointment_services criada');

    // Criar tabela product_categories
    const { error: productCategoriesError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.product_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    if (productCategoriesError) console.error('Erro ao criar tabela product_categories:', productCategoriesError);
    else console.log('✅ Tabela product_categories criada');

    // Criar tabela products
    const { error: productsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image TEXT,
        categoryId INTEGER REFERENCES public.product_categories(id),
        stock INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    if (productsError) console.error('Erro ao criar tabela products:', productsError);
    else console.log('✅ Tabela products criada');

    // Criar tabela loyalty_rewards
    const { error: loyaltyRewardsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        pointsRequired INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    if (loyaltyRewardsError) console.error('Erro ao criar tabela loyalty_rewards:', loyaltyRewardsError);
    else console.log('✅ Tabela loyalty_rewards criada');

    console.log('Criação de tabelas concluída!');
  } catch (error) {
    console.error('Erro durante a criação das tabelas:', error);
  }
}

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
    if (error.message) {
      console.error('Mensagem de erro:', error.message);
    }
    if (error.code) {
      console.error('Código de erro:', error.code);
    }
    if (error.details) {
      console.error('Detalhes do erro:', error.details);
    }
  }
}

// Executar criação de tabelas e depois migração
async function main() {
  await createTables();
  await migrateData();
}

main();
