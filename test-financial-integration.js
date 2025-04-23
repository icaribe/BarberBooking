/**
 * Script para testar a integração entre agendamentos concluídos e transações financeiras
 * 
 * Este script verifica:
 * 1. Agendamentos marcados como concluídos
 * 2. Transações financeiras associadas
 * 3. Tenta criar transações para agendamentos sem registros financeiros
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Conexão com o Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Credenciais do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinancialIntegration() {
  console.log('Iniciando teste de integração financeira...');
  
  try {
    // 1. Buscar agendamentos concluídos
    console.log('Buscando agendamentos concluídos...');
    
    const { data: completedAppointments, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        status,
        appointment_services (
          service_id,
          services (id, name, price)
        )
      `)
      .eq('status', 'completed');
    
    if (appointmentError) {
      throw new Error(`Erro ao buscar agendamentos: ${appointmentError.message}`);
    }
    
    console.log(`Encontrados ${completedAppointments.length} agendamentos concluídos`);
    
    // 2. Para cada agendamento, verificar se existe transação financeira
    let appointmentsWithTransactions = 0;
    let appointmentsWithoutTransactions = 0;
    let successfullyCreatedTransactions = 0;
    
    for (const appointment of completedAppointments) {
      console.log(`\nVerificando agendamento #${appointment.id}:`);
      
      // Buscar transações para este agendamento
      const { data: transactions, error: transactionError } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('appointment_id', appointment.id);
      
      if (transactionError) {
        console.error(`  Erro ao buscar transações: ${transactionError.message}`);
        continue;
      }
      
      if (transactions && transactions.length > 0) {
        console.log(`  ✓ Transação encontrada: ID #${transactions[0].id}, Valor: R$ ${parseFloat(transactions[0].amount).toFixed(2)}`);
        appointmentsWithTransactions++;
        continue;
      }
      
      console.log(`  ✗ Nenhuma transação encontrada para este agendamento`);
      appointmentsWithoutTransactions++;
      
      // 3. Tentar criar transação para este agendamento
      if (!appointment.appointment_services || appointment.appointment_services.length === 0) {
        console.log(`  ✗ Nenhum serviço associado a este agendamento`);
        continue;
      }
      
      // Calcular o valor total dos serviços
      let totalValue = 0;
      const serviceNames = [];
      
      for (const service of appointment.appointment_services) {
        if (service.services?.price) {
          totalValue += parseFloat(service.services.price);
          serviceNames.push(service.services.name);
        }
      }
      
      if (totalValue === 0) {
        console.log(`  ✗ Valor total dos serviços é zero`);
        continue;
      }
      
      console.log(`  Serviços: ${serviceNames.join(', ')}`);
      console.log(`  Valor total: R$ ${(totalValue).toFixed(2)}`);
      
      // Criar transação
      const transactionDate = new Date(appointment.date);
        
      const formattedDate = transactionDate.toISOString().split('T')[0];
      
      const { data: newTransaction, error: createError } = await supabase
        .from('cash_flow')
        .insert({
          date: formattedDate,
          amount: totalValue.toString(),
          type: 'income',
          description: `Serviços concluídos: ${serviceNames.join(', ')}`,
          appointment_id: appointment.id,
          category: 'service',
          created_by_id: 1
        })
        .select()
        .single();
      
      if (createError) {
        console.error(`  ✗ Erro ao criar transação: ${createError.message}`);
        continue;
      }
      
      console.log(`  ✓ Transação criada com sucesso: ID #${newTransaction.id}, Valor: R$ ${parseFloat(newTransaction.amount).toFixed(2)}`);
      successfullyCreatedTransactions++;
    }
    
    // Resumo
    console.log('\n===== RESUMO =====');
    console.log(`Total de agendamentos concluídos: ${completedAppointments.length}`);
    console.log(`Agendamentos com transações: ${appointmentsWithTransactions}`);
    console.log(`Agendamentos sem transações: ${appointmentsWithoutTransactions}`);
    console.log(`Transações criadas com sucesso: ${successfullyCreatedTransactions}`);
    
  } catch (error) {
    console.error('Erro durante o teste de integração:', error);
  }
}

// Executar o teste
testFinancialIntegration().catch(console.error);