import { db } from './server/db.js';
import { products, productCategories } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function clearCurrentProducts() {
  try {
    console.log('Removendo todos os produtos atuais...');
    await db.delete(products);
    console.log('Removendo todas as categorias de produtos atuais...');
    await db.delete(productCategories);
    console.log('Dados removidos com sucesso!');
  } catch (error) {
    console.error('Erro ao remover dados:', error);
    process.exit(1);
  }
}

async function addProductCategories() {
  try {
    console.log('Adicionando categorias de produtos...');
    
    const categories = [
      { name: "Produtos para Barba e Cabelo", icon: "scissors" },
      { name: "Pomadas e Produtos para Estilização", icon: "disc" },
      { name: "Bebidas Alcoólicas", icon: "wine" },
      { name: "Bebidas Não Alcoólicas", icon: "coffee" },
      { name: "Lanches e Snacks", icon: "burger" },
      { name: "Acessórios e Outros", icon: "shopping-bag" }
    ];

    for (const category of categories) {
      await db.insert(productCategories).values(category);
    }
    
    console.log('Categorias de produtos adicionadas com sucesso!');
    
    // Retornar as categorias inseridas para obter os IDs
    return await db.select().from(productCategories);
  } catch (error) {
    console.error('Erro ao adicionar categorias de produtos:', error);
    process.exit(1);
  }
}

