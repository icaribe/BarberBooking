import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// URL e chave de API do Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_KEY são necessários no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase com a chave de serviço (service key) que ignora RLS
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAppointments() {
  console.log('\n🔍 Verificando agendamentos no Supabase...');

  try {
    // 1. Verificar estrutura das tabelas
    console.log('\n1. Verificando estrutura da tabela appointments:');
    
    // Verificar agendamentos
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .limit(5);

    if (appointmentsError) {
      console.error('❌ Erro ao buscar agendamentos:', appointmentsError);
      process.exit(1);
    }

    if (!appointments || appointments.length === 0) {
      console.log('⚠️ Nenhum agendamento encontrado na tabela.');
      process.exit(0);
    }

    console.log(`✅ Encontrados ${appointments.length} agendamentos. Aqui está o primeiro:`);
    console.log(JSON.stringify(appointments[0], null, 2));

    console.log('\n2. Verificando colunas disponíveis:');
    const columns = Object.keys(appointments[0]);
    console.log(columns);

    // 2. Verificar problemas de case sensitivity no status
    console.log('\n3. Verificando valores do campo "status":');
    const { data: statusData, error: statusError } = await supabase
      .from('appointments')
      .select('status')
      .order('status');

    if (statusError) {
      console.error('❌ Erro ao buscar status de agendamentos:', statusError);
    } else {
      // Contar os diferentes status
      const statusCounts: Record<string, number> = {};
      statusData.forEach(item => {
        const status = String(item.status || 'null');
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      console.log('Status encontrados (e suas contagens):');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`- ${status}: ${count}`);
      });
    }

    // 3. Verificar se existem agendamentos para a data de hoje
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n4. Verificando agendamentos para hoje (${today}):`);
    const { data: todayAppointments, error: todayError } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', today);

    if (todayError) {
      console.error('❌ Erro ao buscar agendamentos de hoje:', todayError);
    } else {
      console.log(`✅ Encontrados ${todayAppointments?.length || 0} agendamentos para hoje.`);
      if (todayAppointments && todayAppointments.length > 0) {
        todayAppointments.forEach((app, index) => {
          console.log(`${index + 1}. ID: ${app.id}, Status: ${app.status}, Horário: ${app.start_time}`);
        });
      }
    }

    // 4. Verificar se existe a coluna 'completed_at'
    console.log('\n5. Verificando se existe a coluna completed_at:');
    if (columns.includes('completed_at')) {
      console.log('✅ A coluna completed_at existe na tabela.');
    } else {
      console.log('❌ A coluna completed_at NÃO existe na tabela.');
    }

    // 5. Verificar serviços associados aos agendamentos
    console.log('\n6. Verificando serviços associados aos agendamentos:');
    const { data: appointmentServices, error: servicesError } = await supabase
      .from('appointment_services')
      .select('appointment_id, service_id')
      .limit(10);

    if (servicesError) {
      console.error('❌ Erro ao buscar serviços de agendamentos:', servicesError);
    } else {
      console.log(`✅ Encontrados ${appointmentServices?.length || 0} registros na tabela appointment_services.`);
      
      // Agrupar por appointment_id
      const servicesByAppointment: Record<number, number[]> = {};
      appointmentServices?.forEach(as => {
        if (!servicesByAppointment[as.appointment_id]) {
          servicesByAppointment[as.appointment_id] = [];
        }
        servicesByAppointment[as.appointment_id].push(as.service_id);
      });

      console.log('Agendamentos e seus serviços:');
      Object.entries(servicesByAppointment).forEach(([appId, services]) => {
        console.log(`- Agendamento #${appId}: ${services.length} serviços (IDs: ${services.join(', ')})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar agendamentos:', error);
  }
}

checkAppointments();