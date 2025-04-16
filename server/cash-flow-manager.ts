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

import supabase from './supabase';
import { TransactionType } from '../shared/schema';

// Interface para filtros de busca de transações
interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  category?: string;
  appointmentId?: number;
}

// Interface para criação de novas transações
interface NewTransaction {
  date: Date;
  amount: number;
  type: TransactionType;
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
    
    // Iniciar a consulta base
    let query = supabase
      .from('cash_flow')
      .select('*')
      .order('date', { ascending: false });
    
    // Aplicar filtros se existirem
    if (filters.startDate) {
      query = query.gte('date', filters.startDate.toISOString().split('T')[0]);
    }
    
    if (filters.endDate) {
      query = query.lte('date', filters.endDate.toISOString().split('T')[0]);
    }
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.appointmentId) {
      query = query.eq('appointment_id', filters.appointmentId);
    }
    
    // Executar a consulta
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
}

/**
 * Registra uma nova transação financeira
 */
export async function recordTransaction(transaction: NewTransaction) {
  try {
    console.log('Registrando nova transação:', JSON.stringify(transaction));
    
    // Formatação de data para o formato PostgreSQL
    const formattedDate = transaction.date.toISOString().split('T')[0];
    
    // Preparar dados para inserção
    const insertData = {
      date: formattedDate,
      amount: transaction.amount.toString(), // Armazenado como string para evitar problemas de precisão
      type: transaction.type,
      description: transaction.description,
      appointment_id: transaction.appointmentId || null,
      category: transaction.category || 'other'
    };
    
    // Inserir no banco
    const { data, error } = await supabase
      .from('cash_flow')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao registrar transação:', error);
      throw error;
    }
    
    console.log('Transação registrada com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao registrar transação:', error);
    throw error;
  }
}

/**
 * Calcula o saldo financeiro com base em filtros opcionais
 */
