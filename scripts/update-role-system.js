/**
 * Script para atualizar o sistema de papéis de usuário
 * 
 * Este script modifica o sistema atual para usar a coluna 'role' 
 * que foi adicionada à tabela 'users' no Supabase, substituindo
 * o workaround anterior baseado em emails/usernames.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Criar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateRoleSystem() {
  console.log('Iniciando atualização do sistema de papéis...');
  
  try {
    // 1. Verificar se a coluna role existe
    console.log('Verificando coluna role na tabela users...');
    const { data: columnInfo, error: columnError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'role'
      `
    });
    
    if (columnError) {
      console.error('Erro ao verificar coluna role:', columnError);
      process.exit(1);
    }
    
    if (!columnInfo || columnInfo.length === 0) {
      console.error('A coluna role não foi encontrada na tabela users!');
      console.log('Por favor, execute o script SQL para adicionar a coluna role primeiro.');
      process.exit(1);
    }
    
    console.log('Coluna role encontrada! Tipo:', columnInfo[0]?.data_type);
    
    // 2. Garantir que os papéis estejam atualizados para os usuários existentes
    console.log('Atualizando papéis para corresponder ao workaround anterior...');
    
    // 2.1 Atualizar administradores
    const { error: adminError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .or('email.eq.johnatanlima26@gmail.com,username.eq.johnata');
    
    if (adminError) {
      console.error('Erro ao atualizar administradores:', adminError);
    } else {
      console.log('Administradores atualizados com sucesso!');
    }
    
    // 2.2 Atualizar profissionais
    const { error: profError } = await supabase
      .from('users')
      .update({ role: 'professional' })
      .or('username.eq.carlos,username.eq.jorran,username.eq.iuri,username.eq.mikael')
      .not('role', 'eq', 'admin'); // Não alterar se já for admin
    
    if (profError) {
      console.error('Erro ao atualizar profissionais:', profError);
    } else {
      console.log('Profissionais atualizados com sucesso!');
    }
    
    // 2.3 Garantir que todos os outros usuários sejam clientes
    const { error: custError } = await supabase
      .from('users')
      .update({ role: 'customer' })
      .is('role', null);
    
    if (custError) {
      console.error('Erro ao atualizar clientes:', custError);
    } else {
      console.log('Clientes atualizados com sucesso!');
    }
    
    // 3. Verificar os resultados
    const { data: userCounts, error: countError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
      `
    });
    
    if (countError) {
      console.error('Erro ao contar usuários por papel:', countError);
    } else {
      console.log('Distribuição de papéis de usuário:');
      console.table(userCounts);
    }
    
    console.log('Atualização do sistema de papéis concluída!');
  } catch (error) {
    console.error('Erro durante a atualização do sistema de papéis:', error);
    process.exit(1);
  }
}

// Executar o script
updateRoleSystem()
  .then(() => {
    console.log('Script concluído com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro durante a execução do script:', error);
    process.exit(1);
  });