/**
 * Script para verificar os status dos agendamentos
 */

import supabase from '../server/supabase';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function main() {
  console.log('Verificando status de agendamentos...');
  
  try {
    // Primeiro vamos verificar as colunas da tabela
    console.log('Verificando estrutura da tabela appointments...');
    const { data: tableCols, error: describeError } = await supabase
      .rpc('describe_table', { table_name: 'appointments' });
      
    if (describeError) {
      console.error('Erro ao verificar estrutura da tabela:', describeError);
      console.log('Tentando buscar direto...');
    } else {
      console.log('Colunas da tabela appointments:', tableCols);
    }
    
    // Buscar todos os agendamentos
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false })
      .limit(20);
      
    if (error) {
      throw error;
    }
    
    console.log(`\nEncontrados ${data.length} agendamentos recentes.`);
    
    // Mostrar a estrutura do primeiro agendamento
    if (data.length > 0) {
      console.log('\nEstrutura do agendamento (primeiro registro):');
      console.log(JSON.stringify(data[0], null, 2));
    }
    
    console.log('\nStatuses encontrados:');
    
    // Agrupar por status
    const statusGroups: Record<string, number> = {};
    
    for (const appointment of data) {
      const status = appointment.status || 'null';
      if (!statusGroups[status]) {
        statusGroups[status] = 0;
      }
      statusGroups[status]++;
      
      // Mostrar detalhes básicos de cada agendamento
      console.log(`ID #${appointment.id} | Data: ${appointment.date} | Status: ${appointment.status}`);
    }
    
    console.log('\nResumo por status:');
    for (const [status, count] of Object.entries(statusGroups)) {
      console.log(`${status}: ${count} agendamento(s)`);
    }
    
    // Verificar também tabela de appointment_services
    console.log('\nVerificando appointment_services...');
    const { data: appServices, error: appServicesError } = await supabase
      .from('appointment_services')
      .select('*')
      .limit(5);
      
    if (appServicesError) {
      console.error('Erro ao verificar appointment_services:', appServicesError);
    } else if (appServices && appServices.length > 0) {
      console.log('Estrutura de appointment_services (primeiro registro):');
      console.log(JSON.stringify(appServices[0], null, 2));
    } else {
      console.log('Nenhum registro encontrado em appointment_services');
    }
    
    // Verificar tabela de cash_flow
    console.log('\nVerificando cash_flow...');
    const { data: cashFlow, error: cashFlowError } = await supabase
      .from('cash_flow')
      .select('*')
      .limit(5);
      
    if (cashFlowError) {
      console.error('Erro ao verificar cash_flow:', cashFlowError);
    } else if (cashFlow && cashFlow.length > 0) {
      console.log('Estrutura de cash_flow (primeiro registro):');
      console.log(JSON.stringify(cashFlow[0], null, 2));
      console.log(`Encontrados ${cashFlow.length} registros de fluxo de caixa`);
    } else {
      console.log('Nenhum registro encontrado em cash_flow');
    }
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    process.exit(1);
  }
}

main();