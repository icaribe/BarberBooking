/**
 * Script para adicionar a coluna completed_at à tabela appointments no Supabase
 */

import supabase from './server/supabase.js';

async function addCompletedAtColumn() {
  try {
    console.log('Iniciando adição da coluna completed_at à tabela appointments...');
    
    // Verificar se a coluna já existe
    const { data: columns, error: columnError } = await supabase.rpc('get_columns_from_table', {
      table_name: 'appointments'
    });
    
    if (columnError) {
      console.error('Erro ao verificar colunas existentes:', columnError);
      // Se o RPC falhar, tentar uma abordagem alternativa
      console.log('Tentando adicionar a coluna diretamente...');
    } else {
      // Se o RPC funcionar, verificar se a coluna já existe
      const hasCompletedAt = columns && columns.some(col => col.column_name === 'completed_at');
      
      if (hasCompletedAt) {
        console.log('A coluna completed_at já existe na tabela appointments.');
        return { success: true, message: 'A coluna já existe' };
      }
    }
    
    // Adicionar a coluna completed_at
    const { error } = await supabase.rpc('add_column_if_not_exists', {
      table_name: 'appointments',
      column_name: 'completed_at',
      column_type: 'timestamptz'
    });
    
    if (error) {
      console.error('Erro ao adicionar coluna via RPC:', error);
      console.log('Tentando executar SQL raw...');
      
      // Tentar executar SQL diretamente
      const { error: sqlError } = await supabase.query(`
        ALTER TABLE appointments 
        ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ
      `);
      
      if (sqlError) {
        console.error('Erro ao executar SQL raw:', sqlError);
        throw new Error('Não foi possível adicionar a coluna completed_at');
      }
    }
    
    console.log('Coluna completed_at adicionada com sucesso à tabela appointments!');
    return { success: true };
  } catch (error) {
    console.error('Erro ao adicionar coluna completed_at:', error);
    return { 
      success: false, 
      message: error.message || 'Erro desconhecido' 
    };
  }
}

// Executar o script
addCompletedAtColumn()
  .then(result => {
    console.log('Resultado:', result);
    if (result.success) {
      console.log('✅ Coluna completed_at adicionada ou já existente');
    } else {
      console.error('❌ Falha ao adicionar coluna:', result.message);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
  });