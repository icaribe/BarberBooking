import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Ambiente e configurações
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

console.log('SUPABASE_URL:', supabaseUrl);
console.log('Chaves do Supabase configuradas:', 
  supabaseAnonKey ? 'Anônima ✓' : 'Anônima ✗', 
  supabaseServiceKey ? 'Serviço ✓' : 'Serviço ✗'
);

// Cliente Supabase para operações anônimas (cliente)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente Supabase com chave de serviço (apenas backend)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Função para verificar conexão
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin.from('users').select('count', { count: 'exact' }).limit(1);
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error);
      return false;
    }
    
    console.log('Conexão com o Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão com o Supabase:', error);
    return false;
  }
}