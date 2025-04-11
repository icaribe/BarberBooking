/**
 * Gerenciador de Fluxo de Caixa
 * 
 * Este módulo centraliza todas as operações relacionadas ao fluxo de caixa,
 * permitindo o registro e consulta de transações financeiras.
 */

import supabase from './supabase';

// Tipos de transação
export enum TransactionType {
  INCOME = 'INCOME',         // Entrada de dinheiro (ex: pagamento de serviço)
  EXPENSE = 'EXPENSE',       // Saída de dinheiro (ex: pagamento de fornecedor)
  REFUND = 'REFUND',         // Devolução de dinheiro ao cliente
  ADJUSTMENT = 'ADJUSTMENT', // Ajuste manual no caixa
  PRODUCT_SALE = 'PRODUCT_SALE' // Venda de produto
}

// Interface para criação de uma transação
export interface CreateTransaction {
  date: Date;
  appointmentId?: number;
  amount: number;
  type: TransactionType;
  description?: string;
}

// Interface para consulta de transações
export interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  appointmentId?: number;
}

/**
 * Registra uma transação no fluxo de caixa
 */
export async function recordTransaction(transaction: CreateTransaction) {
  try {
    console.log(`Registrando transação: ${transaction.type} de R$ ${(transaction.amount/100).toFixed(2)}`);

    // Converter de centavos para reais no registro
    const amountInReais = transaction.amount / 100;

    const { data, error } = await supabase
      .from('cash_flow')
      .insert({
        date: transaction.date.toISOString().split('T')[0],
        appointment_id: transaction.appointmentId,
        amount: amountInReais,
        type: transaction.type,
        description: transaction.description
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao registrar transação:', error);
      throw new Error(`Falha ao registrar transação: ${error.message}`);
    }

    console.log('Transação registrada com sucesso:', data.id);
    return data;
  } catch (error) {
    console.error('Erro ao processar transação:', error);
    throw error;
  }
}

/**
 * Busca transações com base nos filtros fornecidos
 */
export async function getTransactions(filter: TransactionFilter) {
  try {
    console.log('Buscando transações com filtros:', filter);

    let query = supabase
      .from('cash_flow')
      .select('*');

    if (filter.startDate) {
      query = query.gte('date', filter.startDate.toISOString().split('T')[0]);
    }

    if (filter.endDate) {
      query = query.lte('date', filter.endDate.toISOString().split('T')[0]);
    }

    if (filter.type) {
      query = query.eq('type', filter.type);
    }

    if (filter.appointmentId) {
      query = query.eq('appointment_id', filter.appointmentId);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar transações:', error);
      throw new Error(`Falha ao buscar transações: ${error.message}`);
    }

    console.log(`${data.length} transações encontradas`);
    return data;
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
}

/**
 * Calcula o saldo total do caixa em um período
 */
export async function calculateBalance(startDate?: Date, endDate?: Date) {
  try {
    console.log(`Calculando saldo no período: ${startDate?.toISOString().split('T')[0] || 'início'} até ${endDate?.toISOString().split('T')[0] || 'hoje'}`);

    // Construir a consulta
    let query = supabase
      .from('cash_flow')
      .select('*');

    if (startDate) {
      query = query.gte('date', startDate.toISOString().split('T')[0]);
    }

    if (endDate) {
      query = query.lte('date', endDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao calcular saldo:', error);
      throw new Error(`Falha ao calcular saldo: ${error.message}`);
    }

    // Calcular o saldo
    let balance = 0;

    for (const transaction of data) {
      if (transaction.type === TransactionType.INCOME || transaction.type === TransactionType.PRODUCT_SALE) {
        balance += parseFloat(transaction.amount);
      } else if (transaction.type === TransactionType.EXPENSE || transaction.type === TransactionType.REFUND) {
        balance -= parseFloat(transaction.amount);
      } else if (transaction.type === TransactionType.ADJUSTMENT) {
        // Para ajustes, o valor pode ser positivo ou negativo
        balance += parseFloat(transaction.amount);
      }
    }

    console.log(`Saldo calculado: R$ ${balance.toFixed(2)}`);
    return balance;
  } catch (error) {
    console.error('Erro ao calcular saldo:', error);
    throw error;
  }
}

/**
 * Registra automaticamente uma transação de entrada quando um agendamento é marcado como concluído
 */
export async function recordAppointmentTransaction(appointmentId: number, serviceDetails: {name: string, price: number}[], date: Date) {
  try {
    console.log(`Registrando transação para agendamento #${appointmentId}`);

    // Calcular o valor total dos serviços (os preços já estão em centavos no banco)
    let totalAmount = 0;
    for (const service of serviceDetails) {
      if (service && service.price) {
        totalAmount += service.price;
        console.log(`Adicionando serviço ${service.name}: R$ ${(service.price/100).toFixed(2)}`);
      }
    }

    console.log(`Valor total calculado: R$ ${(totalAmount/100).toFixed(2)}`);

    // Não usar totalValue do appointment pois pode estar desatualizado
    if (totalAmount === 0) {
      console.log('ALERTA: Nenhum valor de serviço encontrado para o agendamento');
      return null; // Retorna null se não houver valor
    }

    // Verificar se já existe transação para este agendamento
    const { data: existingTransactions, error: checkError } = await supabase
      .from('cash_flow')
      .select('id')
      .eq('appointment_id', appointmentId)
      .eq('type', TransactionType.INCOME);

    if (checkError) {
      console.error('Erro ao verificar transações existentes:', checkError);
      throw new Error(`Falha ao verificar transações existentes: ${checkError.message}`);
    }

    if (existingTransactions && existingTransactions.length > 0) {
      console.log(`Transação já existente para o agendamento #${appointmentId}, ignorando.`);
      return existingTransactions[0]; // Retornar a transação existente em vez de null
    }

    // Registrar a transação
    return await recordTransaction({
      date: date || new Date(),
      appointmentId,
      amount: totalAmount,
      type: TransactionType.INCOME,
      description: `Pagamento de serviço - Agendamento #${appointmentId}`
    });
  } catch (error) {
    console.error('Erro ao registrar transação de agendamento:', error);
    throw error;
  }
}

/**
 * Função para compatibilidade com código existente
 * Esta função existe para manter compatibilidade com código que usa o formato antigo
 */
export async function recordAppointmentIncome(
  appointmentId: number, 
  appointmentDate: string, 
  amountInReais: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Converter a data de string para objeto Date
    const date = new Date(appointmentDate);

    // Converter o valor de reais para centavos
    const amountInCents = Math.round(amountInReais * 100);

    // Registrar a transação usando a função principal
    const result = await recordAppointmentTransaction(
      appointmentId,
      [{name: "Unknown Service", price: amountInCents}], //Added a dummy service detail for compatibility.
      date
    );

    if (result) {
      return { 
        success: true, 
        data: result 
      };
    } else {
      return { 
        success: false, 
        error: 'Transação já existente ou não foi possível registrar' 
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro em recordAppointmentIncome:', errorMessage);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

/**
 * Remove uma transação associada a um agendamento quando este é desmarcado como concluído
 * @param appointmentId ID do agendamento
 * @returns A transação removida ou null se não encontrada
 */
export async function removeAppointmentTransaction(appointmentId: number) {
  try {
    console.log(`Removendo transação financeira para agendamento #${appointmentId}`);

    // Verificar se existe transação para este agendamento
    const { data: existingTransactions, error: checkError } = await supabase
      .from('cash_flow')
      .select('*')
      .eq('appointment_id', appointmentId)
      .eq('type', TransactionType.INCOME);

    if (checkError) {
      console.error('Erro ao verificar transações existentes:', checkError);
      throw new Error(`Falha ao verificar transações existentes: ${checkError.message}`);
    }

    if (!existingTransactions || existingTransactions.length === 0) {
      console.log(`Nenhuma transação encontrada para o agendamento #${appointmentId}, nada a remover.`);
      return null;
    }

    console.log(`Encontrada(s) ${existingTransactions.length} transação(ões) para remover do agendamento #${appointmentId}`);

    // Capturar o ID da transação a ser removida
    const transactionId = existingTransactions[0].id;

    // Remover a transação
    const { data, error } = await supabase
      .from('cash_flow')
      .delete()
      .eq('id', transactionId)
      .select();

    if (error) {
      console.error(`Erro ao remover transação #${transactionId}:`, error);
      throw new Error(`Falha ao remover transação: ${error.message}`);
    }

    console.log(`Transação #${transactionId} removida com sucesso para o agendamento #${appointmentId}`);
    return data ? data[0] : null;
  } catch (error) {
    console.error('Erro ao remover transação de agendamento:', error);
    throw error;
  }
}