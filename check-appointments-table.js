/**
 * Script para verificar a estrutura e dados da tabela appointments
 * e ajudar a diagnosticar problemas de carregamento no painel administrativo
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Verificar se as variáveis de ambiente estão definidas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Erro: Variáveis de ambiente SUPABASE_URL e/ou SUPABASE_SERVICE_KEY não definidas.');
  console.error('Certifique-se de que as variáveis de ambiente estão configuradas no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase com a chave de serviço para ignorar RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkAppointmentsTable() {
  console.log('➡️ Verificando a tabela de agendamentos no Supabase...');
  console.log('URL do Supabase:', process.env.SUPABASE_URL);
  
  try {
    // 1. Verificar a estrutura da tabela
    console.log('\n📋 Verificando a estrutura da tabela appointments...');
    
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'appointments' });
    
    if (columnsError) {
      console.error('❌ Erro ao obter a estrutura da tabela:', columnsError.message);
      
      // Tentativa alternativa usando introspection
      console.log('\nTentando método alternativo para verificar a estrutura...');
      
      try {
        const { data: firstRow, error: firstRowError } = await supabase
          .from('appointments')
          .select('*')
          .limit(1);
        
        if (firstRowError) {
          console.error('❌ Erro ao buscar amostra de dados:', firstRowError.message);
          return;
        }
        
        if (firstRow && firstRow.length > 0) {
          console.log('✅ Colunas detectadas baseadas na primeira linha:');
          console.log(Object.keys(firstRow[0]).join(', '));
        } else {
          console.log('⚠️ Nenhum dado encontrado na tabela para inferir estrutura.');
        }
      } catch (introspectionError) {
        console.error('❌ Erro na introspection:', introspectionError);
      }
    } else {
      console.log('✅ Estrutura da tabela detectada:');
      console.table(columns);
    }
    
    // 2. Contar o número total de agendamentos
    console.log('\n🔢 Contando agendamentos...');
    
    const { data: countData, error: countError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar agendamentos:', countError.message);
    } else {
      console.log(`✅ Total de agendamentos: ${countData.count || 0}`);
    }
    
    // 3. Contar agendamentos por status
    console.log('\n📊 Contando agendamentos por status...');
    
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('status');
    
    if (appointmentsError) {
      console.error('❌ Erro ao buscar status dos agendamentos:', appointmentsError.message);
    } else if (appointments && appointments.length > 0) {
      // Agrupar e contar por status
      const statusCount = appointments.reduce((acc, appointment) => {
        const status = appointment.status?.toLowerCase() || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('✅ Agendamentos por status:');
      console.table(statusCount);
    } else {
      console.log('⚠️ Nenhum agendamento encontrado para análise de status.');
    }
    
    // 4. Buscar amostra de agendamentos
    console.log('\n📝 Amostra de agendamentos:');
    
    const { data: sampleAppointments, error: sampleError } = await supabase
      .from('appointments')
      .select('id, date, start_time, end_time, status, user_id, professional_id, notes, created_at')
      .limit(3);
    
    if (sampleError) {
      console.error('❌ Erro ao buscar amostra de agendamentos:', sampleError.message);
    } else if (sampleAppointments && sampleAppointments.length > 0) {
      console.log('✅ Amostra de agendamentos:');
      console.table(sampleAppointments);
    } else {
      console.log('⚠️ Nenhum agendamento encontrado para amostragem.');
    }
    
    // 5. Verificar relações com outras tabelas
    console.log('\n🔄 Verificando relações com outros dados...');
    
    try {
      // Verificar tabela appointment_services (relacionamentos com serviços)
      const { data: services, error: servicesError } = await supabase
        .from('appointment_services')
        .select('appointment_id, service_id')
        .limit(5);
      
      if (servicesError) {
        console.error('❌ Erro ao verificar serviços de agendamentos:', servicesError.message);
      } else {
        console.log(`✅ Serviços de agendamentos: ${services.length} encontrados (limitado a 5)`);
        if (services.length > 0) {
          console.table(services);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar relações:', error);
    }
    
    console.log('\n✅ Verificação da tabela de agendamentos concluída.');
    
  } catch (error) {
    console.error('❌ Erro geral durante a verificação:', error);
  }
}

// Executar verificação
checkAppointmentsTable();