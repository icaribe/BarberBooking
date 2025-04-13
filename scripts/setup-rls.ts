/**
 * Script para configurar políticas de Row Level Security (RLS) no Supabase
 * 
 * Este script faz o seguinte:
 * 1. Ativa RLS em todas as tabelas do esquema público
 * 2. Cria políticas RLS para cada tabela
 */

import { supabaseAdmin } from '../shared/supabase-client';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function setupRLS() {
  console.log('\n=== Configurando Políticas RLS no Supabase ===\n');
  
  try {
    // 1. Buscar todas as tabelas do esquema público
    console.log('Buscando tabelas do esquema público...');
    
    // Tentativa de ativar RLS para as principais tabelas específicas
    const mainTables = [
      'users',
      'services',
      'service_categories',
      'products',
      'product_categories',
      'professionals',
      'schedules',
      'appointments',
      'appointment_services',
      'loyalty_rewards',
      'loyalty_history',
      'cash_flow'
    ];
    
    // Ativar RLS para cada tabela principal
    console.log('Ativando RLS para tabelas principais:');
    
    for (const tableName of mainTables) {
      try {
        // Verificar se a tabela existe
        const { error: checkError } = await supabaseAdmin
          .from(tableName)
          .select('count')
          .limit(1);
        
        if (checkError && checkError.code === 'PGRST116') {
          console.log(`⚠️ Tabela "${tableName}" não encontrada, pulando...`);
          continue;
        }
        
        // Ativar RLS na tabela
        const { error: rlsError } = await supabaseAdmin.rpc('exec', {
          query: `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;`
        });
        
        if (rlsError) {
          console.error(`❌ Erro ao ativar RLS para tabela "${tableName}":`, rlsError);
        } else {
          console.log(`✅ RLS ativado para tabela "${tableName}"`);
        }
        
        // Criar políticas para a tabela
        await createPoliciesForTable(tableName);
      } catch (error) {
        console.error(`❌ Erro durante processamento da tabela "${tableName}":`, error);
      }
    }
    
    console.log('\n=== Configuração RLS Concluída ===\n');
  } catch (error) {
    console.error('Erro durante a configuração RLS:', error);
    process.exit(1);
  }
}

/**
 * Cria políticas RLS para uma tabela específica
 */
