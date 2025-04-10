/**
 * Módulo para gerenciar papéis de usuário sem depender da coluna role na tabela users
 * 
 * Este arquivo oferece uma solução alternativa para o gerenciamento de papéis
 * de usuário quando a coluna role não existe na tabela users do banco de dados.
 * 
 * Esta implementação simplificada identificará o admin pelo email, 
 * profissionais pela lista definida, e os demais como clientes.
 */

import supabase from '../server/supabase';

// Enum para papéis de usuário
export enum UserRole {
  ADMIN = 'admin',
  PROFESSIONAL = 'professional',
  CUSTOMER = 'customer'
}

// E-mail do administrador
const ADMIN_EMAIL = 'johnatanlima26@gmail.com';

// Emails dos profissionais
const PROFESSIONAL_EMAILS = [
  'carlosbarb@example.com',
  'jorran@example.com',
  'iuribarbs@example.com',
  'mikaelbarbers@example.com'
];

// Cache de papéis para evitar múltiplas consultas
const userRoleCache = new Map<number, UserRole>();

/**
 * Obtém o papel de um usuário a partir do seu ID
 * 
 * Esta função agora usa a coluna 'role' da tabela users diretamente,
 * mas mantém a lógica de fallback do workaround original para compatibilidade.
 */
export async function getUserRole(userId: number): Promise<UserRole> {
  try {
    // Verificar se o papel está em cache
    if (userRoleCache.has(userId)) {
      return userRoleCache.get(userId)!;
    }
    
    // Buscar dados do usuário, incluindo a coluna role
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, username, role')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao obter dados do usuário:', error);
      return UserRole.CUSTOMER;
    }
    
    if (!userData) {
      console.error('Usuário não encontrado:', userId);
      return UserRole.CUSTOMER;
    }
    
    // Usar o papel da coluna role se disponível
    let role: UserRole;
    
    if (userData.role && Object.values(UserRole).includes(userData.role as UserRole)) {
      // Usar o valor da coluna role
      role = userData.role as UserRole;
      console.log(`Papel obtido da coluna role: ${role}`);
    } else {
      // Fallback para a lógica antiga (workaround) se a coluna não estiver definida
      console.log('Fallback: Determinando papel para usuário:', userData.email);
      
      if (userData.email === ADMIN_EMAIL || userData.username === 'johnata') {
        role = UserRole.ADMIN;
        console.log('Fallback: Usuário identificado como ADMIN');
      } else if (PROFESSIONAL_EMAILS.includes(userData.email) || 
                ['carlos', 'jorran', 'iuri', 'mikael'].includes(userData.username)) {
        role = UserRole.PROFESSIONAL;
        console.log('Fallback: Usuário identificado como PROFESSIONAL');
      } else {
        role = UserRole.CUSTOMER;
        console.log('Fallback: Usuário identificado como CUSTOMER');
      }
      
      // Atualizar a coluna role no banco de dados para o próximo acesso
      try {
        const { error: updateError } = await supabase
          .from('users')
          .update({ role })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Erro ao atualizar coluna role:', updateError);
        } else {
          console.log(`Coluna role atualizada para ${role}`);
        }
      } catch (updateError) {
        console.error('Erro ao atualizar coluna role:', updateError);
      }
    }
    
    // Armazenar em cache
    userRoleCache.set(userId, role);
    
    return role;
  } catch (error) {
    console.error('Erro ao obter papel do usuário:', error);
    return UserRole.CUSTOMER;
  }
}

/**
 * Limpa o cache para um usuário específico ou para todos os usuários
 */
export function clearRoleCache(userId?: number): void {
  if (userId) {
    userRoleCache.delete(userId);
  } else {
    userRoleCache.clear();
  }
}