
import { db } from '../server/db';
import * as schema from '../shared/schema';

async function listServices() {
  console.log('Listando todos os serviços no banco de dados local:');
  console.log('------------------------------------------------');

  try {
    // Buscar todos os serviços do banco de dados local
    const services = await db.select().from(schema.services);
    
    if (services.length === 0) {
      console.log('Nenhum serviço encontrado na base de dados.');
      return;
    }

    // Buscar categorias para mostrar os nomes junto com os serviços
    const categories = await db.select().from(schema.serviceCategories);
    const categoryMap = new Map();
    categories.forEach(cat => categoryMap.set(cat.id, cat.name));

    // Exibir os serviços em formato tabular
    console.log('ID | Nome                      | Preço    | Duração | Categoria');
    console.log('-------------------------------------------------------------------');
    
    services.forEach(service => {
      const { id, name, price, durationMinutes, categoryId } = service;
      const categoryName = categoryMap.get(categoryId) || 'Categoria não encontrada';
      const priceFormatted = price ? `R$ ${(price / 100).toFixed(2)}` : 'Variável';
      
      // Formatar para exibição em colunas alinhadas
      console.log(
        `${id.toString().padEnd(3)} | ${name.padEnd(25)} | ${priceFormatted.padEnd(8)} | ${durationMinutes}min`.padEnd(50) + 
        ` | ${categoryName}`
      );
    });
    
    console.log('-------------------------------------------------------------------');
    console.log(`Total: ${services.length} serviços encontrados.`);
    
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
  }
}

// Executar a função principal
listServices();
