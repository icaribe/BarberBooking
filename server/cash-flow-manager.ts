/**
 * Gerenciador de fluxo de caixa
 * 
 * Este módulo é responsável por gerenciar todas as operações 
 * relacionadas ao fluxo de caixa, incluindo:
 * 
 * - Registro de novas transações
 * - Sincronização automática de agendamentos com transações financeiras
 * - Geração de resumos financeiros
 * - Validação e correção de dados inconsistentes
 */

// Usar cliente REST em vez de conexão direta com PostgreSQL
// para evitar erros de DNS/conectividade
import supabaseRest from './supabase-rest-client';
import supabase from './supabase';
import { transactionTypeEnum } from '../shared/schema';

// Definir tipos para o enum de transações
export type TransactionType = 'income' | 'expense' | 'INCOME' | 'EXPENSE' | 'PRODUCT_SALE' | 'REFUND';

// Estrutura para representar um serviço em um agendamento
interface AppointmentService {
  id: number;
  name: string;
  price: number;
}

// Interface para filtros de busca de transações
interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  type?: string;
  category?: string;
  appointmentId?: number;
}

// Interface para criação de novas transações
interface NewTransaction {
  date: Date;
  amount: number;
  type: string;
  description: string;
  appointmentId?: number;
  category?: string;
}

/**
 * Busca transações com filtros opcionais
 */
export async function getTransactions(filters: TransactionFilters = {}) {
  try {
    console.log('Buscando transações com filtros:', JSON.stringify(filters));
    
    // Construir os filtros para a API REST
    const restFilters: Record<string, any> = {};
    
    if (filters.startDate) {
      const startDateStr = filters.startDate.toISOString().split('T')[0];
      restFilters['date=gte'] = startDateStr;
    }

    if (filters.endDate) {
      const endDateStr = filters.endDate.toISOString().split('T')[0];
      restFilters['date=lte'] = endDateStr;
    }

    if (filters.type) {
      // Converter 'income' para 'INCOME' e 'expense' para 'EXPENSE'
      let dbType = filters.type;
      if (filters.type === 'income') dbType = 'INCOME';
      if (filters.type === 'expense') dbType = 'EXPENSE';
      
      restFilters['type=eq'] = dbType;
    }

    if (filters.category) {
      restFilters['category=eq'] = filters.category;
    }

    if (filters.appointmentId) {
      restFilters['appointment_id=eq'] = filters.appointmentId;
    }
    
    // Adicionar parâmetro de ordenação
    restFilters['order'] = 'date.desc';

    // Tentar primeiro com o cliente REST (mais confiável em ambientes com restrições de DNS)
    try {
      console.log('Tentando obter transações via API REST');
      const { data, error } = await supabaseRest.select('cash_flow', '*', restFilters);
      
      if (error) {
        console.error('Erro ao buscar transações via REST:', error);
        throw error;
      }
      
      console.log(`Encontradas ${data?.length || 0} transações via API REST`);
      
      // Converter os tipos de transação do banco de dados para o formato esperado pelo frontend
      const formattedData = (data || []).map(transaction => {
        const formattedTransaction = { ...transaction };
        
        // Converter INCOME para income e EXPENSE para expense
        if (transaction.type === 'INCOME') {
          formattedTransaction.type = 'income';
        } else if (transaction.type === 'EXPENSE') {
          formattedTransaction.type = 'expense';
        }
        
        return formattedTransaction;
      });
      
      return formattedData;
    } catch (restError) {
      // Se falhar com API REST, tentar com o cliente padrão
      console.warn('Falha ao buscar transações via REST, tentando método alternativo:', restError);
      
      let query = supabase
        .from('cash_flow')
        .select('*')
        .order('date', { ascending: false });
  
      if (filters.startDate) {
        query = query.gte('date', filters.startDate.toISOString().split('T')[0]);
      }
  
      if (filters.endDate) {
        query = query.lte('date', filters.endDate.toISOString().split('T')[0]);
      }
  
      if (filters.type) {
        // Converter 'income' para 'INCOME' e 'expense' para 'EXPENSE'
        let dbType = filters.type;
        if (filters.type === 'income') dbType = 'INCOME';
        if (filters.type === 'expense') dbType = 'EXPENSE';
        
        query = query.eq('type', dbType);
      }
  
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
  
      if (filters.appointmentId) {
        query = query.eq('appointment_id', filters.appointmentId);
      }
  
      const { data, error } = await query;
  
      if (error) throw error;
      
      // Converter os tipos de transação do banco de dados para o formato esperado pelo frontend
      const formattedData = (data || []).map(transaction => {
        const formattedTransaction = { ...transaction };
        
        // Converter INCOME para income e EXPENSE para expense
        if (transaction.type === 'INCOME') {
          formattedTransaction.type = 'income';
        } else if (transaction.type === 'EXPENSE') {
          formattedTransaction.type = 'expense';
        }
        
        return formattedTransaction;
      });
      
      return formattedData;
    }
  } catch (error: any) {
    console.error('Erro ao buscar transações:', error.message);
    return []; // Retornar array vazio em vez de lançar erro para evitar quebrar a interface
  }
}

