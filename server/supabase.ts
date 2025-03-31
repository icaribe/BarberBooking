import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// URL e chave de API do Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_KEY são necessários no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase com a chave de serviço (service key) que ignora RLS
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;