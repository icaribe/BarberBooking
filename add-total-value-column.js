import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Criar cliente Supabase para consultas diretas
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function addTotalValueColumn() {
  try {
    console.log("Iniciando adição da coluna total_value à tabela appointments");
    
    // Verificar se a coluna já existe
    const { data: existingColumns, error: columnError } = await supabase.rpc(
      'get_columns_for_table',
      { table_name: 'appointments' }
    );
    
    if (columnError) {
      console.error("Erro ao verificar colunas existentes:", columnError);
      
      // Tentativa alternativa para verificar a estrutura
      const { data: sample, error: sampleError } = await supabase
        .from('appointments')
        .select('*')
        .limit(1);
        
      if (sampleError) {
        console.error("Erro ao buscar exemplo de agendamento:", sampleError);
      } else {
        console.log("Colunas atuais na tabela appointments:", Object.keys(sample[0] || {}));
      }
    } else {
      const hasColumn = existingColumns.some(col => col.column_name === 'total_value');
      console.log(`Coluna total_value ${hasColumn ? 'JÁ EXISTE' : 'NÃO EXISTE'} na tabela`);
      
      if (hasColumn) {
        console.log("A coluna total_value já existe, não é necessário criar novamente.");
        return;
      }
    }
    
    // Adicionar a coluna total_value
    console.log("Adicionando coluna total_value à tabela appointments...");
    
    // Use o cliente Supabase para executar SQL diretamente
    const { error } = await supabase.rpc(
      'execute_sql',
      { query: 'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_value DECIMAL(10, 2) DEFAULT 0;' }
    );
    
    if (error) {
      console.error("Erro ao adicionar coluna:", error);
      
      // Tentativa alternativa com SQL direto via REST
      const altResult = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({
          query: 'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_value DECIMAL(10, 2) DEFAULT 0;'
        })
      });
      
      if (!altResult.ok) {
        console.error("Erro na tentativa alternativa:", await altResult.text());
      } else {
        console.log("Coluna adicionada com sucesso via REST API!");
      }
    } else {
      console.log("Coluna total_value adicionada com sucesso!");
    }
    
    // Agora vamos preencher os valores para agendamentos COMPLETED existentes
    console.log("Buscando agendamentos COMPLETED para atualizar total_value...");
    
    const { data: completedAppointments, error: completedError } = await supabase
      .from('appointments')
      .select('id')
      .eq('status', 'COMPLETED');
      
    if (completedError) {
      console.error("Erro ao buscar agendamentos concluídos:", completedError);
      return;
    }
    
    console.log(`Encontrados ${completedAppointments.length} agendamentos concluídos para atualizar.`);
    
    // Para cada agendamento, calcular o valor com base nos serviços
    for (const appointment of completedAppointments) {
      try {
        // Buscar serviços do agendamento
        const { data: appointmentServices, error: servicesError } = await supabase
          .from('appointment_services')
          .select('service_id')
          .eq('appointment_id', appointment.id);
          
        if (servicesError) {
          console.error(`Erro ao buscar serviços do agendamento #${appointment.id}:`, servicesError);
          continue;
        }
        
        if (!appointmentServices || appointmentServices.length === 0) {
          console.log(`Agendamento #${appointment.id} não tem serviços, definindo valor como 0.`);
          continue;
        }
        
        // Buscar preço de cada serviço
        let totalValue = 0;
        for (const as of appointmentServices) {
          const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('price')
            .eq('id', as.service_id)
            .single();
            
          if (serviceError) {
            console.error(`Erro ao buscar serviço #${as.service_id}:`, serviceError);
            continue;
          }
          
          totalValue += service.price || 0;
        }
        
        // Atualizar o agendamento com o valor total
        console.log(`Atualizando agendamento #${appointment.id} com valor total: R$ ${totalValue}`);
        
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ total_value: totalValue })
          .eq('id', appointment.id);
          
        if (updateError) {
          console.error(`Erro ao atualizar agendamento #${appointment.id}:`, updateError);
        }
      } catch (appointmentError) {
        console.error(`Erro geral processando agendamento #${appointment.id}:`, appointmentError);
      }
    }
    
    console.log("Processo concluído!");
    
  } catch (error) {
    console.error("Erro global:", error);
  }
}

addTotalValueColumn().then(() => console.log("Script finalizado."));