/**
 * Registra uma nova transação financeira
 */
export async function recordTransaction(transaction: NewTransaction) {
  try {
    console.log('Registrando nova transação:', JSON.stringify(transaction));
    const formattedDate = transaction.date.toISOString().split('T')[0];

    const insertData = {
      date: formattedDate,
      amount: transaction.amount.toString(),
      type: transaction.type,
      description: transaction.description,
      appointment_id: transaction.appointmentId || null,
      category: transaction.category || 'service'
    };
    
    console.log('Dados formatados para inserção:', JSON.stringify(insertData));

    // Tentar primeiro com cliente REST (mais confiável em ambientes com restrições de DNS)
    try {
      console.log('Tentando inserir transação via API REST');
      const { data, error } = await supabaseRest.insert('cash_flow', insertData);
      
      if (error) {
        console.error('Erro ao inserir transação via REST:', error);
        throw error;
      }
      
      console.log('Transação registrada com sucesso via API REST:', JSON.stringify(data));
      return data;
    } catch (restError) {
      // Se falhar com API REST, tentar com o cliente padrão
      console.warn('Falha ao inserir transação via REST, tentando método alternativo:', restError);
      
      const { data, error } = await supabase
        .from('cash_flow')
        .insert(insertData)
        .select()
        .single();
    
      if (error) throw error;
      console.log('Transação inserida com sucesso via cliente padrão');
      return data;
    }
  } catch (error: any) {
    console.error('Erro ao registrar transação:', error.message);
    throw error;
  }
}

/**
 * Calcula o saldo financeiro com base em filtros opcionais
 */
export async function calculateBalance(startDate?: Date, endDate?: Date): Promise<number> {
  try {
    // Obter transações diretamente do banco para garantir que os tipos originais estejam presentes
    let query = supabase
      .from('cash_flow')
      .select('*');
      
    if (startDate) {
      query = query.gte('date', startDate.toISOString().split('T')[0]);
    }

    if (endDate) {
      query = query.lte('date', endDate.toISOString().split('T')[0]);
    }
    
    const { data: transactions, error } = await query;
    
    if (error) throw error;
    
    let balance = 0;

    for (const transaction of transactions || []) {
      const amount = parseFloat(transaction.amount);
      if (transaction.type === 'INCOME' || transaction.type === 'PRODUCT_SALE' || transaction.type === 'income') {
        balance += amount;
      } else if (transaction.type === 'EXPENSE' || transaction.type === 'REFUND' || transaction.type === 'expense') {
        balance -= amount;
      }
    }

    return balance;
  } catch (error) {
    console.error('Erro ao calcular saldo:', error);
    throw error;
  }
}

/**
 * Função que sincroniza automaticamente os agendamentos concluídos com o fluxo de caixa
 * Verifica todos os agendamentos marcados como 'completed' e cria transações financeiras
 * para os que ainda não possuem uma transação associada
 */