async function addProducts(categories) {
  try {
    console.log('Adicionando produtos...');
    
    // Mapear nomes de categorias para IDs
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });
    
    // Produtos para Barba e Cabelo (Categoria 1)
    const barbaECabeloId = categoryMap["Produtos para Barba e Cabelo"];
    const barbaECabelo = [
      { name: "Foxidil minoxidil para barba (fox) 120 ml", price: 9000, description: "Minoxidil para crescimento de barba", categoryId: barbaECabeloId, inStock: true },
      { name: "Bal fox", price: 4000, description: "Balm para hidratação de barba", categoryId: barbaECabeloId, inStock: true },
      { name: "Balm B.URB para barba", price: 3500, description: "Balm para hidratação da barba", categoryId: barbaECabeloId, inStock: true },
      { name: "Balm Red Nek para barba", price: 3500, description: "Balm para hidratação de barba", categoryId: barbaECabeloId, inStock: true },
      { name: "Derma Roller", price: 4000, description: "Equipamento para microagulhamento", categoryId: barbaECabeloId, inStock: true },
      { name: "Condicionador 3 em 1", price: 3000, description: "Condicionador multifuncional", categoryId: barbaECabeloId, inStock: true },
      { name: "Condicionador Ice Fresh Fox 240ml", price: 2500, description: "Condicionador refrescante", categoryId: barbaECabeloId, inStock: true },
      { name: "Escova anti estática", price: 4500, description: "Escova especializada", categoryId: barbaECabeloId, inStock: true },
      { name: "Esponja de Nudred", price: 3000, description: "Esponja para cabelo", categoryId: barbaECabeloId, inStock: true },
      { name: "Loção Hidratante Balm Barba 4 em 1", price: 3500, description: "Loção multifuncional", categoryId: barbaECabeloId, inStock: true },
      { name: "Loção Spray Pós Barba Lenhador", price: 3000, description: "Loção pós-barba", categoryId: barbaECabeloId, inStock: true },
      { name: "Maquina Itan", price: 6000, description: "Máquina de corte", categoryId: barbaECabeloId, inStock: true },
      { name: "Minoxidil Kirkland Signature 05% 60ml", price: 9000, description: "Minoxidil importado", categoryId: barbaECabeloId, inStock: true },
      { name: "Navalha", price: 3000, description: "Navalha profissional", categoryId: barbaECabeloId, inStock: true },
      { name: "Óleo de Barba Lenhador Kerafyto", price: 3000, description: "Óleo para barba", categoryId: barbaECabeloId, inStock: true },
      { name: "Pente", price: 2500, description: "Pente profissional", categoryId: barbaECabeloId, inStock: true },
      { name: "Pente de mão", price: 300, description: "Pente pequeno para carregar", categoryId: barbaECabeloId, inStock: true },
      { name: "Perfume de barba", price: 2500, description: "Perfume para barba", categoryId: barbaECabeloId, inStock: true },
      { name: "Perfumes", price: 3000, description: "Perfumes variados", categoryId: barbaECabeloId, inStock: true },
      { name: "Shampoo 3 em 1", price: 3000, description: "Shampoo multifuncional", categoryId: barbaECabeloId, inStock: true },
      { name: "Shampoo anti-caspa", price: 3000, description: "Shampoo especializado", categoryId: barbaECabeloId, inStock: true },
      { name: "Shampoo com minoxidill", price: 3000, description: "Shampoo para crescimento", categoryId: barbaECabeloId, inStock: true },
      { name: "Shampoo Ice Fresh Fox 240ml", price: 2500, description: "Shampoo refrescante", categoryId: barbaECabeloId, inStock: true },
      { name: "Shampoo preto", price: 3000, description: "Shampoo com tonalizante", categoryId: barbaECabeloId, inStock: true },
      { name: "Tonico capilar", price: 3000, description: "Tônico para cabelo", categoryId: barbaECabeloId, inStock: true },
    ];
    
    // Pomadas e Produtos para Estilização (Categoria 2)
    const pomadasId = categoryMap["Pomadas e Produtos para Estilização"];
    const pomadas = [
      { name: "Cera Red Neck Cinza", price: 2000, description: "Cera para modelagem", categoryId: pomadasId, inStock: true },
      { name: "Cera Red Neck Laranja", price: 2000, description: "Cera para modelagem", categoryId: pomadasId, inStock: true },
      { name: "Cera Red Neck Roxa", price: 2000, description: "Cera para modelagem", categoryId: pomadasId, inStock: true },
      { name: "Cera Red Neck Verde", price: 2000, description: "Cera para modelagem", categoryId: pomadasId, inStock: true },
      { name: "Cera Red Neck Vermelho", price: 2000, description: "Cera para modelagem", categoryId: pomadasId, inStock: true },
      { name: "Pomada efeito teia lenhador 120g", price: 3000, description: "Pomada de efeito teia", categoryId: pomadasId, inStock: true },
      { name: "Pomada fox verde 120g", price: 3000, description: "Pomada modeladora", categoryId: pomadasId, inStock: true },
      { name: "Pomada 60g Pequena (Máxima e Lenhador)", price: 2000, description: "Pomada tamanho pequeno", categoryId: pomadasId, inStock: true },
      { name: "Pomada black Fox 120g", price: 3000, description: "Pomada black", categoryId: pomadasId, inStock: true },
      { name: "Pomada black lenhador 120g", price: 3000, description: "Pomada black lenhador", categoryId: pomadasId, inStock: true },
      { name: "Pomada caramelo fox 120g", price: 3000, description: "Pomada caramelo", categoryId: pomadasId, inStock: true },
      { name: "Pomada Conhaque", price: 3000, description: "Pomada conhaque", categoryId: pomadasId, inStock: true },
      { name: "Pomada Efeito teia Fox 120g", price: 3000, description: "Pomada efeito teia", categoryId: pomadasId, inStock: true },
      { name: "Pomada em pó", price: 3000, description: "Pomada formato pó", categoryId: pomadasId, inStock: true },
      { name: "Pomada hair fox laranja 120g", price: 3000, description: "Pomada laranja", categoryId: pomadasId, inStock: true },
      { name: "Pomada matte lenhador 120g", price: 3000, description: "Pomada matte", categoryId: pomadasId, inStock: true },
      { name: "Pomada Modeladora Caramelo", price: 3000, description: "Pomada modeladora", categoryId: pomadasId, inStock: true },
      { name: "Pomada pequena CREAM", price: 2500, description: "Pomada cream pequena", categoryId: pomadasId, inStock: true },
      { name: "Pomada Pequena", price: 2000, description: "Pomada pequena", categoryId: pomadasId, inStock: true },
      { name: "Pomada toque seco fox 120g", price: 3000, description: "Pomada toque seco", categoryId: pomadasId, inStock: true },
      { name: "Pomada Tradicional lenhador 120g", price: 3000, description: "Pomada tradicional", categoryId: pomadasId, inStock: true },
    ];
    
    // Bebidas Alcoólicas (Categoria 3)
    const bebidasAlcoolicasId = categoryMap["Bebidas Alcoólicas"];
    const bebidasAlcoolicas = [
      { name: "BUDWEISER LONG NECK", price: 700, description: "Cerveja long neck", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "Campari", price: 600, description: "Aperitivo", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "CORONA LONG NECK", price: 800, description: "Cerveja long neck", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "Coronita", price: 700, description: "Cerveja long neck", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE ALAMBIQUE MURICI", price: 200, description: "Dose de cachaça", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE CACHAÇA 51", price: 400, description: "Dose de cachaça", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE CORTEZANO", price: 200, description: "Dose de destilado", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE MONTILLA", price: 300, description: "Dose de destilado", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE OLD PARR 12 ANOS", price: 1800, description: "Dose de whisky", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE ORLOFF VODKA", price: 600, description: "Dose de vodka", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE PARATUDO", price: 500, description: "Dose de cachaça", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE SÃO JOÃO DA BARRA", price: 400, description: "Dose de cachaça", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE SELETA", price: 500, description: "Dose de cachaça", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE TEQUILA OURO (JOSE CUERVO)", price: 1000, description: "Dose de tequila", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE TEQUILA PRATA (JOSE CUERVO)", price: 900, description: "Dose de tequila", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE VELHO BARREIRO", price: 400, description: "Dose de cachaça", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE VODKA SKYY", price: 800, description: "Dose de vodka", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE Vodka SMIRNOFFF", price: 700, description: "Dose de vodka", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE WHISKEY BLACK LABEL", price: 1800, description: "Dose de whisky", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE WHISKEY CHIVAS 12 ANOS", price: 1800, description: "Dose de whisky", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE WHISKEY JACK DANIELS", price: 1600, description: "Dose de whisky", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE WHISKEY RED LABEL", price: 1100, description: "Dose de whisky", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "DOSE WHITE HORSE", price: 1000, description: "Dose de whisky", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "MONSTER ABSOLUT", price: 1000, description: "Energético com vodka", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "RIBEIRAO COLORADO LONG NECK", price: 1000, description: "Cerveja long neck", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "SPATEN 600ML", price: 1300, description: "Cerveja garrafa", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "SPATEN LONG NECK", price: 700, description: "Cerveja long neck", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "STELLA ARTOIS LONG NECK 330ml", price: 700, description: "Cerveja long neck", categoryId: bebidasAlcoolicasId, inStock: true },
      { name: "Patagônia IPA 355ml", price: 800, description: "Cerveja long neck", categoryId: bebidasAlcoolicasId, inStock: true },
    ];
    
    // Bebidas Não Alcoólicas (Categoria 4)
    const bebidasNaoAlcoolicasId = categoryMap["Bebidas Não Alcoólicas"];
    const bebidasNaoAlcoolicas = [
      { name: "AGUA COM GAS", price: 350, description: "Água mineral com gás", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "Agua com gas + Limão", price: 350, description: "Água com gás e limão", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "AGUA MINERAL", price: 300, description: "Água mineral sem gás", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "Antarctica Lata", price: 350, description: "Refrigerante lata", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "ANTARCTICA ORIGINAL 600ml", price: 1300, description: "Cerveja sem álcool", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "APPIA COLORADO 300ML", price: 700, description: "Cerveja sem álcool", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "Chopp Stadt", price: 600, description: "Chopp sem álcool", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "COCA 310ML", price: 450, description: "Refrigerante lata", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "COCA ZERO LATA 310ML", price: 400, description: "Refrigerante zero lata", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "COCA-COLA KS", price: 500, description: "Refrigerante garrafa", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "HEINEKEN ZERO ALCOOL 330ml", price: 700, description: "Cerveja sem álcool", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "Monster de goiaba", price: 1000, description: "Energético sabor goiaba", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "Monster de Laranja", price: 1000, description: "Energético sabor laranja", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "MONSTER MANGO LOKO", price: 1000, description: "Energético sabor manga", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "Monster Melancia", price: 1000, description: "Energético sabor melancia", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "Monster Tradicional 473ml", price: 1000, description: "Energético tradicional", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "GATORADE (MoRANGO)", price: 600, description: "Isotônico sabor morango", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "GATOREDE(limão)", price: 600, description: "Isotônico sabor limão", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "GATOREDE(MARACUJA)", price: 600, description: "Isotônico sabor maracujá", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "POWERADE SABORES 500ML", price: 500, description: "Isotônico diversos sabores", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "RED BULL ENERGETICO", price: 1000, description: "Energético Red Bull", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "Suco de Manga", price: 450, description: "Suco de manga", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "Suco de maracuja", price: 450, description: "Suco de maracujá", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "SUCO GOIABA 290ML", price: 450, description: "Suco de goiaba", categoryId: bebidasNaoAlcoolicasId, inStock: true },
      { name: "SUCO UVA 290 ML", price: 450, description: "Suco de uva", categoryId: bebidasNaoAlcoolicasId, inStock: true },
    ];
    
    // Lanches e Snacks (Categoria 5)
    const lanchesId = categoryMap["Lanches e Snacks"];
    const lanches = [
      { name: "Barra de Cereal", price: 250, description: "Barra de cereal diversos sabores", categoryId: lanchesId, inStock: true },
      { name: "Barra de cereal banana", price: 300, description: "Barra de cereal sabor banana", categoryId: lanchesId, inStock: true },
      { name: "Barra de cereal coco + frutas", price: 300, description: "Barra de cereal sabor coco com frutas", categoryId: lanchesId, inStock: true },
      { name: "Chocolate 5 Star 40g", price: 400, description: "Chocolate 5 Star", categoryId: lanchesId, inStock: true },
      { name: "Chocolate branco Laka 34g", price: 400, description: "Chocolate branco", categoryId: lanchesId, inStock: true },
      { name: "Chocolate Diamante Negro 34g", price: 400, description: "Chocolate ao leite", categoryId: lanchesId, inStock: true },
      { name: "Chocolate Lacta ao leite 34g", price: 400, description: "Chocolate ao leite", categoryId: lanchesId, inStock: true },
      { name: "Trident (cereja) 8g", price: 300, description: "Chiclete sabor cereja", categoryId: lanchesId, inStock: true },
      { name: "Trident (Intense Black) 8g", price: 300, description: "Chiclete sabor black", categoryId: lanchesId, inStock: true },
      { name: "Trident (menta verde) 8g", price: 300, description: "Chiclete sabor menta", categoryId: lanchesId, inStock: true },
      { name: "Trident (morango) 8g", price: 300, description: "Chiclete sabor morango", categoryId: lanchesId, inStock: true },
      { name: "TRIDENT (senses blueberry) 8g", price: 300, description: "Chiclete sabor blueberry", categoryId: lanchesId, inStock: true },
      { name: "Trident melancia 8g", price: 300, description: "Chiclete sabor melancia", categoryId: lanchesId, inStock: true },
      { name: "Trident(tutti fruiti)8g", price: 300, description: "Chiclete sabor tutti-frutti", categoryId: lanchesId, inStock: true },
    ];
    
    // Acessórios e Outros (Categoria 6)
    const acessoriosId = categoryMap["Acessórios e Outros"];
    const acessorios = [
      { name: "CARTEIRA PAIOL OURO", price: 1800, description: "Carteira de tabaco", categoryId: acessoriosId, inStock: true },
      { name: "CARTEIRA TRADICIONAL E MAMA CADELA", price: 1500, description: "Carteira de tabaco", categoryId: acessoriosId, inStock: true },
      { name: "Tabaco", price: 200, description: "Tabaco", categoryId: acessoriosId, inStock: true },
      { name: "UND PAIOL OURO", price: 150, description: "Unidade de paiol", categoryId: acessoriosId, inStock: true },
      { name: "UND PAIOL TRADICIONAL E MAMA CADELA", price: 100, description: "Unidade de paiol", categoryId: acessoriosId, inStock: true },
    ];
    
    // Juntar todos os produtos
    const allProducts = [
      ...barbaECabelo,
      ...pomadas,
      ...bebidasAlcoolicas,
      ...bebidasNaoAlcoolicas,
      ...lanches,
      ...acessorios
    ];
    
    // Inserir todos os produtos
    for (const product of allProducts) {
      await db.insert(products).values(product);
    }
    
    console.log(`${allProducts.length} produtos adicionados com sucesso!`);
  } catch (error) {
    console.error('Erro ao adicionar produtos:', error);
    process.exit(1);
  }
}

async function main() {
  await clearCurrentProducts();
  const categories = await addProductCategories();
  await addProducts(categories);
  console.log('Atualização concluída com sucesso!');
  process.exit(0);
}

main();