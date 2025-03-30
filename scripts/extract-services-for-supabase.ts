
import { db } from '../server/db';
import * as schema from '../shared/schema';
import fs from 'fs';

async function extractServicesData() {
  console.log('Extraindo dados de serviços para importação no SQL Editor do Supabase...');

  try {
    // Buscar todos os serviços do banco de dados local
    const services = await db.select().from(schema.services);
    
    if (services.length === 0) {
      console.log('Nenhum serviço encontrado na base de dados.');
      return;
    }

    // Gerar comandos INSERT para o SQL Editor do Supabase
    let sqlCommands = `-- Script de Importação de Serviços para o Supabase\n`;
    sqlCommands += `-- Cole este script no SQL Editor do Supabase e execute\n\n`;
    
    // Adicionar comando para desativar temporariamente as restrições de chave estrangeira, se necessário
    sqlCommands += `-- Comando para desativar restrições temporariamente (opcional)\n`;
    sqlCommands += `-- ALTER TABLE services DISABLE TRIGGER ALL;\n\n`;

    // Comandos INSERT
    sqlCommands += `-- Comandos INSERT para a tabela services\n`;
    
    services.forEach(service => {
      const { id, name, price, priceType, durationMinutes, categoryId, description, createdAt, updatedAt } = service;
      
      // Formatar datas para SQL
      const createdAtStr = createdAt ? `'${createdAt.toISOString()}'` : 'NOW()';
      const updatedAtStr = updatedAt ? `'${updatedAt.toISOString()}'` : 'NOW()';
      
      // Lidar com strings e evitar problemas de aspas
      const escapedName = name.replace(/'/g, "''");
      const escapedDescription = description ? description.replace(/'/g, "''") : null;
      
      sqlCommands += `INSERT INTO services (id, name, price, price_type, duration_minutes, category_id, description, created_at, updated_at)\n`;
      sqlCommands += `VALUES (${id}, '${escapedName}', ${price}, '${priceType}', ${durationMinutes}, ${categoryId}, ${escapedDescription ? `'${escapedDescription}'` : 'NULL'}, ${createdAtStr}, ${updatedAtStr})\n`;
      sqlCommands += `ON CONFLICT (id) DO UPDATE SET \n`;
      sqlCommands += `  name = EXCLUDED.name,\n`;
      sqlCommands += `  price = EXCLUDED.price,\n`;
      sqlCommands += `  price_type = EXCLUDED.price_type,\n`;
      sqlCommands += `  duration_minutes = EXCLUDED.duration_minutes,\n`;
      sqlCommands += `  category_id = EXCLUDED.category_id,\n`;
      sqlCommands += `  description = EXCLUDED.description,\n`;
      sqlCommands += `  updated_at = NOW();\n\n`;
    });
    
    // Adicionar comando para reativar as restrições de chave estrangeira, se necessário
    sqlCommands += `-- Comando para reativar restrições (opcional)\n`;
    sqlCommands += `-- ALTER TABLE services ENABLE TRIGGER ALL;\n\n`;
    
    // Comando para resetar sequência de ID, se necessário
    sqlCommands += `-- Resetar a sequência para o próximo ID (opcional)\n`;
    sqlCommands += `-- SELECT setval('services_id_seq', (SELECT MAX(id) FROM services), true);\n`;
    
    // Salvar o SQL em um arquivo
    fs.writeFileSync('scripts/import-services-to-supabase.sql', sqlCommands);
    
    console.log(`✅ Script SQL gerado com sucesso em 'scripts/import-services-to-supabase.sql'`);
    console.log(`✅ Total de ${services.length} serviços processados.`);
    console.log('Copie o conteúdo deste arquivo e cole no SQL Editor do Supabase.');
    
    // Imprimir o SQL no console para facilitar a cópia
    console.log('\n=== INÍCIO DO SCRIPT SQL ===\n');
    console.log(sqlCommands);
    console.log('=== FIM DO SCRIPT SQL ===\n');
    
  } catch (error) {
    console.error('Erro ao extrair dados de serviços:', error);
  }
}

// Executar a função principal
extractServicesData();
