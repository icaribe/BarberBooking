/**
 * Script para inicializar o banco de dados no Supabase
 * 
 * Este script cria as tabelas conforme o esquema definido em shared/schema.ts
 * usando Drizzle ORM para o Supabase.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';
import supabase from '../server/supabase';

// Carregar variáveis de ambiente
dotenv.config();

// Verificar se as variáveis de ambiente necessárias estão configuradas
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const DATABASE_URL = process.env.DATABASE_URL || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !DATABASE_URL) {
  console.error("❌ Erro: As variáveis de ambiente SUPABASE_URL, SUPABASE_SERVICE_KEY e DATABASE_URL são necessárias");
  process.exit(1);
}

// Função para executar SQL diretamente
async function executeSQL(sql: string, params: any[] = []): Promise<any> {
  // Verificar se DATABASE_URL está definido
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL não está definido ou está vazio');
  }
  
  // Criar cliente SQL
  const client = postgres(DATABASE_URL, { 
    ssl: 'require',
    max: 1
  });
  
  try {
    const result = await client.query(sql, ...params);
    return result;
  } catch (error) {
    console.error(`Erro ao executar SQL: ${sql}`, error);
    throw error;
  } finally {
    await client.end();
  }
}

// Função principal para criar o esquema do banco de dados
async function createSchema() {
  console.log("🚀 Iniciando criação do esquema no banco de dados Supabase...");

  try {
    // Verificar se existem tabelas no esquema
    console.log("🔍 Verificando tabelas existentes...");
    
    const { data: existingTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      throw new Error(`Erro ao verificar tabelas existentes: ${tablesError.message}`);
    }
    
    const existingTableNames = existingTables.map(t => t.table_name);
    console.log(`📊 Tabelas existentes: ${existingTableNames.length ? existingTableNames.join(', ') : 'Nenhuma'}`);
    
    // Criar enums necessários
    console.log("\n🔄 Criando tipos enumerados...");
    
    // Enum para papel do usuário (user_role)
    try {
      await executeSQL(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
            CREATE TYPE user_role AS ENUM ('user', 'professional', 'admin');
          END IF;
        END
        $$;
      `);
      console.log("✅ Enum 'user_role' criado ou já existente");
    } catch (error) {
      console.error("❌ Erro ao criar enum 'user_role':", error);
    }
    
    // Enum para tipo de transação (transaction_type)
    try {
      await executeSQL(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
            CREATE TYPE transaction_type AS ENUM ('income', 'expense');
          END IF;
        END
        $$;
      `);
      console.log("✅ Enum 'transaction_type' criado ou já existente");
    } catch (error) {
      console.error("❌ Erro ao criar enum 'transaction_type':", error);
    }
    
    // Enum para categoria de transação (transaction_category)
    try {
      await executeSQL(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_category') THEN
            CREATE TYPE transaction_category AS ENUM (
              'service',
              'product',
              'salary',
              'rent',
              'utilities',
              'supplies',
              'maintenance',
              'other'
            );
          END IF;
        END
        $$;
      `);
      console.log("✅ Enum 'transaction_category' criado ou já existente");
    } catch (error) {
      console.error("❌ Erro ao criar enum 'transaction_category':", error);
    }
    
    // Criar tabelas definidas no esquema
    console.log("\n🔄 Criando tabelas conforme o esquema...");
    
    // Tabela users
    if (!existingTableNames.includes('users')) {
      await executeSQL(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          phone TEXT,
          role user_role NOT NULL DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Tabela 'users' criada");
    } else {
      console.log("✅ Tabela 'users' já existe");
    }
    
    // Tabela service_categories
    if (!existingTableNames.includes('service_categories')) {
      await executeSQL(`
        CREATE TABLE IF NOT EXISTS service_categories (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Tabela 'service_categories' criada");
    } else {
      console.log("✅ Tabela 'service_categories' já existe");
    }
    
    // Tabela services
    if (!existingTableNames.includes('services')) {
      await executeSQL(`
        CREATE TABLE IF NOT EXISTS services (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          duration INTEGER NOT NULL,
          image_url TEXT,
          category_id INTEGER REFERENCES service_categories(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Tabela 'services' criada");
    } else {
      console.log("✅ Tabela 'services' já existe");
    }
    
    // Tabela professionals
    if (!existingTableNames.includes('professionals')) {
      await executeSQL(`
        CREATE TABLE IF NOT EXISTS professionals (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id),
          bio TEXT,
          profile_image TEXT,
          specialties TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Tabela 'professionals' criada");
    } else {
      console.log("✅ Tabela 'professionals' já existe");
    }
    
    // Tabela professional_services
    if (!existingTableNames.includes('professional_services')) {
      await executeSQL(`
        CREATE TABLE IF NOT EXISTS professional_services (
          id SERIAL PRIMARY KEY,
          professional_id INTEGER REFERENCES professionals(id),
          service_id INTEGER REFERENCES services(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(professional_id, service_id)
        );
      `);
      console.log("✅ Tabela 'professional_services' criada");
    } else {
      console.log("✅ Tabela 'professional_services' já existe");
    }
    
    // Tabela schedules
    if (!existingTableNames.includes('schedules')) {
      await executeSQL(`
        CREATE TABLE IF NOT EXISTS schedules (
          id SERIAL PRIMARY KEY,
          professional_id INTEGER REFERENCES professionals(id),
          day_of_week INTEGER NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          is_available BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Tabela 'schedules' criada");
    } else {
      console.log("✅ Tabela 'schedules' já existe");
    }
    
    // Tabela appointments
    if (!existingTableNames.includes('appointments')) {
      await executeSQL(`
        CREATE TABLE IF NOT EXISTS appointments (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id),
          professional_id INTEGER REFERENCES professionals(id),
          date DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          status TEXT DEFAULT 'pending',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Tabela 'appointments' criada");
    } else {
      console.log("✅ Tabela 'appointments' já existe");
    }
    
    // Tabela appointment_services
    if (!existingTableNames.includes('appointment_services')) {
      await executeSQL(`
        CREATE TABLE IF NOT EXISTS appointment_services (
          id SERIAL PRIMARY KEY,
          appointment_id INTEGER REFERENCES appointments(id),
          service_id INTEGER REFERENCES services(id),
          price DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Tabela 'appointment_services' criada");
    } else {
      console.log("✅ Tabela 'appointment_services' já existe");
    }
    
    // Tabela product_categories
    if (!existingTableNames.includes('product_categories')) {
      await executeSQL(`
        CREATE TABLE IF NOT EXISTS product_categories (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Tabela 'product_categories' criada");
    } else {
      console.log("✅ Tabela 'product_categories' já existe");
    }
    
    // Tabela products
    if (!existingTableNames.includes('products')) {
      await executeSQL(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          image_url TEXT,
          category_id INTEGER REFERENCES product_categories(id),
          stock_quantity INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Tabela 'products' criada");
    } else {
      console.log("✅ Tabela 'products' já existe");
    }
    
    // Tabela loyalty_rewards
    if (!existingTableNames.includes('loyalty_rewards')) {
      await executeSQL(`
        CREATE TABLE IF NOT EXISTS loyalty_rewards (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          points_required INTEGER NOT NULL,
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Tabela 'loyalty_rewards' criada");
    } else {
      console.log("✅ Tabela 'loyalty_rewards' já existe");
    }
    
    // Tabela loyalty_history
    if (!existingTableNames.includes('loyalty_history')) {
      await executeSQL(`
        CREATE TABLE IF NOT EXISTS loyalty_history (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id),
          points INTEGER NOT NULL,
          transaction_type TEXT NOT NULL,
          description TEXT,
          related_entity_id INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Tabela 'loyalty_history' criada");
    } else {
      console.log("✅ Tabela 'loyalty_history' já existe");
    }
    
    // Tabela cash_flow
    if (!existingTableNames.includes('cash_flow')) {
      await executeSQL(`
        CREATE TABLE IF NOT EXISTS cash_flow (
          id SERIAL PRIMARY KEY,
          amount DECIMAL(10, 2) NOT NULL,
          transaction_type transaction_type NOT NULL,
          category transaction_category NOT NULL,
          description TEXT,
          related_entity_id INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          transaction_date DATE DEFAULT CURRENT_DATE
        );
      `);
      console.log("✅ Tabela 'cash_flow' criada");
    } else {
      console.log("✅ Tabela 'cash_flow' já existe");
    }
    
    console.log("\n✅ Esquema do banco de dados criado/atualizado com sucesso!");
  } catch (error) {
    console.error("\n❌ Erro durante a criação do esquema:", error);
    process.exit(1);
  }
}

// Iniciar o processo de criação do esquema
createSchema().catch(console.error);