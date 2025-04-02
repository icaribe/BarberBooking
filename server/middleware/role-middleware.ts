/**
 * Middleware para controle de acesso baseado em roles
 */

import { Request, Response, NextFunction } from 'express';

export enum UserRole {
  USER = 'USER',
  PROFESSIONAL = 'PROFESSIONAL',
  ADMIN = 'ADMIN'
}

/**
 * Middleware que verifica se o usuário possui pelo menos uma das roles especificadas
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const userRole = (req.user as any).role || UserRole.USER;
    
    if (allowedRoles.includes(userRole)) {
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

  const userRole = (req.user as any).role || UserRole.USER;
  const currentUserId = (req.user as any).id;
  const targetUserId = parseInt(req.params.userId);
  
  // Administradores podem acessar qualquer recurso de usuário
  if (userRole === UserRole.ADMIN) {
    return next();
  }
  
  // Usuários só podem acessar seus próprios recursos
  if (currentUserId === targetUserId) {
    return next();
  }
  
  return res.status(403).json({ 
    message: 'Acesso negado. Você só pode gerenciar seus próprios recursos.' 
  });
}

/**
 * Middleware que verifica se o usuário é o profissional associado ao recurso ou um administrador
 */
export function ownProfessionalOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Autenticação necessária' });
  }

  const userRole = (req.user as any).role || UserRole.USER;
  const userProfessionalId = (req.user as any).professionalId;
  const targetProfessionalId = parseInt(req.params.professionalId);
  
  // Administradores podem acessar qualquer recurso de profissional
  if (userRole === UserRole.ADMIN) {
    return next();
  }
  
  // Profissionais só podem acessar seus próprios recursos
  if (userRole === UserRole.PROFESSIONAL && userProfessionalId === targetProfessionalId) {
    return next();
  }
  
  return res.status(403).json({ 
    message: 'Acesso negado. Você só pode gerenciar recursos associados ao seu perfil profissional.' 
  });
}