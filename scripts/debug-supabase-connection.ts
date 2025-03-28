import { supabase } from '../server/supabase';

async function testSupabaseConnection() {
  console.log('Testando conexão com o Supabase...');

  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);

    if (error) throw error;

    console.log('✅ Conexão com o Supabase estabelecida com sucesso!');

    // Verificar estrutura da tabela users
    try {
      const { data: userColumns, error: columnsError } = await supabase
        .rpc('test_query', { query_text: "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users'" });

      if (columnsError) {
        console.log('❌ Erro ao verificar colunas da tabela users:', columnsError);
      } else {
        console.log('Colunas da tabela users:', userColumns.map(col => col.column_name).join(', '));
      }
    } catch (err) {
      console.log('❌ Erro ao verificar colunas da tabela users:', err);
    }

    // Tentar listar as tabelas disponíveis
    try {
      const { data: tables, error: tablesError } = await supabase
        .rpc('test_query', { query_text: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'" });

      if (tablesError) throw tablesError;

      console.log('Tabelas disponíveis:', tables.map(t => t.table_name).join(', '));
    } catch (err) {
      console.log('❌ Erro ao listar tabelas:', err);
    }

  } catch (error) {
    console.log('❌ Erro ao conectar com o Supabase:', error);
  }
}

testSupabaseConnection();