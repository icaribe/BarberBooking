
import supabase from '../server/supabase';

async function listUserCredentials() {
  try {
    console.log('Verificando conexão com Supabase...');
    
    // Primeiro vamos atualizar o Johnata como ADMIN
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('username', 'johnata');
    
    if (updateError) {
      console.error('Erro ao atualizar role do admin:', updateError.message);
      return;
    }

    // Atualizar outros usuários como professional
    const { error: updateProfError } = await supabase
      .from('users')
      .update({ role: 'professional' })
      .neq('username', 'johnata')
      .in('username', ['carlos', 'iuri', 'jorran', 'mikael']);

    if (updateProfError) {
      console.error('Erro ao atualizar role dos profissionais:', updateProfError.message);
      return;
    }

    // Listar usuários atualizados
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Erro ao consultar usuários:', error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('Nenhum usuário encontrado.');
      return;
    }
    
    console.log('\nCredenciais de acesso atualizadas:');
    console.log('==============================\n');
    
    users.forEach(user => {
      console.log(`Usuário: ${user.username}`);
      console.log(`Nome: ${user.name}`);
      console.log(`Role: ${user.role || 'não definido'}`);
      console.log(`Email: ${user.email}`);
      console.log('Senha temporária: senha123\n');
    });
    
  } catch (error) {
    console.error('Erro ao listar credenciais:', error);
  }
}

listUserCredentials();
