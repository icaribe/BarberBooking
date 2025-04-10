/**
 * Rotas para gerenciamento do fluxo de caixa
 */

import { Router, Request, Response } from 'express';
import { requireRole, UserRole } from '../middleware/role-middleware';
import * as cashFlowManager from '../cash-flow-manager';
import supabase from '../supabase';

const cashFlowRouter = Router();

/**
 * Obter registros de fluxo de caixa com filtros
 */
cashFlowRouter.get('/', 
  requireRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, type } = req.query;
      
      console.log('Buscando registros de fluxo de caixa com filtros:', { startDate, endDate, type });
      
      // Construir consulta com base nos filtros
      let query = supabase.from('cash_flow').select('*');
      
      // Adicionar filtros, se fornecidos
      if (startDate) {
        query = query.gte('date', startDate as string);
      }
      
      if (endDate) {
        query = query.lte('date', endDate as string);
      }
      
      if (type) {
        query = query.eq('type', type as string);
      }
      
      // Ordenar por data (mais recente primeiro)
      query = query.order('date', { ascending: false });
      
      // Executar consulta
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar registros de fluxo de caixa:', error);
        return res.status(500).json({ 
          success: false,
          message: 'Erro ao buscar registros de fluxo de caixa' 
        });
      }
      
      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Erro ao processar requisição de fluxo de caixa:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao processar requisição de fluxo de caixa' 
      });
    }
  }
);

/**
 * Obter resumo financeiro do período
 */
cashFlowRouter.get('/summary', 
  requireRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      // Obter parâmetros de período
      let { startDate, endDate } = req.query;
      
      // Se não forem fornecidos, usar período do mês atual
      if (!startDate || !endDate) {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        startDate = start.toISOString().split('T')[0];
        endDate = end.toISOString().split('T')[0];
      }
      
      console.log('Calculando resumo financeiro para o período:', { startDate, endDate });
      
      // Buscar todos os registros do período
      const { data, error } = await supabase
        .from('cash_flow')
        .select('*')
        .gte('date', startDate as string)
        .lte('date', endDate as string);
      
      if (error) {
        console.error('Erro ao buscar dados para o resumo financeiro:', error);
        return res.status(500).json({ 
          success: false,
          message: 'Erro ao buscar dados para o resumo financeiro' 
        });
      }
      
      // Calcular totais por tipo
      let totalIncome = 0;
      let totalExpense = 0;
      let totalProductSales = 0;
      
      for (const record of data || []) {
        if (record.type === 'INCOME') {
          totalIncome += record.amount;
        } else if (record.type === 'EXPENSE') {
          totalExpense += record.amount;
        } else if (record.type === 'PRODUCT_SALE') {
          totalProductSales += record.amount;
        }
      }
      
      // Calcular saldo líquido
      const netBalance = totalIncome + totalProductSales - totalExpense;
      
      res.json({
        success: true,
        data: {
          period: {
            startDate,
            endDate
          },
          totals: {
            income: totalIncome.toFixed(2),
            expense: totalExpense.toFixed(2),
            productSales: totalProductSales.toFixed(2),
            netBalance: netBalance.toFixed(2)
          },
          recordCount: data?.length || 0
        }
      });
    } catch (error) {
      console.error('Erro ao calcular resumo financeiro:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao calcular resumo financeiro' 
      });
    }
  }
);

/**
 * Registrar transação manual
 */
cashFlowRouter.post('/', 
  requireRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const { date, amount, type, description } = req.body;
      
      // Validar dados
      if (!date || amount === undefined || !type || !description) {
        return res.status(400).json({ 
          success: false,
          message: 'Data, valor, tipo e descrição são obrigatórios' 
        });
      }
      
      console.log('Registrando transação manual:', { date, amount, type, description });
      
      // Registrar transação utilizando o módulo de fluxo de caixa
      const result = await cashFlowManager.recordTransaction({
        date,
        amount: parseFloat(amount),
        type: type as any,
        description
      });
      
      if (!result.success) {
        return res.status(500).json({ 
          success: false,
          message: 'Erro ao registrar transação',
          error: result.error
        });
      }
      
      res.status(201).json({
        success: true,
        data: result.data,
        message: 'Transação registrada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao registrar transação manual:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao registrar transação manual' 
      });
    }
  }
);

/**
 * Registrar despesa
 */
cashFlowRouter.post('/expense', 
  requireRole([UserRole.ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const { date, amount, description } = req.body;
      
      // Validar dados
      if (!date || amount === undefined || !description) {
        return res.status(400).json({ 
          success: false,
          message: 'Data, valor e descrição são obrigatórios' 
        });
      }
      
      console.log('Registrando despesa:', { date, amount, description });
      
      // Registrar despesa
      const result = await cashFlowManager.recordExpense(
        date,
        parseFloat(amount),
        description
      );
      
      if (!result.success) {
        return res.status(500).json({ 
          success: false,
          message: 'Erro ao registrar despesa',
          error: result.error
        });
      }
      
      res.status(201).json({
        success: true,
        data: result.data,
        message: 'Despesa registrada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao registrar despesa:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao registrar despesa' 
      });
    }
  }
);

/**
 * Registrar venda de produto
 */
cashFlowRouter.post('/product-sale', 
  requireRole([UserRole.ADMIN, UserRole.PROFESSIONAL]),
  async (req: Request, res: Response) => {
    try {
      const { date, amount, description } = req.body;
      
      // Validar dados
      if (!date || amount === undefined || !description) {
        return res.status(400).json({ 
          success: false,
          message: 'Data, valor e descrição são obrigatórios' 
        });
      }
      
      console.log('Registrando venda de produto:', { date, amount, description });
      
      // Registrar venda de produto
      const result = await cashFlowManager.recordProductSale(
        date,
        parseFloat(amount),
        description
      );
      
      if (!result.success) {
        return res.status(500).json({ 
          success: false,
          message: 'Erro ao registrar venda de produto',
          error: result.error
        });
      }
      
      res.status(201).json({
        success: true,
        data: result.data,
        message: 'Venda de produto registrada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao registrar venda de produto:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao registrar venda de produto' 
      });
    }
  }
);

export default cashFlowRouter;