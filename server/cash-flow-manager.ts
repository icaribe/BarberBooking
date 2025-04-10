/**
 * Gerenciador de fluxo de caixa
 * 
 * Este módulo contém funções para gerenciar registros financeiros no sistema,
 * incluindo registro de receitas de agendamentos, despesas, etc.
 */

import supabase from './supabase';

/**
 * Enum para tipos de transações financeiras
 */
export enum TransactionType {
  INCOME = 'INCOME',       // Receita
  EXPENSE = 'EXPENSE',     // Despesa
  REFUND = 'REFUND',       // Reembolso/Estorno
  ADJUSTMENT = 'ADJUSTMENT', // Ajuste manual
  PRODUCT_SALE = 'PRODUCT_SALE', // Venda de produto
}

/**
 * Interface para criação de um registro financeiro
 */
export interface CashFlowRecord {
  date: string; // Data no formato YYYY-MM-DD
  appointment_id?: number; // ID do agendamento relacionado (opcional)
  amount: number; // Valor em reais (não em centavos)
  type: TransactionType; // Tipo da transação
  description: string; // Descrição ou observação
}

/**
 * Interface para resposta padronizada
 */
interface CashFlowResponse {
  success: boolean;
  data?: any;
  error?: any;
}

/**
 * Verifica se a tabela cash_flow existe e tenta criá-la se não existir
 */
async function ensureCashFlowTableExists(): Promise<boolean> {
  // Verificar se a tabela existe
  try {
    const { data, error } = await supabase
      .from('cash_flow')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      // Tabela não existe, tentar criar
      return await createCashFlowTable();
    } else if (error) {
      console.error("Erro ao verificar tabela cash_flow:", error);
      return false;
    }
    
    // Tabela existe
    return true;
  } catch (error) {
    console.error("Erro ao verificar tabela cash_flow:", error);
    return false;
  }
}

/**
 * Registra uma nova transação financeira
 */
