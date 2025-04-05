/**
 * Middleware para controle de acesso baseado em roles
 */

import { Request, Response, NextFunction } from 'express';
import { getUserRole, UserRole as RoleEnum } from '../../shared/role-workaround';

// Reexportar a enumeração para manter compatibilidade com o código existente
export enum UserRole {
  USER = RoleEnum.CUSTOMER,
  PROFESSIONAL = RoleEnum.PROFESSIONAL,
  ADMIN = RoleEnum.ADMIN
}

/**
 * Middleware que verifica se o usuário possui pelo menos uma das roles especificadas
 */
export function requireRole(allowedRoles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const userId = (req.user as any).id;
    const userRole = await getUserRole(userId);
    
    // Armazenar o papel do usuário no objeto req.user para utilização posterior
    (req.user as any).role = userRole;
    
    // Mapeando de RoleEnum para UserRole
    let mappedRole: UserRole;
    if (userRole === RoleEnum.ADMIN) {
      mappedRole = UserRole.ADMIN;
    } else if (userRole === RoleEnum.PROFESSIONAL) {
      mappedRole = UserRole.PROFESSIONAL;
    } else {
      mappedRole = UserRole.USER;
    }
    
    if (allowedRoles.includes(mappedRole)) {
      return next();
    }
    
    return res.status(403).json({ 
      message: 'Acesso negado. Você não tem permissão para acessar este recurso.' 
    });
  };
}

/**
 * Middleware que verifica se o usuário é o proprietário do recurso de usuário ou um administrador
 */
export function ownUserOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Autenticação necessária' });
  }

  const currentUserId = (req.user as any).id;
  const targetUserId = parseInt(req.params.userId);
  
  // Verificar o papel apenas se for necessário
  const checkRole = async () => {
    const userRole = await getUserRole(currentUserId);
    
    // Administradores podem acessar qualquer recurso de usuário
    if (userRole === RoleEnum.ADMIN) {
      return next();
    } else {
      return res.status(403).json({ 
        message: 'Acesso negado. Você só pode gerenciar seus próprios recursos.' 
      });
    }
  };
  
  // Usuários podem acessar seus próprios recursos
  if (currentUserId === targetUserId) {
    return next();
  }
  
  // Se não for o próprio usuário, verificar se é admin
  return checkRole();
}

/**
 * Middleware que verifica se o usuário é o profissional associado ao recurso ou um administrador
 */
export function ownProfessionalOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Autenticação necessária' });
  }

  const userId = (req.user as any).id;
  const userProfessionalId = (req.user as any).professionalId;
  const targetProfessionalId = parseInt(req.params.professionalId);
  
  const checkRole = async () => {
    const userRole = await getUserRole(userId);
    
    // Administradores podem acessar qualquer recurso de profissional
    if (userRole === RoleEnum.ADMIN) {
      return next();
    }
    
    // Profissionais só podem acessar seus próprios recursos
    if (userRole === RoleEnum.PROFESSIONAL && userProfessionalId === targetProfessionalId) {
      return next();
    }
    
    return res.status(403).json({ 
      message: 'Acesso negado. Você só pode gerenciar recursos associados ao seu perfil profissional.' 
    });
  };
  
  return checkRole();
}