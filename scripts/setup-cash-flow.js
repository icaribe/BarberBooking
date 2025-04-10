/**
 * Script para configurar a tabela cash_flow e migrar dados existentes
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Criar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function setupCashFlow() {
  console.log('Iniciando configuração da tabela cash_flow...');
  
  try {
    // 1. Verificar se tabela cash_flow existe
    console.log('Verificando se a tabela cash_flow existe...');
    let { data: existingTable, error: tableError } = await supabase
      .from('cash_flow')
      .select('id')
      .limit(1);
    
    let tableExists = true;
    
    if (tableError && tableError.code === '42P01') {
      console.log('Tabela cash_flow não existe, criando...');
      tableExists = false;
      
      // 2. Executar criação da função e tabela
      const createTableSQL = `
        -- Função para criar a tabela cash_flow
        CREATE OR REPLACE FUNCTION create_cash_flow_table()
        RETURNS VOID
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          -- Verificar se a tabela já existe
          IF NOT EXISTS (
            SELECT FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename = 'cash_flow'
          ) THEN
            -- Criar a tabela cash_flow
            CREATE TABLE public.cash_flow (
              id SERIAL PRIMARY KEY,
              date DATE NOT NULL,
              appointment_id INTEGER REFERENCES public.appointments(id) ON DELETE SET NULL,
              amount DECIMAL(10, 2) NOT NULL,
              type TEXT NOT NULL,
              description TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            -- Criar índices para melhorar desempenho
            CREATE INDEX cash_flow_date_idx ON public.cash_flow(date);
            CREATE INDEX cash_flow_type_idx ON public.cash_flow(type);
            CREATE INDEX cash_flow_appointment_id_idx ON public.cash_flow(appointment_id);
            
            -- Comentários da tabela
            COMMENT ON TABLE public.cash_flow IS 'Registros do fluxo de caixa da barbearia';
            
            -- Ativar RLS (Row Level Security)
            ALTER TABLE public.cash_flow ENABLE ROW LEVEL SECURITY;
            
            -- Criar política para administradores (acesso completo)
            CREATE POLICY cash_flow_admin_policy ON public.cash_flow
              FOR ALL
              TO authenticated
              USING (
                EXISTS (
                  SELECT 1 FROM public.users
                  WHERE users.auth_id = auth.uid()
                  AND users.role = 'admin'
                )
              );
              
            RAISE NOTICE 'Tabela cash_flow criada com sucesso';
          ELSE
            RAISE NOTICE 'Tabela cash_flow já existe';
          END IF;
        END;
        $$;
      `;
      
      // Executar SQL para criar função
      const { error: createFunctionError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createFunctionError) {
        console.error('Erro ao criar função para tabela cash_flow:', createFunctionError);
        
        // Tentar abordagem alternativa direta
        console.log('Tentando criar tabela diretamente...');
        
        const directTableSQL = `
          CREATE TABLE IF NOT EXISTS public.cash_flow (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL,
            appointment_id INTEGER REFERENCES public.appointments(id) ON DELETE SET NULL,
            amount DECIMAL(10, 2) NOT NULL,
            type TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          -- Criar índices para melhorar desempenho
          CREATE INDEX IF NOT EXISTS cash_flow_date_idx ON public.cash_flow(date);
          CREATE INDEX IF NOT EXISTS cash_flow_type_idx ON public.cash_flow(type);
          CREATE INDEX IF NOT EXISTS cash_flow_appointment_id_idx ON public.cash_flow(appointment_id);
        `;
        
        const { error: directCreateError } = await supabase.rpc('exec_sql', { sql: directTableSQL });
        
        if (directCreateError) {
          console.error('Erro ao criar tabela diretamente:', directCreateError);
          console.log('A tabela precisará ser criada manualmente no Supabase.');
        } else {
          console.log('Tabela criada com sucesso!');
          tableExists = true;
        }
      } else {
        // Chamar a função criada
        const { error: execFunctionError } = await supabase.rpc('create_cash_flow_table');
        
        if (execFunctionError) {
          console.error('Erro ao executar função create_cash_flow_table:', execFunctionError);
        } else {
          console.log('Função create_cash_flow_table executada com sucesso!');
          tableExists = true;
        }
      }
    } else if (tableError) {
      console.error('Erro ao verificar tabela cash_flow:', tableError);
    } else {
      console.log('Tabela cash_flow já existe!');
    }
    
    // Se a tabela foi criada ou já existia, migrar os dados
    if (tableExists) {
      console.log('Migrando agendamentos concluídos para o fluxo de caixa...');
      await migrateAppointmentsToFlow();
    }
    
    console.log('Configuração do fluxo de caixa concluída!');
  } catch (error) {
    console.error('Erro durante a configuração do fluxo de caixa:', error);
  }
}

async function migrateAppointmentsToFlow() {
  try {
    // 1. Buscar agendamentos concluídos
    const { data: completedAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, date, professional_id, services')
      .eq('status', 'COMPLETED');
    
    if (appointmentsError) {
      console.error('Erro ao buscar agendamentos concluídos:', appointmentsError);
      return;
    }
    
    console.log(`Encontrados ${completedAppointments.length} agendamentos concluídos para migração`);
    
    // 2. Para cada agendamento, verificar se já possui registro no fluxo de caixa
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const appointment of completedAppointments) {
      // Verificar se já existe registro
      const { data: existingRecords, error: checkError } = await supabase
        .from('cash_flow')
        .select('id')
        .eq('appointment_id', appointment.id)
        .eq('type', 'INCOME');
      
      if (checkError) {
        console.error(`Erro ao verificar registro existente para agendamento #${appointment.id}:`, checkError);
        continue;
      }
      
      // Se já existe, pular
      if (existingRecords && existingRecords.length > 0) {
        console.log(`Agendamento #${appointment.id} já possui registro financeiro, pulando...`);
        skippedCount++;
        continue;
      }
      
      // Calcular valor do agendamento
      let appointmentValue = 0;
      
      if (appointment.services && Array.isArray(appointment.services)) {
        // 3. Buscar serviços do agendamento
        for (const serviceId of appointment.services) {
          const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('price')
            .eq('id', serviceId)
            .single();
          
          if (serviceError) {
            console.error(`Erro ao buscar serviço #${serviceId}:`, serviceError);
            continue;
          }
          
          // Preços estão em centavos, converter para reais
          appointmentValue += (service.price || 0) / 100;
        }
      }
      
      console.log(`Valor calculado para agendamento #${appointment.id}: R$ ${appointmentValue.toFixed(2)}`);
      
      // 4. Criar registro no fluxo de caixa
      const { data: insertResult, error: insertError } = await supabase
        .from('cash_flow')
        .insert([{
          date: appointment.date,
          appointment_id: appointment.id,
          amount: appointmentValue,
          type: 'INCOME',
          description: `Migração: Agendamento concluído #${appointment.id}`
        }])
        .select();
      
      if (insertError) {
        console.error(`Erro ao migrar agendamento #${appointment.id}:`, insertError);
      } else {
        console.log(`Agendamento #${appointment.id} migrado com sucesso!`);
        migratedCount++;
      }
    }
    
    console.log(`Migração concluída! ${migratedCount} agendamentos migrados, ${skippedCount} pulados.`);
  } catch (error) {
    console.error('Erro durante a migração de agendamentos:', error);
  }
}

// Executar o script
setupCashFlow()
  .then(() => {
    console.log('Script concluído!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro durante a execução do script:', error);
    process.exit(1);
  });