/**
 * Rotas para o sistema de fluxo de caixa
 * 
 * Este arquivo define as rotas da API para operações relacionadas ao fluxo de caixa,
 * como registro e consulta de transações financeiras.
 */

import { Router } from 'express';
import { requireRole, UserRole } from '../middleware/role-middleware';
import * as cashFlowManager from '../cash-flow-manager';

const router = Router();

/**
 * GET /api/cash-flow
 * Retorna transações com base nos filtros fornecidos
 */
router.get('/', requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]), async (req, res) => {
  try {
    const filter: cashFlowManager.TransactionFilter = {};
    
    // Processar parâmetros de filtro
    if (req.query.startDate) {
      filter.startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      filter.endDate = new Date(req.query.endDate as string);
    }
    
    if (req.query.type) {
      filter.type = req.query.type as cashFlowManager.TransactionType;
    }
    
    if (req.query.appointmentId) {
      filter.appointmentId = parseInt(req.query.appointmentId as string);
    }
    
    const transactions = await cashFlowManager.getTransactions(filter);
    
    // Manter os valores como reais, já que estão armazenados como reais no banco
    res.json(transactions);
  } catch (error: any) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ message: `Erro ao buscar transações: ${error.message}` });
  }
});

/**
 * GET /api/cash-flow/balance
 * Calcula o saldo do caixa em um período
 */
router.get('/balance', requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]), async (req, res) => {
  try {
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (req.query.startDate) {
      startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);
    }
    
    const balance = await cashFlowManager.calculateBalance(startDate, endDate);
    
    res.json({ balance: balance });
  } catch (error: any) {
    console.error('Erro ao calcular saldo:', error);
    res.status(500).json({ message: `Erro ao calcular saldo: ${error.message}` });
  }
});

/**
 * POST /api/cash-flow
 * Registra uma nova transação
 */
router.post('/', requireRole([UserRole.ADMIN]), async (req, res) => {
  try {
    const { date, appointmentId, amount, type, description } = req.body;
    
    if (!date || amount === undefined || !type) {
      return res.status(400).json({ message: 'Data, valor e tipo são obrigatórios' });
    }
    
    // Converter data para objeto Date
    const transactionDate = new Date(date);
    
    // Verificar se o tipo é válido
    if (!Object.values(cashFlowManager.TransactionType).includes(type)) {
      return res.status(400).json({ message: 'Tipo de transação inválido' });
    }
    
    // Presumir que o valor vem em centavos do frontend
    const transaction = await cashFlowManager.recordTransaction({
      date: transactionDate,
      appointmentId,
      amount, // Será convertido para reais dentro da função
      type: type as cashFlowManager.TransactionType,
      description
    });
    
    res.status(201).json(transaction);
  } catch (error: any) {
    console.error('Erro ao registrar transação:', error);
    res.status(500).json({ message: `Erro ao registrar transação: ${error.message}` });
  }
});

export default router;