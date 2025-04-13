import { supabase, supabaseAdmin, testSupabaseConnection } from '../shared/supabase-client';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function main() {
  console.log('\n=== Verificação de Conexão com o Supabase ===\n');
  
  // Verificando variáveis de ambiente
  console.log('Verificando variáveis de ambiente:');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  const useSupabase = process.env.USE_SUPABASE;
  
  console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`USE_SUPABASE: ${useSupabase ? `✅ Configurado (${useSupabase})` : '❌ Não configurado'}`);
  
  // Testando conexão com o Supabase
  console.log('\nTentando conexão com o Supabase...');
  const isConnected = await testSupabaseConnection();
  
  if (isConnected) {
    console.log('✅ Conexão bem-sucedida com o Supabase!');
    
    // Verificando tabelas existentes usando SQL direta
    console.log('\nVerificando tabelas existentes:');
    try {
      // No Supabase, não podemos consultar diretamente information_schema,
      // então vamos usar um método alternativo para verificar algumas tabelas comuns
      console.log('Tentando verificar algumas tabelas comuns...');
      
      // Tentando obter lista de usuários para ver se a tabela existe
      const { error: usersError } = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1);

      if (usersError) {
        if (usersError.code === 'PGRST116') {
          console.log('❌ Tabela "users" não encontrada');
        } else {
          console.error('❌ Erro ao verificar tabela users:', usersError);
        }
      } else {
        console.log('✅ Tabela "users" encontrada');
      }
      
      // Tentando obter lista de serviços para ver se a tabela existe
      const { error: servicesError } = await supabaseAdmin
        .from('services')
        .select('count')
        .limit(1);

      if (servicesError) {
        if (servicesError.code === 'PGRST116') {
          console.log('❌ Tabela "services" não encontrada');
        } else {
          console.error('❌ Erro ao verificar tabela services:', servicesError);
        }
      } else {
        console.log('✅ Tabela "services" encontrada');
      }
      
      // Tentando obter lista de produtos para ver se a tabela existe
      const { error: productsError } = await supabaseAdmin
        .from('products')
        .select('count')
        .limit(1);

      if (productsError) {
        if (productsError.code === 'PGRST116') {
          console.log('❌ Tabela "products" não encontrada');
        } else {
          console.error('❌ Erro ao verificar tabela products:', productsError);
        }
      } else {
        console.log('✅ Tabela "products" encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao listar tabelas:', error);
    }
  } else {
    console.error('❌ Falha na conexão com o Supabase. Verifique as variáveis de ambiente e credenciais.');
  }
  
  console.log('\n=== Verificação Concluída ===\n');
}

main().catch(error => {
  console.error('Erro durante a verificação:', error);
  process.exit(1);
});