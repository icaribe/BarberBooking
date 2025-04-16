/**
 * Script para configurar funções RPC no Supabase
 * Cria funções que permitem inserção direta de usuários contornando RLS
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

/**
 * Função SQL para criar um usuário diretamente no banco de dados
 * Esta função usa SECURITY DEFINER para ignorar políticas RLS
 */
const createUserDirectSQL = `
CREATE OR REPLACE FUNCTION create_user_direct(
  username TEXT,
  email TEXT,
  role TEXT,
  password_hash TEXT,
  name TEXT DEFAULT NULL,
  phone TEXT DEFAULT NULL,
  auth_id UUID DEFAULT NULL
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_user_id INTEGER;
  result JSONB;
BEGIN
  -- Inserir o usuário na tabela users
  INSERT INTO users (username, email, name, phone, password, role, auth_id)
  VALUES (username, email, name, phone, password_hash, role::user_role, auth_id)
  RETURNING id INTO new_user_id;
  
  -- Buscar o usuário criado
  SELECT jsonb_build_object(
    'id', u.id,
    'username', u.username,
    'email', u.email,
    'role', u.role,
    'created_at', u.created_at
  ) INTO result
  FROM users u
  WHERE u.id = new_user_id;
  
  RETURN result;
END;
$$;
`;

/**
 * Função para configurar o Supabase com as funções RPC necessárias
 */
async function setupSupabaseRPC() {
  try {
    console.log('Iniciando configuração de funções RPC no Supabase...');
    
    // Verificar se temos acesso SQL
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
    
    // Criar a função SQL para inserção direta
    console.log('\nCriando função RPC para inserção direta de usuários...');
    
    console.log(`
Para criar a função RPC que contorna as políticas RLS, você precisa executar o seguinte SQL no Supabase:

${createUserDirectSQL}

Para executar este SQL:
1. Acesse o painel do Supabase (https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para "SQL Editor" no menu lateral
4. Crie uma nova consulta
5. Cole o código SQL acima
6. Execute a consulta

Depois de criar essa função, você poderá chamar 'supabase.rpc("create_user_direct", {...})' 
para criar usuários diretamente, contornando as políticas RLS.
`);
    
    // Verificar se a função já existe
    console.log('\nVerificando se a função RPC já existe...');
    
    try {
      const { data, error } = await supabase.rpc('create_user_direct', {
        username: 'test_user',
        email: 'test@example.com',
        role: 'customer',
        password_hash: 'test_hash'
      });
      
      if (!error || error.message.includes('does not exist')) {
        console.log('❌ A função RPC ainda não existe ou não está configurada corretamente.');
        console.log('Por favor, siga as instruções acima para criar a função RPC.');
      } else {
        console.log('✅ A função RPC parece já existir, mas retornou um erro:', error.message);
        console.log('Verifique se os parâmetros estão corretos.');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar função RPC:', error.message);
      console.log('Por favor, crie a função RPC manualmente seguindo as instruções acima.');
    }
    
    console.log('\n===================================================================');
    console.log('Alternativamente, você pode desabilitar o RLS na tabela "users":');
    console.log('1. Acesse o painel do Supabase');
    console.log('2. Vá para "Authentication" -> "Policies"');
    console.log('3. Encontre a tabela "users"');
    console.log('4. Desative o RLS para essa tabela');
    console.log('⚠️ ATENÇÃO: Isso permite que qualquer um acesse a tabela "users"');
    console.log('           Só é recomendado para ambiente de desenvolvimento!');
    console.log('===================================================================\n');
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    process.exit(1);
  }
}

// Executar a função principal
setupSupabaseRPC().then(() => {
  console.log('\n✨ Configuração de RPC concluída!');
}).catch(error => {
  console.error('❌ Falha na configuração:', error);
});