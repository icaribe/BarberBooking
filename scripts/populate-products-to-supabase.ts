import { supabase } from '../server/supabase';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

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
    
    // Lista de categorias que queremos verificar
    const categorias = [
      { id: ProductCategory.BarbaECabelo, name: 'Barba e Cabelo', description: 'Produtos para cuidados com barba e cabelo' },
      { id: ProductCategory.Pomadas, name: 'Pomadas', description: 'Pomadas e ceras para modelagem' },
      { id: ProductCategory.BebidasAlcoolicas, name: 'Bebidas Alcoólicas', description: 'Cervejas, destilados e outras bebidas' },
      { id: ProductCategory.BebidasNaoAlcoolicas, name: 'Bebidas Não Alcoólicas', description: 'Águas, refrigerantes e sucos' },
      { id: ProductCategory.Lanches, name: 'Lanches', description: 'Lanches e petiscos para consumo na barbearia' },
      { id: ProductCategory.Acessorios, name: 'Acessórios', description: 'Acessórios diversos para barba e estilo' }
    ];
    
    // Verificar se todas as categorias existem
    for (const categoria of categorias) {
      const { data, error } = await supabase
        .from('product_categories')
        .select('id, name')
        .eq('id', categoria.id)
        .single();
      
      if (error || !data) {
        console.log(`Categoria ${categoria.name} (ID ${categoria.id}) não encontrada, criando...`);
        
        // Inserir a categoria se não existir
        const { data: novaCategoria, error: insertError } = await supabase
          .from('product_categories')
          .insert({
            id: categoria.id,
            name: categoria.name,
            description: categoria.description
          })
          .select()
          .single();
        
        if (insertError) {
          console.error(`Erro ao criar categoria ${categoria.name}:`, insertError);
        } else {
          console.log(`✅ Categoria ${categoria.name} criada com ID ${novaCategoria.id}`);
        }
      } else {
        console.log(`✓ Categoria ${data.name} (ID ${data.id}) já existe.`);
      }
    }
    
    console.log('✅ Verificação de categorias concluída!');
  } catch (error) {
    console.error('❌ Erro ao verificar categorias:', error);
    throw error;
  }
}

/**
 * Popula a tabela de produtos no Supabase com produtos de exemplo.
 */
async function populateProducts() {
  try {
    console.log('Iniciando população de produtos no Supabase...');
    
    // Verificar se as categorias existem antes de inserir produtos
    await verificarCategorias();
    
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
    
    // Limpar produtos existentes
    console.log('Removendo produtos existentes...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .gte('id', 0);
    
    if (deleteError) {
      console.error('❌ Erro ao remover produtos:', deleteError);
      return;
    }
    
    console.log('✅ Produtos removidos com sucesso.');
    
    // Inserir novos produtos
    console.log(`Inserindo ${produtos.length} produtos...`);
    const { data, error } = await supabase
      .from('products')
      .insert(produtos)
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir produtos:', error);
      return;
    }
    
    console.log(`✅ ${data.length} produtos inseridos com sucesso:`);
    
    // Mostrar os produtos inseridos
    data.forEach((produto, index) => {
      const priceInReais = (produto.price / 100).toFixed(2);
      console.log(`${index + 1}. ${produto.name} (ID: ${produto.id}) - R$ ${priceInReais}`);
    });
    
    console.log('\n🎉 População de produtos concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a inserção de produtos:', error);
    process.exit(1);
  }
}

// Executar o script
populateProducts().catch(console.error);