/**
 * Script para validar a integração entre agendamentos concluídos e fluxo de caixa
 * 
 * Este script verifica a existência de transações financeiras para todos os
 * agendamentos marcados como concluídos e gera um relatório.
 */

import { supabaseAdmin } from './shared/supabase-client.js';

async function validateCashFlowIntegration() {
  console.log('=== VALIDANDO INTEGRAÇÃO DE AGENDAMENTOS E FLUXO DE CAIXA ===');
  
  try {
    // 1. Buscar todos os agendamentos concluídos
    console.log('\nBuscando agendamentos concluídos...');
    
    const { data: completedAppointments, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        date,
        status,
        user_id,
        professional_id,
        appointment_services (
          service_id,
          services (id, name, price)
        )
      `)
      .eq('status', 'completed')
      .order('date', { ascending: false });
    
    if (appointmentError) {
      throw new Error(`Erro ao buscar agendamentos: ${appointmentError.message}`);
    }
    
    console.log(`\nEncontrados ${completedAppointments.length} agendamentos concluídos.`);
    
    // 2. Verificar quais agendamentos têm transações
    let appointmentsWithTransactions = 0;
    let appointmentsWithoutTransactions = 0;
    let transactionsCreated = 0;
    
    for (const appointment of completedAppointments) {
      process.stdout.write(`\nVerificando agendamento #${appointment.id} (${new Date(appointment.date).toLocaleDateString('pt-BR')})... `);
      
      // Buscar transações relacionadas
      const { data: transactions, error: transactionError } = await supabaseAdmin
        .from('cash_flow')
        .select('*')
        .eq('appointment_id', appointment.id);
      
      if (transactionError) {
        console.error(`\n  Erro ao buscar transações: ${transactionError.message}`);
        continue;
      }
      
      if (transactions && transactions.length > 0) {
        console.log(`✓ (Transação #${transactions[0].id} encontrada)`);
        appointmentsWithTransactions++;
        continue;
      }
      
      console.log('✗ (Sem transação)');
      appointmentsWithoutTransactions++;
      
      // 3. Tentar criar transação para este agendamento (se o usuário permitir)
      if (!appointment.appointment_services || appointment.appointment_services.length === 0) {
        console.log(`  - Agendamento sem serviços associados`);
        continue;
      }
      
      let totalValue = 0;
      const serviceNames = [];
      
      for (const service of appointment.appointment_services) {
        if (service.services?.price) {
          totalValue += parseFloat(service.services.price);
          serviceNames.push(service.services.name);
        }
      }
      
      if (totalValue === 0) {
        console.log(`  - Serviços sem valor definido`);
        continue;
      }
      
      console.log(`  - Serviços: ${serviceNames.join(', ')}`);
      console.log(`  - Valor total: R$ ${(totalValue/100).toFixed(2)}`);
    }
    
    // 4. Gerar relatório final
    console.log(`\n=== RELATÓRIO FINAL ===`);
    console.log(`Total de agendamentos concluídos: ${completedAppointments.length}`);
    console.log(`Agendamentos com transações: ${appointmentsWithTransactions} (${Math.round((appointmentsWithTransactions/completedAppointments.length)*100)}%)`);
    console.log(`Agendamentos sem transações: ${appointmentsWithoutTransactions} (${Math.round((appointmentsWithoutTransactions/completedAppointments.length)*100)}%)`);
    
    // 5. Verificar transações existentes no banco e resumir
    const { data: allTransactions, error: allTransError } = await supabaseAdmin
      .from('cash_flow')
      .select('*')
      .order('date', { ascending: false });
    
    if (allTransError) {
      console.error(`\nErro ao buscar todas as transações: ${allTransError.message}`);
    } else {
      const appointmentTransactions = allTransactions.filter(t => t.appointment_id !== null);
      const totalIncomeValue = allTransactions
        .filter(t => t.type === 'income' || t.type === 'INCOME')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        
      console.log(`\nEstatísticas do Fluxo de Caixa:`);
      console.log(`- Total de transações: ${allTransactions.length}`);
      console.log(`- Transações de agendamentos: ${appointmentTransactions.length}`);
      console.log(`- Transações de outros tipos: ${allTransactions.length - appointmentTransactions.length}`);
      console.log(`- Valor total (receitas): R$ ${totalIncomeValue.toFixed(2)}`);
    }
    
  } catch (error) {
    console.error('Erro na validação:', error);
  }
}

// Executar validação
validateCashFlowIntegration().catch(console.error);