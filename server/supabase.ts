import { supabaseAdmin } from './supabase-admin-client';
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

export default supabase;