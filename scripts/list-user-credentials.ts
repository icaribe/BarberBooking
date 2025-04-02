
import { supabase } from '../server/supabase';
import * as schema from '../shared/schema';

async function listUserCredentials() {
  try {
    console.log('Listando credenciais dos usuários...\n');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .in('role', ['ADMIN', 'PROFESSIONAL']);
    
    if (error) {
      throw error;
    }
    
    console.log('Credenciais de acesso:');
    console.log('======================\n');
    
    for (const user of users) {
      console.log(`Usuário: ${user.username}`);
      console.log(`Nome: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Email: ${user.email}`);
      console.log('Senha temporária: senha123\n');
    }
    
  } catch (error) {
    console.error('Erro ao listar credenciais:', error);
  }
}

listUserCredentials();
