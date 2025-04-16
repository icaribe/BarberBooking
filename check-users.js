/**
 * Script para listar usuários existentes no banco de dados
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente SUPABASE_URL e/ou SUPABASE_SERVICE_KEY não definidas.');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function listUsers() {
  try {
    console.log('🔍 Buscando usuários no banco de dados...');
    
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, name, role');
    
    if (error) {
      console.error('❌ Erro ao buscar usuários:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado no banco de dados.');
      return;
    }
    
    console.log(`✅ Encontrados ${data.length} usuários:`);
    
    // Listar todos os usuários encontrados
    data.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Nome: ${user.name || 'N/A'}, Papel: ${user.role || 'N/A'}`);
    });
    
    // Procurar especificamente por usuários Admin
    const admins = data.filter(user => user.role === 'admin');
    
    if (admins.length > 0) {
      console.log(`\n👑 Encontrados ${admins.length} usuários com papel de admin:`);
      admins.forEach(admin => {
        console.log(`- ID: ${admin.id}, Username: ${admin.username}, Email: ${admin.email}`);
      });
    } else {
      console.log('\n⚠️ Nenhum usuário com papel de admin encontrado.');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
listUsers();