
import { supabase } from '../server/supabase';
import dotenv from 'dotenv';
import { db } from '../server/db';

// Carregar variáveis de ambiente
dotenv.config();

async function testSupabaseConnection() {
  console.log('Testando conexão com o Supabase...');
  console.log('URL do Supabase:', process.env.SUPABASE_URL || 'Usando valor padrão');
  console.log('Database URL:', process.env.DATABASE_URL ? 'Configurada' : 'Não configurada');

  try {
    // Verificar conexão básica via API
    console.log('\n1. Testando conexão via API Supabase:');
    const { data, error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      console.log('❌ Erro na conexão API Supabase:', error);
    } else {
      console.log('✅ Conexão API Supabase estabelecida com sucesso!');
    }

    // Verificar tabelas disponíveis
    console.log('\n2. Listando tabelas disponíveis:');
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (tablesError) {
      console.log('❌ Erro ao verificar tabela users:', tablesError);
    } else {
      console.log('✅ Tabela users acessível');
    }
    
    // Testar categorias de serviços
    console.log('\n3. Testando acesso à tabela service_categories:');
    const { data: categories, error: categoriesError } = await supabase
      .from('service_categories')
      .select('*');
      
    if (categoriesError) {
      console.log('❌ Erro ao acessar service_categories:', categoriesError);
    } else {
      console.log(`✅ Categorias de serviços encontradas: ${categories.length}`);
      if (categories.length > 0) {
        console.log('   Primeira categoria:', categories[0]);
      }
    }
    
    // Testar conexão direta com o banco de dados via drizzle
    console.log('\n4. Testando conexão direta ao banco via Drizzle:');
    try {
      // Executar uma consulta simples para verificar a conexão
      const result = await db.execute(sql`SELECT current_timestamp`);
      console.log('✅ Conexão direta com o banco estabelecida!');
    } catch (dbError) {
      console.log('❌ Erro na conexão direta com o banco:', dbError);
    }

  } catch (error) {
    console.log('❌ Erro geral ao conectar com o Supabase:', error);
  }
}

// Importação do sql para consultas diretas
import { sql } from 'drizzle-orm';

testSupabaseConnection();
