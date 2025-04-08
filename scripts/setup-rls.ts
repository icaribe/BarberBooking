/**
 * Script para configurar políticas de RLS (Row Level Security) no Supabase
 * 
 * Este script estabelece políticas de segurança adequadas para proteger
 * os dados com base em regras de autenticação e autorização.
 */

import supabase from '../server/supabase';
import dotenv from 'dotenv';
import postgres from 'postgres';

// Carregar variáveis de ambiente
dotenv.config();

// Verificar se as variáveis de ambiente necessárias estão configuradas
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const DATABASE_URL = process.env.DATABASE_URL || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !DATABASE_URL) {
  console.error("❌ Erro: As variáveis de ambiente SUPABASE_URL, SUPABASE_SERVICE_KEY e DATABASE_URL são necessárias");
  process.exit(1);
}

// Função para executar SQL diretamente
async function executeSQL(sql: string, params: any[] = []): Promise<any> {
  // Verificar se DATABASE_URL está definido
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL não está definido ou está vazio');
  }
  
  // Criar cliente SQL
  const client = postgres(DATABASE_URL, { 
    ssl: 'require',
    max: 1
  });
  
  try {
    const result = await client.query(sql, ...params);
    return result;
  } catch (error) {
    console.error(`Erro ao executar SQL: ${sql}`, error);
    throw error;
  } finally {
    await client.end();
  }
}

// Configurar Row Level Security para uma tabela
async function setupRLSForTable(tableName: string, enableRLS: boolean = true): Promise<void> {
  try {
    console.log(`\n🔒 Configurando RLS para tabela: ${tableName}`);
    
    // Habilitar ou desabilitar RLS na tabela
    const action = enableRLS ? 'ENABLE' : 'DISABLE';
    await executeSQL(`ALTER TABLE "${tableName}" ${action} ROW LEVEL SECURITY;`);
    
    if (enableRLS) {
      console.log(`✅ RLS habilitado para tabela: ${tableName}`);
    } else {
      console.log(`⚠️ RLS desabilitado para tabela: ${tableName}`);
      return;
    }
    
    // Remover políticas existentes para a tabela
    await removeExistingPolicies(tableName);
    
    // Aplicar políticas específicas baseadas no nome da tabela
    switch (tableName) {
      case 'users':
        await setupUsersPolicies(tableName);
        break;
      case 'service_categories':
        await setupPublicReadPolicies(tableName);
        break;
      case 'services':
        await setupPublicReadPolicies(tableName);
        break;
      case 'professionals':
        await setupPublicReadPolicies(tableName);
        break;
      case 'schedules':
        await setupSchedulesPolicies(tableName);
        break;
      case 'appointments':
        await setupAppointmentsPolicies(tableName);
        break;
      case 'appointment_services':
        await setupAppointmentServicesPolicies(tableName);
        break;
      case 'product_categories':
        await setupPublicReadPolicies(tableName);
        break;
      case 'products':
        await setupPublicReadPolicies(tableName);
        break;
      case 'loyalty_rewards':
        await setupPublicReadPolicies(tableName);
        break;
      case 'loyalty_history':
        await setupLoyaltyHistoryPolicies(tableName);
        break;
      case 'cash_flow':
        await setupAdminOnlyPolicies(tableName);
        break;
      case 'professional_services':
        await setupPublicReadPolicies(tableName);
        break;
      default:
        console.log(`⚠️ Políticas padrão aplicadas para tabela: ${tableName}`);
        await setupDefaultPolicies(tableName);
    }
    
    console.log(`✅ Políticas RLS configuradas para tabela: ${tableName}`);
  } catch (error) {
    console.error(`❌ Erro ao configurar RLS para ${tableName}:`, error);
    throw error;
  }
}

