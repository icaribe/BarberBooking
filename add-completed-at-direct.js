/**
 * Script para adicionar a coluna completed_at à tabela appointments no Supabase
 * Usando SQL direto via API REST do Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Obter credenciais do Supabase das variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL || 'https://rrqefsxymripcvoabers.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Verificar se temos a chave de serviço
if (!supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_SERVICE_KEY não está definida nas variáveis de ambiente');
  process.exit(1);
}

// Criar cliente Supabase
console.log(`Conectando ao Supabase: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addCompletedAtColumn() {
  try {
    console.log('Adicionando coluna completed_at à tabela appointments...');
    
    // Executar SQL para adicionar a coluna
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE appointments 
        ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
      `
    });
    
    if (error) {
      console.error('Erro ao executar SQL para adicionar coluna:', error);
      return { success: false, error };
    }
    
    console.log('Coluna adicionada com sucesso, verificando...');
    
    // Verificar se a coluna existe
    const { data: columns, error: checkError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'appointments' 
        AND column_name = 'completed_at';
      `
    });
    
    if (checkError) {
      console.error('Erro ao verificar coluna:', checkError);
      return { success: true, verified: false, error: checkError };
    }
    
    console.log('Resultado da verificação:', columns);
    
    return { 
      success: true, 
      verified: columns && columns.length > 0,
      result: columns
    };
  } catch (error) {
    console.error('Erro ao adicionar coluna:', error);
    return { success: false, error };
  }
}

// Executar o script
addCompletedAtColumn()
  .then(result => {
    console.log('Resultado:', result);
    if (result.success) {
      console.log('✅ Coluna completed_at adicionada com sucesso');
    } else {
      console.error('❌ Falha ao adicionar coluna');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
  });