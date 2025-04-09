import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Criar cliente Supabase para consultas diretas
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testBilling() {
  try {
    console.log("Testando faturamento direto dos agendamentos concluídos");

    // 1. Buscar todos os agendamentos concluídos do dia - usando date exato com o formato correto
    const todayDateFormatted = new Date().toISOString().split('T')[0];
    console.log("Calculando agendamentos do dia, data:", todayDateFormatted);
    
    const appointmentsTodayResult = await supabase
      .from('appointments')
      .select('id, total_value, date')
      .eq('date', todayDateFormatted)
      .eq('status', 'COMPLETED');
    
    // 2. Buscar todos os agendamentos concluídos do mês
    // Primeiro dia do mês
    const startOfMonthDate = new Date();
    startOfMonthDate.setDate(1);
    const startOfMonthFormatted = startOfMonthDate.toISOString().split('T')[0];
    
    // Último dia do mês
    const endOfMonthDate = new Date();
    endOfMonthDate.setMonth(endOfMonthDate.getMonth() + 1);
    endOfMonthDate.setDate(0);
    const endOfMonthFormatted = endOfMonthDate.toISOString().split('T')[0];
    
    console.log("Calculando agendamentos do mês, período:", startOfMonthFormatted, "até", endOfMonthFormatted);
    
    const appointmentsMonthResult = await supabase
      .from('appointments')
      .select('id, total_value, date')
      .gte('date', startOfMonthFormatted)
      .lte('date', endOfMonthFormatted)
      .eq('status', 'COMPLETED');
    
    // Verificar e processar os resultados
    if (appointmentsTodayResult.error) {
      console.error('Erro ao buscar agendamentos do dia:', appointmentsTodayResult.error);
    }
    
    if (appointmentsMonthResult.error) {
      console.error('Erro ao buscar agendamentos do mês:', appointmentsMonthResult.error);
    }
    
    const todayAppointments = appointmentsTodayResult.data || [];
    const monthAppointments = appointmentsMonthResult.data || [];
    
    console.log("Agendamentos do dia encontrados:", todayAppointments.length);
    console.log("Agendamentos do mês encontrados:", monthAppointments.length);
    
    // 3. Detalhes de cada agendamento do dia
    console.log("Detalhes dos agendamentos do dia:");
    let dailyTotal = 0;
    for (const appointment of todayAppointments) {
      console.log(`- Agendamento #${appointment.id} (${appointment.date}): R$ ${appointment.total_value || 0}`);
      dailyTotal += appointment.total_value || 0;
    }
    
    // 4. Calcular valor total mensal
    let monthlyTotal = 0;
    for (const appointment of monthAppointments) {
      monthlyTotal += appointment.total_value || 0;
    }
    
    console.log("\nResumo financeiro:");
    console.log(`- Faturamento diário: R$ ${dailyTotal.toFixed(2)}`);
    console.log(`- Faturamento mensal: R$ ${monthlyTotal.toFixed(2)}`);
    
    // 5. Para debug - listar todos os agendamentos concluídos
    console.log("\nTodos os agendamentos COMPLETED:");
    const allCompletedResult = await supabase
      .from('appointments')
      .select('id, date, status, total_value')
      .eq('status', 'COMPLETED')
      .order('date', { ascending: false });
      
    if (allCompletedResult.error) {
      console.error('Erro ao buscar todos os agendamentos concluídos:', allCompletedResult.error);
    } else {
      allCompletedResult.data.forEach(app => {
        console.log(`- #${app.id}: ${app.date} (${app.status}) R$ ${app.total_value || 0}`);
      });
    }
    
  } catch (error) {
    console.error('Erro geral ao testar faturamento:', error);
  }
}

testBilling().then(() => console.log('Teste concluído'));