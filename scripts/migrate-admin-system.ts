/**
 * Script para migrar o banco de dados para suportar o sistema administrativo
 * 
 * Este script realiza as migrações necessárias para implementar o sistema de gerenciamento
 * administrativo para a barbearia.
 */

import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const DATABASE_URL = process.env.DATABASE_URL!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !DATABASE_URL) {
  console.error("Erro: Variáveis de ambiente SUPABASE_URL, SUPABASE_SERVICE_KEY ou DATABASE_URL não definidas");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const client = postgres(DATABASE_URL);
const db = drizzle(client);

async function generateMigrations() {
  console.log("Gerando migrações para o sistema administrativo...");
  
  try {
    // 1. Adicionar coluna 'role' à tabela de usuários
    console.log("Adicionando coluna 'role' à tabela users...");
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'USER';
      COMMENT ON COLUMN users.role IS 'Papel do usuário: USER, PROFESSIONAL ou ADMIN';
    `);
    
    // 2. Adicionar coluna professionalId à tabela de usuários
    console.log("Adicionando coluna 'professionalId' à tabela users...");
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_id INTEGER REFERENCES professionals(id);
      COMMENT ON COLUMN users.professional_id IS 'ID do profissional (se o usuário for um profissional)';
    `);
    
    // 3. Adicionar coluna 'loyaltyPoints' à tabela de usuários
    console.log("Adicionando coluna 'loyaltyPoints' à tabela users...");
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
      COMMENT ON COLUMN users.loyalty_points IS 'Pontos de fidelidade acumulados pelo usuário';
    `);
    
    // 4. Criar tabela para histórico de pontos de fidelidade
    console.log("Criando tabela 'loyalty_history'...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS loyalty_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        points INTEGER NOT NULL,
        description TEXT NOT NULL,
        date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      COMMENT ON TABLE loyalty_history IS 'Histórico de pontos de fidelidade';
    `);
    
    // 5. Criar tabela para fluxo de caixa
    console.log("Criando tabela 'cash_flow'...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS cash_flow (
        id SERIAL PRIMARY KEY,
        transaction_type VARCHAR(20) NOT NULL,
        category VARCHAR(50) NOT NULL,
        amount INTEGER NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_by_id INTEGER REFERENCES users(id),
        appointment_id INTEGER REFERENCES appointments(id),
        product_id INTEGER REFERENCES products(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      COMMENT ON TABLE cash_flow IS 'Registro de transações financeiras';
    `);
    
    // 6. Criar tabela para bloqueios de horários
    console.log("Criando tabela 'blocked_times'...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS blocked_times (
        id SERIAL PRIMARY KEY,
        professional_id INTEGER REFERENCES professionals(id),
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      COMMENT ON TABLE blocked_times IS 'Bloqueios de horários na agenda';
    `);
    
    // 7. Criar tabela para relacionar profissionais e serviços
    console.log("Criando tabela 'professional_services'...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS professional_services (
        id SERIAL PRIMARY KEY,
        professional_id INTEGER REFERENCES professionals(id),
        service_id INTEGER REFERENCES services(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(professional_id, service_id)
      );
      COMMENT ON TABLE professional_services IS 'Relacionamento entre profissionais e serviços que eles realizam';
    `);
    
    console.log("Migrações geradas com sucesso!");
  } catch (error) {
    console.error("Erro ao gerar migrações:", error);
    throw error;
  }
}

async function runMigrations() {
  console.log("Executando migrações...");
  
  try {
    // Executar as migrações
    await generateMigrations();
    
    console.log("Migrações concluídas com sucesso!");
  } catch (error) {
    console.error("Erro ao executar migrações:", error);
  } finally {
    // Fechar conexão com o banco
    await client.end();
  }
}

async function main() {
  console.log("Iniciando migração do sistema administrativo...");
  
  // Executar migrações
  await runMigrations();
  
  console.log("Migração do sistema administrativo concluída!");
}

// Executar o script
main();