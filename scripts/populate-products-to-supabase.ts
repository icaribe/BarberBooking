import { supabase } from '../server/supabase';

// Lista de categorias e seus respectivos IDs
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
  // Produtos para Barba e Cabelo
  [ProductCategory.BarbaECabelo]: [
    { name: "Foxidil minoxidil para barba (fox) 120 ml", price: 9000, description: "Minoxidil para crescimento da barba", inStock: true },
    { name: "Bal fox", price: 4000, description: "Bálsamo para barba da Fox", inStock: true },
    { name: "Balm B.URB para barba", price: 3500, description: "Bálsamo para barba da marca B.URB", inStock: true },
    { name: "Balm Red Nek para barba", price: 3500, description: "Bálsamo para barba da marca Red Nek", inStock: true },
    { name: "Derma Roller", price: 4000, description: "Equipamento para microagulhamento capilar", inStock: true },
    { name: "Condicionador 3 em 1", price: 3000, description: "Condicionador multifuncional 3 em 1", inStock: true },
    { name: "Condicionador Ice Fresh Fox 240ml", price: 2500, description: "Condicionador refrescante", inStock: true },
    { name: "Escova anti estática", price: 4500, description: "Escova especial anti estática", inStock: true },
    { name: "Esponja de Nudred", price: 3000, description: "Esponja para cabelo crespo", inStock: true },
    { name: "Loção Hidratante Balm Barba 4 em 1", price: 3500, description: "Loção multifuncional para barba", inStock: true },
    { name: "Loção Spray Pós Barba Lenhador", price: 3000, description: "Loção pós-barba refrescante", inStock: true },
    { name: "Maquina Itan", price: 6000, description: "Máquina de corte profissional", inStock: true },
    { name: "Minoxidil Kirkland Signature 05% 60ml", price: 9000, description: "Minoxidil importado para crescimento capilar", inStock: true },
    { name: "Navalha", price: 3000, description: "Navalha para barbear profissional", inStock: true },
    { name: "Óleo de Barba Lenhador Kerafyto", price: 3000, description: "Óleo hidratante para barba", inStock: true },
    { name: "Pente", price: 2500, description: "Pente para cabelo", inStock: true },
    { name: "Pente de mão", price: 300, description: "Pente portátil pequeno", inStock: true },
    { name: "Perfume de barba", price: 2500, description: "Perfume específico para barba", inStock: true },
    { name: "Perfumes", price: 3000, description: "Perfumes variados", inStock: true },
    { name: "Shampoo 3 em 1", price: 3000, description: "Shampoo multifuncional", inStock: true },
    { name: "Shampoo anti-caspa", price: 3000, description: "Shampoo para combate à caspa", inStock: true },
    { name: "Shampoo com minoxidill", price: 3000, description: "Shampoo com minoxidil para crescimento capilar", inStock: true },
    { name: "Shampoo Ice Fresh Fox 240ml", price: 2500, description: "Shampoo refrescante Fox", inStock: true },
    { name: "Shampoo preto", price: 3000, description: "Shampoo tonalizante preto", inStock: true },
    { name: "Tonico capilar", price: 3000, description: "Tônico para fortalecimento capilar", inStock: true }
  ],

  // Pomadas e Produtos para Estilização
  [ProductCategory.Pomadas]: [
    { name: "Cera Red Neck Cinza", price: 2000, description: "Cera de fixação média, acabamento matte", inStock: true },
    { name: "Cera Red Neck Laranja", price: 2000, description: "Cera de fixação forte, acabamento brilhante", inStock: true },
    { name: "Cera Red Neck Roxa", price: 2000, description: "Cera de fixação forte, acabamento matte", inStock: true },
    { name: "Cera Red Neck Verde", price: 2000, description: "Cera de fixação média, acabamento brilhante", inStock: true },
    { name: "Cera Red Neck Vermelho", price: 2000, description: "Cera de fixação extra forte, acabamento matte", inStock: true },
    { name: "Pomada efeito teia lenhador 120g", price: 3000, description: "Pomada com textura para efeito teia", inStock: true },
    { name: "Pomada fox verde 120g", price: 3000, description: "Pomada da Fox com acabamento médio", inStock: true },
    { name: "Pomada 60g Pequena (Máxima e Lenhador)", price: 2000, description: "Pomada pequena de alto desempenho", inStock: true },
    { name: "Pomada black Fox 120g", price: 3000, description: "Pomada Black da Fox, alta fixação", inStock: true },
    { name: "Pomada black lenhador 120g", price: 3000, description: "Pomada Black Lenhador, alta fixação", inStock: true },
    { name: "Pomada caramelo fox 120g", price: 3000, description: "Pomada Fox caramelo, fixação média", inStock: true },
    { name: "Pomada Conhaque", price: 3000, description: "Pomada com aroma de conhaque, fixação média", inStock: true },
    { name: "Pomada Efeito teia Fox 120g", price: 3000, description: "Pomada Fox com efeito teia", inStock: true },
    { name: "Pomada em pó", price: 3000, description: "Pomada em pó para volume e textura", inStock: true },
    { name: "Pomada hair fox laranja 120g", price: 3000, description: "Pomada Fox laranja, fixação forte", inStock: true },
    { name: "Pomada matte lenhador 120g", price: 3000, description: "Pomada matte acabamento seco", inStock: true },
    { name: "Pomada Modeladora Caramelo", price: 3000, description: "Pomada modeladora coloração caramelo", inStock: true },
    { name: "Pomada pequena CREAM", price: 2500, description: "Pomada pequena cremosa", inStock: true },
    { name: "Pomada Pequnea", price: 2000, description: "Pomada pequena para uso diário", inStock: true },
    { name: "Pomada toque seco fox 120g", price: 3000, description: "Pomada com acabamento seco Fox", inStock: true },
    { name: "Pomada Tradicional lenhador 120g", price: 3000, description: "Pomada tradicional Lenhador", inStock: true }
  ],

  // Bebidas Alcoólicas
  [ProductCategory.BebidasAlcoolicas]: [
    { name: "BUDWEISER LONG NECK", price: 700, description: "Cerveja Budweiser Long Neck", inStock: true },
    { name: "Campari", price: 600, description: "Dose de Campari", inStock: true },
    { name: "CORONA LONG NECK", price: 800, description: "Cerveja Corona Long Neck", inStock: true },
    { name: "Coronita", price: 700, description: "Cerveja Coronita", inStock: true },
    { name: "DOSE ALAMBIQUE MURICI", price: 200, description: "Dose de cachaça artesanal", inStock: true },
    { name: "DOSE CACHAÇA 51", price: 400, description: "Dose de cachaça 51", inStock: true },
    { name: "DOSE CORTEZANO", price: 200, description: "Dose de Cortezano", inStock: true },
    { name: "DOSE MONTILLA", price: 300, description: "Dose de Montilla", inStock: true },
    { name: "DOSE OLD PARR 12 ANOS", price: 1800, description: "Dose de whisky Old Parr 12 anos", inStock: true },
    { name: "DOSE ORLOFF VODKA", price: 600, description: "Dose de vodka Orloff", inStock: true },
    { name: "DOSE PARATUDO", price: 500, description: "Dose de cachaça Paratudo", inStock: true },
    { name: "DOSE SÃO JOÃO DA BARRA", price: 400, description: "Dose de cachaça São João da Barra", inStock: true },
    { name: "DOSE SELETA", price: 500, description: "Dose de cachaça Seleta", inStock: true },
    { name: "DOSE TEQUILA OURO (JOSE CUERVO)", price: 1000, description: "Dose de tequila ouro José Cuervo", inStock: true },
    { name: "DOSE TEQUILA PRATA (JOSE CUERVO)", price: 900, description: "Dose de tequila prata José Cuervo", inStock: true },
    { name: "DOSE VELHO BARREIRO", price: 400, description: "Dose de cachaça Velho Barreiro", inStock: true },
    { name: "DOSE VODKA SKYY", price: 800, description: "Dose de vodka Skyy", inStock: true },
    { name: "DOSE Vodka SMIRNOFFF", price: 700, description: "Dose de vodka Smirnoff", inStock: true },
    { name: "DOSE WHISKEY BLACK LABEL", price: 1800, description: "Dose de whisky Johnnie Walker Black Label", inStock: true },
    { name: "DOSE WHISKEY CHIVAS 12 ANOS", price: 1800, description: "Dose de whisky Chivas Regal 12 anos", inStock: true },
    { name: "DOSE WHISKEY JACK DANIELS", price: 1600, description: "Dose de whisky Jack Daniel's", inStock: true },
    { name: "DOSE WHISKEY RED LABEL", price: 1100, description: "Dose de whisky Johnnie Walker Red Label", inStock: true },
    { name: "DOSE WHITE HORSE", price: 1000, description: "Dose de whisky White Horse", inStock: true },
    { name: "MONSTER ABSOLUT", price: 1000, description: "Drink Monster com vodka Absolut", inStock: true },
    { name: "RIBEIRAO COLORADO LONG NECK", price: 1000, description: "Cerveja Colorado Ribeirão Lager", inStock: true },
    { name: "SPATEN 600ML", price: 1300, description: "Cerveja Spaten 600ml", inStock: true },
    { name: "SPATEN LONG NECK", price: 700, description: "Cerveja Spaten Long Neck", inStock: true },
    { name: "STELLA ARTOIS LONG NECK 330ml", price: 700, description: "Cerveja Stella Artois Long Neck", inStock: true },
    { name: "Patagônia IPA 355ml", price: 800, description: "Cerveja Patagônia IPA", inStock: true }
  ],

  // Bebidas Não Alcoólicas
  [ProductCategory.BebidasNaoAlcoolicas]: [
    { name: "AGUA COM GAS", price: 350, description: "Água mineral com gás", inStock: true },
    { name: "Agua com gas + Limão", price: 350, description: "Água mineral com gás e limão", inStock: true },
    { name: "AGUA MINERAL", price: 300, description: "Água mineral sem gás", inStock: true },
    { name: "Antarctica Lata", price: 350, description: "Refrigerante Antarctica em lata", inStock: true },
    { name: "ANTARCTICA ORIGINAL 600ml", price: 1300, description: "Cerveja Antarctica Original 600ml", inStock: true },
    { name: "APPIA COLORADO 300ML", price: 700, description: "Cerveja Colorado Appia 300ml", inStock: true },
    { name: "Chopp Stadt", price: 600, description: "Chopp Stadt", inStock: true },
    { name: "COCA 310ML", price: 450, description: "Coca-Cola lata 310ml", inStock: true },
    { name: "COCA ZERO LATA 310ML", price: 400, description: "Coca-Cola Zero lata 310ml", inStock: true },
    { name: "COCA-COLA KS", price: 500, description: "Coca-Cola KS", inStock: true },
    { name: "HEINEKEN ZERO ALCOOL 330ml", price: 700, description: "Cerveja Heineken Zero Álcool", inStock: true },
    { name: "Monster de goiaba", price: 1000, description: "Energético Monster sabor goiaba", inStock: true },
    { name: "Monster de Laranja", price: 1000, description: "Energético Monster sabor laranja", inStock: true },
    { name: "MONSTER MANGO LOKO", price: 1000, description: "Energético Monster Mango Loko", inStock: true },
    { name: "Monster Melancia", price: 1000, description: "Energético Monster sabor melancia", inStock: true },
    { name: "Monster Tradicional 473ml", price: 1000, description: "Energético Monster tradicional", inStock: true },
    { name: "GATORADE (MoRANGO)", price: 600, description: "Isotônico Gatorade sabor morango", inStock: true },
    { name: "GATOREDE(limão)", price: 600, description: "Isotônico Gatorade sabor limão", inStock: true },
    { name: "GATOREDE(MARACUJA)", price: 600, description: "Isotônico Gatorade sabor maracujá", inStock: true },
    { name: "POWERADE SABORES 500ML", price: 500, description: "Isotônico Powerade diversos sabores", inStock: true },
    { name: "RED BULL ENERGETICO", price: 1000, description: "Energético Red Bull", inStock: true },
    { name: "Suco de Manga", price: 450, description: "Suco natural de manga", inStock: true },
    { name: "Suco de maracuja", price: 450, description: "Suco natural de maracujá", inStock: true },
    { name: "SUCO GOIABA 290ML", price: 450, description: "Suco de goiaba 290ml", inStock: true },
    { name: "SUCO UVA 290 ML", price: 450, description: "Suco de uva 290ml", inStock: true }
  ],

  // Lanches e Snacks
  [ProductCategory.Lanches]: [
    { name: "Barra de Cereal", price: 250, description: "Barra de cereal diversos sabores", inStock: true },
    { name: "Barra de cereal banana", price: 300, description: "Barra de cereal sabor banana", inStock: true },
    { name: "Barra de cereal coco + frutas", price: 300, description: "Barra de cereal sabor coco com frutas", inStock: true },
    { name: "Chocolate 5 Star 40g", price: 400, description: "Chocolate 5 Star 40g", inStock: true },
    { name: "Chocolate branco Laka 34g", price: 400, description: "Chocolate branco Lacta 34g", inStock: true },
    { name: "Chocolate Diamante Negro 34g", price: 400, description: "Chocolate Diamante Negro 34g", inStock: true },
    { name: "Chocolate Lacta ao leite 34g", price: 400, description: "Chocolate Lacta ao leite 34g", inStock: true },
    { name: "Trident (cereja) 8g", price: 300, description: "Chiclete Trident sabor cereja", inStock: true },
    { name: "Trident (Intense Black) 8g", price: 300, description: "Chiclete Trident Intense Black", inStock: true },
    { name: "Trident (menta verde) 8g", price: 300, description: "Chiclete Trident sabor menta verde", inStock: true },
    { name: "Trident (morango) 8g", price: 300, description: "Chiclete Trident sabor morango", inStock: true },
    { name: "TRIDENT (senses blueberry) 8g", price: 300, description: "Chiclete Trident Senses Blueberry", inStock: true },
    { name: "Trident melancia 8g", price: 300, description: "Chiclete Trident sabor melancia", inStock: true },
    { name: "Trident(tutti fruiti)8g", price: 300, description: "Chiclete Trident sabor tutti-frutti", inStock: true }
  ],

  // Acessórios e Outros
  [ProductCategory.Acessorios]: [
    { name: "CARTEIRA PAIOL OURO", price: 1800, description: "Carteira de paiol ouro", inStock: true },
    { name: "CARTEIRA TRADICIONAL E MAMA CADELA", price: 1500, description: "Carteira tradicional e mama cadela", inStock: true },
    { name: "Tabaco", price: 200, description: "Tabaco para enrolar", inStock: true },
    { name: "UND PAIOL OURO", price: 150, description: "Unidade de paiol ouro", inStock: true },
    { name: "UND PAIOL TRADICIONAL E MAMA CADELA", price: 100, description: "Unidade de paiol tradicional e mama cadela", inStock: true }
  ]
};

