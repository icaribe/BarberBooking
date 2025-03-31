import { supabase } from '../server/supabase';
import { executeSql } from './utils/sql-executor';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

interface ServiceCategory {
  id: number;
  name: string;
  description: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category_id: number;
}

interface ServiceDefinition {
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface CategoryDefinition {
  name: string;
  description: string;
  services: ServiceDefinition[];
}

/**
 * Script para sincronizar as informações entre as tabelas de serviços e categorias
 * no Supabase, garantindo que os dados estejam consistentes.
 */
async function syncServicesData() {
  try {
    console.log('Iniciando sincronização de dados de serviços...');
    
    // 1. Buscar categorias de serviços existentes no Supabase
    console.log('Buscando categorias de serviços existentes...');
    const { data: existingCategories, error: categoriesError } = await supabase
      .from('service_categories')
      .select('*');
    
    if (categoriesError) {
      throw new Error(`Erro ao buscar categorias: ${categoriesError.message}`);
    }
    
    console.log(`Encontradas ${existingCategories.length} categorias de serviços.`);
    
    // Mapear IDs das categorias para facilitar a consulta
    const categoryMap = new Map<string, number>();
    existingCategories.forEach((category: ServiceCategory) => {
      categoryMap.set(category.name.toLowerCase(), category.id);
    });
    
    // 2. Buscar serviços existentes no Supabase
    console.log('Buscando serviços existentes...');
    const { data: existingServices, error: servicesError } = await supabase
      .from('services')
      .select('*');
    
    if (servicesError) {
      throw new Error(`Erro ao buscar serviços: ${servicesError.message}`);
    }
    
    if (!existingServices) {
      throw new Error('Não foi possível recuperar os serviços existentes');
    }
    
    console.log(`Encontrados ${existingServices.length} serviços.`);
    
    // Mapear IDs dos serviços para facilitar a consulta
    interface ServiceMapEntry {
      id: number;
      categoryId: number;
      price: number;
      description: string;
      duration: number;
    }
    
    const serviceMap = new Map<string, ServiceMapEntry>();
    existingServices.forEach((service: Service) => {
      serviceMap.set(service.name.toLowerCase(), {
        id: service.id,
        categoryId: service.category_id,
        price: service.price,
        description: service.description,
        duration: service.duration
      });
    });
    
    // 3. Definição de categorias de serviços e seus serviços associados
    const serviceCategories: CategoryDefinition[] = [
      {
        name: 'Cortes de Cabelo',
        description: 'Diversos estilos de cortes para todos os tipos de cabelo',
        services: [
          {
            name: 'Corte Degradê',
            description: 'Corte moderno com transição suave entre diferentes comprimentos',
            price: 40.00,
            duration: 30
          },
          {
            name: 'Corte Tradicional',
            description: 'Corte clássico com tesoura e máquina',
            price: 35.00,
            duration: 25
          },
          {
            name: 'Corte Navalhado',
            description: 'Acabamento especial com navalha para um visual mais definido',
            price: 45.00,
            duration: 35
          }
        ]
      },
      {
        name: 'Serviços para Barba',
        description: 'Cuidados completos para a barba',
        services: [
          {
            name: 'Barba Completa',
            description: 'Aparagem, modelagem e produtos para hidratação',
            price: 30.00,
            duration: 20
          },
          {
            name: 'Barba com Toalha Quente',
            description: 'Tratamento premium com toalha quente para amaciar a barba',
            price: 35.00,
            duration: 25
          },
          {
            name: 'Contorno de Barba',
            description: 'Definição e alinhamento do contorno da barba',
            price: 20.00,
            duration: 15
          }
        ]
      },
      {
        name: 'Combos',
        description: 'Combinações de serviços com preço especial',
        services: [
          {
            name: 'Corte + Barba',
            description: 'Corte de cabelo + barba completa',
            price: 65.00,
            duration: 50
          },
          {
            name: 'Corte + Barba + Sobrancelha',
            description: 'Pacote completo incluindo design de sobrancelha',
            price: 75.00,
            duration: 60
          }
        ]
      },
      {
        name: 'Tratamentos',
        description: 'Tratamentos especiais para cabelo e barba',
        services: [
          {
            name: 'Hidratação Capilar',
            description: 'Tratamento profundo para nutrir e hidratar os fios',
            price: 40.00,
            duration: 30
          },
          {
            name: 'Máscara para Barba',
            description: 'Tratamento nutritivo para barba ressecada',
            price: 25.00,
            duration: 20
          }
        ]
      }
    ];
    
    // 4. Adicionar categorias de serviços que não existem ainda
    console.log('Sincronizando categorias de serviços...');
    for (const category of serviceCategories) {
      const normalizedName = category.name.toLowerCase();
      
      if (!categoryMap.has(normalizedName)) {
        console.log(`Adicionando nova categoria: ${category.name}`);
        
        const { data: newCategory, error: insertError } = await supabase
          .from('service_categories')
          .insert({
            name: category.name,
            description: category.description
          })
          .select()
          .single();
        
        if (insertError) {
          console.error(`Erro ao adicionar categoria ${category.name}:`, insertError);
          continue;
        }
        
        categoryMap.set(normalizedName, newCategory.id);
        console.log(`✅ Categoria adicionada com ID: ${newCategory.id}`);
      } else {
        // Atualizar descrição da categoria se necessário
        const existingCategoryId = categoryMap.get(normalizedName);
        const existingCategory = existingCategories.find(c => c.id === existingCategoryId);
        
        if (existingCategory && existingCategory.description !== category.description) {
          console.log(`Atualizando descrição da categoria: ${category.name}`);
          
          const { error: updateError } = await supabase
            .from('service_categories')
            .update({ description: category.description })
            .eq('id', existingCategoryId);
          
          if (updateError) {
            console.error(`Erro ao atualizar categoria ${category.name}:`, updateError);
            continue;
          }
          
          console.log(`✅ Descrição da categoria atualizada`);
        }
      }
      
      // 5. Adicionar ou atualizar serviços para esta categoria
      const categoryId = categoryMap.get(normalizedName);
      
      for (const service of category.services) {
        const normalizedServiceName = service.name.toLowerCase();
        
        if (!serviceMap.has(normalizedServiceName)) {
          console.log(`Adicionando novo serviço: ${service.name}`);
          
          const { data: newService, error: insertError } = await supabase
            .from('services')
            .insert({
              name: service.name,
              description: service.description,
              price: service.price,
              duration: service.duration,
              category_id: categoryId
            })
            .select()
            .single();
          
          if (insertError) {
            console.error(`Erro ao adicionar serviço ${service.name}:`, insertError);
            continue;
          }
          
          serviceMap.set(normalizedServiceName, {
            id: newService.id,
            categoryId: newService.category_id,
            price: newService.price,
            description: newService.description,
            duration: newService.duration
          });
          
          console.log(`✅ Serviço adicionado com ID: ${newService.id}`);
        } else {
          // Verificar se os dados do serviço estão atualizados
          const existingService = serviceMap.get(normalizedServiceName);
          
          if (!existingService) {
            console.error(`Erro ao encontrar serviço ${service.name} no mapa`);
            continue;
          }
          
          const needsUpdate = 
            existingService.categoryId !== categoryId ||
            existingService.price !== service.price ||
            existingService.description !== service.description ||
            existingService.duration !== service.duration;
          
          if (needsUpdate) {
            console.log(`Atualizando serviço: ${service.name}`);
            
            const { error: updateError } = await supabase
              .from('services')
              .update({
                description: service.description,
                price: service.price,
                duration: service.duration,
                category_id: categoryId
              })
              .eq('id', existingService.id);
            
            if (updateError) {
              console.error(`Erro ao atualizar serviço ${service.name}:`, updateError);
              continue;
            }
            
            console.log(`✅ Serviço atualizado`);
          }
        }
      }
    }
    
    console.log('\n🎉 Sincronização de dados de serviços concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error);
    process.exit(1);
  }
}

// Executar o script
syncServicesData().catch(console.error);