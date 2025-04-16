import { supabaseAdmin } from '../shared/supabase-client';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Verificar configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

console.log('📡 Verificando configuração Supabase:');
console.log(`URL: ${supabaseUrl ? '✓ Configurada' : '✗ Não configurada'}`);
console.log(`Service Key: ${supabaseKey ? '✓ Configurada' : '✗ Não configurada'}`);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_KEY são necessários no arquivo .env');
  process.exit(1);
}

// Utiliza o cliente Supabase com permissões administrativas
const supabase = supabaseAdmin;

// Testar conexão
async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    }
    console.log('✅ Conexão Supabase estabelecida com sucesso');
    return true;
  } catch (err) {
    console.error('❌ Erro ao testar conexão:', err);
    return false;
  }
}

testConnection();

export default supabase;