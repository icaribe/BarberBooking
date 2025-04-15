
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { getUserRole } from '../../shared/role-workaround';

export async function validateEntityRelations(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const userId = req.user.id;
    const userRole = await getUserRole(userId);

    // Administradores têm acesso total
    if (userRole === 'admin') {
      return next();
    }

    // Verificar relações específicas
    if (req.path.includes('/appointments')) {
      if (userRole === 'professional') {
        const { professionalId } = req.user;
        if (req.method === 'GET') {
          // Profissionais só podem ver seus próprios agendamentos
          req.query.professionalId = professionalId?.toString();
        } else {
          // Verificar se o agendamento pertence ao profissional
          const appointmentId = parseInt(req.params.id);
          const appointment = await storage.getAppointment(appointmentId);
          if (appointment?.professionalId !== professionalId) {
            return res.status(403).json({ message: 'Acesso negado' });
          }
        }
      } else {
        // Clientes só podem ver/modificar seus próprios agendamentos
        if (req.method === 'GET') {
          req.query.userId = userId.toString();
        } else {
          const appointmentId = parseInt(req.params.id);
          const appointment = await storage.getAppointment(appointmentId);
          if (appointment?.userId !== userId) {
            return res.status(403).json({ message: 'Acesso negado' });
          }
        }
      }
    }

    next();
  } catch (error) {
    console.error('Erro ao validar relações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}
