/**
 * Script para atualizar as políticas de segurança da tabela cash_flow
 * 
 * Este script configura as políticas de acesso à tabela cash_flow
 * baseando-se na coluna role da tabela users.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Criar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateCashFlowPolicies() {
  console.log('Configurando políticas de segurança para a tabela cash_flow...');
  
  try {
    // Verificar se a tabela cash_flow existe
    console.log('Verificando a tabela cash_flow...');
    const { data: tableExists, error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'cash_flow'
        );
      `
    });
    
    if (tableError) {
      console.error('Erro ao verificar tabela cash_flow:', tableError);
      process.exit(1);
    }
    
    if (!tableExists || !tableExists[0]?.exists) {
      console.error('A tabela cash_flow não existe!');
      console.log('Por favor, execute o script SQL para criar a tabela cash_flow primeiro.');
      process.exit(1);
    }
    
    console.log('Tabela cash_flow encontrada!');
    
    // Verificar se a coluna role existe
    console.log('Verificando coluna role na tabela users...');
    const { data: columnInfo, error: columnError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name 
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
    
    console.log('Coluna role encontrada! Atualizando políticas...');
    
    // Remover políticas existentes
    console.log('Removendo políticas existentes...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS cash_flow_all_access ON public.cash_flow;
        DROP POLICY IF EXISTS cash_flow_admin_policy ON public.cash_flow;
        DROP POLICY IF EXISTS cash_flow_full_access ON public.cash_flow;
      `
    });
    
    if (dropError) {
      console.error('Erro ao remover políticas existentes:', dropError);
    } else {
      console.log('Políticas anteriores removidas com sucesso!');
    }
    
    // Criar política para admins (acesso total)
    console.log('Criando política para administradores...');
    const { error: adminPolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY cash_flow_admin_policy ON public.cash_flow
        FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_id = auth.uid()
            AND users.role = 'admin'
          )
        );
      `
    });
    
    if (adminPolicyError) {
      console.error('Erro ao criar política para administradores:', adminPolicyError);
    } else {
      console.log('Política para administradores criada com sucesso!');
    }
    
    // Criar política para leitura por profissionais
    console.log('Criando política de leitura para profissionais...');
    const { error: profReadPolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY cash_flow_professional_read_policy ON public.cash_flow
        FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_id = auth.uid()
            AND users.role = 'professional'
          )
        );
      `
    });
    
    if (profReadPolicyError) {
      console.error('Erro ao criar política de leitura para profissionais:', profReadPolicyError);
    } else {
      console.log('Política de leitura para profissionais criada com sucesso!');
    }
    
    console.log('Configuração de políticas concluída!');
  } catch (error) {
    console.error('Erro durante a configuração de políticas:', error);
    process.exit(1);
  }
}

// Executar o script
updateCashFlowPolicies()
  .then(() => {
    console.log('Script concluído com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro durante a execução do script:', error);
    process.exit(1);
  });