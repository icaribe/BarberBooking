/**
 * Script para testar o sistema de papéis de usuário
 * 
 * Este script testa a nova implementação de papéis para garantir que
 * os usuários sejam corretamente identificados como ADMIN, PROFESSIONAL ou CUSTOMER.
 */

import supabase from '../server/supabase';
import { getUserRole, UserRole } from '../shared/role-workaround';

async function testRoleSystem() {
  try {
    console.log('Obtendo lista de usuários...');
    
    // Buscar todos os usuários
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, professional_id');
    
    if (usersError) {
      console.error('Erro ao buscar usuários:', usersError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('Nenhum usuário encontrado.');
      return;
    }
    
    console.log(`Testando papéis para ${users.length} usuários...`);
    
    // Testar papel de cada usuário
    for (const user of users) {
      const role = await getUserRole(user.id);
      console.log(`Usuário ${user.email} (ID: ${user.id}) - Papel: ${role}${user.professional_id ? ' - É profissional' : ''}`);
    }
    
    console.log('Teste concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante a execução do teste:', error);
  }
}

testRoleSystem();