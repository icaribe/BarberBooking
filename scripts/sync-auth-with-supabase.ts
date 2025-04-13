/**
 * Script para sincronizar os usuários do banco de dados local com o Supabase Auth
 * 
 * O que este script faz:
 * 1. Busca todos os usuários da tabela users
 * 2. Para cada usuário, verifica se ele existe no Supabase Auth
 * 3. Se não existir, cria o usuário no Supabase Auth
 * 4. Atualiza o campo auth_id na tabela users
 */

import { supabaseAdmin } from '../shared/supabase-client';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function syncAuthWithSupabase() {
  console.log('\n=== Sincronizando Autenticação com Supabase ===\n');
  
  try {
    // 1. Buscar todos os usuários da tabela users
    console.log('Buscando usuários na tabela users...');
    
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*');
    
    if (usersError) {
      throw new Error(`Erro ao buscar usuários: ${usersError.message}`);
    }
    
    if (!users || users.length === 0) {
      console.log('Nenhum usuário encontrado na tabela users.');
      return;
    }
    
    console.log(`✅ Encontrados ${users.length} usuários na tabela users.`);
    
    // 2. Para cada usuário, verificar e sincronizar com o Supabase Auth
    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        // Se o usuário já tiver auth_id, verificar se o usuário existe no Supabase Auth
        if (user.auth_id) {
          // Verificar se o usuário já existe no Supabase Auth
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user.auth_id);
          
          if (!authError && authUser) {
            console.log(`✅ Usuário ${user.username || user.email} (ID: ${user.id}) já existe no Supabase Auth com ID: ${user.auth_id}`);
            continue;
          }
          
          // Se o auth_id não for válido, remover para recriar
          console.log(`⚠️ Usuário ${user.username || user.email} tem auth_id ${user.auth_id} inválido. Recriando...`);
        }
        
        // Criar o usuário no Supabase Auth
        const email = user.email || `${user.username}@example.com`;
        const password = user.password ? user.password : 'Password123!'; // Senha temporária se não houver
        
        const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: user.name || "",
            display_name: user.name || "",
            username: user.username || "",
            role: user.role || "customer"
          }
        });
        
        if (createError) {
          console.error(`❌ Erro ao criar usuário ${email} no Supabase Auth:`, createError);
          errorCount++;
          continue;
        }
        
        if (!newAuthUser || !newAuthUser.user || !newAuthUser.user.id) {
          console.error(`❌ Falha ao criar usuário ${email} no Supabase Auth: resposta vazia ou inválida`);
          errorCount++;
          continue;
        }
        
        const authId = newAuthUser.user.id;
        
        // Atualizar o campo auth_id na tabela users
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ auth_id: authId })
          .eq('id', user.id);
        
        if (updateError) {
          console.error(`❌ Erro ao atualizar auth_id para usuário ${email}:`, updateError);
          errorCount++;
          
          // Tentar excluir o usuário Auth criado para evitar inconsistências
          try {
            await supabaseAdmin.auth.admin.deleteUser(authId);
          } catch (deleteError) {
            console.error(`❌ Erro ao tentar excluir usuário Auth após falha na atualização:`, deleteError);
          }
          
          continue;
        }
        
        console.log(`✅ Usuário ${email} (ID: ${user.id}) sincronizado com Supabase Auth (auth_id: ${authId})`);
        
        if (user.auth_id) {
          updatedCount++;
        } else {
          createdCount++;
        }
      } catch (error) {
        console.error(`❌ Erro durante sincronização do usuário ${user.email || user.username}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n=== Resumo da Sincronização ===');
    console.log(`Total de usuários processados: ${users.length}`);
    console.log(`Usuários criados no Supabase Auth: ${createdCount}`);
    console.log(`Usuários atualizados no Supabase Auth: ${updatedCount}`);
    console.log(`Erros: ${errorCount}`);
    
    console.log('\n=== Sincronização Concluída ===\n');
  } catch (error) {
    console.error('Erro durante a sincronização:', error);
    process.exit(1);
  }
}

// Executar a função principal
syncAuthWithSupabase().catch(error => {
  console.error('Erro fatal durante a sincronização:', error);
  process.exit(1);
});