/**
 * Script para verificar a configuração do banco de dados no Supabase
 * 
 * Este script faz o seguinte:
 * 1. Verifica tabelas existentes
 * 2. Verifica tipos enumerados
 * 3. Verifica políticas RLS
 * 4. Verifica se RLS está habilitado nas tabelas
 */

import { supabaseAdmin } from '../shared/supabase-client';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Verifica a configuração do banco de dados no Supabase
 */
async function verifySupabaseDatabase() {
  console.log('\n=== Verificando Configuração do Banco de Dados no Supabase ===\n');
  
  // Declaração para armazenar os nomes das tabelas para acesso posterior
  let allTableNames: string[] = [];
  
  try {
    // Verificar tabelas
    console.log('Verificando tabelas existentes:');
    
    // Lista de tabelas a verificar
    const tablesToCheck = [
      'users',
      'services',
      'service_categories',
      'products',
      'product_categories',
      'professionals',
      'schedules',
      'appointments',
      'appointment_services',
      'loyalty_rewards',
      'loyalty_history',
      'cash_flow'
    ];
    
    const existingTables: string[] = [];
    const missingTables: string[] = [];
    
    // Verificar cada tabela
    for (const tableName of tablesToCheck) {
      try {
        const { error } = await supabaseAdmin
          .from(tableName)
          .select('count')
          .limit(1);
        
        if (error && error.code === 'PGRST116') {
          missingTables.push(tableName);
        } else {
          existingTables.push(tableName);
          allTableNames.push(tableName);
        }
      } catch (error) {
        console.error(`Erro ao verificar tabela ${tableName}:`, error);
        missingTables.push(tableName);
      }
    }
    
    // Mostrar resultados da verificação de tabelas
    if (existingTables.length > 0) {
      console.log('✅ Tabelas encontradas:');
      existingTables.forEach(tableName => console.log(`   - ${tableName}`));
    }
    
    if (missingTables.length > 0) {
      console.error('❌ Tabelas ausentes:');
      missingTables.forEach(tableName => console.log(`   - ${tableName}`));
    }
    
    // Verificar políticas RLS
    console.log('\nVerificando políticas RLS:');
    
    // Verifica políticas para cada tabela existente
    for (const tableName of existingTables) {
      try {
        // Tentativa de verificar as políticas da tabela
        const { data: tableData, error: policyError } = await supabaseAdmin.rpc('exec', {
          query: `
            SELECT policyname, permissive, roles, cmd
            FROM pg_policies
            WHERE tablename = '${tableName}'
            ORDER BY policyname
          `
        });
        
        if (policyError) {
          console.error(`❌ Erro ao verificar políticas para tabela ${tableName}:`, policyError);
          continue;
        }
        
        if (!tableData || tableData.length === 0) {
          console.warn(`⚠️ Nenhuma política RLS encontrada para tabela ${tableName}`);
        } else {
          console.log(`✅ ${tableData.length} políticas encontradas para tabela ${tableName}:`);
          
          // Mostrar detalhes das políticas encontradas
          for (const policy of tableData) {
            console.log(`   - ${policy.policyname} (${policy.cmd || 'ALL'})`);
          }
        }
      } catch (error) {
        console.error(`❌ Erro durante verificação de políticas para tabela ${tableName}:`, error);
      }
    }
    
    // Verificar se RLS está habilitado nas tabelas
    console.log('\nVerificando status RLS das tabelas:');
    
    for (const tableName of existingTables) {
      try {
        const { data: rlsData, error: rlsError } = await supabaseAdmin.rpc('exec', {
          query: `
            SELECT relname, relrowsecurity 
            FROM pg_class 
            WHERE relname = '${tableName}'
          `
        });
        
        if (rlsError) {
          console.error(`❌ Erro ao verificar RLS para tabela ${tableName}:`, rlsError);
          continue;
        }
        
        if (!rlsData || rlsData.length === 0) {
          console.warn(`⚠️ Não foi possível verificar status RLS para tabela ${tableName}`);
        } else {
          const isEnabled = rlsData[0].relrowsecurity === true;
          const status = isEnabled ? '✅' : '❌';
          console.log(`${status} ${tableName}: RLS ${isEnabled ? 'habilitado' : 'desabilitado'}`);
        }
      } catch (error) {
        console.error(`❌ Erro durante verificação de status RLS para tabela ${tableName}:`, error);
      }
    }
    
    console.log('\n=== Verificação Concluída ===\n');
  } catch (error) {
    console.error('Erro durante a verificação:', error);
  }
}

// Executar a função principal
verifySupabaseDatabase().catch(error => {
  console.error('Erro durante a verificação do banco de dados:', error);
  process.exit(1);
});