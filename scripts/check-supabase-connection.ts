import supabase from '../server/supabase';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Script para testar a conexão com o Supabase e listar as tabelas existentes
 */
async function checkSupabaseConnection() {
  try {
    console.log('Testando conexão com o Supabase...');
    console.log(`URL: ${process.env.SUPABASE_URL}`);
    
    // Verificar se a conexão está funcionando com uma consulta simples
    const { data: tablesData, error: tablesError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (tablesError) {
      console.error('❌ Erro ao consultar tabelas:', tablesError);
      
      // Tentar uma consulta alternativa mais simples
      console.log('Tentando consulta alternativa...');
      const { data: version, error: versionError } = await supabase.rpc('version');
      
      if (versionError) {
        console.error('❌ Erro na consulta alternativa:', versionError);
        console.log('Detalhes da conexão:');
        console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? 'Configurado' : 'Não configurado'}`);
        console.log(`SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? 'Configurado' : 'Não configurado'}`);
        console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Configurado' : 'Não configurado'}`);
      } else {
        console.log('✅ Conexão com Supabase funcional!');
        console.log('Versão:', version);
      }
      return;
    }
    
    console.log('✅ Conexão com Supabase funcional!');
    
    // Exibir informações de contagem
    console.log('\nVerificação de contagem bem-sucedida!');
    
    // Consultar tabela de produtos
    console.log('\nConsultando tabela de produtos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (productsError) {
      console.error('❌ Erro ao consultar produtos:', productsError);
    } else if (products && products.length > 0) {
      console.log(`✅ ${products.length} produtos encontrados:`);
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - ${(product.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`);
      });
    } else {
      console.log('Nenhum produto encontrado.');
    }
    
    // Consultar categorias de produtos
    console.log('\nConsultando categorias de produtos...');
    const { data: categories, error: categoriesError } = await supabase
      .from('product_categories')
      .select('*');
    
    if (categoriesError) {
      console.error('❌ Erro ao consultar categorias:', categoriesError);
    } else if (categories && categories.length > 0) {
      console.log(`✅ ${categories.length} categorias encontradas:`);
      categories.forEach((category, index) => {
        console.log(`${index + 1}. ID: ${category.id}, Nome: ${category.name}`);
      });
    } else {
      console.log('Nenhuma categoria encontrada.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o Supabase:', error);
  }
}

// Executar a verificação
checkSupabaseConnection().catch(console.error);