export async function calculateBalance(startDate?: Date, endDate?: Date): Promise<number> {
  try {
    // Buscar todas as transações no período especificado
    const transactions = await getTransactions({
      startDate,
      endDate
    });
    
    let balance = 0;
    
    // Calcular saldo
    for (const transaction of transactions) {
      const amount = parseFloat(transaction.amount);
      
      // Receitas aumentam o saldo, despesas diminuem
      if (transaction.type === 'INCOME' || transaction.type === 'PRODUCT_SALE') {
        balance += amount;
      } else if (transaction.type === 'EXPENSE' || transaction.type === 'REFUND') {
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
    console.log('Iniciando sincronização de transações com agendamentos concluídos...');
    
    // Status das operações
    const result = {
      total_appointments: 0,
      appointments_with_transactions: 0,
      new_transactions_created: 0,
      errors: 0,
      error_details: [] as any[]
    };
    
    // 1. Buscar todos os agendamentos com status "completed"
    const { data: completedAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'completed');
    
    if (appointmentsError) {
      throw new Error(`Erro ao buscar agendamentos concluídos: ${appointmentsError.message}`);
    }
    
    if (!completedAppointments || completedAppointments.length === 0) {
      console.log('Nenhum agendamento concluído encontrado');
      return { ...result, message: 'Nenhum agendamento concluído encontrado' };
    }
    
    result.total_appointments = completedAppointments.length;
    console.log(`Encontrados ${completedAppointments.length} agendamentos concluídos`);
    
    // 2. Para cada agendamento, verificar se existe uma transação correspondente
    for (const appointment of completedAppointments) {
      try {
        // Verificar se já existe uma transação para este agendamento
        const { data: existingTransactions, error: txError } = await supabase
          .from('cash_flow')
          .select('*')
          .eq('appointment_id', appointment.id);
        
        if (txError) {
          throw new Error(`Erro ao verificar transações para o agendamento #${appointment.id}: ${txError.message}`);
        }
        
        // Se já existir uma transação, pular
        if (existingTransactions && existingTransactions.length > 0) {
          result.appointments_with_transactions++;
          continue;
        }
        
        // 3. Buscar serviços associados ao agendamento
        const { data: appointmentServices, error: servicesError } = await supabase
          .from('appointment_services')
          .select('*')
          .eq('appointment_id', appointment.id);
        
        if (servicesError) {
          throw new Error(`Erro ao buscar serviços do agendamento #${appointment.id}: ${servicesError.message}`);
        }
        
        if (!appointmentServices || appointmentServices.length === 0) {
          console.warn(`Agendamento #${appointment.id} não tem serviços registrados, pulando`);
          continue;
        }
        
        // 4. Calcular valor total dos serviços
        let totalValue = 0;
        
        for (const appointmentService of appointmentServices) {
          // Buscar detalhes do serviço para obter o preço
          const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('price')
            .eq('id', appointmentService.service_id)
            .single();
          
          if (serviceError) {
            console.warn(`Erro ao buscar detalhes do serviço #${appointmentService.service_id}: ${serviceError.message}`);
            continue;
          }
          
          if (service && service.price) {
            totalValue += service.price;
          }
        }
        
        // 5. Criar transação financeira para o agendamento
        if (totalValue > 0) {
          // Definir uma data para a transação - usar a data do agendamento ou a data de conclusão
          let transactionDate = new Date(appointment.date);
          
          // Se houver completed_at, usar essa data em vez da data do agendamento
          if (appointment.completed_at) {
            transactionDate = new Date(appointment.completed_at);
          }
          
          // Registrar nova transação
          const transactionData = {
            date: transactionDate,
            amount: totalValue,
            type: 'INCOME' as TransactionType,
            description: `Serviço concluído - Agendamento #${appointment.id}`,
            appointmentId: appointment.id,
            category: 'service'
          };
          
          await recordTransaction(transactionData);
          result.new_transactions_created++;
          
          console.log(`Criada transação para agendamento #${appointment.id} no valor de R$${totalValue}`);
        } else {
          console.warn(`Agendamento #${appointment.id} tem valor total 0, não será criada transação`);
        }
      } catch (error: any) {
        console.error(`Erro ao processar agendamento #${appointment.id}:`, error);
        result.errors++;
        result.error_details.push({
          appointment_id: appointment.id,
          error: error.message
        });
      }
    }
    
    console.log('Sincronização concluída!', result);
    return result;
  } catch (error: any) {
    console.error('Erro ao sincronizar transações:', error);
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
    
    if (error) {
      console.error(`Erro ao verificar transação para o agendamento #${appointmentId}:`, error);
      throw error;
    }
    
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
    console.log(`Processando conclusão do agendamento #${appointmentId}...`);
    
    // 1. Verificar se já existe uma transação para este agendamento
    const hasTransaction = await checkAppointmentHasTransaction(appointmentId);
    
    if (hasTransaction) {
      console.log(`Agendamento #${appointmentId} já possui transação, ignorando`);
      return;
    }
    
    // 2. Buscar detalhes do agendamento
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();
    
    if (appointmentError || !appointment) {
      throw new Error(`Erro ao buscar agendamento #${appointmentId}: ${appointmentError?.message || 'Agendamento não encontrado'}`);
    }
    
    // 3. Verificar se o status é realmente "completed"
    if (appointment.status !== 'completed') {
      console.log(`Agendamento #${appointmentId} não está com status "completed" (atual: ${appointment.status}), ignorando`);
      return;
    }
    
    // 4. Buscar serviços do agendamento
    const { data: appointmentServices, error: servicesError } = await supabase
      .from('appointment_services')
      .select('*')
      .eq('appointment_id', appointmentId);
    
    if (servicesError) {
      throw new Error(`Erro ao buscar serviços do agendamento #${appointmentId}: ${servicesError.message}`);
    }
    
    if (!appointmentServices || appointmentServices.length === 0) {
      console.warn(`Agendamento #${appointmentId} não tem serviços registrados, pulando`);
      return;
    }
    
    // 5. Calcular valor total do agendamento
    let totalValue = 0;
    
    for (const appointmentService of appointmentServices) {
      // Buscar detalhes do serviço (incluindo preço)
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', appointmentService.service_id)
        .single();
      
      if (serviceError) {
        console.warn(`Erro ao buscar detalhes do serviço #${appointmentService.service_id}: ${serviceError.message}`);
        continue;
      }
      
      if (service && service.price) {
        totalValue += service.price;
      }
    }
    
    // 6. Verificar se há valor para registrar
    if (totalValue <= 0) {
      console.warn(`Agendamento #${appointmentId} tem valor total 0, não será criada transação`);
      return;
    }
    
    // 7. Definir data da transação
    let transactionDate = new Date(appointment.date);
    
    // Se houver completed_at, usar essa data em vez da data do agendamento
    if (appointment.completed_at) {
      transactionDate = new Date(appointment.completed_at);
    } else {
      // Se não houver completed_at, definir como data atual
      transactionDate = new Date();
      
      // Também atualizar o campo completed_at no agendamento
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ completed_at: transactionDate.toISOString() })
        .eq('id', appointmentId);
      
      if (updateError) {
        console.warn(`Erro ao atualizar campo completed_at do agendamento #${appointmentId}: ${updateError.message}`);
      }
    }
    
    // 8. Registrar transação financeira
    const transactionData = {
      date: transactionDate,
      amount: totalValue,
      type: 'INCOME' as TransactionType,
      description: `Serviço concluído - Agendamento #${appointmentId}`,
      appointmentId: appointmentId,
      category: 'service'
    };
    
    await recordTransaction(transactionData);
    
    console.log(`Transação criada com sucesso para o agendamento #${appointmentId} no valor de R$${totalValue}`);
  } catch (error: any) {
    console.error(`Erro ao processar conclusão do agendamento #${appointmentId}:`, error);
    throw new Error(`Falha ao processar conclusão do agendamento: ${error.message}`);
  }
}