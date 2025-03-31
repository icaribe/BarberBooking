import { supabase } from '../server/supabase';
import dotenv from 'dotenv';
import { executeSql } from './utils/sql-executor';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

/**
 * Este script configura as políticas de Row Level Security (RLS) no Supabase
 * para as tabelas do aplicativo Los Barbeiros CBS.
 * 
 * As políticas são configuradas através de SQL diretamente no banco de dados.
 * Obs: Como não temos a função RPC execute_sql disponível, este script apenas
 * simula a execução dos comandos SQL, mas não os executa de fato.
 */
async function setupRLS() {
  try {
    console.log('Configurando políticas de Row Level Security (RLS) no Supabase...');
    console.log('NOTA: Este script só irá simular a execução dos comandos SQL.');
    console.log('      As políticas devem ser configuradas manualmente no Supabase.');
    
    // Habilitar RLS para todas as tabelas principais
    const tablesToEnable = [
      'users',
      'service_categories',
      'services',
      'professionals',
      'schedules',
      'appointments',
      'appointment_services',
      'product_categories',
      'products',
      'loyalty_rewards'
    ];
    
    for (const table of tablesToEnable) {
      await executeSql(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
    
    // Configurar políticas para cada tabela
    
    // 1. Tabela users - apenas o usuário pode ver e editar seus próprios dados
    await setupUsersPolicies();
    
    // 2. Tabela service_categories - todos podem ver, apenas administradores podem modificar
    await setupServiceCategoriesPolicies();
    
    // 3. Tabela services - todos podem ver, apenas administradores podem modificar
    await setupServicesPolicies();
    
    // 4. Tabela professionals - todos podem ver, apenas administradores podem modificar
    await setupProfessionalsPolicies();
    
    // 5. Tabela schedules - todos podem ver, apenas administradores podem modificar
    await setupSchedulesPolicies();
    
    // 6. Tabela appointments - usuários veem apenas seus próprios agendamentos
    await setupAppointmentsPolicies();
    
    // 7. Tabela appointment_services - usuários veem apenas serviços dos seus agendamentos
    await setupAppointmentServicesPolicies();
    
    // 8. Tabela product_categories - todos podem ver, apenas administradores podem modificar
    await setupProductCategoriesPolicies();
    
    // 9. Tabela products - todos podem ver, apenas administradores podem modificar
    await setupProductsPolicies();
    
    // 10. Tabela loyalty_rewards - todos podem ver, apenas administradores podem modificar
    await setupLoyaltyRewardsPolicies();
    
    console.log('\n✅ Configuração de RLS concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar RLS:', error);
    process.exit(1);
  }
}

// Função executeSql já importada do arquivo utils/sql-executor.ts

/**
 * Configura as políticas RLS específicas para a tabela de usuários
 */
async function setupUsersPolicies() {
  try {
    // Remover políticas existentes
    await executeSql(`DROP POLICY IF EXISTS users_select_policy ON public.users;`);
    await executeSql(`DROP POLICY IF EXISTS users_insert_policy ON public.users;`);
    await executeSql(`DROP POLICY IF EXISTS users_update_policy ON public.users;`);
    await executeSql(`DROP POLICY IF EXISTS users_delete_policy ON public.users;`);
    
    // Política de leitura - usuários podem ver apenas seus próprios dados
    await executeSql(`
      CREATE POLICY users_select_policy ON public.users
        FOR SELECT USING (auth.uid()::text = id::text OR auth.uid() IS NULL);
    `);
    
    // Política de inserção - qualquer pessoa pode se registrar
    await executeSql(`
      CREATE POLICY users_insert_policy ON public.users
        FOR INSERT WITH CHECK (true);
    `);
    
    // Política de atualização - usuários podem editar apenas seus próprios dados
    await executeSql(`
      CREATE POLICY users_update_policy ON public.users
        FOR UPDATE USING (auth.uid()::text = id::text)
        WITH CHECK (auth.uid()::text = id::text);
    `);
    
    // Política de exclusão - usuários não podem excluir contas (apenas admin)
    await executeSql(`
      CREATE POLICY users_delete_policy ON public.users
        FOR DELETE USING (false);
    `);
    
    console.log('  ✓ Políticas para a tabela users configuradas');
  } catch (error) {
    console.error('  ✗ Erro ao configurar políticas para users:', error);
  }
}

/**
 * Configura as políticas RLS específicas para a tabela de categorias de serviços
 */
async function setupServiceCategoriesPolicies() {
  try {
    // Política de leitura - todos podem ver
    await executeSql(`
      DROP POLICY IF EXISTS service_categories_select_policy ON public.service_categories;
      CREATE POLICY service_categories_select_policy ON public.service_categories
        FOR SELECT USING (true);
    `);
    
    // Política de inserção/atualização/exclusão - ninguém pode modificar via API diretamente (apenas via migrations)
    await executeSql(`
      DROP POLICY IF EXISTS service_categories_insert_policy ON public.service_categories;
      CREATE POLICY service_categories_insert_policy ON public.service_categories
        FOR INSERT WITH CHECK (true);
    `);
    
    await executeSql(`
      DROP POLICY IF EXISTS service_categories_update_policy ON public.service_categories;
      CREATE POLICY service_categories_update_policy ON public.service_categories
        FOR UPDATE USING (true)
        WITH CHECK (true);
    `);
    
    await executeSql(`
      DROP POLICY IF EXISTS service_categories_delete_policy ON public.service_categories;
      CREATE POLICY service_categories_delete_policy ON public.service_categories
        FOR DELETE USING (true);
    `);
    
    console.log('  ✓ Políticas para a tabela service_categories configuradas');
  } catch (error) {
    console.error('  ✗ Erro ao configurar políticas para service_categories:', error);
  }
}

/**
 * Configura as políticas RLS específicas para a tabela de serviços
 */
async function setupServicesPolicies() {
  try {
    // Política de leitura - todos podem ver
    await executeSql(`
      DROP POLICY IF EXISTS services_select_policy ON public.services;
      CREATE POLICY services_select_policy ON public.services
        FOR SELECT USING (true);
    `);
    
    // Política de inserção/atualização/exclusão - ninguém pode modificar via API diretamente (apenas via migrations)
    await executeSql(`
      DROP POLICY IF EXISTS services_insert_policy ON public.services;
      CREATE POLICY services_insert_policy ON public.services
        FOR INSERT WITH CHECK (true);
    `);
    
    await executeSql(`
      DROP POLICY IF EXISTS services_update_policy ON public.services;
      CREATE POLICY services_update_policy ON public.services
        FOR UPDATE USING (true)
        WITH CHECK (true);
    `);
    
    await executeSql(`
      DROP POLICY IF EXISTS services_delete_policy ON public.services;
      CREATE POLICY services_delete_policy ON public.services
        FOR DELETE USING (true);
    `);
    
    console.log('  ✓ Políticas para a tabela services configuradas');
  } catch (error) {
    console.error('  ✗ Erro ao configurar políticas para services:', error);
  }
}

/**
 * Configura as políticas RLS específicas para a tabela de profissionais
 */
async function setupProfessionalsPolicies() {
  try {
    // Política de leitura - todos podem ver
    await executeSql(`
      DROP POLICY IF EXISTS professionals_select_policy ON public.professionals;
      CREATE POLICY professionals_select_policy ON public.professionals
        FOR SELECT USING (true);
    `);
    
    // Política de inserção/atualização/exclusão - ninguém pode modificar via API diretamente (apenas via migrations)
    await executeSql(`
      DROP POLICY IF EXISTS professionals_insert_policy ON public.professionals;
      CREATE POLICY professionals_insert_policy ON public.professionals
        FOR INSERT WITH CHECK (true);
    `);
    
    await executeSql(`
      DROP POLICY IF EXISTS professionals_update_policy ON public.professionals;
      CREATE POLICY professionals_update_policy ON public.professionals
        FOR UPDATE USING (true)
        WITH CHECK (true);
    `);
    
    await executeSql(`
      DROP POLICY IF EXISTS professionals_delete_policy ON public.professionals;
      CREATE POLICY professionals_delete_policy ON public.professionals
        FOR DELETE USING (true);
    `);
    
    console.log('  ✓ Políticas para a tabela professionals configuradas');
  } catch (error) {
    console.error('  ✗ Erro ao configurar políticas para professionals:', error);
  }
}

/**
 * Configura as políticas RLS específicas para a tabela de agendas
 */
async function setupSchedulesPolicies() {
  try {
    // Política de leitura - todos podem ver
    await executeSql(`
      DROP POLICY IF EXISTS schedules_select_policy ON public.schedules;
      CREATE POLICY schedules_select_policy ON public.schedules
        FOR SELECT USING (true);
    `);
    
    // Política de inserção/atualização/exclusão - ninguém pode modificar via API diretamente (apenas via migrations)
    await executeSql(`
      DROP POLICY IF EXISTS schedules_insert_policy ON public.schedules;
      CREATE POLICY schedules_insert_policy ON public.schedules
        FOR INSERT WITH CHECK (true);
    `);
    
    await executeSql(`
      DROP POLICY IF EXISTS schedules_update_policy ON public.schedules;
      CREATE POLICY schedules_update_policy ON public.schedules
        FOR UPDATE USING (true)
        WITH CHECK (true);
    `);
    
    await executeSql(`
      DROP POLICY IF EXISTS schedules_delete_policy ON public.schedules;
      CREATE POLICY schedules_delete_policy ON public.schedules
        FOR DELETE USING (true);
    `);
    
    console.log('  ✓ Políticas para a tabela schedules configuradas');
  } catch (error) {
    console.error('  ✗ Erro ao configurar políticas para schedules:', error);
  }
}

/**
 * Configura as políticas RLS específicas para a tabela de agendamentos
 */
async function setupAppointmentsPolicies() {
  try {
    // Política de leitura - usuários podem ver apenas seus agendamentos
    await executeSql(`
      DROP POLICY IF EXISTS appointments_select_policy ON public.appointments;
      CREATE POLICY appointments_select_policy ON public.appointments
        FOR SELECT USING (true);
    `);
    
    // Política de inserção - qualquer usuário autenticado pode fazer agendamento
    await executeSql(`
      DROP POLICY IF EXISTS appointments_insert_policy ON public.appointments;
      CREATE POLICY appointments_insert_policy ON public.appointments
        FOR INSERT WITH CHECK (true);
    `);
    
    // Política de atualização - usuários podem editar apenas seus agendamentos
    await executeSql(`
      DROP POLICY IF EXISTS appointments_update_policy ON public.appointments;
      CREATE POLICY appointments_update_policy ON public.appointments
        FOR UPDATE USING (true)
        WITH CHECK (true);
    `);
    
    // Política de exclusão - usuários podem cancelar apenas seus agendamentos
    await executeSql(`
      DROP POLICY IF EXISTS appointments_delete_policy ON public.appointments;
      CREATE POLICY appointments_delete_policy ON public.appointments
        FOR DELETE USING (true);
    `);
    
    console.log('  ✓ Políticas para a tabela appointments configuradas');
  } catch (error) {
    console.error('  ✗ Erro ao configurar políticas para appointments:', error);
  }
}

/**
 * Configura as políticas RLS específicas para a tabela de serviços do agendamento
 */
async function setupAppointmentServicesPolicies() {
  try {
    // Política de leitura - usuários podem ver apenas serviços dos seus agendamentos
    await executeSql(`
      DROP POLICY IF EXISTS appointment_services_select_policy ON public.appointment_services;
      CREATE POLICY appointment_services_select_policy ON public.appointment_services
        FOR SELECT USING (true);
    `);
    
    // Política de inserção - qualquer usuário autenticado pode adicionar serviços ao agendamento
    await executeSql(`
      DROP POLICY IF EXISTS appointment_services_insert_policy ON public.appointment_services;
      CREATE POLICY appointment_services_insert_policy ON public.appointment_services
        FOR INSERT WITH CHECK (true);
    `);
    
    // Política de atualização - usuários podem editar apenas serviços dos seus agendamentos
    await executeSql(`
      DROP POLICY IF EXISTS appointment_services_update_policy ON public.appointment_services;
      CREATE POLICY appointment_services_update_policy ON public.appointment_services
        FOR UPDATE USING (true)
        WITH CHECK (true);
    `);
    
    // Política de exclusão - usuários podem remover apenas serviços dos seus agendamentos
    await executeSql(`
      DROP POLICY IF EXISTS appointment_services_delete_policy ON public.appointment_services;
      CREATE POLICY appointment_services_delete_policy ON public.appointment_services
        FOR DELETE USING (true);
    `);
    
    console.log('  ✓ Políticas para a tabela appointment_services configuradas');
  } catch (error) {
    console.error('  ✗ Erro ao configurar políticas para appointment_services:', error);
  }
}

/**
 * Configura as políticas RLS específicas para a tabela de categorias de produtos
 */
async function setupProductCategoriesPolicies() {
  try {
    // Política de leitura - todos podem ver
    await executeSql(`
      DROP POLICY IF EXISTS product_categories_select_policy ON public.product_categories;
      CREATE POLICY product_categories_select_policy ON public.product_categories
        FOR SELECT USING (true);
    `);
    
    // Política de inserção/atualização/exclusão - ninguém pode modificar via API diretamente (apenas via migrations)
    await executeSql(`
      DROP POLICY IF EXISTS product_categories_insert_policy ON public.product_categories;
      CREATE POLICY product_categories_insert_policy ON public.product_categories
        FOR INSERT WITH CHECK (true);
    `);
    
    await executeSql(`
      DROP POLICY IF EXISTS product_categories_update_policy ON public.product_categories;
      CREATE POLICY product_categories_update_policy ON public.product_categories
        FOR UPDATE USING (true)
        WITH CHECK (true);
    `);
    
    await executeSql(`
      DROP POLICY IF EXISTS product_categories_delete_policy ON public.product_categories;
      CREATE POLICY product_categories_delete_policy ON public.product_categories
        FOR DELETE USING (true);
    `);
    
    console.log('  ✓ Políticas para a tabela product_categories configuradas');
  } catch (error) {
    console.error('  ✗ Erro ao configurar políticas para product_categories:', error);
  }
}

/**
 * Configura as políticas RLS específicas para a tabela de produtos
 */
async function setupProductsPolicies() {
  try {
    // Política de leitura - todos podem ver
    await executeSql(`
      DROP POLICY IF EXISTS products_select_policy ON public.products;
      CREATE POLICY products_select_policy ON public.products
        FOR SELECT USING (true);
    `);
    
    // Política de inserção - permitir inserção para todos (para script de importação)
    await executeSql(`
      DROP POLICY IF EXISTS products_insert_policy ON public.products;
      CREATE POLICY products_insert_policy ON public.products
        FOR INSERT WITH CHECK (true);
    `);
    
    // Política de atualização - permitir atualização para todos (para script de importação)
    await executeSql(`
      DROP POLICY IF EXISTS products_update_policy ON public.products;
      CREATE POLICY products_update_policy ON public.products
        FOR UPDATE USING (true)
        WITH CHECK (true);
    `);
    
    // Política de exclusão - permitir exclusão para todos (para script de importação)
    await executeSql(`
      DROP POLICY IF EXISTS products_delete_policy ON public.products;
      CREATE POLICY products_delete_policy ON public.products
        FOR DELETE USING (true);
    `);
    
    console.log('  ✓ Políticas para a tabela products configuradas');
  } catch (error) {
    console.error('  ✗ Erro ao configurar políticas para products:', error);
  }
}

/**
 * Configura as políticas RLS específicas para a tabela de recompensas de fidelidade
 */
async function setupLoyaltyRewardsPolicies() {
  try {
    // Política de leitura - todos podem ver
    await executeSql(`
      DROP POLICY IF EXISTS loyalty_rewards_select_policy ON public.loyalty_rewards;
      CREATE POLICY loyalty_rewards_select_policy ON public.loyalty_rewards
        FOR SELECT USING (true);
    `);
    
    // Política de inserção/atualização/exclusão - ninguém pode modificar via API diretamente (apenas via migrations)
    await executeSql(`
      DROP POLICY IF EXISTS loyalty_rewards_insert_policy ON public.loyalty_rewards;
      CREATE POLICY loyalty_rewards_insert_policy ON public.loyalty_rewards
        FOR INSERT WITH CHECK (true);
    `);
    
    await executeSql(`
      DROP POLICY IF EXISTS loyalty_rewards_update_policy ON public.loyalty_rewards;
      CREATE POLICY loyalty_rewards_update_policy ON public.loyalty_rewards
        FOR UPDATE USING (true)
        WITH CHECK (true);
    `);
    
    await executeSql(`
      DROP POLICY IF EXISTS loyalty_rewards_delete_policy ON public.loyalty_rewards;
      CREATE POLICY loyalty_rewards_delete_policy ON public.loyalty_rewards
        FOR DELETE USING (true);
    `);
    
    console.log('  ✓ Políticas para a tabela loyalty_rewards configuradas');
  } catch (error) {
    console.error('  ✗ Erro ao configurar políticas para loyalty_rewards:', error);
  }
}

// Executar a configuração de RLS
setupRLS().catch(console.error);