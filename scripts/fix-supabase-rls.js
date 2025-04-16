/**
 * Script para configurar as políticas RLS no Supabase
 * Permite inserção de usuários no banco de dados
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
// A chave de serviço bypassa políticas de RLS
const supabase = createClient(supabaseUrl, supabaseKey);

async function configureRLSPolicies() {
  console.log('Configurando políticas de segurança RLS no Supabase...');
  
  try {
    // Verificando as permissões do cliente
    console.log('Verificando permissões na tabela users...');
    
    // Tentando buscar um usuário para testar permissões
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      console.error('Erro ao acessar a tabela users:', usersError);
      console.log('A chave de serviço pode não ter as permissões necessárias');
    } else {
      console.log('✅ Acesso à tabela users confirmado');
    }
    
    // Verificar se já existe a política para inserção de usuários
    console.log('Verificando se a tabela users tem RLS ativado...');
    
    // Criar política para inserção na tabela users
    // Isso requer executar SQL, mas só pode ser feito no painel do Supabase
    console.log(`
Para resolver o problema de cadastro de usuários, você precisa:

1. Fazer login no painel de administração do Supabase (https://supabase.com/dashboard)
2. Selecionar o projeto: ${supabaseUrl.replace('https://', '').replace('.supabase.co', '')}
3. Navegar até "Authentication" -> "Policies"
4. Na tabela "users":
   - Verificar se o RLS está ativado (deve estar)
   - Adicionar uma nova política com as seguintes configurações:
     * Nome: "Allow inserts for new users"
     * Operação: INSERT
     * Target roles: authenticated, anon
     * Using expression: true
     * With check expression: true

Isso permitirá que usuários anônimos ou autenticados insiram novos registros na tabela users.

Alternativamente, você pode desativar o RLS para a tabela users, mas isso não é recomendado 
em ambientes de produção.
`);
    
    console.log('Para mais detalhes sobre como configurar RLS no Supabase, consulte:');
    console.log('https://supabase.com/docs/guides/auth/row-level-security');
    
  } catch (error) {
    console.error('Erro ao configurar políticas RLS:', error);
  }
}

// Executar a função principal
configureRLSPolicies()
  .catch(err => {
    console.error('Falha ao executar o script:', err);
  })
  .finally(() => {
    console.log('Script concluído.');
  });