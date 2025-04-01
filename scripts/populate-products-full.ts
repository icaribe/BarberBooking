import supabase from '../server/supabase';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Enumeração de categorias de produtos com seus IDs correspondentes
enum ProductCategory {
  BarbaECabelo = 1,
  Pomadas = 2,
  BebidasAlcoolicas = 3,
  BebidasNaoAlcoolicas = 4,
  Lanches = 5,
  Acessorios = 6
}

// Tipos de produtos
interface Product {
  name: string;
  description: string;
  price: number; // valor em centavos
  image_url?: string;
  category_id: number;
  in_stock: boolean;
}

/**
 * Verifica se as categorias de produtos existem no Supabase
 * antes de iniciar a inserção de produtos.
 */
async function verificarCategorias() {
  console.log('Verificando categorias existentes...');
  
  const { data: categories, error } = await supabase
    .from('product_categories')
    .select('*');
  
  if (error) {
    console.error('Erro ao verificar categorias:', error);
    process.exit(1);
  }
  
  if (!categories || categories.length < 6) {
    console.error('Erro: É necessário ter as 6 categorias de produtos cadastradas.');
    process.exit(1);
  }
  
  console.log('Categorias encontradas:');
  categories.forEach(cat => {
    console.log(`ID: ${cat.id}, Nome: ${cat.name}`);
  });
  
  return categories;
}

/**
 * Limpa a tabela de produtos antes de inserir novos
 */
async function limparProdutosExistentes() {
  console.log('Removendo produtos existentes...');
  
  const { error } = await supabase
    .from('products')
    .delete()
    .neq('id', 0); // Condição para excluir todos
  
  if (error) {
    console.error('Erro ao limpar produtos:', error);
    process.exit(1);
  }
  
  console.log('Produtos removidos com sucesso!');
}

/**
 * Insere produtos por categoria
 */
