import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config();

// Configurações do Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_KEY são necessários no arquivo .env');
  process.exit(1);
}

// Criar cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseTables() {
  console.log('\n🔍 Verificando tabelas existentes no Supabase...\n');

  try {
    // Lista de tabelas esperadas com base no schema
    const expectedTables = [
      'users', 'service_categories', 'services', 'professionals',
      'schedules', 'appointments', 'appointment_services',
      'product_categories', 'products', 'loyalty_rewards',
      'loyalty_history', 'cash_flow', 'professional_services'
    ];
    
    console.log('📋 Verificando acesso às tabelas:');
    
    for (const table of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { head: true, count: 'exact' });
        
        if (error) {
          console.log(`❌ Tabela ${table}: Não encontrada ou sem acesso (${error.message})`);
        } else {
          console.log(`✅ Tabela ${table}: Acessível`);
        }
      } catch (err) {
        console.log(`❌ Tabela ${table}: Erro ao verificar (${err})`);
      }
    }
    
    // Tentar obter uma lista completa das tabelas usando query SQL bruta
    console.log('\n📋 Tentando obter lista completa de tabelas com query SQL:');
    
    const { data, error } = await supabase.rpc('check_tables');
    
    if (error) {
      console.log(`❌ Não foi possível obter lista de tabelas via RPC: ${error.message}`);
      
      // Método alternativo: usar a query SQL direta
      const { data: queryResult, error: queryError } = await supabase
        .from('_information_schema_tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      if (queryError) {
        console.log(`❌ Não foi possível consultar lista de tabelas: ${queryError.message}`);
      } else if (queryResult) {
        console.log('✅ Tabelas encontradas via consulta direta:');
        queryResult.forEach((row, idx) => {
          console.log(`   ${idx + 1}. ${row.table_name}`);
        });
      }
    } else if (data) {
      console.log('✅ Tabelas encontradas via RPC:');
      data.forEach((row, idx) => {
        console.log(`   ${idx + 1}. ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
  }
}

checkSupabaseTables();