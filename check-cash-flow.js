import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Criar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkCashFlow() {
  try {
    console.log('Verificando entradas no fluxo de caixa para 3 de abril de 2025...');
    
    // Buscar transações do dia 03/04/2025
    const { data, error } = await supabase
      .from('cash_flow')
      .select('*')
      .eq('date', '2025-04-03');
    
    if (error) {
      console.error('Erro ao buscar dados de cash_flow:', error);
      return;
    }
    
    console.log(`Encontradas ${data.length} transações para o dia 03/04/2025`);
    
    // Exibir detalhes de cada transação
    data.forEach(transaction => {
      console.log('----------------------------------');
      console.log(`ID: ${transaction.id}`);
      console.log(`Tipo: ${transaction.type}`);
      console.log(`Valor: R$ ${(transaction.amount/100).toFixed(2)}`);
      console.log(`Agendamento ID: ${transaction.appointment_id || 'N/A'}`);
      console.log(`Descrição: ${transaction.description || 'Sem descrição'}`);
    });
    
    // Buscar agendamentos concluídos para o dia 03/04/2025
    console.log('\nBuscando agendamentos concluídos para 03/04/2025...');
    
    const { data: appointments, error: appError } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', '2025-04-03')
      .eq('status', 'completed');
    
    if (appError) {
      console.error('Erro ao buscar agendamentos:', appError);
      return;
    }
    
    console.log(`Encontrados ${appointments.length} agendamentos concluídos para o dia 03/04/2025`);
    
    // Exibir detalhes de cada agendamento
    for (const app of appointments) {
      console.log('==================================');
      console.log(`Agendamento ID: ${app.id}`);
      console.log(`Cliente ID: ${app.user_id}`);
      console.log(`Profissional ID: ${app.professional_id}`);
      console.log(`Horário: ${app.start_time}`);
      console.log(`Valor Total: ${app.total_value ? 'R$ ' + (app.total_value/100).toFixed(2) : 'Não definido'}`);
      
      // Buscar serviços do agendamento
      const { data: services, error: servicesError } = await supabase
        .from('appointment_services')
        .select('service_id')
        .eq('appointment_id', app.id);
      
      if (servicesError) {
        console.error(`Erro ao buscar serviços do agendamento ${app.id}:`, servicesError);
        continue;
      }
      
      console.log(`\nServiços associados (${services.length}):`);
      
      // Buscar detalhes de cada serviço
      for (const svc of services) {
        const { data: serviceDetails, error: serviceError } = await supabase
          .from('services')
          .select('*')
          .eq('id', svc.service_id)
          .single();
        
        if (serviceError) {
          console.error(`Erro ao buscar detalhes do serviço ${svc.service_id}:`, serviceError);
          continue;
        }
        
        console.log(`- ${serviceDetails.name}: R$ ${(serviceDetails.price/100).toFixed(2)}`);
      }
    }
    
  } catch (error) {
    console.error('Erro geral ao verificar cash_flow:', error);
  }
}

checkCashFlow();