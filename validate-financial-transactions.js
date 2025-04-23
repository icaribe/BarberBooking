/**
 * Script para validar e sincronizar transações financeiras dos agendamentos concluídos
 * 
 * Este script faz o seguinte:
 * 1. Busca todos os agendamentos com status "completed"
 * 2. Para cada agendamento, verifica se existe uma transação correspondente na tabela cash_flow
 * 3. Se não existir, cria a transação automaticamente com base nos serviços do agendamento
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Conexão com o Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais do Supabase não configuradas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Conexão com Supabase inicializada.');

async function validateFinancialTransactions() {
  console.log('\n=== VALIDANDO E CORRIGINDO TRANSAÇÕES FINANCEIRAS ===');
  
  try {
    console.log('\nBuscando agendamentos concluídos...');
    
    // 1. Buscar todos os agendamentos com status "completed"
    const { data: completedAppointments, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        status,
        appointment_services (
          service_id,
          services (
            id,
            name,
            price
          )
        )
      `)
      .eq('status', 'completed');
    
    if (appointmentError) {
      throw new Error(`Erro ao buscar agendamentos: ${appointmentError.message}`);
    }
    
    console.log(`Encontrados ${completedAppointments.length} agendamentos concluídos`);
    
    if (completedAppointments.length === 0) {
      console.log('Nenhum agendamento concluído para processar.');
      return;
    }
    
    // Estatísticas
    let appointmentsWithTransactions = 0;
    let appointmentsWithoutTransactions = 0;
    let transactionsCreated = 0;
    
    // 2. Para cada agendamento, verificar se existe transação correspondente
    for (const appointment of completedAppointments) {
      process.stdout.write(`\nAgendamento #${appointment.id} (${new Date(appointment.date).toLocaleDateString()}): `);
      
      // Verificar se já existe transação
      const { data: existingTransactions, error: transactionError } = await supabase
        .from('cash_flow')
        .select('id, amount')
        .eq('appointment_id', appointment.id);
      
      if (transactionError) {
        console.error(`\nErro ao verificar transações: ${transactionError.message}`);
        continue;
      }
      
      if (existingTransactions && existingTransactions.length > 0) {
        console.log(`✓ Já possui transação #${existingTransactions[0].id}`);
        appointmentsWithTransactions++;
        continue;
      }
      
      // Se não tem transação, criar uma
      console.log('✗ Sem transação');
      appointmentsWithoutTransactions++;
      
      // Verificar se tem serviços
      if (!appointment.appointment_services || appointment.appointment_services.length === 0) {
        console.log(`  - Sem serviços associados`);
        continue;
      }
      
      // Calcular valor total dos serviços
      let totalValue = 0;
      const serviceNames = [];
      
      for (const service of appointment.appointment_services) {
        if (service.services && service.services.price) {
          const price = parseFloat(service.services.price);
          if (!isNaN(price)) {
            totalValue += price;
            serviceNames.push(service.services.name);
          }
        }
      }
      
      if (totalValue === 0) {
        console.log(`  - Valor total zero, não será criada transação`);
        continue;
      }
      
      console.log(`  - Serviços: ${serviceNames.join(', ')}`);
      console.log(`  - Valor total: R$ ${totalValue.toFixed(2)}`);
      
      // Criar a transação
      const { data: newTransaction, error: createError } = await supabase
        .from('cash_flow')
        .insert({
          date: new Date(appointment.date).toISOString().split('T')[0],
          amount: totalValue.toString(),
          type: 'income',
          description: `Serviços: ${serviceNames.join(', ')}`,
          appointment_id: appointment.id,
          category: 'service',
          created_by_id: 1 // ID padrão do admin
        })
        .select()
        .single();
      
      if (createError) {
        console.error(`  - Erro ao criar transação: ${createError.message}`);
        continue;
      }
      
      console.log(`  - ✓ Transação #${newTransaction.id} criada com sucesso!`);
      transactionsCreated++;
    }
    
    // 3. Resumo final
    console.log('\n=== RESUMO DA SINCRONIZAÇÃO ===');
    console.log(`Agendamentos concluídos encontrados: ${completedAppointments.length}`);
    console.log(`Agendamentos já com transações: ${appointmentsWithTransactions}`);
    console.log(`Agendamentos sem transações: ${appointmentsWithoutTransactions}`);
    console.log(`Novas transações criadas: ${transactionsCreated}`);
    
    if (transactionsCreated > 0) {
      console.log('\n✓ Sincronização concluída com sucesso!');
      console.log('  Foram criadas novas transações para agendamentos concluídos.');
    } else if (appointmentsWithoutTransactions === 0) {
      console.log('\n✓ Todos os agendamentos concluídos já possuem transações associadas.');
    } else {
      console.log('\n⚠️ Não foi possível criar transações para alguns agendamentos.');
    }
    
  } catch (error) {
    console.error('Erro durante a validação e sincronização:', error);
  }
}

// Executar a validação e sincronização
validateFinancialTransactions()
  .catch(console.error)
  .finally(() => {
    console.log('\nProcesso finalizado.');
  });