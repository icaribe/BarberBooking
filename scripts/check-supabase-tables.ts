
import { supabase } from '../server/supabase';

async function checkTables() {
  console.log('Verificando tabelas no Supabase...');

  try {
    // Lista de tabelas que devem existir baseadas no schema
    const expectedTables = [
      'users',
      'service_categories',
      'services',
      'professionals',
      'schedules',
      'appointments',
      'appointment_services',
      'product_categories',
      'products',
      'loyalty_rewards'
    ];

    // Verificar cada tabela e contar registros
    for (const tableName of expectedTables) {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' });
      
      if (error) {
        console.error(`Erro ao verificar tabela ${tableName}:`, error.message);
      } else {
        console.log(`✅ Tabela ${tableName} existe com ${count} registros`);
        
        // Mostrar amostra de dados (primeiros 2 registros)
        if (data && data.length > 0) {
          console.log(`  Amostra de dados:`);
          console.log(JSON.stringify(data.slice(0, 2), null, 2));
        } else {
          console.log(`  Tabela vazia`);
        }
      }
    }

    // Verificar as relações entre tabelas através de queries específicas
    console.log('\n--- Verificando relações entre tabelas ---');
    
    // 1. Usuários e agendamentos
    const { data: userAppointments, error: userAppError } = await supabase
      .from('appointments')
      .select(`
        id, 
        users (id, name),
        professionals (id, name)
      `)
      .limit(2);
    
    if (userAppError) {
      console.error('Erro ao verificar relação entre usuários e agendamentos:', userAppError.message);
    } else {
      console.log('✅ Relação entre usuários e agendamentos verificada:', userAppointments.length > 0 ? 'OK' : 'Sem dados');
    }
    
    // 2. Serviços e categorias
    const { data: serviceCateg, error: serviceCategError } = await supabase
      .from('services')
      .select(`
        id, name,
        service_categories (id, name)
      `)
      .limit(2);
    
    if (serviceCategError) {
      console.error('Erro ao verificar relação entre serviços e categorias:', serviceCategError.message);
    } else {
      console.log('✅ Relação entre serviços e categorias verificada:', serviceCateg.length > 0 ? 'OK' : 'Sem dados');
    }

    // 3. Produtos e categorias
    const { data: prodCateg, error: prodCategError } = await supabase
      .from('products')
      .select(`
        id, name,
        product_categories (id, name)
      `)
      .limit(2);
    
    if (prodCategError) {
      console.error('Erro ao verificar relação entre produtos e categorias:', prodCategError.message);
    } else {
      console.log('✅ Relação entre produtos e categorias verificada:', prodCateg.length > 0 ? 'OK' : 'Sem dados');
    }

    console.log('\nVerificação concluída');
  } catch (error) {
    console.error('Erro durante a verificação:', error);
  }
}

// Executar verificação
checkTables();
