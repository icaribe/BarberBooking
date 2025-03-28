
import { supabase } from '../server/supabase';

async function debugSupabaseConnection() {
  console.log('Testando conexão com o Supabase...');

  try {
    // Verificar a conexão
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão com o Supabase:', error);
      return;
    }
    
    console.log('✅ Conexão com o Supabase estabelecida com sucesso!');
    
    // Listar todas as tabelas
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('❌ Erro ao listar tabelas:', tablesError);
      return;
    }
    
    console.log('\nTabelas existentes no Supabase:');
    if (tables && tables.length > 0) {
      tables.forEach(t => console.log(`- ${t.table_name}`));
    } else {
      console.log('Nenhuma tabela encontrada.');
    }
    
    // Verificar estrutura da tabela de usuários
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'users');
    
    if (columnsError) {
      console.error('❌ Erro ao verificar estrutura da tabela users:', columnsError);
      return;
    }
    
    console.log('\nEstrutura da tabela de usuários:');
    if (columns && columns.length > 0) {
      columns.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));
    } else {
      console.log('Tabela users não encontrada ou sem colunas.');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

// Executar função de debug
debugSupabaseConnection();
