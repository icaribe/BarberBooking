import { supabase } from '../server/supabase';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

/**
 * Script para desativar temporariamente RLS para inserção de dados
 */
async function disableRLS() {
  try {
    console.log('Gerando comandos SQL para desabilitar RLS temporariamente...');
    
    // Lista de tabelas
    const tables = [
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
    
    console.log('\n-- Execute estes comandos no Console SQL do Supabase:');
    console.log('-- 1. Desabilitar RLS temporariamente');
    
    for (const table of tables) {
      console.log(`ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;`);
    }
    
    console.log('\n-- 2. Após importar os dados, habilite o RLS novamente:');
    
    for (const table of tables) {
      console.log(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
    
    console.log('\n-- 3. Configure as políticas para cada tabela');
    console.log('-- Consulte o arquivo rls-commands.sql para as políticas completas');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

// Executar o script
disableRLS().catch(console.error);