// Remover todas as políticas existentes para uma tabela
async function removeExistingPolicies(tableName: string): Promise<void> {
  try {
    const policies = await executeSQL(`
      SELECT policyname FROM pg_policies 
      WHERE tablename = $1 AND schemaname = 'public'
    `, [tableName]);
    
    for (const policy of policies) {
      await executeSQL(`DROP POLICY IF EXISTS "${policy.policyname}" ON "${tableName}";`);
      console.log(`🗑️ Política removida: ${policy.policyname}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao remover políticas existentes para ${tableName}:`, error);
    throw error;
  }
}

// Configurar políticas para usuários
async function setupUsersPolicies(tableName: string): Promise<void> {
  // Política para que usuários possam visualizar apenas seus próprios dados
  await executeSQL(`
    CREATE POLICY "Usuários podem ler seus próprios dados" ON "${tableName}"
    FOR SELECT
    USING (auth.uid() = id);
  `);
  
  // Política para que usuários possam atualizar apenas seus próprios dados
  await executeSQL(`
    CREATE POLICY "Usuários podem atualizar seus próprios dados" ON "${tableName}"
    FOR UPDATE
    USING (auth.uid() = id);
  `);
  
  // Política para que administradores possam visualizar todos os usuários
  await executeSQL(`
    CREATE POLICY "Administradores podem ler todos os dados" ON "${tableName}"
    FOR SELECT
    USING (
      (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
  `);
  
  // Política para que administradores possam atualizar todos os usuários
  await executeSQL(`
    CREATE POLICY "Administradores podem atualizar todos os dados" ON "${tableName}"
    FOR UPDATE
    USING (
      (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
  `);
  
  console.log(`✅ Políticas específicas configuradas para tabela: ${tableName}`);
}

// Configurar políticas para leitura pública
async function setupPublicReadPolicies(tableName: string): Promise<void> {
  // Política para leitura pública
  await executeSQL(`
    CREATE POLICY "Leitura pública" ON "${tableName}"
    FOR SELECT
    TO PUBLIC
    USING (true);
  `);
  
  // Política para que administradores possam modificar
  await executeSQL(`
    CREATE POLICY "Administradores podem modificar" ON "${tableName}"
    FOR ALL
    USING (
      (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
  `);
  
  console.log(`✅ Políticas de leitura pública configuradas para tabela: ${tableName}`);
}

// Configurar políticas para agendamentos
async function setupSchedulesPolicies(tableName: string): Promise<void> {
  // Política para leitura pública de horários
  await executeSQL(`
    CREATE POLICY "Leitura pública de horários" ON "${tableName}"
    FOR SELECT
    TO PUBLIC
    USING (true);
  `);
  
  // Política para que profissionais possam atualizar seus horários
  await executeSQL(`
    CREATE POLICY "Profissionais podem atualizar seus horários" ON "${tableName}"
    FOR UPDATE
    USING (
      professional_id = (SELECT id FROM professionals WHERE user_id = auth.uid())
    );
  `);
  
  // Política para que administradores possam modificar todos os horários
  await executeSQL(`
    CREATE POLICY "Administradores podem modificar todos os horários" ON "${tableName}"
    FOR ALL
    USING (
      (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
  `);
  
  console.log(`✅ Políticas específicas configuradas para tabela: ${tableName}`);
}

// Configurar políticas para agendamentos
async function setupAppointmentsPolicies(tableName: string): Promise<void> {
  // Política para que usuários possam ler seus próprios agendamentos
  await executeSQL(`
    CREATE POLICY "Usuários podem ler seus próprios agendamentos" ON "${tableName}"
    FOR SELECT
    USING (user_id = auth.uid());
  `);
  
  // Política para que usuários possam criar seus próprios agendamentos
  await executeSQL(`
    CREATE POLICY "Usuários podem criar seus próprios agendamentos" ON "${tableName}"
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
  `);
  
  // Política para que usuários possam atualizar seus próprios agendamentos
  await executeSQL(`
    CREATE POLICY "Usuários podem atualizar seus próprios agendamentos" ON "${tableName}"
    FOR UPDATE
    USING (user_id = auth.uid());
  `);
  
  // Política para que profissionais possam ler agendamentos destinados a eles
  await executeSQL(`
    CREATE POLICY "Profissionais podem ler seus agendamentos" ON "${tableName}"
    FOR SELECT
    USING (
      professional_id = (SELECT id FROM professionals WHERE user_id = auth.uid())
    );
  `);
  
  // Política para que profissionais possam atualizar agendamentos destinados a eles
  await executeSQL(`
    CREATE POLICY "Profissionais podem atualizar seus agendamentos" ON "${tableName}"
    FOR UPDATE
    USING (
      professional_id = (SELECT id FROM professionals WHERE user_id = auth.uid())
    );
  `);
  
  // Política para que administradores possam ler e modificar todos os agendamentos
  await executeSQL(`
    CREATE POLICY "Administradores têm acesso completo aos agendamentos" ON "${tableName}"
    FOR ALL
    USING (
      (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
  `);
  
  console.log(`✅ Políticas específicas configuradas para tabela: ${tableName}`);
}

// Configurar políticas para serviços de agendamentos
async function setupAppointmentServicesPolicies(tableName: string): Promise<void> {
  // Política para que usuários possam ler seus próprios serviços de agendamento
  await executeSQL(`
    CREATE POLICY "Usuários podem ler seus próprios serviços de agendamento" ON "${tableName}"
    FOR SELECT
    USING (
      appointment_id IN (
        SELECT id FROM appointments WHERE user_id = auth.uid()
      )
    );
  `);
  
  // Política para que usuários possam criar seus próprios serviços de agendamento
  await executeSQL(`
    CREATE POLICY "Usuários podem criar seus próprios serviços de agendamento" ON "${tableName}"
    FOR INSERT
    WITH CHECK (
      appointment_id IN (
        SELECT id FROM appointments WHERE user_id = auth.uid()
      )
    );
  `);
  
  // Política para que profissionais possam ler serviços de agendamentos destinados a eles
  await executeSQL(`
    CREATE POLICY "Profissionais podem ler serviços de seus agendamentos" ON "${tableName}"
    FOR SELECT
    USING (
      appointment_id IN (
        SELECT id FROM appointments WHERE professional_id = (
          SELECT id FROM professionals WHERE user_id = auth.uid()
        )
      )
    );
  `);
  
  // Política para que administradores possam ler e modificar todos os serviços de agendamentos
  await executeSQL(`
    CREATE POLICY "Administradores têm acesso completo aos serviços de agendamentos" ON "${tableName}"
    FOR ALL
    USING (
      (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
  `);
  
  console.log(`✅ Políticas específicas configuradas para tabela: ${tableName}`);
}

// Configurar políticas para histórico de fidelidade
async function setupLoyaltyHistoryPolicies(tableName: string): Promise<void> {
  // Política para que usuários possam ler seu próprio histórico de fidelidade
  await executeSQL(`
    CREATE POLICY "Usuários podem ler seu próprio histórico de fidelidade" ON "${tableName}"
    FOR SELECT
    USING (user_id = auth.uid());
  `);
  
  // Política para que administradores possam ler e modificar todo o histórico de fidelidade
  await executeSQL(`
    CREATE POLICY "Administradores têm acesso completo ao histórico de fidelidade" ON "${tableName}"
    FOR ALL
    USING (
      (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
  `);
  
  console.log(`✅ Políticas específicas configuradas para tabela: ${tableName}`);
}

// Configurar políticas somente para administradores
async function setupAdminOnlyPolicies(tableName: string): Promise<void> {
  // Política para que administradores possam ler e modificar todos os dados
  await executeSQL(`
    CREATE POLICY "Administradores têm acesso completo" ON "${tableName}"
    FOR ALL
    USING (
      (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
  `);
  
  console.log(`✅ Políticas específicas para administradores configuradas para tabela: ${tableName}`);
}

// Configurar políticas padrão
async function setupDefaultPolicies(tableName: string): Promise<void> {
  // Política para leitura por usuários autenticados
  await executeSQL(`
    CREATE POLICY "Usuários autenticados podem ler" ON "${tableName}"
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  `);
  
  // Política para que administradores possam ler e modificar todos os dados
  await executeSQL(`
    CREATE POLICY "Administradores têm acesso completo" ON "${tableName}"
    FOR ALL
    USING (
      (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
  `);
  
  console.log(`✅ Políticas padrão configuradas para tabela: ${tableName}`);
}

// Função principal de configuração RLS
async function setupRLS(): Promise<void> {
  console.log("\n🔒 Iniciando configuração de RLS no Supabase...");
  
  try {
    // Listar todas as tabelas no banco de dados
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .not('table_name', 'ilike', 'pg_%')
      .not('table_name', 'ilike', 'drizzle_%');
    
    if (tablesError) {
      throw tablesError;
    }
    
    if (!tables || tables.length === 0) {
      console.log("⚠️ Nenhuma tabela encontrada no banco de dados.");
      return;
    }
    
    console.log(`\n📊 Total de tabelas encontradas: ${tables.length}`);
    
    // Configurar RLS para cada tabela
    for (const table of tables) {
      await setupRLSForTable(table.table_name);
    }
    
    console.log("\n✅ Configuração de RLS concluída com sucesso!");
  } catch (error) {
    console.error("\n❌ Erro durante a configuração de RLS:", error);
    process.exit(1);
  }
}

// Executar configuração RLS
setupRLS().catch(console.error);