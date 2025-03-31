import supabase from '../server/supabase';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Script para verificar os serviços cadastrados no Supabase
 */
async function checkServices() {
  try {
    console.log('Consultando categorias de serviços...');
    
    // Consultar categorias de serviços
    const { data: categories, error: categoriesError } = await supabase
      .from('service_categories')
      .select('*');
    
    if (categoriesError) {
      console.error('❌ Erro ao consultar categorias de serviços:', categoriesError);
      return;
    }
    
    console.log(`✅ ${categories.length} categorias de serviços encontradas:`);
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ID: ${category.id}, Nome: ${category.name}`);
    });
    
    // Consultar serviços
    console.log('\nConsultando serviços...');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*, service_categories(name)');
    
    if (servicesError) {
      console.error('❌ Erro ao consultar serviços:', servicesError);
      return;
    }
    
    if (services && services.length > 0) {
      console.log(`✅ ${services.length} serviços encontrados:`);
      services.forEach((service, index) => {
        const categoryName = service.service_categories ? service.service_categories.name : 'Categoria desconhecida';
        const formattedPrice = (service.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const formattedDuration = service.duration_minutes ? `${service.duration_minutes} min` : 'Não especificado';
        
        console.log(`${index + 1}. ${service.name} - ${formattedPrice} - ${formattedDuration} - Categoria: ${categoryName}`);
      });
    } else {
      console.log('Nenhum serviço encontrado.');
    }
    
    // Consultar profissionais
    console.log('\nConsultando profissionais...');
    const { data: professionals, error: professionalsError } = await supabase
      .from('professionals')
      .select('*');
    
    if (professionalsError) {
      console.error('❌ Erro ao consultar profissionais:', professionalsError);
      return;
    }
    
    if (professionals && professionals.length > 0) {
      console.log(`✅ ${professionals.length} profissionais encontrados:`);
      professionals.forEach((professional, index) => {
        console.log(`${index + 1}. ${professional.name} - ${professional.role || 'Função não especificada'}`);
      });
    } else {
      console.log('Nenhum profissional encontrado.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o Supabase:', error);
  }
}

// Executar a verificação
checkServices().catch(console.error);