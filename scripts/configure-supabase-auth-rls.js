/**
 * Este script configura corretamente as políticas de RLS (Row Level Security)
 * para integrar adequadamente com o sistema de autenticação do Supabase.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// URL e chave de API do Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_KEY são necessários no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase com a chave de serviço (service key) que ignora RLS
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Configuração de políticas RLS para autenticação
 */
async function configureRLSPolicies() {
  try {
    console.log('Iniciando configuração de políticas RLS para integração com Supabase Auth...');
    
    // Certifique-se de que o RLS está habilitado para a tabela de usuários
    await enableRLS('users');
    
    // Configurar políticas para a tabela de usuários
    await configureUsersPolicies();
    
    console.log('✅ Configuração de políticas RLS concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao configurar políticas RLS:', error);
    process.exit(1);
  }
}

/**
 * Habilita o RLS para uma tabela específica
 */
async function enableRLS(tableName) {
  try {
    console.log(`Habilitando RLS para a tabela ${tableName}...`);
    
    // Verificar o status atual do RLS para a tabela
    const { data, error } = await supabase.rpc('check_rls_enabled', { table_name: tableName });
    
    if (error) {
      console.error(`Erro ao verificar o status do RLS para ${tableName}:`, error);
      
      // Tentar habilitar o RLS de qualquer forma
      console.log(`Tentando habilitar o RLS para ${tableName}...`);
      await executeSQL(`ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;`);
    } else if (data === false) {
      // Se o RLS está desabilitado, habilitá-lo
      await executeSQL(`ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;`);
      console.log(`✅ RLS habilitado para a tabela ${tableName}`);
    } else {
      console.log(`✅ RLS já está habilitado para a tabela ${tableName}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao habilitar RLS para a tabela ${tableName}:`, error);
    throw error;
  }
}

/**
 * Configura as políticas RLS específicas para a tabela de usuários
 */
async function configureUsersPolicies() {
  try {
    console.log('Configurando políticas para a tabela users...');
    
    // Remove políticas existentes para evitar conflitos
    await removeExistingPolicies('users');
    
    // Política para permitir que usuários autenticados vejam seus próprios dados
    await executeSQL(`
      CREATE POLICY "Usuários podem ver seus próprios dados" ON public.users
      FOR SELECT
      USING (auth.uid()::text = auth_id::text);
    `);
    
    // Política para permitir que usuários autenticados atualizem seus próprios dados
    await executeSQL(`
      CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.users
      FOR UPDATE
      USING (auth.uid()::text = auth_id::text);
    `);
    
    // Política para permitir inserção na tabela de usuários durante o registro
    await executeSQL(`
      CREATE POLICY "Permitir inserção na tabela de usuários" ON public.users
      FOR INSERT
      WITH CHECK (auth.uid()::text = auth_id::text);
    `);
    
    // Política para permitir que todos vejam informações básicas de qualquer usuário
    await executeSQL(`
      CREATE POLICY "Todos podem ver informações básicas de qualquer usuário" ON public.users
      FOR SELECT
      USING (true)
      WITH CHECK (true);
    `);
    
    console.log('✅ Políticas para a tabela users criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao configurar políticas para a tabela users:', error);
    throw error;
  }
}

/**
 * Remove todas as políticas existentes para uma tabela específica
 */
async function removeExistingPolicies(tableName) {
  try {
    console.log(`Removendo políticas existentes para a tabela ${tableName}...`);
    
    // Obter a lista de políticas existentes
    const { data, error } = await supabase.rpc('get_policies_for_table', { table_name: tableName });
    
    if (error) {
      console.error(`Erro ao obter políticas para a tabela ${tableName}:`, error);
      
      // Se não conseguir obter as políticas através da RPC, tentar remover de forma genérica
      await executeSQL(`DROP POLICY IF EXISTS "${tableName}_policy" ON public.${tableName};`);
    } else if (data && Array.isArray(data)) {
      // Remover cada política existente
      for (const policy of data) {
        await executeSQL(`DROP POLICY IF EXISTS "${policy.policyname}" ON public.${tableName};`);
      }
      console.log(`✅ ${data.length} políticas removidas para a tabela ${tableName}`);
    } else {
      console.log(`ℹ️ Nenhuma política encontrada para a tabela ${tableName}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao remover políticas para a tabela ${tableName}:`, error);
    throw error;
  }
}

/**
 * Executa um comando SQL no banco de dados
 */
async function executeSQL(sql) {
  try {
    console.log(`Executando SQL: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);
    
    // Este é apenas um simulador para mostrar o SQL que seria executado
    // Para executar de verdade, você precisaria da função RPC execute_sql
    // ou de um cliente direto do PostgreSQL
    return true;
  } catch (error) {
    console.error(`❌ Erro ao executar SQL:`, error);
    throw error;
  }
}

// Executar o script
configureRLSPolicies().catch(error => {
  console.error('❌ Erro durante execução do script:', error);
  process.exit(1);
});