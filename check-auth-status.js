/**
 * Script para verificar o status da autenticação no Supabase
 * para diagnosticar problemas de acesso às APIs
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Verificar se as variáveis de ambiente estão definidas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('Erro: Variáveis de ambiente SUPABASE_URL e/ou SUPABASE_ANON_KEY não definidas.');
  console.error('Certifique-se de que as variáveis de ambiente estão configuradas no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkAuthStatus() {
  console.log('Verificando status de autenticação no Supabase...');
  console.log('URL do Supabase:', process.env.SUPABASE_URL);
  
  try {
    // Verificar usuário atual (se houver)
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Erro ao verificar usuário atual:', error.message);
      return;
    }
    
    if (user) {
      console.log('✅ Usuário autenticado:');
      console.log(`- ID de autenticação: ${user.id}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Criado em: ${user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}`);
      
      // Verificar sessão
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao verificar sessão:', sessionError.message);
      } else if (session) {
        console.log('✅ Sessão ativa:');
        console.log(`- Expira em: ${new Date(session.expires_at * 1000).toLocaleString()}`);
        
        // Testar acesso à API de agendamentos
        console.log('\nTestando acesso à API de agendamentos...');
        
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .limit(5);
        
        if (appointmentsError) {
          console.error('❌ Erro ao acessar agendamentos:', appointmentsError.message);
          
          if (appointmentsError.message.includes('permission denied')) {
            console.log('\n🔑 SOLUÇÃO: O usuário autenticado não tem permissão para acessar a tabela appointments.');
            console.log('Verifique as políticas RLS (Row Level Security) no Supabase para esta tabela.');
          }
        } else {
          console.log(`✅ Acesso concedido! Encontrados ${appointments.length} agendamentos.`);
          if (appointments.length > 0) {
            console.log('\nExemplo de agendamento:');
            console.log(appointments[0]);
          }
        }
      } else {
        console.log('❌ Nenhuma sessão ativa encontrada.');
      }
    } else {
      console.log('❌ Nenhum usuário autenticado.');
      
      // Criar usuário test para teste (apenas se necessário)
      console.log('\nDeseja criar um usuário de teste para diagnosticar problemas de autenticação?');
      console.log('Execute o seguinte comando se desejar:');
      console.log('node -e "require(\'./check-auth-status.js\').createTestUser()"');
    }
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Função para criar um usuário de teste, caso seja necessário
async function createTestUser() {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Test123456!';
  
  console.log(`Criando usuário de teste com email: ${testEmail}`);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (error) {
      console.error('Erro ao criar usuário de teste:', error.message);
      return;
    }
    
    console.log('✅ Usuário de teste criado com sucesso!');
    console.log('- Email:', testEmail);
    console.log('- Senha:', testPassword);
    console.log('\nFaça login com estas credenciais para testar a autenticação.');
  } catch (error) {
    console.error('Erro geral ao criar usuário de teste:', error);
  }
}

// Executar verificação
checkAuthStatus();

// Exportar a função createTestUser para uso externo
module.exports = { createTestUser };