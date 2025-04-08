/**
 * Script para verificar a conexão com o Supabase e validar o banco de dados
 * 
 * Este script testa a conexão com o Supabase e verifica se as tabelas 
 * foram criadas corretamente, exibindo um relatório detalhado.
 */

import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Verificar se as variáveis de ambiente necessárias estão configuradas
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !DATABASE_URL) {
  console.error("❌ Erro: As variáveis de ambiente SUPABASE_URL, SUPABASE_SERVICE_KEY e DATABASE_URL são necessárias");
  process.exit(1);
}

// Criar cliente Supabase com a chave de serviço
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Função para verificar a conexão e as tabelas
async function verifyDatabase() {
  console.log("🔍 Iniciando verificação do banco de dados Supabase...");

  try {
    // Testar a conexão com o Supabase
    console.log("🔄 Testando conexão com o Supabase...");
    const { data: supabaseTest, error: supabaseError } = await supabase.from('pg_tables').select('*').limit(1);
    
    if (supabaseError) {
      throw new Error(`Falha na conexão com o Supabase: ${supabaseError.message}`);
    }
    
    console.log("✅ Conexão com o Supabase estabelecida com sucesso!");

    // Verificar se DATABASE_URL está definido
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL não está definido ou está vazio');
    }

    // Configuração do cliente Postgres para verificação
    console.log("🔄 Testando conexão direta com o banco de dados PostgreSQL...");
    const pgClient = postgres(DATABASE_URL, { 
      ssl: 'require',
      max: 1 // Use apenas uma conexão para verificação
    });

    // Verificar a conexão PostgreSQL
    try {
      await pgClient.query('SELECT NOW()');
      console.log("✅ Conexão direta com o PostgreSQL estabelecida com sucesso!");
    } catch (pgError) {
      console.error("❌ Falha na conexão direta com o PostgreSQL:", pgError);
      throw pgError;
    }

    // Listar todas as tabelas no banco de dados
    console.log("\n📋 Verificando tabelas existentes...");
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      throw tablesError;
    }

    const existingTables = tables.map(t => t.table_name);
    console.log(`\n📊 Total de tabelas encontradas: ${existingTables.length}`);
    
    // Verificar cada tabela esperada
    const expectedTables = [
      'users',
      'service_categories',
      'services',
      'professionals',
      'schedules',
      'appointments',
      'appointment_services',
      'product_categories',
      'products',
      'loyalty_rewards',
      'loyalty_history',
      'cash_flow',
      'professional_services'
    ];

    console.log("\n🔍 Verificando tabelas esperadas:");
    
    for (const tableName of expectedTables) {
      if (existingTables.includes(tableName)) {
        // Verificar a estrutura da tabela
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_schema', 'public')
          .eq('table_name', tableName);
          
        if (columnsError) {
          console.error(`❌ Erro ao verificar colunas da tabela ${tableName}:`, columnsError);
          continue;
        }
        
        console.log(`✅ Tabela '${tableName}' encontrada com ${columns.length} colunas`);
      } else {
        console.error(`❌ Tabela '${tableName}' NÃO encontrada`);
      }
    }

    // Verificar enums
    console.log("\n🔍 Verificando tipos enumerados:");
    const { data: enums, error: enumsError } = await pgClient.query(`
      SELECT typname 
      FROM pg_type 
      JOIN pg_catalog.pg_namespace ON pg_namespace.oid = pg_type.typnamespace
      WHERE typtype = 'e' AND nspname = 'public'
    `);

    if (enumsError) {
      console.error("❌ Erro ao verificar enums:", enumsError);
    } else {
      const existingEnums = enums.map(e => e.typname);
      const expectedEnums = ['user_role', 'transaction_type', 'transaction_category'];
      
      for (const enumName of expectedEnums) {
        if (existingEnums.includes(enumName)) {
          console.log(`✅ Enum '${enumName}' encontrado`);
        } else {
          console.log(`❌ Enum '${enumName}' NÃO encontrado`);
        }
      }
    }

    // Verificar políticas RLS
    console.log("\n🔍 Verificando políticas RLS:");
    const { data: policies, error: policiesError } = await pgClient.query(`
      SELECT tablename, policyname
      FROM pg_policies
      WHERE schemaname = 'public'
    `);

    if (policiesError) {
      console.error("❌ Erro ao verificar políticas RLS:", policiesError);
    } else {
      if (policies.length === 0) {
        console.log("⚠️ Nenhuma política RLS encontrada. Execute o script setup-rls.ts para configurar as políticas.");
      } else {
        console.log(`✅ Total de políticas RLS encontradas: ${policies.length}`);
        
        // Agrupar políticas por tabela
        const policyByTable = policies.reduce<Record<string, string[]>>((acc, policy) => {
          if (!acc[policy.tablename]) {
            acc[policy.tablename] = [];
          }
          acc[policy.tablename].push(policy.policyname);
          return acc;
        }, {});
        
        // Mostrar políticas para cada tabela
        for (const [table, tablePolicies] of Object.entries(policyByTable)) {
          console.log(`   📝 Tabela '${table}': ${tablePolicies.length} políticas`);
          // tablePolicies.forEach(policy => console.log(`      - ${policy}`));
        }
      }
    }

    console.log("\n✅ Verificação do banco de dados concluída!");
    
    // Fechar a conexão
    await pgClient.end();
  } catch (error) {
    console.error("\n❌ Erro durante a verificação do banco de dados:", error);
    process.exit(1);
  }
}

// Executar o script
verifyDatabase().catch(console.error);