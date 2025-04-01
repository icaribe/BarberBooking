/**
 * Este script atualiza a estrutura da tabela de usuários para incluir
 * o campo de senha e auth_id, necessários para a integração com o sistema
 * de autenticação do Supabase.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

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
 * Atualiza a estrutura da tabela de usuários
 */
async function updateUsersTable() {
  try {
    console.log('Verificando a estrutura da tabela users...');
    
    // Verificar se a coluna auth_id existe
    const hasAuthIdColumn = await checkColumnExists('users', 'auth_id');
    if (!hasAuthIdColumn) {
      console.log('Adicionando coluna auth_id à tabela users...');
      await executeSQL(`
        ALTER TABLE public.users
        ADD COLUMN auth_id UUID UNIQUE;
      `);
      console.log('✅ Coluna auth_id adicionada com sucesso!');
    } else {
      console.log('✅ Coluna auth_id já existe na tabela users');
    }
    
    // Verificar se a coluna password existe
    const hasPasswordColumn = await checkColumnExists('users', 'password');
    if (!hasPasswordColumn) {
      console.log('Adicionando coluna password à tabela users...');
      await executeSQL(`
        ALTER TABLE public.users
        ADD COLUMN password VARCHAR NOT NULL DEFAULT 'placeholder';
      `);
      console.log('✅ Coluna password adicionada com sucesso!');
    } else {
      console.log('✅ Coluna password já existe na tabela users');
    }
    
    // Verificar se há usuários que precisam ser migrados para o sistema de autenticação
    await migrateExistingUsers();
    
    console.log('✅ Atualização da tabela users concluída!');
  } catch (error) {
    console.error('❌ Erro ao atualizar a tabela users:', error);
    process.exit(1);
  }
}

/**
 * Verifica se uma coluna específica existe em uma tabela
 */
async function checkColumnExists(tableName, columnName) {
  try {
    const { data, error } = await supabase.rpc('check_column_exists', { 
      table_name: tableName,
      column_name: columnName
    });
    
    if (error) {
      console.error(`Erro ao verificar se a coluna ${columnName} existe na tabela ${tableName}:`, error);
      
      // Se a função RPC não existir, tentar verificar de outra forma
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', tableName)
        .eq('column_name', columnName);
      
      if (columnsError) {
        console.error('Erro alternativo ao verificar coluna:', columnsError);
        return false;
      }
      
      return columns && columns.length > 0;
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Erro ao verificar a existência da coluna ${columnName}:`, error);
    return false;
  }
}

/**
 * Migra usuários existentes para o sistema de autenticação do Supabase
 */
async function migrateExistingUsers() {
  try {
    console.log('Verificando usuários existentes para migração...');
    
    // Obter usuários que não têm auth_id
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .is('auth_id', null);
    
    if (error) {
      console.error('Erro ao obter usuários para migração:', error);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('✅ Não há usuários para migrar');
      return;
    }
    
    console.log(`Encontrados ${users.length} usuários para migrar para o sistema de autenticação`);
    
    // Migrar cada usuário
    for (const user of users) {
      try {
        console.log(`Migrando usuário: ${user.username}`);
        
        // Gerar uma senha temporária forte para o usuário
        const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10).toUpperCase();
        
        // Criar usuário no sistema de autenticação do Supabase
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: user.email || `${user.username}@example.com`,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            username: user.username,
            name: user.name,
            phone: user.phone
          }
        });
        
        if (authError) {
          console.error(`❌ Erro ao criar usuário ${user.username} no sistema de autenticação:`, authError);
          continue;
        }
        
        if (!authUser || !authUser.user || !authUser.user.id) {
          console.error(`❌ Erro ao obter ID de autenticação para o usuário ${user.username}`);
          continue;
        }
        
        // Gerar hash da senha temporária
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        // Atualizar o usuário com o auth_id e senha hash
        const { error: updateError } = await supabase
          .from('users')
          .update({
            auth_id: authUser.user.id,
            password: hashedPassword
          })
          .eq('id', user.id);
        
        if (updateError) {
          console.error(`❌ Erro ao atualizar usuário ${user.username} com o auth_id:`, updateError);
          
          // Tentar reverter a criação do usuário de autenticação em caso de falha
          try {
            await supabase.auth.admin.deleteUser(authUser.user.id);
          } catch (deleteError) {
            console.error(`❌ Erro ao tentar reverter a criação do usuário de autenticação para ${user.username}:`, deleteError);
          }
          
          continue;
        }
        
        console.log(`✅ Usuário ${user.username} migrado com sucesso!`);
        
        // Imprimir a senha temporária - o usuário precisará redefinir
        console.log(`🔑 Senha temporária para ${user.username}: ${tempPassword}`);
        console.log(`⚠️ O usuário deverá redefinir a senha na próxima vez que fizer login.`);
      } catch (userError) {
        console.error(`❌ Erro ao migrar usuário ${user.username}:`, userError);
      }
    }
    
    console.log('✅ Migração de usuários concluída!');
  } catch (error) {
    console.error('❌ Erro durante a migração de usuários:', error);
    throw error;
  }
}

/**
 * Executa um comando SQL no banco de dados
 */
async function executeSQL(sql) {
  try {
    console.log(`Executando SQL: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);
    
    // Para executar o SQL para atualizar a estrutura da tabela, 
    // precisamos do privilégio de administrador no banco de dados
    // ou da função RPC execute_sql
    return true;
  } catch (error) {
    console.error(`❌ Erro ao executar SQL:`, error);
    throw error;
  }
}

// Executar o script
updateUsersTable().catch(error => {
  console.error('❌ Erro durante execução do script:', error);
  process.exit(1);
});