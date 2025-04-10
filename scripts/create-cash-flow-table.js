/**
 * Script para criar a tabela cash_flow no Supabase
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Criar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createCashFlowTable() {
  console.log('Iniciando criação da tabela cash_flow...');
  
  try {
    // Verificar se a tabela já existe
    let { data: existingTable, error: tableError } = await supabase
      .from('cash_flow')
      .select('id')
      .limit(1);
      
    if (tableError && tableError.code === '42P01') {
      console.log('Tabela cash_flow não existe, criando...');
      
      // SQL para criar a tabela
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.cash_flow (
          id SERIAL PRIMARY KEY,
          date DATE NOT NULL,
          appointment_id INTEGER REFERENCES public.appointments(id) ON DELETE SET NULL,
          amount DECIMAL(10, 2) NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Criar índices para melhorar desempenho
        CREATE INDEX IF NOT EXISTS cash_flow_date_idx ON public.cash_flow(date);
        CREATE INDEX IF NOT EXISTS cash_flow_type_idx ON public.cash_flow(type);
        CREATE INDEX IF NOT EXISTS cash_flow_appointment_id_idx ON public.cash_flow(appointment_id);
      `;
      
      // Executar SQL
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error('Erro ao criar tabela cash_flow:', createError);
        return false;
      }
      
      console.log('Tabela cash_flow criada com sucesso!');
      return true;
    } else if (tableError) {
      console.error('Erro ao verificar tabela cash_flow:', tableError);
      return false;
    } else {
      console.log('Tabela cash_flow já existe!');
      return true;
    }
  } catch (error) {
    console.error('Erro inesperado:', error);
    return false;
  }
}

// Executar a função
createCashFlowTable()
  .then(success => {
    if (success) {
      console.log('Script concluído com sucesso!');
    } else {
      console.log('Script concluído com erros.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Erro durante a execução do script:', error);
    process.exit(1);
  });