export async function validateAndFixTransactions() {
  try {
    const result = {
      total_appointments: 0,
      appointments_with_transactions: 0,
      new_transactions_created: 0,
      errors: 0,
      error_details: [] as any[]
    };

    const { data: completedAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        *,
        appointment_services (
          service_id,
          services (
            name,
            price
          )
        )
      `)
      .eq('status', 'completed');

    if (appointmentsError) throw appointmentsError;

    if (!completedAppointments) {
      return { ...result, message: 'Nenhum agendamento concluído encontrado' };
    }

    result.total_appointments = completedAppointments.length;

    for (const appointment of completedAppointments) {
      try {
        const { data: existingTransactions } = await supabase
          .from('cash_flow')
          .select('*')
          .eq('appointment_id', appointment.id);

        if (existingTransactions && existingTransactions.length > 0) {
          result.appointments_with_transactions++;
          continue;
        }

        let totalValue = 0;
        const serviceNames: string[] = [];

        if (appointment.appointment_services) {
          for (const service of appointment.appointment_services) {
            if (service.services?.price) {
              totalValue += parseFloat(service.services.price);
              serviceNames.push(service.services.name);
            }
          }
        }

        if (totalValue > 0) {
          const transactionDate = appointment.completed_at 
            ? new Date(appointment.completed_at)
            : new Date(appointment.date);

          await recordTransaction({
            date: transactionDate,
            amount: totalValue,
            type: 'INCOME',
            description: `Serviços concluídos: ${serviceNames.join(', ')}`,
            appointmentId: appointment.id,
            category: 'service'
          });

          result.new_transactions_created++;
        }
      } catch (error: any) {
        result.errors++;
        result.error_details.push({
          appointment_id: appointment.id,
          error: error.message
        });
      }
    }

    return result;
  } catch (error: any) {
    throw new Error(`Falha na sincronização de transações: ${error.message}`);
  }
}

/**
 * Verifica se um agendamento já possui uma transação associada
 */
export async function checkAppointmentHasTransaction(appointmentId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('cash_flow')
      .select('id')
      .eq('appointment_id', appointmentId);

    if (error) throw error;
    return (data && data.length > 0);
  } catch (error) {
    console.error(`Erro ao verificar transação para o agendamento #${appointmentId}:`, error);
    throw error;
  }
}

/**
 * Hook para ser chamado quando um agendamento é marcado como concluído
 * Cria automaticamente uma transação de receita no fluxo de caixa
 */
export async function appointmentCompletedHook(appointmentId: number): Promise<void> {
  try {
    const hasTransaction = await checkAppointmentHasTransaction(appointmentId);
    if (hasTransaction) return;

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        appointment_services (
          service_id,
          services (
            name,
            price
          )
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) throw appointmentError;

    if (appointment.status !== 'completed') return;

    let totalValue = 0;
    const serviceNames: string[] = [];

    if (appointment.appointment_services) {
      for (const service of appointment.appointment_services) {
        if (service.services?.price) {
          totalValue += parseFloat(service.services.price);
          serviceNames.push(service.services.name);
        }
      }
    }

    if (totalValue > 0) {
      const transactionDate = appointment.completed_at 
        ? new Date(appointment.completed_at)
        : new Date();

      await recordTransaction({
        date: transactionDate,
        amount: totalValue,
        type: 'INCOME',
        description: `Serviços concluídos: ${serviceNames.join(', ')}`,
        appointmentId: appointmentId,
        category: 'service'
      });
    }
  } catch (error) {
    console.error(`Erro ao processar conclusão do agendamento #${appointmentId}:`, error);
    throw error;
  }
}

/**
 * Registra uma transação financeira para um agendamento concluído
 * 
 * @param appointmentId ID do agendamento concluído
 * @param services Lista de serviços realizados com seus preços
 * @param appointmentDate Data do agendamento
 * @returns Dados da transação criada ou null se houver erro
 */
export async function recordAppointmentTransaction(
  appointmentId: number,
  services: AppointmentService[],
  appointmentDate: Date
): Promise<any> {
  try {
    console.log(`Registrando transação para agendamento #${appointmentId}`);
    
    // Verificar se já existe transação para este agendamento
    const hasTransaction = await checkAppointmentHasTransaction(appointmentId);
    if (hasTransaction) {
      console.log(`Agendamento #${appointmentId} já possui transação registrada, pulando...`);
      return null;
    }
    
    // Verificar se temos serviços para registrar
    if (!services || services.length === 0) {
      console.log(`Nenhum serviço fornecido para o agendamento #${appointmentId}`);
      return null;
    }
    
    // Calcular o valor total
    let totalAmount = 0;
    const serviceNames: string[] = [];
    
    for (const service of services) {
      if (service && service.price) {
        totalAmount += service.price;
        serviceNames.push(service.name);
      }
    }
    
    if (totalAmount === 0) {
      console.log(`Valor total calculado é zero para o agendamento #${appointmentId}`);
      return null;
    }
    
    console.log(`Valor total dos serviços: ${totalAmount} centavos (${services.length} serviços)`);
    
    // Criar descrição detalhada dos serviços
    const description = serviceNames.length > 0
      ? `Serviços: ${serviceNames.join(', ')}`
      : `Agendamento concluído #${appointmentId}`;
    
    // Registrar a transação
    const transaction = await recordTransaction({
      date: appointmentDate,
      amount: totalAmount / 100, // Converter de centavos para reais na transação
      type: 'INCOME',
      description,
      appointmentId,
      category: 'service'
    });
    
    console.log(`Transação registrada com sucesso: ID #${transaction.id}, Valor: R$ ${(totalAmount/100).toFixed(2)}`);
    return transaction;
  } catch (error) {
    console.error(`Erro ao registrar transação para o agendamento #${appointmentId}:`, error);
    return null;
  }
}

/**
 * Remove a transação financeira associada a um agendamento
 * 
 * @param appointmentId ID do agendamento
 * @returns Dados da transação removida ou null se não encontrada
 */
export async function removeAppointmentTransaction(appointmentId: number): Promise<any> {
  try {
    console.log(`Removendo transação para agendamento #${appointmentId}`);
    
    // Buscar transação pelo appointment_id
    const { data: transactions, error } = await supabase
      .from('cash_flow')
      .select('*')
      .eq('appointment_id', appointmentId);
    
    if (error) {
      console.error(`Erro ao buscar transação do agendamento #${appointmentId}:`, error);
      return null;
    }
    
    if (!transactions || transactions.length === 0) {
      console.log(`Nenhuma transação encontrada para o agendamento #${appointmentId}`);
      return null;
    }
    
    // Remover a transação encontrada
    const transactionToRemove = transactions[0];
    const { data: removedTransaction, error: removeError } = await supabase
      .from('cash_flow')
      .delete()
      .eq('id', transactionToRemove.id)
      .select()
      .single();
    
    if (removeError) {
      console.error(`Erro ao remover transação #${transactionToRemove.id}:`, removeError);
      return null;
    }
    
    console.log(`Transação #${transactionToRemove.id} removida com sucesso para o agendamento #${appointmentId}`);
    return removedTransaction;
  } catch (error) {
    console.error(`Erro ao remover transação do agendamento #${appointmentId}:`, error);
    return null;
  }
}