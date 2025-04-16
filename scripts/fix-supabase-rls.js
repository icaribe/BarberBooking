/**
 * Script para configurar corretamente as políticas RLS no Supabase
 * Este script cria políticas que permitem:
 * 1. Inserção de novos usuários durante o registro
 * 2. Leitura de dados pelos próprios usuários
 * 3. Acesso administrativo para usuários com role='admin'
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são necessárias');
  process.exit(1);
}

// Criando o cliente do Supabase com a chave de serviço
const supabase = createClient(supabaseUrl, supabaseKey);

// SQL para configurar políticas RLS na tabela users
const setupUsersPoliciesSQL = `
-- Primeiro, vamos garantir que RLS esteja ativado na tabela
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON users;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios dados" ON users;
DROP POLICY IF EXISTS "Admins podem ver todos os dados" ON users;
DROP POLICY IF EXISTS "Admins podem inserir dados" ON users;
DROP POLICY IF EXISTS "Admins podem atualizar dados" ON users;
DROP POLICY IF EXISTS "Admins podem deletar dados" ON users;
DROP POLICY IF EXISTS "Service role pode fazer tudo" ON users;

-- Política para permitir que qualquer usuário autenticado INSIRA novos usuários (necessário para registro)
CREATE POLICY "Permitir inserção de novos usuários" ON users
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para permitir que usuários VEJAM seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados" ON users
FOR SELECT
TO authenticated
USING (auth.uid() = auth_id);

-- Política para permitir que usuários ATUALIZEM seus próprios dados
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- Políticas para administradores terem acesso total
CREATE POLICY "Admins podem ver todos os dados" ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admins podem inserir dados" ON users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admins podem atualizar dados" ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid() AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admins podem deletar dados" ON users
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid() AND users.role = 'admin'
  )
);

-- Política para permitir que a role de serviço tenha acesso completo
CREATE POLICY "Service role pode fazer tudo" ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
`;

/**
 * Função para configurar as políticas RLS no Supabase
 */
async function setupRLSPolicies() {
  try {
    console.log('Iniciando configuração de políticas RLS no Supabase...');
    
    // Verificar se temos acesso
    console.log('\nTestando conexão com o banco de dados...');
    
    try {
      const { data, error } = await supabase.from('users').select('count');
      
      if (error) {
        console.error('❌ Erro ao conectar com o banco de dados:', error);
        process.exit(1);
      }
      
      console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      process.exit(1);
    }
    
    // Script para configurar políticas
    console.log('\nPara configurar corretamente as políticas RLS, execute o seguinte SQL no Supabase:');
    console.log('\n==========================================================');
    console.log(setupUsersPoliciesSQL);
    console.log('==========================================================\n');
    
    console.log('Instruções para executar este SQL:');
    console.log('1. Acesse o painel do Supabase (https://supabase.com/dashboard)');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá para "SQL Editor" no menu lateral');
    console.log('4. Crie uma nova consulta');
    console.log('5. Cole o código SQL acima');
    console.log('6. Execute a consulta\n');
    
    // Alternativa: tentar executar o SQL diretamente via API REST
    console.log('Tentando aplicar políticas RLS diretamente via API...');
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          sql: setupUsersPoliciesSQL
        })
      });
      
      if (response.ok) {
        console.log('✅ Políticas RLS aplicadas com sucesso via API!');
      } else {
        const errorData = await response.json();
        console.log('❌ Não foi possível aplicar políticas RLS via API:', errorData);
        console.log('Por favor, aplique manualmente seguindo as instruções acima.');
      }
    } catch (error) {
      console.log('❌ Erro ao tentar aplicar políticas RLS via API:', error);
      console.log('Por favor, aplique manualmente seguindo as instruções acima.');
    }
    
    console.log('\n===================================================================');
    console.log('Estas políticas RLS permitem:');
    console.log('1. Qualquer usuário autenticado pode se registrar (inserir novo usuário)');
    console.log('2. Usuários podem ver e atualizar apenas seus próprios dados');
    console.log('3. Administradores têm acesso completo a todos os dados');
    console.log('4. A chave de serviço (service_role) tem acesso completo a todos os dados');
    console.log('===================================================================\n');
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    process.exit(1);
  }
}

// Executar a função principal
setupRLSPolicies().then(() => {
  console.log('\n✨ Configuração de políticas RLS concluída!');
}).catch(error => {
  console.error('❌ Falha na configuração:', error);
});