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
 * Gera um script SQL para inserir produtos na tabela products
 */
async function generateProductsSQL() {
  try {
    console.log('-- Script SQL para inserir produtos na tabela products');
    console.log('-- Executar este script no SQL Editor do Supabase');
    console.log('');
    
    // Limpar produtos existentes
    console.log('-- Remover produtos existentes');
    console.log('DELETE FROM public.products WHERE id > 0;');
    console.log('');
    
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
    
    // Inserir novos produtos
    console.log('-- Inserir novos produtos');
    console.log('INSERT INTO public.products (name, description, price, image_url, category_id, in_stock)');
    console.log('VALUES');
    
    produtos.forEach((produto, index) => {
      const isLast = index === produtos.length - 1;
      console.log(`  ('${produto.name.replace(/'/g, "''")}', '${produto.description.replace(/'/g, "''")}', ${produto.price}, '${produto.image_url}', ${produto.category_id}, ${produto.in_stock})${isLast ? ';' : ','}`);
    });
    
    console.log('\n-- Fim do script');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

// Executar a geração do script SQL
generateProductsSQL().catch(console.error);