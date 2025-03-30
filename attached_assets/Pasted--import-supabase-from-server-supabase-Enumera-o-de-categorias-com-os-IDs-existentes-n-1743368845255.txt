
import { supabase } from '../server/supabase';

// Enumeração de categorias com os IDs existentes no Supabase
enum ProductCategory {
  BarbaECabelo = 1,
  Pomadas = 2,
  BebidasAlcoolicas = 3,
  BebidasNaoAlcoolicas = 4,
  Lanches = 5,
  Acessorios = 6
}

// Função para converter preço de formato R$ XX,XX para centavos (inteiro)
const priceToInt = (priceString: string): number => {
  // Se já for um número, retorna como está
  if (typeof priceString === 'number') return priceString;
  
  // Remove "R$ " e converte para número
  const numericPrice = parseFloat(priceString.replace('R$ ', '').replace(',', '.'));
  // Converte para centavos
  return Math.round(numericPrice * 100);
};

// Função para adicionar campos de timestamp
const addTimestamps = (data: any) => {
  const now = new Date().toISOString();
  return {
    ...data,
    created_at: now,
    updated_at: now
  };
};

// Categorias e seus produtos
const productsByCategory = {
  // Produtos para Barba e Cabelo (ID: 1)
  [ProductCategory.BarbaECabelo]: [
    { name: "Foxidil minoxidil para barba (fox) 120 ml", price: priceToInt("R$ 90,00"), description: "Minoxidil para crescimento da barba", image_url: null, in_stock: true },
    { name: "Bal fox", price: priceToInt("R$ 40,00"), description: "Bálsamo para barba da Fox", image_url: null, in_stock: true },
    { name: "Balm B.URB para barba", price: priceToInt("R$ 35,00"), description: "Bálsamo para barba da marca B.URB", image_url: null, in_stock: true },
    { name: "Balm Red Nek para barba", price: priceToInt("R$ 35,00"), description: "Bálsamo para barba da marca Red Nek", image_url: null, in_stock: true },
    { name: "Derma Roller", price: priceToInt("R$ 40,00"), description: "Equipamento para microagulhamento capilar", image_url: null, in_stock: true },
    { name: "Condicionador 3 em 1", price: priceToInt("R$ 30,00"), description: "Condicionador multifuncional 3 em 1", image_url: null, in_stock: true },
    { name: "Condicionador Ice Fresh Fox 240ml", price: priceToInt("R$ 25,00"), description: "Condicionador refrescante", image_url: null, in_stock: true },
    { name: "Escova anti estática", price: priceToInt("R$ 45,00"), description: "Escova especial anti estática", image_url: null, in_stock: true },
    { name: "Esponja de Nudred", price: priceToInt("R$ 30,00"), description: "Esponja para cabelo crespo", image_url: null, in_stock: true },
    { name: "Loção Hidratante Balm Barba 4 em 1", price: priceToInt("R$ 35,00"), description: "Loção multifuncional para barba", image_url: null, in_stock: true },
    { name: "Loção Spray Pós Barba Lenhador", price: priceToInt("R$ 30,00"), description: "Loção pós-barba refrescante", image_url: null, in_stock: true },
    { name: "Maquina Itan", price: priceToInt("R$ 60,00"), description: "Máquina de corte profissional", image_url: null, in_stock: true },
    { name: "Minoxidil Kirkland Signature 05% 60ml", price: priceToInt("R$ 90,00"), description: "Minoxidil importado para crescimento capilar", image_url: null, in_stock: true },
    { name: "Navalha", price: priceToInt("R$ 30,00"), description: "Navalha para barbear profissional", image_url: null, in_stock: true },
    { name: "Óleo de Barba Lenhador Kerafyto", price: priceToInt("R$ 30,00"), description: "Óleo hidratante para barba", image_url: null, in_stock: true },
    { name: "Pente", price: priceToInt("R$ 25,00"), description: "Pente para cabelo", image_url: null, in_stock: true },
    { name: "Pente de mão", price: priceToInt("R$ 3,00"), description: "Pente portátil pequeno", image_url: null, in_stock: true },
    { name: "Perfume de barba", price: priceToInt("R$ 25,00"), description: "Perfume específico para barba", image_url: null, in_stock: true },
    { name: "Perfumes", price: priceToInt("R$ 30,00"), description: "Perfumes variados", image_url: null, in_stock: true },
    { name: "Shampoo 3 em 1", price: priceToInt("R$ 30,00"), description: "Shampoo multifuncional", image_url: null, in_stock: true },
    { name: "Shampoo anti-caspa", price: priceToInt("R$ 30,00"), description: "Shampoo para combate à caspa", image_url: null, in_stock: true },
    { name: "Shampoo com minoxidill", price: priceToInt("R$ 30,00"), description: "Shampoo com minoxidil para crescimento capilar", image_url: null, in_stock: true },
    { name: "Shampoo Ice Fresh Fox 240ml", price: priceToInt("R$ 25,00"), description: "Shampoo refrescante Fox", image_url: null, in_stock: true },
    { name: "Shampoo preto", price: priceToInt("R$ 30,00"), description: "Shampoo tonalizante preto", image_url: null, in_stock: true },
    { name: "Tonico capilar", price: priceToInt("R$ 30,00"), description: "Tônico para fortalecimento capilar", image_url: null, in_stock: true }
  ],

  // Pomadas e Produtos para Estilização (ID: 2)
  [ProductCategory.Pomadas]: [
    { name: "Cera Red Neck Cinza", price: priceToInt("R$ 20,00"), description: "Cera de fixação média, acabamento matte", image_url: null, in_stock: true },
    { name: "Cera Red Neck Laranja", price: priceToInt("R$ 20,00"), description: "Cera de fixação forte, acabamento brilhante", image_url: null, in_stock: true },
    { name: "Cera Red Neck Roxa", price: priceToInt("R$ 20,00"), description: "Cera de fixação forte, acabamento matte", image_url: null, in_stock: true },
    { name: "Cera Red Neck Verde", price: priceToInt("R$ 20,00"), description: "Cera de fixação média, acabamento brilhante", image_url: null, in_stock: true },
    { name: "Cera Red Neck Vermelho", price: priceToInt("R$ 20,00"), description: "Cera de fixação extra forte, acabamento matte", image_url: null, in_stock: true },
    { name: "Pomada efeito teia lenhador 120g", price: priceToInt("R$ 30,00"), description: "Pomada com textura para efeito teia", image_url: null, in_stock: true },
    { name: "Pomada fox verde 120g", price: priceToInt("R$ 30,00"), description: "Pomada da Fox com acabamento médio", image_url: null, in_stock: true },
    { name: "Pomada 60g Pequena (Máxima e Lenhador)", price: priceToInt("R$ 20,00"), description: "Pomada pequena de alto desempenho", image_url: null, in_stock: true },
    { name: "Pomada black Fox 120g", price: priceToInt("R$ 30,00"), description: "Pomada Black da Fox, alta fixação", image_url: null, in_stock: true },
    { name: "Pomada black lenhador 120g", price: priceToInt("R$ 30,00"), description: "Pomada Black Lenhador, alta fixação", image_url: null, in_stock: true },
    { name: "Pomada caramelo fox 120g", price: priceToInt("R$ 30,00"), description: "Pomada Fox caramelo, fixação média", image_url: null, in_stock: true },
    { name: "Pomada Conhaque", price: priceToInt("R$ 30,00"), description: "Pomada com aroma de conhaque, fixação média", image_url: null, in_stock: true },
    { name: "Pomada Efeito teia Fox 120g", price: priceToInt("R$ 30,00"), description: "Pomada Fox com efeito teia", image_url: null, in_stock: true },
    { name: "Pomada em pó", price: priceToInt("R$ 30,00"), description: "Pomada em pó para volume e textura", image_url: null, in_stock: true },
    { name: "Pomada hair fox laranja 120g", price: priceToInt("R$ 30,00"), description: "Pomada Fox laranja, fixação forte", image_url: null, in_stock: true },
    { name: "Pomada matte lenhador 120g", price: priceToInt("R$ 30,00"), description: "Pomada matte acabamento seco", image_url: null, in_stock: true },
    { name: "Pomada Modeladora Caramelo", price: priceToInt("R$ 30,00"), description: "Pomada modeladora coloração caramelo", image_url: null, in_stock: true },
    { name: "Pomada pequena CREAM", price: priceToInt("R$ 25,00"), description: "Pomada pequena cremosa", image_url: null, in_stock: true },
    { name: "Pomada Pequnea", price: priceToInt("R$ 20,00"), description: "Pomada pequena para uso diário", image_url: null, in_stock: true },
    { name: "Pomada toque seco fox 120g", price: priceToInt("R$ 30,00"), description: "Pomada com acabamento seco Fox", image_url: null, in_stock: true },
    { name: "Pomada Tradicional lenhador 120g", price: priceToInt("R$ 30,00"), description: "Pomada tradicional Lenhador", image_url: null, in_stock: true }
  ],

  // Bebidas Alcoólicas (ID: 3)
  [ProductCategory.BebidasAlcoolicas]: [
    { name: "BUDWEISER LONG NECK", price: priceToInt("R$ 7,00"), description: "Cerveja Budweiser Long Neck", image_url: null, in_stock: true },
    { name: "Campari", price: priceToInt("R$ 6,00"), description: "Dose de Campari", image_url: null, in_stock: true },
    { name: "CORONA LONG NECK", price: priceToInt("R$ 8,00"), description: "Cerveja Corona Long Neck", image_url: null, in_stock: true },
    { name: "Coronita", price: priceToInt("R$ 7,00"), description: "Cerveja Coronita", image_url: null, in_stock: true },
    { name: "DOSE ALAMBIQUE MURICI", price: priceToInt("R$ 2,00"), description: "Dose de cachaça artesanal", image_url: null, in_stock: true },
    { name: "DOSE CACHAÇA 51", price: priceToInt("R$ 4,00"), description: "Dose de cachaça 51", image_url: null, in_stock: true },
    { name: "DOSE CORTEZANO", price: priceToInt("R$ 2,00"), description: "Dose de Cortezano", image_url: null, in_stock: true },
    { name: "DOSE MONTILLA", price: priceToInt("R$ 3,00"), description: "Dose de Montilla", image_url: null, in_stock: true },
    { name: "DOSE OLD PARR 12 ANOS", price: priceToInt("R$ 18,00"), description: "Dose de whisky Old Parr 12 anos", image_url: null, in_stock: true },
    { name: "DOSE ORLOFF VODKA", price: priceToInt("R$ 6,00"), description: "Dose de vodka Orloff", image_url: null, in_stock: true },
    { name: "DOSE PARATUDO", price: priceToInt("R$ 5,00"), description: "Dose de cachaça Paratudo", image_url: null, in_stock: true },
    { name: "DOSE SÃO JOÃO DA BARRA", price: priceToInt("R$ 4,00"), description: "Dose de cachaça São João da Barra", image_url: null, in_stock: true },
    { name: "DOSE SELETA", price: priceToInt("R$ 5,00"), description: "Dose de cachaça Seleta", image_url: null, in_stock: true },
    { name: "DOSE TEQUILA OURO (JOSE CUERVO)", price: priceToInt("R$ 10,00"), description: "Dose de tequila ouro José Cuervo", image_url: null, in_stock: true },
    { name: "DOSE TEQUILA PRATA (JOSE CUERVO)", price: priceToInt("R$ 9,00"), description: "Dose de tequila prata José Cuervo", image_url: null, in_stock: true },
    { name: "DOSE VELHO BARREIRO", price: priceToInt("R$ 4,00"), description: "Dose de cachaça Velho Barreiro", image_url: null, in_stock: true },
    { name: "DOSE VODKA SKYY", price: priceToInt("R$ 8,00"), description: "Dose de vodka Skyy", image_url: null, in_stock: true },
    { name: "DOSE Vodka SMIRNOFFF", price: priceToInt("R$ 7,00"), description: "Dose de vodka Smirnoff", image_url: null, in_stock: true },
    { name: "DOSE WHISKEY BLACK LABEL", price: priceToInt("R$ 18,00"), description: "Dose de whisky Johnnie Walker Black Label", image_url: null, in_stock: true },
    { name: "DOSE WHISKEY CHIVAS 12 ANOS", price: priceToInt("R$ 18,00"), description: "Dose de whisky Chivas Regal 12 anos", image_url: null, in_stock: true },
    { name: "DOSE WHISKEY JACK DANIELS", price: priceToInt("R$ 16,00"), description: "Dose de whisky Jack Daniel's", image_url: null, in_stock: true },
    { name: "DOSE WHISKEY RED LABEL", price: priceToInt("R$ 11,00"), description: "Dose de whisky Johnnie Walker Red Label", image_url: null, in_stock: true },
    { name: "DOSE WHITE HORSE", price: priceToInt("R$ 10,00"), description: "Dose de whisky White Horse", image_url: null, in_stock: true },
    { name: "MONSTER ABSOLUT", price: priceToInt("R$ 10,00"), description: "Drink Monster com vodka Absolut", image_url: null, in_stock: true },
    { name: "RIBEIRAO COLORADO LONG NECK", price: priceToInt("R$ 10,00"), description: "Cerveja Colorado Ribeirão Lager", image_url: null, in_stock: true },
    { name: "SPATEN 600ML", price: priceToInt("R$ 13,00"), description: "Cerveja Spaten 600ml", image_url: null, in_stock: true },
    { name: "SPATEN LONG NECK", price: priceToInt("R$ 7,00"), description: "Cerveja Spaten Long Neck", image_url: null, in_stock: true },
    { name: "STELLA ARTOIS LONG NECK 330ml", price: priceToInt("R$ 7,00"), description: "Cerveja Stella Artois Long Neck", image_url: null, in_stock: true },
    { name: "Patagônia IPA 355ml", price: priceToInt("R$ 8,00"), description: "Cerveja Patagônia IPA", image_url: null, in_stock: true }
  ],

  // Bebidas Não Alcoólicas (ID: 4)
  [ProductCategory.BebidasNaoAlcoolicas]: [
    { name: "AGUA COM GAS", price: priceToInt("R$ 3,50"), description: "Água mineral com gás", image_url: null, in_stock: true },
    { name: "Agua com gas + Limão", price: priceToInt("R$ 3,50"), description: "Água mineral com gás e limão", image_url: null, in_stock: true },
    { name: "AGUA MINERAL", price: priceToInt("R$ 3,00"), description: "Água mineral sem gás", image_url: null, in_stock: true },
    { name: "Antarctica Lata", price: priceToInt("R$ 3,50"), description: "Refrigerante Antarctica em lata", image_url: null, in_stock: true },
    { name: "ANTARCTICA ORIGINAL 600ml", price: priceToInt("R$ 13,00"), description: "Cerveja Antarctica Original 600ml", image_url: null, in_stock: true },
    { name: "APPIA COLORADO 300ML", price: priceToInt("R$ 7,00"), description: "Cerveja Colorado Appia 300ml", image_url: null, in_stock: true },
    { name: "Chopp Stadt", price: priceToInt("R$ 6,00"), description: "Chopp Stadt", image_url: null, in_stock: true },
    { name: "COCA 310ML", price: priceToInt("R$ 4,50"), description: "Coca-Cola lata 310ml", image_url: null, in_stock: true },
    { name: "COCA ZERO LATA 310ML", price: priceToInt("R$ 4,00"), description: "Coca-Cola Zero lata 310ml", image_url: null, in_stock: true },
    { name: "COCA-COLA KS", price: priceToInt("R$ 5,00"), description: "Coca-Cola KS", image_url: null, in_stock: true },
    { name: "HEINEKEN ZERO ALCOOL 330ml", price: priceToInt("R$ 7,00"), description: "Cerveja Heineken Zero Álcool", image_url: null, in_stock: true },
    { name: "Monster de goiaba", price: priceToInt("R$ 10,00"), description: "Energético Monster sabor goiaba", image_url: null, in_stock: true },
    { name: "Monster de Laranja", price: priceToInt("R$ 10,00"), description: "Energético Monster sabor laranja", image_url: null, in_stock: true },
    { name: "MONSTER MANGO LOKO", price: priceToInt("R$ 10,00"), description: "Energético Monster Mango Loko", image_url: null, in_stock: true },
    { name: "Monster Melancia", price: priceToInt("R$ 10,00"), description: "Energético Monster sabor melancia", image_url: null, in_stock: true },
    { name: "Monster Tradicional 473ml", price: priceToInt("R$ 10,00"), description: "Energético Monster tradicional", image_url: null, in_stock: true },
    { name: "GATORADE (MoRANGO)", price: priceToInt("R$ 6,00"), description: "Isotônico Gatorade sabor morango", image_url: null, in_stock: true },
    { name: "GATOREDE(limão)", price: priceToInt("R$ 6,00"), description: "Isotônico Gatorade sabor limão", image_url: null, in_stock: true },
    { name: "GATOREDE(MARACUJA)", price: priceToInt("R$ 6,00"), description: "Isotônico Gatorade sabor maracujá", image_url: null, in_stock: true },
    { name: "POWERADE SABORES 500ML", price: priceToInt("R$ 5,00"), description: "Isotônico Powerade diversos sabores", image_url: null, in_stock: true },
    { name: "RED BULL ENERGETICO", price: priceToInt("R$ 10,00"), description: "Energético Red Bull", image_url: null, in_stock: true },
    { name: "Suco de Manga", price: priceToInt("R$ 4,50"), description: "Suco natural de manga", image_url: null, in_stock: true },
    { name: "Suco de maracuja", price: priceToInt("R$ 4,50"), description: "Suco natural de maracujá", image_url: null, in_stock: true },
    { name: "SUCO GOIABA 290ML", price: priceToInt("R$ 4,50"), description: "Suco de goiaba 290ml", image_url: null, in_stock: true },
    { name: "SUCO UVA 290 ML", price: priceToInt("R$ 4,50"), description: "Suco de uva 290ml", image_url: null, in_stock: true }
  ],

  // Lanches e Snacks (ID: 5)
  [ProductCategory.Lanches]: [
    { name: "Barra de Cereal", price: priceToInt("R$ 2,50"), description: "Barra de cereal diversos sabores", image_url: null, in_stock: true },
    { name: "Barra de cereal banana", price: priceToInt("R$ 3,00"), description: "Barra de cereal sabor banana", image_url: null, in_stock: true },
    { name: "Barra de cereal coco + frutas", price: priceToInt("R$ 3,00"), description: "Barra de cereal sabor coco com frutas", image_url: null, in_stock: true },
    { name: "Chocolate 5 Star 40g", price: priceToInt("R$ 4,00"), description: "Chocolate 5 Star 40g", image_url: null, in_stock: true },
    { name: "Chocolate branco Laka 34g", price: priceToInt("R$ 4,00"), description: "Chocolate branco Lacta 34g", image_url: null, in_stock: true },
    { name: "Chocolate Diamante Negro 34g", price: priceToInt("R$ 4,00"), description: "Chocolate Diamante Negro 34g", image_url: null, in_stock: true },
    { name: "Chocolate Lacta ao leite 34g", price: priceToInt("R$ 4,00"), description: "Chocolate Lacta ao leite 34g", image_url: null, in_stock: true },
    { name: "Trident (cereja) 8g", price: priceToInt("R$ 3,00"), description: "Chiclete Trident sabor cereja", image_url: null, in_stock: true },
    { name: "Trident (Intense Black) 8g", price: priceToInt("R$ 3,00"), description: "Chiclete Trident Intense Black", image_url: null, in_stock: true },
    { name: "Trident (menta verde) 8g", price: priceToInt("R$ 3,00"), description: "Chiclete Trident sabor menta verde", image_url: null, in_stock: true },
    { name: "Trident (morango) 8g", price: priceToInt("R$ 3,00"), description: "Chiclete Trident sabor morango", image_url: null, in_stock: true },
    { name: "TRIDENT (senses blueberry) 8g", price: priceToInt("R$ 3,00"), description: "Chiclete Trident Senses Blueberry", image_url: null, in_stock: true },
    { name: "Trident melancia 8g", price: priceToInt("R$ 3,00"), description: "Chiclete Trident sabor melancia", image_url: null, in_stock: true },
    { name: "Trident(tutti fruiti)8g", price: priceToInt("R$ 3,00"), description: "Chiclete Trident sabor tutti-frutti", image_url: null, in_stock: true }
  ],

  // Acessórios e Outros (ID: 6)
  [ProductCategory.Acessorios]: [
    { name: "CARTEIRA PAIOL OURO", price: priceToInt("R$ 18,00"), description: "Carteira de paiol ouro", image_url: null, in_stock: true },
    { name: "CARTEIRA TRADICIONAL E MAMA CADELA", price: priceToInt("R$ 15,00"), description: "Carteira tradicional e mama cadela", image_url: null, in_stock: true },
    { name: "Tabaco", price: priceToInt("R$ 2,00"), description: "Tabaco para enrolar", image_url: null, in_stock: true },
    { name: "UND PAIOL OURO", price: priceToInt("R$ 1,50"), description: "Unidade de paiol ouro", image_url: null, in_stock: true },
    { name: "UND PAIOL TRADICIONAL E MAMA CADELA", price: priceToInt("R$ 1,00"), description: "Unidade de paiol tradicional e mama cadela", image_url: null, in_stock: true }
  ]
};

