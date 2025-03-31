import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// URL e chave de API do Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_KEY são necessários no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase com a chave de serviço (service key) que ignora RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

enum ProductCategory {
  BarbaECabelo = 1,
  Pomadas = 2,
  BebidasAlcoolicas = 3,
  BebidasNaoAlcoolicas = 4,
  Lanches = 5,
  Acessorios = 6
}

/**
 * Verifica se as categorias de produtos existem no Supabase
 * antes de iniciar a inserção de produtos.
 */
async function verificarCategorias() {
  try {
    console.log('Verificando categorias de produtos existentes...');
    
    const categoriasEsperadas = [
      { id: ProductCategory.BarbaECabelo, name: 'Produtos para Barba e Cabelo' },
      { id: ProductCategory.Pomadas, name: 'Pomadas e Produtos para Estilização' },
      { id: ProductCategory.BebidasAlcoolicas, name: 'Bebidas Alcoólicas' },
      { id: ProductCategory.BebidasNaoAlcoolicas, name: 'Bebidas Não Alcoólicas' },
      { id: ProductCategory.Lanches, name: 'Lanches e Snacks' },
      { id: ProductCategory.Acessorios, name: 'Acessórios e Outros' }
    ];
    
    // Verificar cada categoria
    for (const categoria of categoriasEsperadas) {
      const { data, error } = await supabaseAdmin
        .from('product_categories')
        .select()
        .eq('id', categoria.id)
        .single();
      
      if (error || !data) {
        console.log(`Categoria ${categoria.name} (ID ${categoria.id}) não encontrada. Criando...`);
        
        // Inserir a categoria
        const { data: insertedData, error: insertError } = await supabaseAdmin
          .from('product_categories')
          .insert({
            id: categoria.id,
            name: categoria.name,
            description: `Categoria para ${categoria.name.toLowerCase()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
        
        if (insertError) {
          console.error(`❌ Erro ao criar categoria ${categoria.name}:`, insertError);
        } else {
          console.log(`✓ Categoria ${categoria.name} (ID ${categoria.id}) criada com sucesso.`);
        }
      } else {
        console.log(`✓ Categoria ${categoria.name} (ID ${categoria.id}) já existe.`);
      }
    }
    
    console.log('✅ Verificação de categorias concluída!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar categorias:', error);
    return false;
  }
}

/**
 * Popula a tabela de produtos no Supabase com produtos de exemplo.
 * Usa a chave de serviço que ignora as políticas RLS.
 */
async function populateProducts() {
  try {
    console.log('Iniciando população de produtos no Supabase...');
    
    // Verificar se as categorias existem
    const categoriasOk = await verificarCategorias();
    if (!categoriasOk) {
      console.error('❌ Erro na verificação de categorias. Abortando inserção de produtos.');
      return;
    }
    
    // Remover produtos existentes
    console.log('Removendo produtos existentes...');
    const { error: deleteError } = await supabaseAdmin
      .from('products')
      .delete()
      .gte('id', 0);
    
    if (deleteError) {
      console.error('❌ Erro ao remover produtos:', deleteError);
      return;
    }
    
    console.log('✅ Produtos removidos com sucesso.');
    
    // Lista de produtos para inserir
    const produtos = [
      // Produtos para Barba e Cabelo
      {
        name: 'Foxidil (Minoxidil para barba)',
        description: 'Solução para crescimento de barba, 60ml',
        price: 7990, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.BarbaECabelo,
        in_stock: true
      },
      {
        name: 'Óleo para Barba Los Barbeiros',
        description: 'Óleo hidratante e modelador para barba, 30ml',
        price: 4500, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.BarbaECabelo,
        in_stock: true
      },
      {
        name: 'Shampoo para Barba',
        description: 'Shampoo especial para limpeza e cuidado da barba, 150ml',
        price: 3550, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.BarbaECabelo,
        in_stock: true
      },
      
      // Pomadas
      {
        name: 'Pomada Modeladora Matte',
        description: 'Pomada com efeito seco para modelagem, 120g',
        price: 3990, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.Pomadas,
        in_stock: true
      },
      {
        name: 'Pomada Modeladora Premium',
        description: 'Pomada com fixação forte e brilho leve, 100g',
        price: 4990, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.Pomadas,
        in_stock: true
      },
      {
        name: 'Cera Modeladora',
        description: 'Cera para definição e textura, 85g',
        price: 3290, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.Pomadas,
        in_stock: true
      },
      
      // Bebidas Alcoólicas
      {
        name: 'Cerveja Artesanal IPA',
        description: 'Cerveja artesanal estilo IPA, 350ml',
        price: 1590, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.BebidasAlcoolicas,
        in_stock: true
      },
      {
        name: 'Whisky 12 anos',
        description: 'Dose de whisky premium envelhecido por 12 anos, 50ml',
        price: 3500, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.BebidasAlcoolicas,
        in_stock: true
      },
      {
        name: 'Gin Tônica',
        description: 'Drink refrescante de gin com água tônica e limão',
        price: 2500, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.BebidasAlcoolicas,
        in_stock: false
      },
      
      // Bebidas Não Alcoólicas
      {
        name: 'Café Especial',
        description: 'Café premium torrado na hora, 80ml',
        price: 850, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.BebidasNaoAlcoolicas,
        in_stock: true
      },
      {
        name: 'Água Mineral',
        description: 'Água mineral sem gás, 500ml',
        price: 500, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.BebidasNaoAlcoolicas,
        in_stock: true
      },
      {
        name: 'Refrigerante',
        description: 'Lata de refrigerante, 350ml',
        price: 700, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.BebidasNaoAlcoolicas,
        in_stock: true
      },
      
      // Lanches
      {
        name: 'Sanduíche Club',
        description: 'Sanduíche completo com frango, bacon e vegetais',
        price: 2990, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.Lanches,
        in_stock: true
      },
      {
        name: 'Mix de Amendoim',
        description: 'Porção de amendoim torrado com especiarias, 100g',
        price: 1200, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.Lanches,
        in_stock: true
      },
      {
        name: 'Tábua de Frios',
        description: 'Seleção de queijos e embutidos com torradas',
        price: 4500, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.Lanches,
        in_stock: true
      },
      
      // Acessórios
      {
        name: 'Pente de Madeira',
        description: 'Pente artesanal de madeira para barba',
        price: 2500, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.Acessorios,
        in_stock: true
      },
      {
        name: 'Kit Tesoura e Pente',
        description: 'Kit com tesoura e pente para manutenção da barba em casa',
        price: 8990, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.Acessorios,
        in_stock: true
      },
      {
        name: 'Necessaire de Couro',
        description: 'Necessaire de couro sintético para produtos de barba',
        price: 5990, // preço em centavos
        image_url: 'https://placekitten.com/300/300',
        category_id: ProductCategory.Acessorios,
        in_stock: true
      }
    ];
    
    // Inserir produtos
    console.log(`Inserindo ${produtos.length} produtos...`);
    
    // Adicionar timestamps aos produtos
    const produtosComTimestamp = produtos.map(produto => ({
      ...produto,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Inserir todos os produtos de uma vez
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(produtosComTimestamp)
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir produtos:', error);
      return;
    }
    
    console.log(`✅ ${data.length} produtos inseridos com sucesso!`);
    
  } catch (error) {
    console.error('❌ Erro ao popular produtos:', error);
  }
}

// Executar a população de produtos
populateProducts().catch(console.error);