import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Criar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fixMissingTransaction() {
  try {
    console.log('Iniciando correção de transação ausente para agendamento do dia 03/04/2025...');
    
    // Buscar agendamento específico (ID 7)
    const { data: appointment, error: appError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', 7)
      .single();
    
    if (appError) {
      console.error('Erro ao buscar agendamento:', appError);
      return;
    }
    
    console.log('Detalhes do agendamento:');
    console.log('ID:', appointment.id);
    console.log('Data:', appointment.date);
    console.log('Status:', appointment.status);
    console.log('Valor Total:', appointment.total_value);
    
    // Buscar serviços do agendamento
    const { data: services, error: servicesError } = await supabase
      .from('appointment_services')
      .select('service_id')
      .eq('appointment_id', appointment.id);
    
    if (servicesError) {
      console.error('Erro ao buscar serviços do agendamento:', servicesError);
      return;
    }
    
    // Buscar detalhes de cada serviço
    console.log('\nServiços do agendamento:');
    let totalValue = 0;
    let serviceDetails = [];
    
    for (const svc of services) {
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', svc.service_id)
        .single();
      
      if (serviceError) {
        console.error(`Erro ao buscar serviço ID ${svc.service_id}:`, serviceError);
        continue;
      }
      
      console.log(`- ${service.name}: R$ ${(service.price/100).toFixed(2)}`);
      totalValue += service.price;
      
      serviceDetails.push({
        id: service.id,
        name: service.name,
        price: service.price
      });
    }
    
    console.log(`\nValor total calculado: R$ ${(totalValue/100).toFixed(2)}`);
    
    // 1. Verificar se o valor total está definido no agendamento
    if (!appointment.total_value) {
      console.log('\nAtualizando campo total_value do agendamento...');
      
      const { data: updateResult, error: updateError } = await supabase
        .from('appointments')
        .update({ total_value: totalValue })
        .eq('id', appointment.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Erro ao atualizar valor total do agendamento:', updateError);
      } else {
        console.log('Valor total do agendamento atualizado com sucesso!');
      }
    }
    
    // 2. Verificar se já existe transação para este agendamento
    const { data: existingTx, error: txCheckError } = await supabase
      .from('cash_flow')
      .select('*')
      .eq('appointment_id', appointment.id);
    
    if (txCheckError) {
      console.error('Erro ao verificar transações existentes:', txCheckError);
      return;
    }
    
    if (existingTx && existingTx.length > 0) {
      console.log('\nJá existe transação para este agendamento:');
      console.log(existingTx[0]);
      return;
    }
    
    // 3. Se não existir transação, criar uma nova
    console.log('\nCriando transação financeira para o agendamento...');
    
    const transactionData = {
      date: appointment.date,
      appointment_id: appointment.id,
      amount: totalValue / 100, // Converter de centavos para reais
      type: 'INCOME',
      description: `Pagamento de serviço - Agendamento #${appointment.id} (Corrigido)`
    };
    
    const { data: newTx, error: createError } = await supabase
      .from('cash_flow')
      .insert(transactionData)
      .select()
      .single();
    
    if (createError) {
      console.error('Erro ao criar transação:', createError);
    } else {
      console.log('Transação criada com sucesso!');
      console.log(newTx);
    }
    
  } catch (error) {
    console.error('Erro geral ao corrigir transação:', error);
  }
}

fixMissingTransaction();