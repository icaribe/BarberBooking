/**
 * Este script atualiza a senha do usuário johnata para "senha123"
 * usando o hash correto do bcrypt e também atualiza o usuário no Supabase Auth
 */

import supabase from '../server/supabase';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function resetJohnataPassword() {
  try {
    // Gerar nova senha com bcrypt
    const password = 'senha123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Nova senha hash gerada:', hashedPassword);

    // Buscar o usuário johnata
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'johnata')
      .single();

    if (userError) {
      console.error('Erro ao buscar usuário johnata:', userError.message);
      return;
    }

    console.log('Usuário encontrado:', user);

    // Atualizar senha no banco de dados
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('username', 'johnata')
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar senha do usuário johnata:', updateError.message);
      return;
    }

    console.log('Senha atualizada com sucesso:', updateData);

    // Se o usuário tiver um auth_id, também atualizar no Supabase Auth
    if (user.auth_id) {
      try {
        const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
          user.auth_id,
          { password }
        );

        if (authUpdateError) {
          console.error('Erro ao atualizar senha no Supabase Auth:', authUpdateError.message);
        } else {
          console.log('Senha atualizada no Supabase Auth com sucesso!');
        }
      } catch (error) {
        console.error('Exceção ao atualizar senha no Supabase Auth:', error);
      }
    }

    console.log('Processo de redefinição de senha concluído!');
    
  } catch (error) {
    console.error('Erro durante o processo:', error);
  }
}

resetJohnataPassword();