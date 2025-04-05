/**
 * Este script atualiza as senhas de todos os usuários profissionais para "senha123"
 */

import supabase from '../server/supabase';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Lista de usuários profissionais
const PROFESSIONAL_USERNAMES = ['carlos', 'iuri', 'jorran', 'mikael', 'johnata'];

async function resetProfessionalPasswords() {
  try {
    // Gerar nova senha com bcrypt
    const password = 'senha123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Nova senha hash gerada:', hashedPassword);

    // Buscar todos os usuários profissionais
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('username', PROFESSIONAL_USERNAMES);

    if (usersError) {
      console.error('Erro ao buscar usuários profissionais:', usersError.message);
      return;
    }

    console.log(`Encontrados ${users.length} usuários profissionais`);

    // Atualizar senha para cada usuário
    for (const user of users) {
      console.log(`\nProcessando usuário: ${user.username}`);
      
      // Atualizar senha no banco de dados
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error(`Erro ao atualizar senha do usuário ${user.username}:`, updateError.message);
        continue;
      }

      console.log(`Senha atualizada com sucesso para ${user.username}`);

      // Se o usuário tiver um auth_id, também atualizar no Supabase Auth
      if (user.auth_id) {
        try {
          const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
            user.auth_id,
            { password }
          );

          if (authUpdateError) {
            console.error(`Erro ao atualizar senha no Supabase Auth para ${user.username}:`, authUpdateError.message);
          } else {
            console.log(`Senha atualizada no Supabase Auth com sucesso para ${user.username}!`);
          }
        } catch (error) {
          console.error(`Exceção ao atualizar senha no Supabase Auth para ${user.username}:`, error);
        }
      }
    }

    console.log('\nProcesso de redefinição de senhas concluído!');
    
  } catch (error) {
    console.error('Erro durante o processo:', error);
  }
}

resetProfessionalPasswords();