/**
 * Script para adicionar a coluna completed_at à tabela appointments
 * Usando o cliente Supabase já configurado no projeto
 */

import supabase from './server/supabase.js';

async function updateAppointmentsTable() {
  try {
    console.log('\n==== Atualizando estrutura da tabela appointments ====');
    
    // Consultar a estrutura atual
    console.log('Verificando se a coluna completed_at já existe...');
    
    try {
      // Tentar selecionar a coluna para ver se ela existe
      const { data: testData, error: testError } = await supabase
        .from('appointments')
        .select('completed_at')
        .limit(1);
      
      if (!testError) {
        console.log('✅ A coluna completed_at já existe na tabela appointments.');
        return true;
      }
      
      console.log('Coluna não encontrada, erro:', testError.message);
      
      if (testError.message.includes('column') && testError.message.includes('does not exist')) {
        console.log('Coluna completed_at não existe, adicionando...');
        
        // Executar SQL direto para adicionar a coluna
        // Usando a função SQL() do Supabase para executar SQL arbitrário
        const { error: alterError } = await supabase.rpc('add_column_to_appointments');
        
        if (alterError) {
          console.error('❌ Erro ao adicionar coluna via RPC:', alterError);
          
          // Se o RPC falhar, criar um SQL simples para ser executado manualmente
          console.log('\n==== SQL PARA EXECUÇÃO MANUAL ====');
          console.log(`
-- Execute este SQL no console SQL do Supabase para adicionar a coluna
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
          `);
          console.log('====================================\n');
          
          throw new Error('Não foi possível adicionar a coluna automáticamente');
        }
        
        console.log('✅ Coluna completed_at adicionada com sucesso!');
        return true;
      }
    } catch (error) {
      console.error('Erro ao verificar/adicionar coluna:', error);
      
      // Gerar SQL para ser executado manualmente
      console.log('\n==== SQL PARA EXECUÇÃO MANUAL ====');
      console.log(`
-- Execute este SQL no console SQL do Supabase para adicionar a coluna
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
      `);
      console.log('====================================\n');
      
      throw error;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erro ao atualizar a tabela appointments:', error);
    return false;
  }
}

// Executar o script
updateAppointmentsTable()
  .then(success => {
    if (success) {
      console.log('✅ Tabela appointments atualizada com sucesso.');
    } else {
      console.log('⚠️ A tabela appointments pode precisar de atualizações manuais.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });