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

// Função para converter preço de formato R$ XX,XX para centavos (inteiro)
const priceToInt = (priceStr: string): number => {
  const numericValue = parseFloat(priceStr.replace('R$ ', '').replace(',', '.'));
  return Math.round(numericValue * 100);
};

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
 * Popula a tabela de produtos no Supabase com a lista completa de produtos.
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
    
    // Lista completa de produtos
    const produtosBarbaECabelo = [
      { name: 'Foxidil minoxidil para barba (fox) 120 ml', price: 'R$ 90,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Bal fox', price: 'R$ 40,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Balm B.URB para barba', price: 'R$ 35,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Balm Red Nek para barba', price: 'R$ 35,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Derma Roller', price: 'R$ 40,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Condicionador 3 em 1', price: 'R$ 30,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Condicionador Ice Fresh Fox 240ml', price: 'R$ 25,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Escova anti estática', price: 'R$ 45,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Esponja de Nudred', price: 'R$ 30,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Loção Hidratante Balm Barba 4 em 1', price: 'R$ 35,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Loção Spray Pós Barba Lenhador', price: 'R$ 30,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Maquina Itan', price: 'R$ 60,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Minoxidil Kirkland Signature 05% 60ml', price: 'R$ 90,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Navalha', price: 'R$ 30,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Óleo de Barba Lenhador Kerafyto', price: 'R$ 30,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Pente', price: 'R$ 25,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Pente de mão', price: 'R$ 3,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Perfume de barba', price: 'R$ 25,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Perfumes', price: 'R$ 30,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Shampoo 3 em 1', price: 'R$ 30,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Shampoo anti-caspa', price: 'R$ 30,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Shampoo com minoxidill', price: 'R$ 30,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Shampoo Ice Fresh Fox 240ml', price: 'R$ 25,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Shampoo preto', price: 'R$ 30,00', category_id: ProductCategory.BarbaECabelo },
      { name: 'Tonico capilar', price: 'R$ 30,00', category_id: ProductCategory.BarbaECabelo }
    ];
    
    const produtosPomadas = [
      { name: 'Cera Red Neck Cinza', price: 'R$ 20,00', category_id: ProductCategory.Pomadas },
      { name: 'Cera Red Neck Laranja', price: 'R$ 20,00', category_id: ProductCategory.Pomadas },
      { name: 'Cera Red Neck Roxa', price: 'R$ 20,00', category_id: ProductCategory.Pomadas },
      { name: 'Cera Red Neck Verde', price: 'R$ 20,00', category_id: ProductCategory.Pomadas },
      { name: 'Cera Red Neck Vermelho', price: 'R$ 20,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada efeito teia lenhador 120g', price: 'R$ 30,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada fox verde 120g', price: 'R$ 30,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada 60g Pequena (Máxima e Lenhador)', price: 'R$ 20,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada black Fox 120g', price: 'R$ 30,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada black lenhador 120g', price: 'R$ 30,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada caramelo fox 120g', price: 'R$ 30,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada Conhaque', price: 'R$ 30,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada Efeito teia Fox 120g', price: 'R$ 30,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada em pó', price: 'R$ 30,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada hair fox laranja 120g', price: 'R$ 30,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada matte lenhador 120g', price: 'R$ 30,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada Modeladora Caramelo', price: 'R$ 30,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada pequena CREAM', price: 'R$ 25,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada Pequnea', price: 'R$ 20,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada toque seco fox 120g', price: 'R$ 30,00', category_id: ProductCategory.Pomadas },
      { name: 'Pomada Tradicional lenhador 120g', price: 'R$ 30,00', category_id: ProductCategory.Pomadas }
    ];
    
    const produtosBebidasAlcoolicas = [
      { name: 'BUDWEISER LONG NECK', price: 'R$ 7,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'Campari', price: 'R$ 6,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'CORONA LONG NECK', price: 'R$ 8,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'Coronita', price: 'R$ 7,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE ALAMBIQUE MURICI', price: 'R$ 2,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE CACHAÇA 51', price: 'R$ 4,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE CORTEZANO', price: 'R$ 2,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE MONTILLA', price: 'R$ 3,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE OLD PARR 12 ANOS', price: 'R$ 18,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE ORLOFF VODKA', price: 'R$ 6,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE PARATUDO', price: 'R$ 5,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE SÃO JOÃO DA BARRA', price: 'R$ 4,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE SELETA', price: 'R$ 5,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE TEQUILA OURO (JOSE CUERVO)', price: 'R$ 10,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE TEQUILA PRATA (JOSE CUERVO)', price: 'R$ 9,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE VELHO BARREIRO', price: 'R$ 4,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE VODKA SKYY', price: 'R$ 8,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE Vodka SMIRNOFFF', price: 'R$ 7,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE WHISKEY BLACK LABEL', price: 'R$ 18,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE WHISKEY CHIVAS 12 ANOS', price: 'R$ 18,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE WHISKEY JACK DANIELS', price: 'R$ 16,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE WHISKEY RED LABEL', price: 'R$ 11,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'DOSE WHITE HORSE', price: 'R$ 10,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'MONSTER ABSOLUT', price: 'R$ 10,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'RIBEIRAO COLORADO LONG NECK', price: 'R$ 10,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'SPATEN 600ML', price: 'R$ 13,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'SPATEN LONG NECK', price: 'R$ 7,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'STELLA ARTOIS LONG NECK 330ml', price: 'R$ 7,00', category_id: ProductCategory.BebidasAlcoolicas },
      { name: 'Patagônia IPA 355ml', price: 'R$ 8,00', category_id: ProductCategory.BebidasAlcoolicas }
    ];
    
    const produtosBebidasNaoAlcoolicas = [
      { name: 'AGUA COM GAS', price: 'R$ 3,50', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'Agua com gas + Limão', price: 'R$ 3,50', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'AGUA MINERAL', price: 'R$ 3,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'Antarctica Lata', price: 'R$ 3,50', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'ANTARCTICA ORIGINAL 600ml', price: 'R$ 13,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'APPIA COLORADO 300ML', price: 'R$ 7,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'Chopp Stadt', price: 'R$ 6,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'COCA 310ML', price: 'R$ 4,50', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'COCA ZERO LATA 310ML', price: 'R$ 4,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'COCA-COLA KS', price: 'R$ 5,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'HEINEKEN ZERO ALCOOL 330ml', price: 'R$ 7,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'Monster de goiaba', price: 'R$ 10,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'Monster de Laranja', price: 'R$ 10,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'MONSTER MANGO LOKO', price: 'R$ 10,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'Monster Melancia', price: 'R$ 10,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'Monster Tradicional 473ml', price: 'R$ 10,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'GATORADE (MoRANGO)', price: 'R$ 6,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'GATOREDE(limão)', price: 'R$ 6,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'GATOREDE(MARACUJA)', price: 'R$ 6,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'POWERADE SABORES 500ML', price: 'R$ 5,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'RED BULL ENERGETICO', price: 'R$ 10,00', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'Suco de Manga', price: 'R$ 4,50', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'Suco de maracuja', price: 'R$ 4,50', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'SUCO GOIABA 290ML', price: 'R$ 4,50', category_id: ProductCategory.BebidasNaoAlcoolicas },
      { name: 'SUCO UVA 290 ML', price: 'R$ 4,50', category_id: ProductCategory.BebidasNaoAlcoolicas }
    ];
    
    const produtosLanches = [
      { name: 'Barra de Cereal', price: 'R$ 2,50', category_id: ProductCategory.Lanches },
      { name: 'Barra de cereal banana', price: 'R$ 3,00', category_id: ProductCategory.Lanches },
      { name: 'Barra de cereal coco + frutas', price: 'R$ 3,00', category_id: ProductCategory.Lanches },
      { name: 'Chocolate 5 Star 40g', price: 'R$ 4,00', category_id: ProductCategory.Lanches },
      { name: 'Chocolate branco Laka 34g', price: 'R$ 4,00', category_id: ProductCategory.Lanches },
      { name: 'Chocolate Diamante Negro 34g', price: 'R$ 4,00', category_id: ProductCategory.Lanches },
      { name: 'Chocolate Lacta ao leite 34g', price: 'R$ 4,00', category_id: ProductCategory.Lanches },
      { name: 'Trident (cereja) 8g', price: 'R$ 3,00', category_id: ProductCategory.Lanches },
      { name: 'Trident (Intense Black) 8g', price: 'R$ 3,00', category_id: ProductCategory.Lanches },
      { name: 'Trident (menta verde) 8g', price: 'R$ 3,00', category_id: ProductCategory.Lanches },
      { name: 'Trident (morango) 8g', price: 'R$ 3,00', category_id: ProductCategory.Lanches },
      { name: 'TRIDENT (senses blueberry) 8g', price: 'R$ 3,00', category_id: ProductCategory.Lanches },
      { name: 'Trident melancia 8g', price: 'R$ 3,00', category_id: ProductCategory.Lanches },
      { name: 'Trident(tutti fruiti)8g', price: 'R$ 3,00', category_id: ProductCategory.Lanches }
    ];
    
    const produtosAcessorios = [
      { name: 'CARTEIRA PAIOL OURO', price: 'R$ 18,00', category_id: ProductCategory.Acessorios },
      { name: 'CARTEIRA TRADICIONAL E MAMA CADELA', price: 'R$ 15,00', category_id: ProductCategory.Acessorios },
      { name: 'Tabaco', price: 'R$ 2,00', category_id: ProductCategory.Acessorios },
      { name: 'UND PAIOL OURO', price: 'R$ 1,50', category_id: ProductCategory.Acessorios },
      { name: 'UND PAIOL TRADICIONAL E MAMA CADELA', price: 'R$ 1,00', category_id: ProductCategory.Acessorios }
    ];
    
    // Combinar todos os produtos em uma única lista
    const todosProdutos = [
      ...produtosBarbaECabelo,
      ...produtosPomadas,
      ...produtosBebidasAlcoolicas,
      ...produtosBebidasNaoAlcoolicas,
      ...produtosLanches,
      ...produtosAcessorios
    ];
    
    // Processar produtos para adicionar todos os campos necessários
    const produtosProcessados = todosProdutos.map(produto => ({
      name: produto.name,
      description: `${produto.name} - Los Barbeiros CBS`,
      price: priceToInt(produto.price),
      image_url: 'https://placekitten.com/300/300', // Imagem de placeholder
      category_id: produto.category_id,
      in_stock: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Inserir todos os produtos de uma vez
    console.log(`Inserindo ${produtosProcessados.length} produtos...`);
    
    // Dividir os produtos em lotes de 50 para evitar problemas com limites de API
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    
    // Inserir em lotes
    for (let i = 0; i < produtosProcessados.length; i += batchSize) {
      const batch = produtosProcessados.slice(i, i + batchSize);
      
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`❌ Erro ao inserir lote de produtos (${i + 1} a ${i + batch.length}):`, error);
        errorCount += batch.length;
      } else if (data) {
        successCount += data.length;
        console.log(`✅ Lote de ${data.length} produtos inserido com sucesso (${successCount} total)`);
      }
    }
    
    console.log(`\n✅ Processo concluído: ${successCount} produtos inseridos com sucesso (${errorCount} falhas)`);
    
  } catch (error) {
    console.error('❌ Erro ao popular produtos:', error);
  }
}

// Executar a população de produtos
populateProducts().catch(console.error);