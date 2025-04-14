/**
 * Script para corrigir a estrutura da tabela appointments
 * adicionando a coluna completed_at necessária
 */

import supabase from './server/supabase.ts';

async function fixAppointmentsTable() {
  try {
    console.log('\n==== Verificando e corrigindo tabela appointments ====');
    
    // 1. Primeiro, vamos verificar a estrutura da tabela
    const { data: tableInfo, error: tableError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Erro ao verificar tabela appointments:', tableError);
      throw new Error('Não foi possível verificar a tabela appointments');
    }
    
    console.log('Tabela appointments existe e está acessível.');
    
    // 2. Tentar acessar a coluna completed_at
    try {
      const { data: testData, error: columnError } = await supabase
        .from('appointments')
        .select('completed_at')
        .limit(1);
      
      if (!columnError) {
        console.log('✅ A coluna completed_at já existe.');
        console.log('Dados de teste:', testData);
        return true;
      }
      
      console.log('❌ Erro ao acessar coluna completed_at:', columnError.message);
      
      // 3. Se a coluna não existe, precisamos informar ao usuário como adicioná-la manualmente
      if (columnError.message.includes('does not exist')) {
        console.log('\n==== ATENÇÃO: ATUALIZAÇÃO MANUAL NECESSÁRIA ====');
        console.log('A coluna "completed_at" não existe na tabela "appointments".');
        console.log('Este é o erro que está impedindo a atualização de status dos agendamentos.');
        console.log('\nEsta coluna precisa ser adicionada manualmente no console do Supabase:');
        console.log('\n1. Acesse o painel do Supabase: https://app.supabase.io');
        console.log('2. Selecione seu projeto');
        console.log('3. Vá para "Table Editor" > "appointments"');
        console.log('4. Clique em "Edit Table"');
        console.log('5. Adicione uma nova coluna com as seguintes propriedades:');
        console.log('   - Nome: completed_at');
        console.log('   - Tipo: timestamptz');
        console.log('   - Default: null');
        console.log('   - Nulável: sim\n');
        console.log('Ou execute o seguinte SQL no editor SQL do Supabase:');
        console.log('\nALTER TABLE appointments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;\n');
        
        return false;
      }
    } catch (error) {
      console.error('Erro ao verificar coluna completed_at:', error);
      throw error;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar/corrigir tabela appointments:', error);
    return false;
  }
}

// Executar
fixAppointmentsTable()
  .then(success => {
    if (success) {
      console.log('\n✅ A tabela appointments está corretamente configurada.');
    } else {
      console.log('\n⚠️ A tabela appointments precisa ser atualizada manualmente conforme as instruções acima.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erro durante a verificação:', error);
    process.exit(1);
  });