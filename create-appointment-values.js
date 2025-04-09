import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

// Criar cliente Supabase para consultas diretas
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Criar cliente SQL direto para PostgreSQL
const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 1
});

async function createAppointmentValuesTable() {
  try {
    console.log("Criando tabela appointment_values para rastrear valores de agendamentos...");
    
    // Verificar se a conexão direta ao PostgreSQL está funcionando
    const testConnection = await sql`SELECT current_timestamp`;
    console.log("Conexão com o PostgreSQL estabelecida:", testConnection[0].current_timestamp);
    
    // Criar a tabela appointment_values
    await sql`
      CREATE TABLE IF NOT EXISTS appointment_values (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER NOT NULL REFERENCES appointments(id),
        total_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(appointment_id)
      )
    `;
    
    console.log("Tabela appointment_values criada com sucesso!");
    
    // Buscar agendamentos COMPLETED para preencher os valores
    console.log("Buscando agendamentos COMPLETED para calcular valores...");
    
    const { data: completedAppointments, error: completedError } = await supabase
      .from('appointments')
      .select('id, date')
      .eq('status', 'COMPLETED');
      
    if (completedError) {
      console.error("Erro ao buscar agendamentos concluídos:", completedError);
      return;
    }
    
    console.log(`Encontrados ${completedAppointments.length} agendamentos concluídos para processar.`);
    
    // Para cada agendamento, calcular o valor com base nos serviços
    for (const appointment of completedAppointments) {
      try {
        // Verificar se já existe um registro para este agendamento
        const existingValues = await sql`
          SELECT * FROM appointment_values WHERE appointment_id = ${appointment.id}
        `;
        
        if (existingValues.length > 0) {
          console.log(`Agendamento #${appointment.id} já possui valor registrado: R$ ${existingValues[0].total_value}`);
          continue;
        }
        
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
          await sql`
            INSERT INTO appointment_values (appointment_id, total_value)
            VALUES (${appointment.id}, 0)
          `;
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
        
        // Inserir o registro na tabela appointment_values
        console.log(`Registrando valor para agendamento #${appointment.id} (${appointment.date}): R$ ${totalValue}`);
        
        await sql`
          INSERT INTO appointment_values (appointment_id, total_value)
          VALUES (${appointment.id}, ${totalValue})
        `;
      } catch (appointmentError) {
        console.error(`Erro geral processando agendamento #${appointment.id}:`, appointmentError);
      }
    }
    
    // Verificar valores registrados
    const allValues = await sql`SELECT * FROM appointment_values ORDER BY appointment_id`;
    console.log("Valores registrados:", allValues);
    
    console.log("Processo concluído!");
    
  } catch (error) {
    console.error("Erro global:", error);
  } finally {
    // Fechar conexão
    await sql.end();
  }
}

createAppointmentValuesTable().then(() => console.log("Script finalizado."));