async function inserirProdutos() {
  // Verificar categorias
  await verificarCategorias();
  
  // Limpar produtos existentes
  await limparProdutosExistentes();
  
  // Definir produtos por categoria
  const produtosBarbaECabelo: Product[] = [
    { name: 'Foxidil minoxidil para barba (fox) 120 ml', description: 'Minoxidil para crescimento de barba', price: 9000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Bal fox', description: 'Balm hidratante para barba', price: 4000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Balm B.URB para barba', description: 'Balm hidratante para barba', price: 3500, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Balm Red Nek para barba', description: 'Balm hidratante para barba', price: 3500, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Derma Roller', description: 'Ferramenta para microagulhamento', price: 4000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Condicionador 3 em 1', description: 'Condicionador multiuso', price: 3000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Condicionador Ice Fresh Fox 240ml', description: 'Condicionador refrescante para cabelo', price: 2500, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Escova anti estática', description: 'Escova que reduz eletricidade estática', price: 4500, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Esponja de Nudred', description: 'Esponja para cabelos crespos', price: 3000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Loção Hidratante Balm Barba 4 em 1', description: 'Loção multifuncional para barba', price: 3500, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Loção Spray Pós Barba Lenhador', description: 'Spray pós-barba com fragrância lenhadora', price: 3000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Maquina Itan', description: 'Máquina de corte profissional', price: 6000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Minoxidil Kirkland Signature 05% 60ml', description: 'Minoxidil para crescimento de barba e cabelo', price: 9000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Navalha', description: 'Navalha para barbear', price: 3000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Óleo de Barba Lenhador Kerafyto', description: 'Óleo nutritivo para barba', price: 3000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Pente', description: 'Pente para cabelo e barba', price: 2500, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Pente de mão', description: 'Pente portátil para ajustes rápidos', price: 300, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Perfume de barba', description: 'Fragrância especial para barba', price: 2500, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Perfumes', description: 'Diversas fragrâncias', price: 3000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Shampoo 3 em 1', description: 'Shampoo multifuncional', price: 3000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Shampoo anti-caspa', description: 'Combate eficaz contra caspa', price: 3000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Shampoo com minoxidill', description: 'Shampoo que estimula crescimento', price: 3000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Shampoo Ice Fresh Fox 240ml', description: 'Shampoo refrescante para cabelo', price: 2500, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Shampoo preto', description: 'Shampoo com pigmento escuro', price: 3000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
    { name: 'Tonico capilar', description: 'Tônico para fortalecimento capilar', price: 3000, category_id: ProductCategory.BarbaECabelo, in_stock: true },
  ];

  const pomadas: Product[] = [
    { name: 'Cera Red Neck Cinza', description: 'Cera modeladora para penteados', price: 2000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Cera Red Neck Laranja', description: 'Cera modeladora para penteados', price: 2000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Cera Red Neck Roxa', description: 'Cera modeladora para penteados', price: 2000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Cera Red Neck Verde', description: 'Cera modeladora para penteados', price: 2000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Cera Red Neck Vermelho', description: 'Cera modeladora para penteados', price: 2000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada efeito teia lenhador 120g', description: 'Pomada para efeito texturizado', price: 3000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada fox verde 120g', description: 'Pomada modeladora', price: 3000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada 60g Pequena (Máxima e Lenhador)', description: 'Pomada tamanho pequeno', price: 2000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada black Fox 120g', description: 'Pomada com pigmento escuro', price: 3000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada black lenhador 120g', description: 'Pomada com pigmento escuro', price: 3000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada caramelo fox 120g', description: 'Pomada com tom caramelo', price: 3000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada Conhaque', description: 'Pomada com tom conhaque', price: 3000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada Efeito teia Fox 120g', description: 'Pomada para efeito texturizado', price: 3000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada em pó', description: 'Pomada em formato de pó para volume', price: 3000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada hair fox laranja 120g', description: 'Pomada modeladora', price: 3000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada matte lenhador 120g', description: 'Pomada com acabamento fosco', price: 3000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada Modeladora Caramelo', description: 'Pomada com tom caramelo', price: 3000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada pequena CREAM', description: 'Pomada cremosa tamanho pequeno', price: 2500, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada Pequnea', description: 'Pomada tamanho pequeno', price: 2000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada toque seco fox 120g', description: 'Pomada com acabamento seco', price: 3000, category_id: ProductCategory.Pomadas, in_stock: true },
    { name: 'Pomada Tradicional lenhador 120g', description: 'Pomada clássica modeladora', price: 3000, category_id: ProductCategory.Pomadas, in_stock: true },
  ];

  const bebidasAlcoolicas: Product[] = [
    { name: 'BUDWEISER LONG NECK', description: 'Cerveja Budweiser 330ml', price: 700, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'Campari', description: 'Dose de Campari', price: 600, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'CORONA LONG NECK', description: 'Cerveja Corona 330ml', price: 800, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'Coronita', description: 'Cerveja Corona 210ml', price: 700, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE ALAMBIQUE MURICI', description: 'Cachaça artesanal de murici', price: 200, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE CACHAÇA 51', description: 'Dose de cachaça 51', price: 400, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE CORTEZANO', description: 'Dose de Cortezano', price: 200, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE MONTILLA', description: 'Dose de Montilla', price: 300, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE OLD PARR 12 ANOS', description: 'Dose de whisky Old Parr 12 anos', price: 1800, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE ORLOFF VODKA', description: 'Dose de vodka Orloff', price: 600, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE PARATUDO', description: 'Dose de cachaça Paratudo', price: 500, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE SÃO JOÃO DA BARRA', description: 'Dose de cachaça São João da Barra', price: 400, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE SELETA', description: 'Dose de cachaça Seleta', price: 500, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE TEQUILA OURO (JOSE CUERVO)', description: 'Dose de tequila ouro Jose Cuervo', price: 1000, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE TEQUILA PRATA (JOSE CUERVO)', description: 'Dose de tequila prata Jose Cuervo', price: 900, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE VELHO BARREIRO', description: 'Dose de cachaça Velho Barreiro', price: 400, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE VODKA SKYY', description: 'Dose de vodka Skyy', price: 800, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE Vodka SMIRNOFFF', description: 'Dose de vodka Smirnoff', price: 700, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE WHISKEY BLACK LABEL', description: 'Dose de whisky Johnnie Walker Black Label', price: 1800, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE WHISKEY CHIVAS 12 ANOS', description: 'Dose de whisky Chivas Regal 12 anos', price: 1800, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE WHISKEY JACK DANIELS', description: 'Dose de whisky Jack Daniels', price: 1600, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE WHISKEY RED LABEL', description: 'Dose de whisky Johnnie Walker Red Label', price: 1100, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'DOSE WHITE HORSE', description: 'Dose de whisky White Horse', price: 1000, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'MONSTER ABSOLUT', description: 'Energético Monster com vodka Absolut', price: 1000, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'RIBEIRAO COLORADO LONG NECK', description: 'Cerveja Colorado Ribeirão Lager 330ml', price: 1000, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'SPATEN 600ML', description: 'Cerveja Spaten 600ml', price: 1300, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'SPATEN LONG NECK', description: 'Cerveja Spaten 330ml', price: 700, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'STELLA ARTOIS LONG NECK 330ml', description: 'Cerveja Stella Artois 330ml', price: 700, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
    { name: 'Patagônia IPA 355ml', description: 'Cerveja Patagônia IPA 355ml', price: 800, category_id: ProductCategory.BebidasAlcoolicas, in_stock: true },
  ];

  const bebidasNaoAlcoolicas: Product[] = [
    { name: 'AGUA COM GAS', description: 'Água mineral com gás', price: 350, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'Agua com gas + Limão', description: 'Água com gás e limão', price: 350, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'AGUA MINERAL', description: 'Água mineral sem gás', price: 300, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'Antarctica Lata', description: 'Refrigerante Antarctica lata 350ml', price: 350, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'ANTARCTICA ORIGINAL 600ml', description: 'Refrigerante Antarctica 600ml', price: 1300, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'APPIA COLORADO 300ML', description: 'Cerveja sem álcool Colorado Appia 300ml', price: 700, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'Chopp Stadt', description: 'Chopp Stadt sem álcool', price: 600, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'COCA 310ML', description: 'Coca-Cola lata 310ml', price: 450, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'COCA ZERO LATA 310ML', description: 'Coca-Cola Zero lata 310ml', price: 400, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'COCA-COLA KS', description: 'Coca-Cola garrafa 290ml', price: 500, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'HEINEKEN ZERO ALCOOL 330ml', description: 'Cerveja sem álcool Heineken 330ml', price: 700, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'Monster de goiaba', description: 'Energético Monster sabor goiaba', price: 1000, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'Monster de Laranja', description: 'Energético Monster sabor laranja', price: 1000, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'MONSTER MANGO LOKO', description: 'Energético Monster sabor manga', price: 1000, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'Monster Melancia', description: 'Energético Monster sabor melancia', price: 1000, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'Monster Tradicional 473ml', description: 'Energético Monster tradicional 473ml', price: 1000, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'GATORADE (MoRANGO)', description: 'Isotônico Gatorade sabor morango', price: 600, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'GATOREDE(limão)', description: 'Isotônico Gatorade sabor limão', price: 600, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'GATOREDE(MARACUJA)', description: 'Isotônico Gatorade sabor maracujá', price: 600, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'POWERADE SABORES 500ML', description: 'Isotônico Powerade diversos sabores 500ml', price: 500, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'RED BULL ENERGETICO', description: 'Energético Red Bull', price: 1000, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'Suco de Manga', description: 'Suco de manga', price: 450, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'Suco de maracuja', description: 'Suco de maracujá', price: 450, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'SUCO GOIABA 290ML', description: 'Suco de goiaba 290ml', price: 450, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
    { name: 'SUCO UVA 290 ML', description: 'Suco de uva 290ml', price: 450, category_id: ProductCategory.BebidasNaoAlcoolicas, in_stock: true },
  ];

  const lanches: Product[] = [
    { name: 'Barra de Cereal', description: 'Barra de cereal diversos sabores', price: 250, category_id: ProductCategory.Lanches, in_stock: true },
    { name: 'Barra de cereal banana', description: 'Barra de cereal sabor banana', price: 300, category_id: ProductCategory.Lanches, in_stock: true },
    { name: 'Barra de cereal coco + frutas', description: 'Barra de cereal sabor coco com frutas', price: 300, category_id: ProductCategory.Lanches, in_stock: true },
    { name: 'Chocolate 5 Star 40g', description: 'Chocolate 5 Star 40g', price: 400, category_id: ProductCategory.Lanches, in_stock: true },
    { name: 'Chocolate branco Laka 34g', description: 'Chocolate branco Lacta Laka 34g', price: 400, category_id: ProductCategory.Lanches, in_stock: true },
    { name: 'Chocolate Diamante Negro 34g', description: 'Chocolate meio amargo Diamante Negro 34g', price: 400, category_id: ProductCategory.Lanches, in_stock: true },
    { name: 'Chocolate Lacta ao leite 34g', description: 'Chocolate Lacta ao leite 34g', price: 400, category_id: ProductCategory.Lanches, in_stock: true },
    { name: 'Trident (cereja) 8g', description: 'Chiclete Trident sabor cereja 8g', price: 300, category_id: ProductCategory.Lanches, in_stock: true },
    { name: 'Trident (Intense Black) 8g', description: 'Chiclete Trident sabor menta intensa 8g', price: 300, category_id: ProductCategory.Lanches, in_stock: true },
    { name: 'Trident (menta verde) 8g', description: 'Chiclete Trident sabor menta verde 8g', price: 300, category_id: ProductCategory.Lanches, in_stock: true },
    { name: 'Trident (morango) 8g', description: 'Chiclete Trident sabor morango 8g', price: 300, category_id: ProductCategory.Lanches, in_stock: true },
    { name: 'TRIDENT (senses blueberry) 8g', description: 'Chiclete Trident sabor blueberry 8g', price: 300, category_id: ProductCategory.Lanches, in_stock: true },
    { name: 'Trident melancia 8g', description: 'Chiclete Trident sabor melancia 8g', price: 300, category_id: ProductCategory.Lanches, in_stock: true },
    { name: 'Trident(tutti fruiti)8g', description: 'Chiclete Trident sabor tutti-frutti 8g', price: 300, category_id: ProductCategory.Lanches, in_stock: true },
  ];

  const acessorios: Product[] = [
    { name: 'CARTEIRA PAIOL OURO', description: 'Carteira de tabaco Paiol Ouro', price: 1800, category_id: ProductCategory.Acessorios, in_stock: true },
    { name: 'CARTEIRA TRADICIONAL E MAMA CADELA', description: 'Carteira de tabaco tradicional', price: 1500, category_id: ProductCategory.Acessorios, in_stock: true },
    { name: 'Tabaco', description: 'Tabaco para cigarro', price: 200, category_id: ProductCategory.Acessorios, in_stock: true },
    { name: 'UND PAIOL OURO', description: 'Unidade de tabaco Paiol Ouro', price: 150, category_id: ProductCategory.Acessorios, in_stock: true },
    { name: 'UND PAIOL TRADICIONAL E MAMA CADELA', description: 'Unidade de tabaco tradicional', price: 100, category_id: ProductCategory.Acessorios, in_stock: true },
  ];

  // Todos os produtos
  const todosProdutos = [
    ...produtosBarbaECabelo,
    ...pomadas,
    ...bebidasAlcoolicas,
    ...bebidasNaoAlcoolicas,
    ...lanches,
    ...acessorios
  ];

  console.log(`Total de produtos a serem inseridos: ${todosProdutos.length}`);

  // Inserir produtos em lotes para evitar sobrecarga
  const BATCH_SIZE = 25;
  let sucessos = 0;
  let falhas = 0;

  for (let i = 0; i < todosProdutos.length; i += BATCH_SIZE) {
    const lote = todosProdutos.slice(i, i + BATCH_SIZE);
    
    console.log(`Inserindo lote ${Math.ceil((i+1)/BATCH_SIZE)} de ${Math.ceil(todosProdutos.length/BATCH_SIZE)}...`);
    
    const { data, error } = await supabase
      .from('products')
      .insert(lote)
      .select();
    
    if (error) {
      console.error(`Erro ao inserir lote ${Math.ceil((i+1)/BATCH_SIZE)}:`, error);
      falhas += lote.length;
    } else {
      console.log(`Lote ${Math.ceil((i+1)/BATCH_SIZE)} inserido com sucesso! (${data.length} produtos)`);
      sucessos += data.length;
    }
  }

  console.log('\nResultado final:');
  console.log(`✅ Produtos inseridos com sucesso: ${sucessos}`);
  console.log(`❌ Produtos com falhas: ${falhas}`);
  console.log(`Total de produtos processados: ${todosProdutos.length}`);
}

// Executar o script
inserirProdutos().catch(error => {
  console.error('Erro ao executar o script:', error);
  process.exit(1);
});