async function createPoliciesForTable(tableName: string) {
  console.log(`\nCriando políticas para tabela "${tableName}"...`);
  
  try {
    // Configurações de política específicas para cada tabela
    const policies = getRLSPoliciesForTable(tableName);
    
    if (!policies || policies.length === 0) {
      console.log(`⚠️ Nenhuma política definida para "${tableName}", pulando...`);
      return;
    }
    
    // Criar cada política para a tabela
    for (const policy of policies) {
      try {
        const { name, operation, expression } = policy;
        
        // Excluir política se já existir (para evitar erros de duplicação)
        await supabaseAdmin.rpc('exec', {
          query: `DROP POLICY IF EXISTS "${name}" ON public.${tableName};`
        });
        
        // Criar a política
        const { error } = await supabaseAdmin.rpc('exec', {
          query: `
            CREATE POLICY "${name}" 
            ON public.${tableName}
            FOR ${operation}
            USING (${expression});
          `
        });
        
        if (error) {
          console.error(`❌ Erro ao criar política "${name}" para "${tableName}":`, error);
        } else {
          console.log(`✅ Política "${name}" criada para "${tableName}"`);
        }
      } catch (policyError) {
        console.error(`❌ Erro durante criação da política:`, policyError);
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao configurar políticas para "${tableName}":`, error);
  }
}

/**
 * Retorna as políticas RLS para uma tabela específica
 */
function getRLSPoliciesForTable(tableName: string) {
  // Definição de políticas para cada tabela
  const policyMap: Record<string, Array<{ name: string, operation: string, expression: string }>> = {
    'users': [
      {
        name: 'Allow users to read their own data',
        operation: 'SELECT',
        expression: 'auth.uid() = auth_id OR auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      },
      {
        name: 'Allow users to update their own data',
        operation: 'UPDATE',
        expression: 'auth.uid() = auth_id OR auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      },
      {
        name: 'Allow admins to read all user data',
        operation: 'SELECT',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      },
      {
        name: 'Allow anon to read non-sensitive user data',
        operation: 'SELECT',
        expression: 'role = \'professional\''
      }
    ],
    'services': [
      {
        name: 'Allow public read access to services',
        operation: 'SELECT',
        expression: 'true'
      },
      {
        name: 'Allow admins and professionals to manage services',
        operation: 'ALL',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE role IN (\'admin\', \'professional\'))'
      }
    ],
    'service_categories': [
      {
        name: 'Allow public read access to service categories',
        operation: 'SELECT',
        expression: 'true'
      },
      {
        name: 'Allow admins to manage service categories',
        operation: 'ALL',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      }
    ],
    'products': [
      {
        name: 'Allow public read access to products',
        operation: 'SELECT',
        expression: 'true'
      },
      {
        name: 'Allow admins to manage products',
        operation: 'ALL',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      }
    ],
    'product_categories': [
      {
        name: 'Allow public read access to product categories',
        operation: 'SELECT',
        expression: 'true'
      },
      {
        name: 'Allow admins to manage product categories',
        operation: 'ALL',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      }
    ],
    'professionals': [
      {
        name: 'Allow public read access to professionals',
        operation: 'SELECT',
        expression: 'true'
      },
      {
        name: 'Allow admins to manage professionals',
        operation: 'ALL',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      }
    ],
    'schedules': [
      {
        name: 'Allow public read access to schedules',
        operation: 'SELECT',
        expression: 'true'
      },
      {
        name: 'Allow professionals to manage their schedules',
        operation: 'ALL',
        expression: 'auth.uid() IN (SELECT u.auth_id FROM users u JOIN professionals p ON u.id = p.user_id WHERE p.id = professional_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      },
      {
        name: 'Allow admins to manage all schedules',
        operation: 'ALL',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      }
    ],
    'appointments': [
      {
        name: 'Allow users to read their own appointments',
        operation: 'SELECT',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id) OR auth.uid() IN (SELECT u.auth_id FROM users u JOIN professionals p ON u.id = p.user_id WHERE p.id = professional_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      },
      {
        name: 'Allow users to create appointments',
        operation: 'INSERT',
        expression: 'auth.uid() IN (SELECT auth_id FROM users)'
      },
      {
        name: 'Allow users to update their own appointments',
        operation: 'UPDATE',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id) OR auth.uid() IN (SELECT u.auth_id FROM users u JOIN professionals p ON u.id = p.user_id WHERE p.id = professional_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      },
      {
        name: 'Allow admins to manage all appointments',
        operation: 'ALL',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      }
    ],
    'appointment_services': [
      {
        name: 'Allow users to read their appointment services',
        operation: 'SELECT',
        expression: 'auth.uid() IN (SELECT u.auth_id FROM users u JOIN appointments a ON u.id = a.user_id WHERE a.id = appointment_id) OR auth.uid() IN (SELECT u.auth_id FROM users u JOIN professionals p ON u.id = p.user_id JOIN appointments a ON p.id = a.professional_id WHERE a.id = appointment_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      },
      {
        name: 'Allow users to create appointment services',
        operation: 'INSERT',
        expression: 'auth.uid() IN (SELECT u.auth_id FROM users u JOIN appointments a ON u.id = a.user_id WHERE a.id = appointment_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      },
      {
        name: 'Allow admins to manage all appointment services',
        operation: 'ALL',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      }
    ],
    'loyalty_rewards': [
      {
        name: 'Allow public read access to loyalty rewards',
        operation: 'SELECT',
        expression: 'true'
      },
      {
        name: 'Allow admins to manage loyalty rewards',
        operation: 'ALL',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      }
    ],
    'loyalty_history': [
      {
        name: 'Allow users to read their own loyalty history',
        operation: 'SELECT',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      },
      {
        name: 'Allow users to create loyalty history entries',
        operation: 'INSERT',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      },
      {
        name: 'Allow admins to manage all loyalty history',
        operation: 'ALL',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      }
    ],
    'cash_flow': [
      {
        name: 'Allow admins to manage cash flow',
        operation: 'ALL',
        expression: 'auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      },
      {
        name: 'Allow professionals to read cash flow entries related to their appointments',
        operation: 'SELECT',
        expression: 'appointment_id IS NOT NULL AND auth.uid() IN (SELECT u.auth_id FROM users u JOIN professionals p ON u.id = p.user_id JOIN appointments a ON p.id = a.professional_id WHERE a.id = appointment_id) OR auth.uid() IN (SELECT auth_id FROM users WHERE role = \'admin\')'
      }
    ]
  };
  
  return policyMap[tableName] || [];
}

// Executar a função principal
setupRLS().catch(error => {
  console.error('Erro fatal durante a configuração RLS:', error);
  process.exit(1);
});