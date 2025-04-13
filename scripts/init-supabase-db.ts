import { supabaseAdmin } from '../shared/supabase-client';
import * as schema from '../shared/schema';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Cria tabelas no Supabase a partir do schema Drizzle
 */
async function createTablesFromSchema() {
  console.log('\n=== Inicializando Banco de Dados no Supabase ===\n');
  
  // Lista de tabelas no schema para criação
  const tables = [
    { name: 'users', schema: getUserTableDDL() },
    { name: 'service_categories', schema: getServiceCategoriesTableDDL() },
    { name: 'services', schema: getServicesTableDDL() },
    { name: 'professionals', schema: getProfessionalsTableDDL() },
    { name: 'schedules', schema: getSchedulesTableDDL() },
    { name: 'appointments', schema: getAppointmentsTableDDL() },
    { name: 'appointment_services', schema: getAppointmentServicesTableDDL() },
    { name: 'product_categories', schema: getProductCategoriesTableDDL() },
    { name: 'products', schema: getProductsTableDDL() },
    { name: 'loyalty_rewards', schema: getLoyaltyRewardsTableDDL() },
    { name: 'loyalty_history', schema: getLoyaltyHistoryTableDDL() },
    { name: 'cash_flow', schema: getCashFlowTableDDL() },
    { name: 'professional_services', schema: getProfessionalServicesTableDDL() }
  ];
  
  // Criando enums
  await createEnums();
  
  // Criando tabelas
  console.log('Criando/verificando tabelas:');
  for (const table of tables) {
    try {
      console.log(`- Processando tabela: ${table.name}`);
      // Verificar se a tabela já existe
      const { data: existingTable, error: checkError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', table.name);
      
      if (checkError) {
        console.error(`  ❌ Erro ao verificar tabela ${table.name}:`, checkError.message);
        continue;
      }
      
      if (existingTable && existingTable.length > 0) {
        console.log(`  ℹ️ Tabela ${table.name} já existe, pulando criação`);
        continue;
      }
      
      // Criar tabela se não existir
      const { error: createError } = await supabaseAdmin.rpc('exec', { 
        query: table.schema 
      });
      
      if (createError) {
        console.error(`  ❌ Erro ao criar tabela ${table.name}:`, createError.message);
      } else {
        console.log(`  ✅ Tabela ${table.name} criada com sucesso`);
      }
    } catch (error) {
      console.error(`  ❌ Exceção ao processar tabela ${table.name}:`, error);
    }
  }
  
  console.log('\n=== Inicialização do Banco de Dados Concluída ===\n');
}

/**
 * Cria os tipos enumerados necessários
 */
async function createEnums() {
  console.log('Criando tipos enumerados:');
  
  // Enum para roles de usuário
  const createUserRoleEnum = `
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'professional', 'customer');
      END IF;
    END $$;
  `;
  
  // Enum para tipo de transação
  const createTransactionTypeEnum = `
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('income', 'expense');
      END IF;
    END $$;
  `;
  
  // Enum para categorias de transação
  const createTransactionCategoryEnum = `
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_category') THEN
        CREATE TYPE transaction_category AS ENUM (
          'service', 'product', 'commission', 'salary', 'rent', 'utilities', 
          'supplies', 'marketing', 'other'
        );
      END IF;
    END $$;
  `;
  
  try {
    // Criar enum de role de usuário
    const { error: roleEnumError } = await supabaseAdmin.rpc('exec', { 
      query: createUserRoleEnum 
    });
    
    if (roleEnumError) {
      console.error('  ❌ Erro ao criar enum user_role:', roleEnumError.message);
    } else {
      console.log('  ✅ Enum user_role criado/verificado com sucesso');
    }
    
    // Criar enum de tipo de transação
    const { error: transTypeEnumError } = await supabaseAdmin.rpc('exec', { 
      query: createTransactionTypeEnum 
    });
    
    if (transTypeEnumError) {
      console.error('  ❌ Erro ao criar enum transaction_type:', transTypeEnumError.message);
    } else {
      console.log('  ✅ Enum transaction_type criado/verificado com sucesso');
    }
    
    // Criar enum de categoria de transação
    const { error: transCatEnumError } = await supabaseAdmin.rpc('exec', { 
      query: createTransactionCategoryEnum 
    });
    
    if (transCatEnumError) {
      console.error('  ❌ Erro ao criar enum transaction_category:', transCatEnumError.message);
    } else {
      console.log('  ✅ Enum transaction_category criado/verificado com sucesso');
    }
  } catch (error) {
    console.error('  ❌ Exceção ao criar enums:', error);
  }
}

// Funções para gerar SQL de criação de tabelas baseadas no schema Drizzle

function getUserTableDDL() {
  return `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      auth_id UUID UNIQUE,
      username VARCHAR NOT NULL,
      password VARCHAR NOT NULL,
      name VARCHAR,
      email VARCHAR NOT NULL,
      phone VARCHAR,
      role user_role DEFAULT 'customer',
      professional_id INTEGER,
      loyalty_points INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;
}

function getServiceCategoriesTableDDL() {
  return `
    CREATE TABLE IF NOT EXISTS service_categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL
    );
  `;
}

function getServicesTableDDL() {
  return `
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price INTEGER,
      price_type TEXT DEFAULT 'fixed',
      duration_minutes INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      description TEXT
    );
  `;
}

function getProfessionalsTableDDL() {
  return `
    CREATE TABLE IF NOT EXISTS professionals (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      avatar TEXT,
      rating INTEGER,
      review_count INTEGER DEFAULT 0,
      specialties TEXT[],
      bio TEXT
    );
  `;
}

function getSchedulesTableDDL() {
  return `
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      professional_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_available BOOLEAN DEFAULT TRUE
    );
  `;
}

function getAppointmentsTableDDL() {
  return `
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      professional_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
}

