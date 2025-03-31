import { supabase } from '../server/supabase';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

/**
 * Script para verificar as tabelas existentes no Supabase
 * e mostrar informações sobre sua estrutura.
 */
async function checkTables() {
  try {
    console.log('Verificando tabelas no Supabase...');
    
    // Vamos tentar listar as principais tabelas que sabemos que existem
    const expectedTables = [
      'users',
      'service_categories',
      'services',
      'professionals',
      'schedules',
      'appointments',
      'appointment_services',
      'product_categories',
      'products',
      'loyalty_rewards'
    ];
    
    const tables: {tablename: string}[] = [];
    
    for (const tableName of expectedTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          tables.push({ tablename: tableName });
          console.log(`✓ Tabela '${tableName}' encontrada. Registros: ${count || 0}`);
        } else {
          console.log(`✗ Tabela '${tableName}' não está acessível: ${error.message}`);
        }
      } catch (e) {
        console.log(`✗ Erro ao acessar tabela ${tableName}: ${(e as Error).message}`);
      }
    }
    
    if (tables.length === 0) {
      console.log('\nNão foram encontradas tabelas acessíveis no schema public.');
      return;
    }
    
    console.log(`\nForam encontradas ${tables.length} tabelas acessíveis no schema public:`);
    const tableNames = tables.map(t => t.tablename);
    
    // Para cada tabela, buscar informações sobre sua estrutura
    console.log('\nDetalhes das tabelas:');
    
    for (const tableName of tableNames) {
      try {
        // Ler uma linha da tabela para examinar a estrutura
        const { data: sampleRow, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
          .single();
        
        if (sampleError) {
          console.log(`- Tabela ${tableName}: Não foi possível ler dados`);
          continue;
        }
        
        console.log(`\n📋 Tabela: ${tableName}`);
        
        // Mostrar as colunas da tabela
        if (sampleRow) {
          const columns = Object.keys(sampleRow);
          console.log(`  Colunas (${columns.length}): ${columns.join(', ')}`);
        }
        
        // Contar registros na tabela
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!countError) {
          console.log(`  Total de registros: ${count || 0}`);
        }
        
      } catch (tableError) {
        console.error(`  Erro ao ler estrutura da tabela ${tableName}:`, tableError);
      }
    }
    
    console.log('\n✅ Verificação de tabelas concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    process.exit(1);
  }
}

// Executar a verificação
checkTables().catch(console.error);