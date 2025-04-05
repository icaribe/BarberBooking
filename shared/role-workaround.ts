/**
 * Módulo para gerenciar papéis de usuário sem depender da coluna role na tabela users
 * 
 * Este arquivo oferece uma solução alternativa para o gerenciamento de papéis
 * de usuário quando a coluna role não existe na tabela users do banco de dados.
 * 
 * Esta implementação usa uma abordagem simplificada baseada nos dados existentes:
 * - E-mail especial para administrador
 * - Professional_id não nulo para profissionais
 * - Os demais são considerados clientes
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

// Cache de papéis para evitar múltiplas consultas
const userRoleCache = new Map<number, UserRole>();

/**
 * Obtém o papel de um usuário a partir do seu ID
 */
export async function getUserRole(userId: number): Promise<UserRole> {
  try {
    // Verificar se o papel está em cache
    if (userRoleCache.has(userId)) {
      return userRoleCache.get(userId)!;
    }
    
    // Buscar dados do usuário
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, professional_id')
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
    
    // Determinar o papel
    let role: UserRole;
    
    if (userData.email === ADMIN_EMAIL) {
      // Administrador identificado pelo e-mail
      role = UserRole.ADMIN;
    } else if (userData.professional_id) {
      // Profissional identificado pelo professional_id
      role = UserRole.PROFESSIONAL;
    } else {
      // Cliente por padrão
      role = UserRole.CUSTOMER;
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