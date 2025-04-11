import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Criar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Script para validar e sincronizar transações financeiras dos agendamentos concluídos
 * 
 * Este script faz o seguinte:
 * 1. Busca todos os agendamentos com status "completed"
 * 2. Para cada agendamento, verifica se existe uma transação correspondente na tabela cash_flow
 * 3. Se não existir, cria a transação automaticamente com base nos serviços do agendamento
 */
async function validateFinancialTransactions() {
  try {
    console.log('Iniciando validação de transações financeiras...');
    
    // Buscar todos os agendamentos concluídos
    const { data: appointments, error: appError } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'completed');
    
    if (appError) {
      console.error('Erro ao buscar agendamentos concluídos:', appError);
      return;
    }
    
    console.log(`Encontrados ${appointments.length} agendamentos concluídos para verificação.`);
    
    let missingTransactions = 0;
    let correctTransactions = 0;
    
    // Verificar cada agendamento
    for (const appointment of appointments) {
      process.stdout.write(`\nVerificando agendamento #${appointment.id}... `);
      
      // Verificar se existe transação para este agendamento
      const { data: transactions, error: txError } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('appointment_id', appointment.id)
        .eq('type', 'INCOME');
      
      if (txError) {
        console.error(`\nErro ao verificar transações do agendamento #${appointment.id}:`, txError);
        continue;
      }
      
      // Se já existir transação, pular para o próximo
      if (transactions && transactions.length > 0) {
        process.stdout.write(`OK (Transação #${transactions[0].id}, R$ ${transactions[0].amount})`);
        correctTransactions++;
        continue;
      }
      
      // Transação não encontrada, buscar serviços do agendamento
      process.stdout.write(`Transação ausente! Corrigindo... `);
      missingTransactions++;
      
      const { data: appServices, error: svcError } = await supabase
        .from('appointment_services')
        .select('service_id')
        .eq('appointment_id', appointment.id);
      
      if (svcError) {
        console.error(`\nErro ao buscar serviços do agendamento #${appointment.id}:`, svcError);
        continue;
      }
      
      // Se não houver serviços, não é possível calcular o valor
      if (!appServices || appServices.length === 0) {
        process.stdout.write(`Sem serviços associados, não é possível calcular valor.`);
        continue;
      }
      
      // Calcular valor total do agendamento com base nos serviços
      let totalAmount = 0;
      let serviceNames = [];
      
      for (const svc of appServices) {
        const { data: service, error: serviceError } = await supabase
          .from('services')
          .select('*')
          .eq('id', svc.service_id)
          .single();
        
        if (serviceError) {
          console.error(`\nErro ao buscar detalhes do serviço #${svc.service_id}:`, serviceError);
          continue;
        }
        
        // Somar ao valor total
        totalAmount += service.price;
        serviceNames.push(service.name);
      }
      
      if (totalAmount === 0) {
        process.stdout.write(`Serviços sem valor definido.`);
        continue;
      }
      
      // Criar transação financeira
      const { data: newTx, error: createError } = await supabase
        .from('cash_flow')
        .insert({
          date: appointment.date,
          appointment_id: appointment.id,
          amount: totalAmount / 100, // Converter de centavos para reais
          type: 'INCOME',
          description: `Pagamento de serviço - Agendamento #${appointment.id} (${serviceNames.join(', ')})`
        })
        .select()
        .single();
      
      if (createError) {
        process.stdout.write(`\nErro ao criar transação: ${createError.message}`);
      } else {
        process.stdout.write(`Transação criada com sucesso! (#${newTx.id}, R$ ${newTx.amount})`);
      }
    }
    
    console.log('\n\n=== RESUMO DA VALIDAÇÃO ===');
    console.log(`Total de agendamentos verificados: ${appointments.length}`);
    console.log(`Transações corretas: ${correctTransactions}`);
    console.log(`Transações ausentes corrigidas: ${missingTransactions}`);
    
  } catch (error) {
    console.error('Erro geral ao validar transações:', error);
  }
}

validateFinancialTransactions();