export async function recordTransaction(transaction: CashFlowRecord): Promise<CashFlowResponse> {
  try {
    // Verificar se a tabela existe
    const tableExists = await ensureCashFlowTableExists();
    if (!tableExists) {
      return {
        success: false,
        error: "Tabela cash_flow não está disponível"
      };
    }
    
    // Preparar dados para inserção
    const record = {
      date: transaction.date,
      appointment_id: transaction.appointment_id,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
    };
    
    // Registrar na tabela
    const { data, error } = await supabase
      .from('cash_flow')
      .insert([record])
      .select();
    
    if (error) {
      console.error('Erro ao registrar transação financeira:', error);
      return {
        success: false,
        error
      };
    }
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Erro ao processar registro financeiro:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Registra receita de um agendamento concluído
 */
export async function recordAppointmentIncome(
  appointmentId: number,
  date: string,
  amount: number
): Promise<CashFlowResponse> {
  try {
    // Verificar se já existe registro para este agendamento
    const { data: existingRecords, error: checkError } = await supabase
      .from('cash_flow')
      .select('id')
      .eq('appointment_id', appointmentId)
      .eq('type', TransactionType.INCOME);
    
    if (checkError) {
      console.error('Erro ao verificar registros existentes:', checkError);
      return {
        success: false,
        error: checkError
      };
    }
    
    // Se já existir, não registrar novamente
    if (existingRecords && existingRecords.length > 0) {
      console.log('Registro financeiro já existe para este agendamento');
      return {
        success: true,
        data: existingRecords[0]
      };
    }
    
    // Preparar transação
    const transaction: CashFlowRecord = {
      date,
      appointment_id: appointmentId,
      amount,
      type: TransactionType.INCOME,
      description: `Agendamento concluído #${appointmentId}`
    };
    
    // Registrar transação
    return await recordTransaction(transaction);
  } catch (error) {
    console.error('Erro ao registrar receita de agendamento:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Registra despesa no sistema
 */
export async function recordExpense(
  date: string,
  amount: number,
  description: string
): Promise<CashFlowResponse> {
  try {
    // Preparar transação
    const transaction: CashFlowRecord = {
      date,
      amount,
      type: TransactionType.EXPENSE,
      description
    };
    
    // Registrar transação
    return await recordTransaction(transaction);
  } catch (error) {
    console.error('Erro ao registrar despesa:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Registra venda de produto
 */
export async function recordProductSale(
  date: string,
  amount: number,
  description: string
): Promise<CashFlowResponse> {
  try {
    // Preparar transação
    const transaction: CashFlowRecord = {
      date,
      amount,
      type: TransactionType.PRODUCT_SALE,
      description
    };
    
    // Registrar transação
    return await recordTransaction(transaction);
  } catch (error) {
    console.error('Erro ao registrar venda de produto:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Obtém o saldo do caixa para uma data específica
 */
export async function getDailyBalance(date: string): Promise<number> {
  try {
    // Buscar transações da data
    const { data, error } = await supabase
      .from('cash_flow')
      .select('amount, type')
      .eq('date', date);
    
    if (error) {
      console.error('Erro ao buscar saldo diário:', error);
      return 0;
    }
    
    // Calcular saldo
    let balance = 0;
    for (const record of data || []) {
      if (record.type === TransactionType.INCOME || record.type === TransactionType.PRODUCT_SALE) {
        balance += record.amount;
      } else if (record.type === TransactionType.EXPENSE || record.type === TransactionType.REFUND) {
        balance -= record.amount;
      }
    }
    
    return balance;
  } catch (error) {
    console.error('Erro ao calcular saldo diário:', error);
    return 0;
  }
}

/**
 * Obtém o saldo do caixa para um mês específico
 */
export async function getMonthlyBalance(year: number, month: number): Promise<number> {
  try {
    // Definir período do mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Buscar transações do período
    const { data, error } = await supabase
      .from('cash_flow')
      .select('amount, type')
      .gte('date', startDateStr)
      .lte('date', endDateStr);
    
    if (error) {
      console.error('Erro ao buscar saldo mensal:', error);
      return 0;
    }
    
    // Calcular saldo
    let balance = 0;
    for (const record of data || []) {
      if (record.type === TransactionType.INCOME || record.type === TransactionType.PRODUCT_SALE) {
        balance += record.amount;
      } else if (record.type === TransactionType.EXPENSE || record.type === TransactionType.REFUND) {
        balance -= record.amount;
      }
    }
    
    return balance;
  } catch (error) {
    console.error('Erro ao calcular saldo mensal:', error);
    return 0;
  }
}

/**
 * Obtém dados financeiros para o dashboard
 * Retorna o faturamento do dia e do mês atual
 */
export async function getDashboardFinancials(): Promise<{
  dailyRevenue: number;
  monthlyRevenue: number;
}> {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Faturamento do dia
    const dailyRevenue = await getDailyBalance(todayStr);
    
    // Faturamento do mês
    const monthlyRevenue = await getMonthlyBalance(
      today.getFullYear(),
      today.getMonth() + 1
    );
    
    return {
      dailyRevenue,
      monthlyRevenue
    };
  } catch (error) {
    console.error('Erro ao obter dados financeiros para o dashboard:', error);
    return {
      dailyRevenue: 0,
      monthlyRevenue: 0
    };
  }
}

/**
 * Função para criar a tabela cash_flow programaticamente
 * Esta função provavelmente falhará devido a permissões, mas estamos
 * incluindo para tentativa.
 */
async function createCashFlowTable(): Promise<boolean> {
  try {
    // Tentar criar a tabela via SQL
    const { error } = await supabase.rpc('create_cash_flow_table');
    
    if (error) {
      console.error('Erro ao criar tabela cash_flow:', error);
      return false;
    }
    
    console.log('Tabela cash_flow criada com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao tentar criar tabela cash_flow:', error);
    return false;
  }
}