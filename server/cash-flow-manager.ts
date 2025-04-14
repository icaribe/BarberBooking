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
    console.log(`\n==== Registrando transação financeira ====`);
    console.log(`Tipo: ${transaction.type}`);
    console.log(`Valor (centavos): ${transaction.amount}`);
    console.log(`Valor (reais): R$ ${(transaction.amount/100).toFixed(2)}`);
    console.log(`Agendamento ID: ${transaction.appointmentId || 'N/A'}`);
    console.log(`Data: ${transaction.date}`);

    // Não converter para reais, manter em centavos
    const amountInCents = transaction.amount;

    const { data, error } = await supabase
      .from('cash_flow')
      .insert({
        date: transaction.date.toISOString().split('T')[0],
        appointment_id: transaction.appointmentId,
        amount: amountInCents,
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
    let processedServices = [];
    
    for (const service of serviceDetails) {
      if (!service) {
        console.error('Serviço inválido encontrado no cálculo');
        continue;
      }
      
      if (typeof service.price !== 'number') {
        console.error(`Preço inválido para serviço ${service.name}: ${service.price}`);
        continue;
      }
      
      totalAmount += service.price;
      processedServices.push({
        name: service.name,
        price: service.price,
        priceFormatted: `R$ ${(service.price/100).toFixed(2)}`
      });
      console.log(`Processando serviço ${service.name}: R$ ${(service.price/100).toFixed(2)}`);
    }

    console.log('\nResumo do cálculo:');
    console.log('Serviços processados:', processedServices.length);
    for (const svc of processedServices) {
      console.log(`- ${svc.name}: ${svc.priceFormatted}`);
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

export async function validateAndFixTransactions() {
  try {
    console.log('Iniciando validação de transações financeiras...');
    
    // Buscar todos os agendamentos concluídos (com status "completed" - minúsculo)
    // Como notamos que existem inconsistências nos status, vamos buscar tanto 'completed' quanto 'COMPLETED'
    console.log('Buscando agendamentos com status "completed" ou "COMPLETED"...');
    
    // Primeiro buscar com "completed" minúsculo
    const { data: appointmentsLower, error: appErrorLower } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'completed');
    
    if (appErrorLower) throw appErrorLower;
    
    // Depois buscar com "COMPLETED" maiúsculo
    const { data: appointmentsUpper, error: appErrorUpper } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'COMPLETED');
    
    if (appErrorUpper) throw appErrorUpper;
    
    // Combinar os resultados
    const appointments = [
      ...(appointmentsLower || []),
      ...(appointmentsUpper || [])
    ];


    console.log(`Encontrados ${appointments?.length || 0} agendamentos com status 'completed'`);

    if (!appointments || appointments.length === 0) {
      console.log('Nenhum agendamento concluído encontrado para processar');
      return;
    }

    for (const appointment of appointments) {
      console.log(`\nProcessando agendamento #${appointment.id} (${appointment.date})`);
      
      // Verificar se já existe transação
      const { data: transactions } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('appointment_id', appointment.id)
        .eq('type', 'INCOME');

      if (!transactions || transactions.length === 0) {
        console.log(`Nenhuma transação encontrada para agendamento #${appointment.id} - criando nova transação...`);
        
        // Buscar serviços do agendamento
        const { data: appointmentServices, error: servicesError } = await supabase
          .from('appointment_services')
          .select('*')
          .eq('appointment_id', appointment.id);
          
        if (servicesError) {
          console.error(`Erro ao buscar serviços para agendamento #${appointment.id}:`, servicesError);
          continue; // Passar para o próximo agendamento
        }
        
        console.log(`Encontrados ${appointmentServices?.length || 0} serviços para o agendamento #${appointment.id}`);
        
        // Se não houver serviços, não podemos prosseguir (não temos valor total na tabela)
        if (!appointmentServices || appointmentServices.length === 0) {
          console.log(`Agendamento #${appointment.id} não possui serviços definidos - pulando`);
          continue;
        }
        
        // Buscar detalhes de cada serviço
        const serviceDetails = [];
        for (const as of appointmentServices) {
          const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('*')
            .eq('id', as.service_id)
            .single();
            
          if (serviceError || !service) {
            console.error(`Erro ao buscar serviço ID ${as.service_id}:`, serviceError || 'Serviço não encontrado');
            continue;
          }
          
          serviceDetails.push({
            id: service.id,
            name: service.name,
            price: service.price
          });
          
          console.log(`Serviço ${service.name}: R$ ${(service.price/100).toFixed(2)}`);
        }
        
        if (serviceDetails.length > 0) {
          console.log(`Registrando transação para agendamento #${appointment.id} com ${serviceDetails.length} serviços`);
          await recordAppointmentTransaction(
            appointment.id,
            serviceDetails,
            new Date(appointment.date)
          );
        } else {
          console.log(`Não foi possível determinar o valor do agendamento #${appointment.id} - pulando`);
        }
      } else {
        console.log(`Transação já existe para agendamento #${appointment.id} - ignorando`);
      }
    }
    
    console.log('\nValidação e correção concluídas');
    return true;
  } catch (error) {
    console.error('Erro na validação:', error);
    throw error;
  }
}