async function populateProductCategories() {
  console.log('Verificando categorias de produtos...');

  const categories = [
    { id: 1, name: "Produtos para Barba e Cabelo", icon: "scissors" },
    { id: 2, name: "Pomadas e Produtos para Estilização", icon: "disc" },
    { id: 3, name: "Bebidas Alcoólicas", icon: "wine" },
    { id: 4, name: "Bebidas Não Alcoólicas", icon: "coffee" },
    { id: 5, name: "Lanches e Snacks", icon: "burger" },
    { id: 6, name: "Acessórios e Outros", icon: "shopping-bag" }
  ];

  for (const category of categories) {
    console.log(`Verificando categoria: ${category.name}`);

    const { data: existingCategory, error: checkError } = await supabase
      .from('product_categories')
      .select('*')
      .eq('id', category.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error(`Erro ao verificar categoria ${category.name}:`, checkError);
      continue;
    }

    if (!existingCategory) {
      const { error } = await supabase
        .from('product_categories')
        .insert([addTimestamps(category)]);

      if (error) {
        console.error(`Erro ao inserir categoria ${category.name}:`, error);
      } else {
        console.log(`✅ Categoria ${category.name} inserida com sucesso.`);
      }
    } else {
      console.log(`⏭️ Categoria ${category.name} já existe.`);
    }
  }

  console.log('Processo de verificação de categorias concluído.\n');
}

