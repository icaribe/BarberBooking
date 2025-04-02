
import supabase from '../server/supabase';

async function listUserCredentials() {
  try {
    console.log('Verificando conexão com Supabase...');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('username, name, role, email')
      .in('role', ['admin', 'professional']);
    
    if (error) {
      console.error('Erro ao consultar usuários:', error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('Nenhum usuário encontrado.');
      return;
    }
    
    console.log('\nCredenciais de acesso:');
    console.log('======================\n');
    
    users.forEach(user => {
      console.log(`Usuário: ${user.username}`);
      console.log(`Nome: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Email: ${user.email}`);
      console.log('Senha temporária: senha123\n');
    });
    
  } catch (error) {
    console.error('Erro ao listar credenciais:', error);
  }
}

listUserCredentials();