async function verificarCategorias() {
  console.log('Verificando categorias existentes no Supabase...');
  
  const { data: categories, error } = await supabase
    .from('product_categories')
    .select('*');
    
  if (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
  
  if (!categories || categories.length === 0) {
    console.error('Não foram encontradas categorias! Por favor, crie as categorias primeiro.');
    return false;
  }
  
  console.log('Categorias encontradas:');
  categories.forEach(cat => {
    console.log(`ID: ${cat.id}, Nome: ${cat.name}`);
  });
  
  return true;
}

async function populateProducts() {
  console.log('=== Script de População de Produtos para Supabase ===\n');
  
  try {
    // Primeiro, verifica se as categorias existem
    const categoriasExistem = await verificarCategorias();
    if (!categoriasExistem) {
      console.log('Execute primeiro o script para criar as categorias de produtos.');
      return;
    }
    
    // Verificar se a tabela products existe
    console.log('\nVerificando tabela products...');
    try {
      const { data: checkTable, error: checkError } = await supabase
        .from('products')
        .select('count')
        .limit(1);

      if (checkError) {
        console.error('Erro ao verificar tabela products:', checkError);

        if (checkError.code === 'PGRST116') {
          console.error('A tabela products não existe no Supabase!');
          console.log('Execute primeiro o script SQL para criar a tabela products.');
          return;
        }

        throw checkError;
      }
      
      console.log('✅ Tabela products encontrada.');
    } catch (error) {
      console.error('Erro ao verificar tabela products:', error);
      return;
    }

    console.log('\nIniciando inserção de produtos...');
    
    // Agora, popule os produtos
    let totalProducts = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const categoryId in productsByCategory) {
      const products = productsByCategory[categoryId as unknown as ProductCategory];
      totalProducts += products.length;

      console.log(`\nInserindo produtos da categoria ID ${categoryId}...`);

      for (const product of products) {
        // Preparar objeto do produto para inserção
        const productData = {
          name: product.name,
          price: product.price,
          description: product.description,
          image_url: product.image_url,
          category_id: parseInt(categoryId), 
          in_stock: product.in_stock
        };

        const productWithTimestamps = addTimestamps(productData);

        // Usar upsert para inserir ou atualizar
        const { error } = await supabase
          .from('products')
          .upsert(productWithTimestamps, { 
            onConflict: 'name', 
            ignoreDuplicates: false 
          });

        if (error) {
          console.error(`Erro ao inserir produto "${product.name}":`, error);
          errorCount++;
        } else {
          successCount++;
          console.log(`✅ Produto "${product.name}" inserido com sucesso.`);
        }
      }
    }

    console.log('\n=== RESUMO DA OPERAÇÃO ===');
    console.log(`Total de produtos: ${totalProducts}`);
    console.log(`Inseridos com sucesso: ${successCount}`);
    console.log(`Falhas: ${errorCount}`);

    if (successCount === totalProducts) {
      console.log('\n✅ Todos os produtos foram inseridos com sucesso!');
    } else {
      console.log('\n⚠️ Alguns produtos não puderam ser inseridos. Verifique os erros acima.');
    }

  } catch (error) {
    console.error('Erro durante a população da tabela products:', error);
  }
}

// Executar script
populateProducts();
