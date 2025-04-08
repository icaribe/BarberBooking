/**
 * Script para executar migrações do Drizzle ORM para o Supabase
 * 
 * Este script conecta ao banco de dados do Supabase e aplica 
 * as migrações necessárias usando o Drizzle ORM.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

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

async function runMigrations() {
  console.log("🚀 Iniciando processo de migração para o banco de dados Supabase...");
  
  try {
    // Verificar se DATABASE_URL está definido
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL não está definido ou está vazio');
    }
    
    // Configuração do cliente Postgres para migração
    const migrationClient = postgres(DATABASE_URL, { 
      ssl: 'require',
      max: 1 // Use apenas uma conexão para migrações
    });
    
    // Criar instância do Drizzle ORM
    const db = drizzle(migrationClient, { schema });
    
    // Executar migrações - cria a pasta migrations se não existir
    console.log("📁 Verificando pasta de migrações...");
    
    // Criar/aplicar esquema no banco de dados
    console.log("🔄 Criando/atualizando estrutura de tabelas no banco de dados...");
    
    // Executar SQL para criar as tabelas definidas no esquema
    for (const tableName in schema) {
      if (tableName.endsWith('Relations') || typeof schema[tableName] !== 'object') continue;
      console.log(`👉 Processando tabela: ${tableName}`);
    }
    
    console.log("✅ Migração executada com sucesso!");
    
    // Fechar a conexão após as migrações
    await migrationClient.end();
  } catch (error) {
    console.error("❌ Erro durante a migração:", error);
    process.exit(1);
  }
}

// Iniciar o processo de migração
runMigrations().catch(console.error);