function getAppointmentServicesTableDDL() {
  return `
    CREATE TABLE IF NOT EXISTS appointment_services (
      id SERIAL PRIMARY KEY,
      appointment_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL
    );
  `;
}

function getProductCategoriesTableDDL() {
  return `
    CREATE TABLE IF NOT EXISTS product_categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL
    );
  `;
}

function getProductsTableDDL() {
  return `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      description TEXT,
      image_url TEXT,
      category_id INTEGER NOT NULL,
      in_stock BOOLEAN DEFAULT TRUE
    );
  `;
}

function getLoyaltyRewardsTableDDL() {
  return `
    CREATE TABLE IF NOT EXISTS loyalty_rewards (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      points_required INTEGER NOT NULL,
      icon TEXT,
      is_active BOOLEAN DEFAULT TRUE
    );
  `;
}

function getLoyaltyHistoryTableDDL() {
  return `
    CREATE TABLE IF NOT EXISTS loyalty_history (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      points INTEGER NOT NULL,
      description TEXT NOT NULL,
      date TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
}

function getCashFlowTableDDL() {
  return `
    CREATE TABLE IF NOT EXISTS cash_flow (
      id SERIAL PRIMARY KEY,
      date TIMESTAMP NOT NULL DEFAULT NOW(),
      amount INTEGER NOT NULL,
      description TEXT NOT NULL,
      transaction_type transaction_type NOT NULL,
      category transaction_category NOT NULL,
      appointment_id INTEGER,
      product_id INTEGER,
      professional_id INTEGER,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      related_transaction_id INTEGER,
      total_value INTEGER
    );
  `;
}

function getProfessionalServicesTableDDL() {
  return `
    CREATE TABLE IF NOT EXISTS professional_services (
      id SERIAL PRIMARY KEY,
      professional_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL
    );
  `;
}

// Executar a função principal
createTablesFromSchema().catch(error => {
  console.error('Erro durante a inicialização do banco de dados:', error);
  process.exit(1);
});