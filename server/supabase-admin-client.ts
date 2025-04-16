/**
 * Cliente Supabase com permissões administrativas que bypassa RLS
 * Este cliente é usado apenas para operações que precisam ignorar as políticas RLS
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Verificar e extrair variáveis de ambiente necessárias
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Verificar se as variáveis de ambiente estão definidas
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são necessárias');
  process.exit(1);
}

// Criar cliente Supabase com a chave de serviço para operações administrativas
// Este cliente tem permissões para ignorar políticas RLS
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-admin-client'
    }
  }
});

// Verificar conexão
async function testSupabaseAdminConnection() {
  try {
    console.log('Testando conexão do cliente admin Supabase...');
    
    const { data, error } = await supabaseAdmin.from('users').select('count');
    
    if (error) {
      console.error('❌ Erro na conexão admin do Supabase:', error);
      return false;
    }
    
    console.log('✅ Conexão admin do Supabase estabelecida com sucesso!');
    
    // Verificar se temos permissões de inserção
    try {
      // Tentar criar um usuário de teste temporário
      const testUsername = `test_${Date.now()}`;
      const testEmail = `${testUsername}@test.com`;
      
      const { data: testUser, error: insertError } = await supabaseAdmin.rpc('create_user_direct', { 
        username: testUsername,
        email: testEmail,
        role: 'customer',
        password_hash: 'temporary_hash'
      });
      
      if (insertError) {
        console.error('❌ Sem permissão de inserção na tabela users:', insertError);
        console.log('❗ É necessário configurar uma função RPC no Supabase para inserção de usuários');
        return false;
      }
      
      console.log('✅ Permissão de inserção na tabela users confirmada!');
      
      // Limpar o teste
      await supabaseAdmin.from('users').delete().eq('username', testUsername);
      
      return true;
    } catch (testError) {
      console.error('❌ Erro ao testar permissões de inserção:', testError);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar conexão admin do Supabase:', error);
    return false;
  }
}

export { supabaseAdmin, testSupabaseAdminConnection };