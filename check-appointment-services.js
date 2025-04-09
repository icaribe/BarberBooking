import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkAppointmentServices() {
  try {
    console.log('Verificando tabela appointment_services...');
    
    // Buscar todos os agendamentos
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, date, status')
      .order('id');
    
    if (appointmentsError) {
      console.error('Erro ao buscar agendamentos:', appointmentsError);
      return;
    }
    
    console.log(`Encontrados ${appointments.length} agendamentos no total`);
    
    // Para cada agendamento, verificar serviços associados
    for (const appointment of appointments) {
      const { data: services, error: servicesError } = await supabase
        .from('appointment_services')
        .select('service_id, appointment_id')
        .eq('appointment_id', appointment.id);
      
      if (servicesError) {
        console.error(`Erro ao buscar serviços para o agendamento #${appointment.id}:`, servicesError);
        continue;
      }
      
      if (!services || services.length === 0) {
        console.log(`⚠️ Agendamento #${appointment.id} (${appointment.date}, ${appointment.status}) NÃO tem serviços associados`);
      } else {
        // Para cada serviço, buscar preço e nome
        let totalValue = 0;
        const serviceNames = [];
        
        for (const service of services) {
          const { data: serviceDetails, error: serviceError } = await supabase
            .from('services')
            .select('name, price')
            .eq('id', service.service_id)
            .single();
          
          if (serviceError) {
            console.error(`Erro ao buscar detalhes do serviço #${service.service_id}:`, serviceError);
            continue;
          }
          
          totalValue += serviceDetails?.price || 0;
          serviceNames.push(serviceDetails?.name || 'Serviço sem nome');
        }
        
        console.log(`✅ Agendamento #${appointment.id} (${appointment.date}, ${appointment.status}) tem ${services.length} serviços: ${serviceNames.join(', ')} - Total: R$ ${totalValue.toFixed(2)}`);
        
        // Se o agendamento estiver concluído, mostrar valor total
        if (appointment.status === 'COMPLETED') {
          console.log(`   💰 Agendamento CONCLUÍDO #${appointment.id} - Valor: R$ ${totalValue.toFixed(2)}`);
        }
      }
    }
    
    // Adicionalmente, verificar os agendamentos de hoje e do mês
    const today = new Date().toISOString().split('T')[0];
    const { data: todayAppointments, error: todayError } = await supabase
      .from('appointments')
      .select('id')
      .eq('date', today)
      .eq('status', 'COMPLETED');
    
    if (todayError) {
      console.error('Erro ao buscar agendamentos de hoje:', todayError);
    } else {
      console.log(`\nAgendamentos CONCLUÍDOS hoje (${today}): ${todayAppointments?.length || 0}`);
    }
    
    // Verificar agendamentos do mês
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const startOfMonthFormatted = startOfMonth.toISOString().split('T')[0];
    
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    const endOfMonthFormatted = endOfMonth.toISOString().split('T')[0];
    
    const { data: monthAppointments, error: monthError } = await supabase
      .from('appointments')
      .select('id')
      .gte('date', startOfMonthFormatted)
      .lte('date', endOfMonthFormatted)
      .eq('status', 'COMPLETED');
    
    if (monthError) {
      console.error('Erro ao buscar agendamentos do mês:', monthError);
    } else {
      console.log(`Agendamentos CONCLUÍDOS no mês (${startOfMonthFormatted} a ${endOfMonthFormatted}): ${monthAppointments?.length || 0}`);
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar a função
checkAppointmentServices();