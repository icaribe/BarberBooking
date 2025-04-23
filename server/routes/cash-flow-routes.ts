/**
 * Rotas para gerenciamento do fluxo de caixa
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { UserRole, requireRole } from '../middleware/role-middleware';
import * as cashFlowManager from '../cash-flow-manager';
import supabase from '../supabase';
import { storage } from '../storage';

const router = Router();

// Esquema de validação para transações financeiras
const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'REFUND', 'ADJUSTMENT', 'PRODUCT_SALE']),
  amount: z.number().min(1),
  description: z.string().min(3).max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  appointmentId: z.number().optional(),
  category: z.string().optional()
});

/**
 * Obter transações com filtros opcionais
 */
router.get('/', 
  requireRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, type, category } = req.query;
      
      // Converter datas se fornecidas
      const startDateObj = startDate ? new Date(startDate as string) : undefined;
      const endDateObj = endDate ? new Date(endDate as string) : undefined;
      
      // Buscar as transações com os filtros fornecidos
      const transactions = await cashFlowManager.getTransactions({
        startDate: startDateObj,
        endDate: endDateObj,
        type: type as any
      });
      
      // Log para diagnóstico
      console.log(`Encontradas ${transactions.length} transações. Filtros: startDate=${startDate}, endDate=${endDate}, type=${type}`);
      if (transactions.length > 0) {
        console.log(`Exemplo de transação: tipo=${transactions[0].type}, valor=${transactions[0].amount}, data=${transactions[0].date}`);
      }
      
      res.json(transactions);
    } catch (error: any) {
      console.error('Erro ao buscar transações:', error);
      res.status(500).json({ 
        success: false, 
        message: `Erro ao buscar transações: ${error.message}`
      });
    }
  }
);

/**
 * Cadastrar nova transação
 */
router.post('/', 
  requireRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      // Validar dados de entrada
      const validData = transactionSchema.safeParse(req.body);
      
      if (!validData.success) {
        return res.status(400).json({ 
          success: false,
          message: 'Dados de transação inválidos',
          errors: validData.error.flatten()
        });
      }
      
      const transaction = validData.data;
      
      // Converter string de data para objeto Date
      const transactionDate = new Date(transaction.date);
      
      // Registrar a transação
      const result = await cashFlowManager.recordTransaction({
        date: transactionDate,
        amount: transaction.amount,
        type: transaction.type as any,
        description: transaction.description,
        appointmentId: transaction.appointmentId
      });
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Erro ao registrar transação:', error);
      res.status(500).json({ 
        success: false, 
        message: `Erro ao registrar transação: ${error.message}`
      });
    }
  }
);

/**
 * Obter resumo financeiro (saldo total)
 */
router.get('/summary', 
  requireRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Converter datas se fornecidas
      const startDateObj = startDate ? new Date(startDate as string) : undefined;
      const endDateObj = endDate ? new Date(endDate as string) : undefined;
      
      // Calcular o saldo
      const balance = await cashFlowManager.calculateBalance(startDateObj, endDateObj);
      
      // Calcular totais por tipo de transação
      const income = await getTotalByType('INCOME', startDateObj, endDateObj);
      const expense = await getTotalByType('EXPENSE', startDateObj, endDateObj);
      const productSales = await getTotalByType('PRODUCT_SALE', startDateObj, endDateObj);
      
      // Calcular os totais para formato do frontend
      const totalIncome = income + productSales;
      const totalExpense = expense;
      
      console.log('Resumo financeiro calculado:');
      console.log(`- Total de entradas (INCOME + PRODUCT_SALE): R$ ${totalIncome.toFixed(2)}`);
      console.log(`- Total de saídas (EXPENSE): R$ ${totalExpense.toFixed(2)}`);
      console.log(`- Saldo final: R$ ${balance.toFixed(2)}`);
      
      // Responder com o formato esperado pelo frontend
      res.json({
        totalIncome,
        totalExpense,
        balance,
        // Dados adicionais para debug e retrocompatibilidade
        categories: [
          { category: 'service', income: income, expense: 0, balance: income },
          { category: 'product', income: productSales, expense: 0, balance: productSales },
          { category: 'expense', income: 0, expense: expense, balance: -expense }
        ]
      });
    } catch (error: any) {
      console.error('Erro ao calcular resumo financeiro:', error);
      res.status(500).json({ 
        success: false, 
        message: `Erro ao calcular resumo financeiro: ${error.message}`
      });
    }
  }
);

/**
 * Sincronizar transações com agendamentos concluídos
 * Esta rota verifica todos os agendamentos concluídos e registra transações
 * financeiras para aqueles que ainda não possuem.
 */
router.post('/sync-appointments', 
  requireRole([UserRole.ADMIN]),
  async (_req: Request, res: Response) => {
    try {
      const result = await cashFlowManager.validateAndFixTransactions();
      
      res.json({
        success: true,
        message: 'Sincronização de transações concluída com sucesso',
        result
      });
    } catch (error: any) {
      console.error('Erro ao sincronizar transações:', error);
      res.status(500).json({ 
        success: false, 
        message: `Erro ao sincronizar transações: ${error.message}`
      });
    }
  }
);

/**
 * Função auxiliar para calcular o total por tipo de transação
 */
async function getTotalByType(type: string, startDate?: Date, endDate?: Date) {
  try {
    // Construir a consulta
    let query = supabase
      .from('cash_flow')
      .select('amount')
      .eq('type', type);
    
    if (startDate) {
      query = query.gte('date', startDate.toISOString().split('T')[0]);
    }
    
    if (endDate) {
      query = query.lte('date', endDate.toISOString().split('T')[0]);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Erro ao calcular total para o tipo ${type}:`, error);
      throw new Error(`Falha ao calcular total: ${error.message}`);
    }
    
    // Calcular o total
    let total = 0;
    
    for (const transaction of data) {
      total += parseFloat(transaction.amount);
    }
    
    return total;
  } catch (error) {
    console.error(`Erro ao calcular total para o tipo ${type}:`, error);
    throw error;
  }
}

export default router;