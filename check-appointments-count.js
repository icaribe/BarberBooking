/**
 * Script simplificado para verificar a contagem de agendamentos
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente SUPABASE_URL e/ou SUPABASE_SERVICE_KEY não definidas.');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkAppointments() {
  console.log('🔍 Verificando agendamentos no Supabase...');
  console.log('URL:', process.env.SUPABASE_URL);
  
  try {
    // Buscar todos os agendamentos
    const { data, error } = await supabase
      .from('appointments')
      .select('id, date, status');
    
    if (error) {
      console.error('❌ Erro ao buscar agendamentos:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ Nenhum agendamento encontrado na tabela.');
      
      // Verificar se a tabela existe
      console.log('\nVerificando se a tabela appointments existe...');
      try {
        const { data: tableInfo, error: tableError } = await supabase
          .rpc('list_tables');
        
        if (tableError) {
          console.error('❌ Erro ao verificar tabelas:', tableError.message);
        } else if (tableInfo) {
          const hasAppointmentsTable = tableInfo.some(table => 
            table.table_name === 'appointments');
          
          if (hasAppointmentsTable) {
            console.log('✅ A tabela appointments existe no banco de dados.');
          } else {
            console.log('❌ A tabela appointments NÃO existe no banco de dados!');
            console.log('Tabelas encontradas:', tableInfo.map(t => t.table_name).join(', '));
          }
        }
      } catch (tableCheckError) {
        console.error('❌ Erro ao verificar existência da tabela:', tableCheckError);
      }
      
      // Método alternativo para verificar existência da tabela
      try {
        console.log('\nTentando método alternativo para verificar a tabela...');
        const { error: testError } = await supabase
          .from('appointments')
          .select('count')
          .limit(1);
        
        if (testError && testError.message.includes('does not exist')) {
          console.log('❌ Confirmado: A tabela appointments NÃO existe!');
        } else {
          console.log('✅ A tabela appointments existe, mas está vazia ou há outro problema.');
        }
      } catch (alternativeError) {
        console.error('❌ Erro no método alternativo:', alternativeError);
      }
      
      return;
    }
    
    console.log(`✅ Encontrados ${data.length} agendamentos.`);
    
    // Contar por status
    const statusCount = {};
    data.forEach(appointment => {
      const status = appointment.status || 'unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    console.log('\n📊 Agendamentos por status:');
    console.table(statusCount);
    
    // Mostrar amostra de agendamentos
    console.log('\n📝 Amostra de agendamentos:');
    console.table(data.slice(0, 5));
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkAppointments();