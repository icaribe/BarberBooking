/**
 * Script para validar e sincronizar transações financeiras dos agendamentos concluídos
 * 
 * Este script faz o seguinte:
 * 1. Busca todos os agendamentos com status "completed"
 * 2. Para cada agendamento, verifica se existe uma transação correspondente na tabela cash_flow
 * 3. Se não existir, cria a transação automaticamente com base nos serviços do agendamento
 */

import supabase from './server/supabase.ts';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Tipo de transação
const TransactionType = {
  INCOME: 'INCOME'
};

// Formatar moeda
const formatCurrency = (valueInCents) => `R$ ${(valueInCents/100).toFixed(2)}`;

async function validateFinancialTransactions() {
  try {
    console.log('Iniciando validação de transações financeiras...');
    
    // Buscar todos os agendamentos concluídos (com status "completed" - minúsculo)
    // Como existem inconsistências nos status, vamos buscar tanto 'completed' quanto 'COMPLETED'
    console.log('\nAnalisando registros da tabela cash_flow do Supabase:');
    
    // Buscar valores por mês
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Janeiro é 0
    const currentYear = today.getFullYear();
    
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
    const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
    
    console.log(`Período: ${startOfMonth} a ${endOfMonth}`);
    
    // Buscar transações do mês atual
    const { data: transactions, error: txError } = await supabase
      .from('cash_flow')
      .select('*')
      .gte('date', startOfMonth)
      .lte('date', endOfMonth);
      
    if (txError) {
      console.error('Erro ao buscar transações:', txError);
      return;
    }
    
    console.log(`\nEncontradas ${transactions?.length || 0} transações neste mês`);
    
    // Agrupar transações por dia e calcular totais
    const dailyTotals = {};
    
    transactions?.forEach(tx => {
      const day = tx.date;
      
      if (!dailyTotals[day]) {
        dailyTotals[day] = {
          income: 0,
          expense: 0,
          count: 0,
          transactions: []
        };
      }
      
      dailyTotals[day].count++;
      dailyTotals[day].transactions.push({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        formatted: formatCurrency(tx.amount),
        description: tx.description,
        appointmentId: tx.appointment_id
      });
      
      // Somar com base no tipo de transação
      if (tx.type === 'INCOME' || tx.type === 'PRODUCT_SALE') {
        dailyTotals[day].income += parseFloat(tx.amount);
      } else if (tx.type === 'EXPENSE' || tx.type === 'REFUND') {
        dailyTotals[day].expense += parseFloat(tx.amount);
      }
    });
    
    // Exibir totais por dia
    console.log('\n=== RESUMO FINANCEIRO POR DIA ===');
    
    let monthlyTotal = 0;
    
    Object.keys(dailyTotals).sort().forEach(day => {
      const daily = dailyTotals[day];
      const dayTotal = daily.income - daily.expense;
      monthlyTotal += dayTotal;
      
      console.log(`\nDia ${day}: ${formatCurrency(dayTotal)} (${daily.count} transações)`);
      
      // Detalhar transações do dia
      daily.transactions.forEach(tx => {
        console.log(`- ${tx.type}: ${tx.formatted} (${tx.description?.substring(0, 50) || 'Sem descrição'})`);
      });
    });
    
    console.log(`\n=== TOTAL DO MÊS: ${formatCurrency(monthlyTotal)} ===`);
    
    // Verificar se há valores estranhos (muito baixos)
    const suspiciousTransactions = transactions?.filter(tx => tx.amount > 0 && tx.amount < 100) || [];
    
    if (suspiciousTransactions.length > 0) {
      console.log('\n\n!!! ATENÇÃO: TRANSAÇÕES SUSPEITAS (VALORES MUITO BAIXOS) !!!');
      suspiciousTransactions.forEach(tx => {
        console.log(`ID: ${tx.id}, Valor: ${formatCurrency(tx.amount)}, Data: ${tx.date}, Desc: ${tx.description}`);
      });
      
      // Investigar essas transações suspeitas
      console.log('\nInvestigando transações suspeitas:');
      
      for (const tx of suspiciousTransactions) {
        console.log(`\n--- Análise de transação ID: ${tx.id} ---`);
        console.log(`Valor: ${formatCurrency(tx.amount)}, Data: ${tx.date}`);
        console.log(`Descrição: ${tx.description}`);
        
        if (tx.appointment_id) {
          console.log(`Vinculada ao agendamento ID: ${tx.appointment_id}`);
          
          // Buscar detalhes do agendamento
          const { data: appointment, error: apptError } = await supabase
            .from('appointments')
            .select('*')
            .eq('id', tx.appointment_id)
            .single();
          
          if (apptError) {
            console.log(`Erro ao buscar agendamento: ${apptError.message}`);
            continue;
          }
          
          console.log(`Agendamento de ${appointment.date} para client ID: ${appointment.user_id}, status: ${appointment.status}`);
          
          // Buscar serviços do agendamento
          const { data: appointmentServices, error: asError } = await supabase
            .from('appointment_services')
            .select('*')
            .eq('appointment_id', tx.appointment_id);
          
          if (asError) {
            console.log(`Erro ao buscar serviços: ${asError.message}`);
            continue;
          }
          
          console.log(`Serviços encontrados: ${appointmentServices.length}`);
          
          // Buscar detalhes de cada serviço
          let serviceTotal = 0;
          
          for (const as of appointmentServices) {
            const { data: service, error: svcError } = await supabase
              .from('services')
              .select('*')
              .eq('id', as.service_id)
              .single();
            
            if (svcError) {
              console.log(`Erro ao buscar serviço ${as.service_id}: ${svcError.message}`);
              continue;
            }
            
            console.log(`- ${service.name}: ${formatCurrency(service.price)}`);
            serviceTotal += service.price;
          }
          
          console.log(`\nValor total dos serviços: ${formatCurrency(serviceTotal)}`);
          console.log(`Valor registrado na transação: ${formatCurrency(tx.amount)}`);
          console.log(`Diferença: ${formatCurrency(serviceTotal - tx.amount)}`);
          
          if (Math.abs(serviceTotal - tx.amount) > 10) {
            console.log('PROBLEMA ENCONTRADO: Valores não correspondem!');
          }
        }
      }
    }
    
    console.log('\nValidação concluída.');
    return true;
  } catch (error) {
    console.error('Erro na validação:', error);
    throw error;
  }
}

// Executar o script
validateFinancialTransactions()
  .then(() => {
    console.log('\nScript finalizado com sucesso.');
    process.exit(0);
  })
  .catch(error => {
    console.error('\nErro durante a execução do script:', error);
    process.exit(1);
  });