
import { supabase } from '../server/supabase';

async function testSupabaseConnection() {
  console.log('Testando conexão com o Supabase...');
  console.log('URL do Supabase:', process.env.SUPABASE_URL || 'Usando valor padrão');

  try {
    // Verificar conexão básica
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
        console.log('Colunas da tabela users:');
        console.log(userColumns.map(col => col.column_name).join(', '));
      }
    } catch (err) {
      console.log('❌ Erro ao verificar colunas da tabela users:', err);
    }

    // Tentar listar as tabelas disponíveis
    try {
      const { data: tables, error: tablesError } = await supabase
        .rpc('test_query', { query_text: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'" });

      if (tablesError) throw tablesError;

      console.log('Tabelas disponíveis:');
      console.log(tables.map(t => t.table_name).join(', '));
      
      // Verificar dados na tabela users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');
        
      if (usersError) {
        console.log('❌ Erro ao verificar dados na tabela users:', usersError);
      } else {
        console.log(`Dados na tabela users: ${usersData.length} registros`);
        if (usersData.length > 0) {
          console.log('Primeiro registro:', JSON.stringify(usersData[0], null, 2));
        }
      }
    } catch (err) {
      console.log('❌ Erro ao listar tabelas:', err);
    }

  } catch (error) {
    console.log('❌ Erro ao conectar com o Supabase:', error);
  }
}

testSupabaseConnection();
