
import { supabase } from '../server/supabase';

// Lista completa de serviços baseada no arquivo import-services-to-supabase.sql
const services = [
  {
    id: 1,
    name: 'Corte Masculino',
    price: 3000,
    price_type: 'fixed',
    duration_minutes: 30,
    category_id: 1,
    description: 'Corte masculino completo'
  },
  {
    id: 2,
    name: 'Corte + Barba',
    price: 5000,
    price_type: 'fixed',
    duration_minutes: 60,
    category_id: 1,
    description: 'Corte masculino com barba'
  },
  {
    id: 3,
    name: 'Corte + Barba + Sobrancelha na Navalha',
    price: null,
    price_type: 'variable',
    duration_minutes: 60,
    category_id: 1,
    description: 'Corte, barba e sobrancelha'
  },
  {
    id: 4,
    name: 'Barba Tradicional',
    price: 2500,
    price_type: 'fixed',
    duration_minutes: 30,
    category_id: 2,
    description: 'Serviço completo de barba com toalha quente'
  },
  {
    id: 5,
    name: 'Sobrancelha na Navalha',
    price: 1000,
    price_type: 'fixed',
    duration_minutes: 15,
    category_id: 4,
    description: 'Modelagem de sobrancelha com navalha'
  },
  {
    id: 6,
    name: 'Corte Degradê',
    price: 3500,
    price_type: 'fixed',
    duration_minutes: 40,
    category_id: 1,
    description: 'Corte com técnica de degradê'
  },
  {
    id: 7,
    name: 'Limpeza de Pele',
    price: 4500,
    price_type: 'fixed',
    duration_minutes: 30,
    category_id: 3,
    description: 'Limpeza facial profunda'
  },
  {
    id: 8,
    name: 'Relaxamento Capilar',
    price: 7000,
    price_type: 'variable',
    duration_minutes: 60,
    category_id: 5,
    description: 'Tratamento para alisar os cabelos'
  },
  {
    id: 9,
    name: 'Pigmentação de Barba',
    price: 4000,
    price_type: 'fixed',
    duration_minutes: 45,
    category_id: 2,
    description: 'Preenchimento da barba com pigmentos'
  },
  {
    id: 10,
    name: 'Coloração',
    price: 6000,
    price_type: 'variable',
    duration_minutes: 60,
    category_id: 6,
    description: 'Coloração completa dos cabelos'
  },
  {
    id: 11,
    name: 'Corte + Barba + Sobrancelha na Pinça',
    price: null,
    price_type: 'variable',
    duration_minutes: 60,
    category_id: 1,
    description: 'Serviço completo com barba e sobrancelha na pinça'
  },
  {
    id: 12,
    name: 'Corte + Pigmentação',
    price: 6000,
    price_type: 'fixed',
    duration_minutes: 60,
    category_id: 1,
    description: 'Corte com pigmentação capilar'
  },
  {
    id: 13,
    name: 'Corte + Sobrancelha na Navalha',
    price: null,
    price_type: 'variable',
    duration_minutes: 30,
    category_id: 1,
    description: 'Corte com modelagem de sobrancelha'
  },
  {
    id: 14,
    name: 'Corte + Sobrancelha na Pinça',
    price: 4500,
    price_type: 'fixed',
    duration_minutes: 60,
    category_id: 1,
    description: 'Corte com modelagem de sobrancelha na pinça'
  },
  {
    id: 15,
    name: 'Corte 1 e 2 pente',
    price: 2000,
    price_type: 'fixed',
    duration_minutes: 15,
    category_id: 1,
    description: 'Corte rápido com máquina'
  },
  {
    id: 16,
    name: 'Barba + Pezinho',
    price: 3200,
    price_type: 'fixed',
    duration_minutes: 30,
    category_id: 2,
    description: 'Barba completa com acabamento no pescoço'
  },
  {
    id: 17,
    name: 'Acabamento (Pezinho)',
    price: 700,
    price_type: 'fixed',
    duration_minutes: 15,
    category_id: 2,
    description: 'Acabamento apenas na nuca'
  },
  {
    id: 18,
    name: 'Hidratação',
    price: 2000,
    price_type: 'fixed',
    duration_minutes: 15,
    category_id: 3,
    description: 'Tratamento de hidratação facial'
  },
  {
    id: 19,
    name: 'BOTOX',
    price: 4000,
    price_type: 'fixed',
    duration_minutes: 30,
    category_id: 3,
    description: 'Tratamento rejuvenescedor para face'
  },
  {
    id: 20,
    name: 'Depilação Nasal',
    price: 1000,
    price_type: 'fixed',
    duration_minutes: 15,
    category_id: 3,
    description: 'Remoção dos pelos nasais'
  },
  {
    id: 21,
    name: 'Sobrancelha Pinça',
    price: 1000,
    price_type: 'fixed',
    duration_minutes: 15,
    category_id: 4,
    description: 'Modelagem de sobrancelha com pinça'
  },
  {
    id: 22,
    name: 'Lavagem + Penteado',
    price: 2000,
    price_type: 'variable',
    duration_minutes: 15,
    category_id: 5,
    description: 'Lavagem com shampoo e finalização'
  },
  {
    id: 23,
    name: 'Relaxamento Capilar (Graxa)',
    price: 2000,
    price_type: 'fixed',
    duration_minutes: 30,
    category_id: 5,
    description: 'Relaxamento com produto específico'
  },
  {
    id: 24,
    name: 'Relaxamento Capilar + Hidratação',
    price: 3000,
    price_type: 'fixed',
    duration_minutes: 30,
    category_id: 5,
    description: 'Relaxamento com tratamento hidratante'
  },
  {
    id: 25,
    name: 'Pigmentação',
    price: 3000,
    price_type: 'variable',
    duration_minutes: 15,
    category_id: 5,
    description: 'Aplicação de pigmentos para disfarçar falhas'
  },
  {
    id: 26,
    name: 'Pintura',
    price: 3000,
    price_type: 'variable',
    duration_minutes: 15,
    category_id: 5,
    description: 'Coloração para cabelos'
  },
  {
    id: 27,
    name: 'Progressiva',
    price: 5000,
    price_type: 'fixed',
    duration_minutes: 30,
    category_id: 6,
    description: 'Tratamento para alisar os cabelos'
  },
  {
    id: 28,
    name: 'Selagem',
    price: 5000,
    price_type: 'fixed',
    duration_minutes: 30,
    category_id: 6,
    description: 'Tratamento para selar cutículas dos fios'
  },
  {
    id: 29,
    name: 'Platinado',
    price: 14000,
    price_type: 'variable',
    duration_minutes: 30,
    category_id: 6,
    description: 'Descoloração total dos cabelos'
  },
  {
    id: 30,
    name: 'Luzes',
    price: 14000,
    price_type: 'variable',
    duration_minutes: 30,
    category_id: 6,
    description: 'Mechas para iluminar o cabelo'
  }
];

