import supabase from '../server/supabase';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

/**
 * Script para testar a conexão com o Supabase e verificar
 * se as credenciais estão configuradas corretamente.
 */
async function testSupabaseConnection() {
  try {
    console.log('Testando conexão com o Supabase...');
    
    // Verificar se as variáveis de ambiente estão definidas
    console.log('Verificando variáveis de ambiente:');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL não está definido no arquivo .env');
    }
    
    if (!supabaseKey) {
      throw new Error('SUPABASE_ANON_KEY não está definido no arquivo .env');
    }
    
    console.log(`- SUPABASE_URL: ${supabaseUrl.substring(0, 15)}...`);
    console.log(`- SUPABASE_ANON_KEY: ${supabaseKey.substring(0, 5)}...${supabaseKey.substring(supabaseKey.length - 5)}`);
    
    // Realizar uma consulta simples para verificar a conexão
    console.log('\nRealizando consulta de teste...');
    
    // Testar tabela service_categories
    const { data: serviceCategories, error: categoriesError } = await supabase
      .from('service_categories')
      .select('*')
      .limit(5);
    
    if (categoriesError) {
      throw new Error(`Erro ao consultar categorias de serviço: ${categoriesError.message}`);
    }
    
    console.log(`✅ Conexão bem-sucedida! Encontradas ${serviceCategories?.length || 0} categorias de serviço.`);
    
    if (serviceCategories && serviceCategories.length > 0) {
      console.log('\nExemplo de categoria de serviço:');
      console.log(JSON.stringify(serviceCategories[0], null, 2));
    }
    
    // Testar tabela services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(5);
    
    if (servicesError) {
      throw new Error(`Erro ao consultar serviços: ${servicesError.message}`);
    }
    
    console.log(`\n✅ Encontrados ${services?.length || 0} serviços.`);
    
    if (services && services.length > 0) {
      console.log('\nExemplo de serviço:');
      console.log(JSON.stringify(services[0], null, 2));
    }
    
    // Verificar informações do projeto
    try {
      const { data: projectInfo, error: projectError } = await supabase
        .rpc('get_project_info');
      
      if (!projectError && projectInfo) {
        console.log('\nInformações do projeto Supabase:');
        console.log(JSON.stringify(projectInfo, null, 2));
      }
    } catch (err) {
      console.log('\nNão foi possível obter informações do projeto (essa função pode não existir).');
    }
    
    console.log('\n🎉 Conexão com o Supabase está funcionando corretamente!');
    
  } catch (error) {
    console.error('\n❌ Erro ao testar conexão com o Supabase:', error);
    process.exit(1);
  }
}

// Executar o teste
testSupabaseConnection().catch(console.error);