/**
 * Este script executa SQL diretamente no Supabase para adicionar as colunas necessárias
 * à tabela de usuários (auth_id e password)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
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

async function updateTables() {
  try {
    console.log('Iniciando atualização das tabelas...');
    
    // Verificar se as colunas auth_id e password existem na tabela users
    console.log('Verificando a estrutura da tabela users...');
    
    // auth_id
    const hasAuthIdColumn = await checkColumnExists('users', 'auth_id');
    if (!hasAuthIdColumn) {
      console.log('Adicionando coluna auth_id à tabela users...');
      await executeSQL(`ALTER TABLE public.users ADD COLUMN auth_id UUID;`);
      console.log('✅ Coluna auth_id adicionada com sucesso!');
    } else {
      console.log('✅ Coluna auth_id já existe na tabela users');
    }
    
    // password
    const hasPasswordColumn = await checkColumnExists('users', 'password');
    if (!hasPasswordColumn) {
      console.log('Adicionando coluna password à tabela users...');
      await executeSQL(`ALTER TABLE public.users ADD COLUMN password VARCHAR NOT NULL DEFAULT '';`);
      console.log('✅ Coluna password adicionada com sucesso!');
    } else {
      console.log('✅ Coluna password já existe na tabela users');
    }
    
    console.log('✅ Atualização das tabelas concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao atualizar as tabelas:', error);
    process.exit(1);
  }
}

async function checkColumnExists(tableName, columnName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .eq('column_name', columnName);
    
    if (error) {
      console.error(`Erro ao verificar a coluna ${columnName}:`, error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error(`Erro ao verificar a existência da coluna ${columnName}:`, error);
    return false;
  }
}

async function executeSQL(sql) {
  try {
    // No Supabase, não temos a função RPC execute_sql disponível diretamente
    // Aqui, usamos um recurso alternativo que envolve chamada direta ao PostgreSQL
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      console.error('Erro ao executar SQL:', error);
      
      // Se a função RPC não estiver disponível, avisar o usuário
      console.log(`
        ❗ Não foi possível executar o SQL automaticamente.
        Por favor, execute o seguinte SQL no console SQL do Supabase:
        
        ${sql}
      `);
      
      // Salvar SQL em um arquivo para execução manual
      const fileName = 'manual_sql_update.sql';
      fs.appendFileSync(fileName, sql + '\n');
      console.log(`SQL salvo no arquivo ${fileName} para execução manual.`);
    }
    
    return data || { success: true };
  } catch (error) {
    console.error('Erro ao executar SQL:', error);
    throw error;
  }
}

// Executar o script
updateTables().catch(error => {
  console.error('Erro durante execução do script:', error);
  process.exit(1);
});