// Função para adicionar campos de timestamp
const addTimestamps = (data: any) => {
  const now = new Date().toISOString();
  return {
    ...data,
    created_at: now,
    updated_at: now
  };
};

async function populateServices() {
  console.log('Iniciando população da tabela services no Supabase...');
  
  try {
    // Verificar se a tabela existe
    const { data: checkTable, error: checkError } = await supabase
      .from('services')
      .select('count')
      .limit(1);
    
    if (checkError) {
      console.error('Erro ao verificar tabela services:', checkError);
      
      if (checkError.code === 'PGRST116') {
        console.error('A tabela services não existe no Supabase!');
        console.log('Execute primeiro o script SQL para criar as tabelas.');
        return;
      }
      
      throw checkError;
    }
    
    console.log('Tabela services encontrada, prosseguindo com a inserção de dados...');
    
    // Inserir serviços um por um para ter melhor controle
    let successCount = 0;
    let errorCount = 0;
    
    for (const service of services) {
      const serviceWithTimestamps = addTimestamps(service);
      
      const { error } = await supabase
        .from('services')
        .upsert(serviceWithTimestamps, { onConflict: 'id' });
      
      if (error) {
        console.error(`Erro ao inserir serviço ${service.id} - ${service.name}:`, error);
        errorCount++;
      } else {
        successCount++;
        console.log(`✅ Serviço ${service.id} - ${service.name} inserido com sucesso.`);
      }
    }
    
    console.log('\n=== RESUMO DA OPERAÇÃO ===');
    console.log(`Total de serviços: ${services.length}`);
    console.log(`Inseridos com sucesso: ${successCount}`);
    console.log(`Falhas: ${errorCount}`);
    
    if (successCount === services.length) {
      console.log('\n✅ Todos os serviços foram inseridos com sucesso!');
    } else {
      console.log('\n⚠️ Alguns serviços não puderam ser inseridos. Verifique os erros acima.');
    }
    
    // Resetar a sequência de IDs
    const { error: seqError } = await supabase.rpc('reset_service_sequence');
    if (seqError) {
      console.log('Nota: Não foi possível resetar a sequência de IDs. Isso não é um problema crítico.');
    } else {
      console.log('✅ Sequência de IDs resetada com sucesso.');
    }
    
  } catch (error) {
    console.error('Erro durante a população da tabela services:', error);
  }
}

// Verifica categorias de serviço e cria se necessário
async function checkServiceCategories() {
  console.log('Verificando categorias de serviços...');
  
  const categories = [
    { id: 1, name: 'Cortes', icon: 'cut' },
    { id: 2, name: 'Barba', icon: 'beard' },
    { id: 3, name: 'Estética', icon: 'spa' },
    { id: 4, name: 'Sobrancelha', icon: 'eyebrow' },
    { id: 5, name: 'Tratamentos', icon: 'treatment' },
    { id: 6, name: 'Químicas', icon: 'chemical' }
  ];
  
  const { data: existingCategories, error } = await supabase
    .from('service_categories')
    .select('*');
  
  if (error) {
    console.error('Erro ao verificar categorias:', error);
    
    if (error.code === 'PGRST116') {
      console.error('A tabela service_categories não existe no Supabase!');
      console.log('Execute primeiro o script SQL para criar as tabelas.');
      return false;
    }
    
    throw error;
  }
  
  if (!existingCategories || existingCategories.length === 0) {
    console.log('Nenhuma categoria encontrada, criando categorias padrão...');
    
    const { error: insertError } = await supabase
      .from('service_categories')
      .upsert(categories.map(addTimestamps));
    
    if (insertError) {
      console.error('Erro ao inserir categorias:', insertError);
      return false;
    }
    
    console.log('✅ Categorias criadas com sucesso!');
  } else {
    console.log(`✅ ${existingCategories.length} categorias já existem.`);
  }
  
  return true;
}

// Função principal
async function main() {
  console.log('=== Script de População de Serviços para Supabase ===\n');
  
  // Primeiro verifica e cria categorias se necessário
  const categoriesOk = await checkServiceCategories();
  
  if (categoriesOk) {
    // Depois popula os serviços
    await populateServices();
  } else {
    console.log('⚠️ Não foi possível prosseguir sem as categorias de serviço.');
  }
  
  console.log('\nOperação concluída.');
}

// Executar script
main();