async function populateProducts() {
  console.log('Iniciando população da tabela products no Supabase...');

  try {
    // Verificar se a tabela existe
    const { data: checkTable, error: checkError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (checkError) {
      console.error('Erro ao verificar tabela products:', checkError);

      if (checkError.code === 'PGRST116') {
        console.error('A tabela products não existe no Supabase!');
        console.log('Execute primeiro o script SQL para criar as tabelas.');
        return;
      }

      throw checkError;
    }

    console.log('Tabela products encontrada, prosseguindo com a inserção de dados...');

    // Primeiro, popule as categorias
    await populateProductCategories();

    // Agora, popule os produtos
    let totalProducts = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const categoryId in productsByCategory) {
      const products = productsByCategory[categoryId as unknown as ProductCategory];
      totalProducts += products.length;

      console.log(`\nInserindo produtos da categoria ID ${categoryId}...`);

      for (const product of products) {
        const productWithCategoryId = {
          ...product,
          category_id: parseInt(categoryId) // Corrected field name here
        };

        const productWithTimestamps = addTimestamps(productWithCategoryId);

        const { error } = await supabase
          .from('products')
          .upsert(productWithTimestamps, { onConflict: 'name' });

        if (error) {
          console.error(`Erro ao inserir produto ${product.name}:`, error);
          errorCount++;
        } else {
          successCount++;
          console.log(`✅ Produto ${product.name} inserido com sucesso.`);
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

// Função principal
async function main() {
  console.log('=== Script de População de Produtos para Supabase ===\n');

  // Popula os produtos
  await populateProducts();

  console.log('\nOperação concluída.');
}

// Executar script
main();