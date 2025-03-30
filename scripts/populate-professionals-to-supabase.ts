
import { supabase } from '../server/supabase';

// Lista de profissionais 
const professionals = [
  {
    id: 1,
    name: 'Carlos',
    avatar: 'https://i.imgur.com/nN6fr9Z.png',
    rating: 47, // Valor entre 0-50 (será exibido como 4.7/5)
    review_count: 32,
    specialties: ['Cortes', 'Barba'],
    bio: 'Especialista em cortes modernos e design de barba.'
  },
  {
    id: 2, 
    name: 'Iuri',
    avatar: 'https://i.imgur.com/RZJc2cB.png',
    rating: 48,
    review_count: 41,
    specialties: ['Cortes', 'Tratamentos Capilares'],
    bio: 'Mestre em degradês e tratamentos capilares.'
  },
  {
    id: 3,
    name: 'Johnata',
    avatar: 'https://i.imgur.com/JWGwtWm.png',
    rating: 45,
    review_count: 28,
    specialties: ['Química', 'Coloração'],
    bio: 'Especializado em coloração e química capilar.'
  },
  {
    id: 4,
    name: 'Jorran',
    avatar: 'https://i.imgur.com/kNYv1ff.png',
    rating: 49,
    review_count: 38,
    specialties: ['Cortes', 'Barba', 'Sobrancelha'],
    bio: 'Multiespecialista com foco em acabamentos perfeitos.'
  },
  {
    id: 5,
    name: 'Mikael',
    avatar: 'https://i.imgur.com/agKSdJd.png',
    rating: 46,
    review_count: 35,
    specialties: ['Cortes Degradê', 'Pigmentação'],
    bio: 'Referência em técnicas de degradê e pigmentação.'
  },
  {
    id: 6,
    name: 'Oséias',
    avatar: 'https://i.imgur.com/bRGglNB.png',
    rating: 47,
    review_count: 33,
    specialties: ['Cortes Clássicos', 'Barba'],
    bio: 'Tradicional e preciso nos cortes clássicos.'
  },
  {
    id: 7,
    name: 'Rodrigo',
    avatar: 'https://i.imgur.com/Egl0BLP.png',
    rating: 50,
    review_count: 45,
    specialties: ['Cortes', 'Tratamentos Faciais'],
    bio: 'Inovador em cortes modernos e tratamentos faciais.'
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

async function populateProfessionals() {
  console.log('Iniciando população da tabela professionals no Supabase...');
  
  try {
    // Verificar se a tabela existe
    const { data: checkTable, error: checkError } = await supabase
      .from('professionals')
      .select('count')
      .limit(1);
    
    if (checkError) {
      console.error('Erro ao verificar tabela professionals:', checkError);
      
      if (checkError.code === 'PGRST116') {
        console.error('A tabela professionals não existe no Supabase!');
        console.log('Execute primeiro o script SQL para criar as tabelas.');
        return;
      }
      
      throw checkError;
    }
    
    console.log('Tabela professionals encontrada, prosseguindo com a inserção de dados...');
    
    // Inserir profissionais um por um para ter melhor controle
    let successCount = 0;
    let errorCount = 0;
    
    for (const professional of professionals) {
      const professionalWithTimestamps = addTimestamps(professional);
      
      const { error } = await supabase
        .from('professionals')
        .upsert(professionalWithTimestamps, { onConflict: 'id' });
      
      if (error) {
        console.error(`Erro ao inserir profissional ${professional.id} - ${professional.name}:`, error);
        errorCount++;
      } else {
        successCount++;
        console.log(`✅ Profissional ${professional.id} - ${professional.name} inserido com sucesso.`);
      }
    }
    
    console.log('\n=== RESUMO DA OPERAÇÃO ===');
    console.log(`Total de profissionais: ${professionals.length}`);
    console.log(`Inseridos com sucesso: ${successCount}`);
    console.log(`Falhas: ${errorCount}`);
    
    if (successCount === professionals.length) {
      console.log('\n✅ Todos os profissionais foram inseridos com sucesso!');
    } else {
      console.log('\n⚠️ Alguns profissionais não puderam ser inseridos. Verifique os erros acima.');
    }
    
    // Resetar a sequência de IDs
    const { error: seqError } = await supabase.rpc('reset_professional_sequence');
    if (seqError) {
      console.log('Nota: Não foi possível resetar a sequência de IDs. Isso não é um problema crítico.');
    } else {
      console.log('✅ Sequência de IDs resetada com sucesso.');
    }
    
  } catch (error) {
    console.error('Erro durante a população da tabela professionals:', error);
  }
}

// Função principal
async function main() {
  console.log('=== Script de População de Profissionais para Supabase ===\n');
  
  // Popula os profissionais
  await populateProfessionals();
  
  console.log('\nOperação concluída.');
}

// Executar script
main();
