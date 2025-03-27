import pg from 'pg';
const { Client } = pg;

async function addDemoData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Conectado ao banco de dados');

    // Adicionar mais serviços
    const serviceInserts = [
      `INSERT INTO services (name, price, price_type, duration_minutes, category_id, description) 
       VALUES ('Barba Tradicional', 2500, 'fixed', 30, 2, 'Serviço completo de barba com toalha quente') 
       ON CONFLICT (id) DO NOTHING RETURNING id`,
      
      `INSERT INTO services (name, price, price_type, duration_minutes, category_id, description) 
       VALUES ('Sobrancelha na Navalha', 1500, 'fixed', 15, 4, 'Modelagem de sobrancelha com navalha') 
       ON CONFLICT (id) DO NOTHING RETURNING id`,
      
      `INSERT INTO services (name, price, price_type, duration_minutes, category_id, description) 
       VALUES ('Corte Degradê', 3500, 'fixed', 40, 1, 'Corte com técnica de degradê') 
       ON CONFLICT (id) DO NOTHING RETURNING id`,
      
      `INSERT INTO services (name, price, price_type, duration_minutes, category_id, description) 
       VALUES ('Limpeza de Pele', 4500, 'fixed', 30, 3, 'Limpeza facial profunda') 
       ON CONFLICT (id) DO NOTHING RETURNING id`,
      
      `INSERT INTO services (name, price, price_type, duration_minutes, category_id, description) 
       VALUES ('Relaxamento Capilar', 7000, 'variable', 60, 5, 'Tratamento para alisar os cabelos') 
       ON CONFLICT (id) DO NOTHING RETURNING id`,
      
      `INSERT INTO services (name, price, price_type, duration_minutes, category_id, description) 
       VALUES ('Pigmentação de Barba', 4000, 'fixed', 45, 2, 'Preenchimento da barba com pigmentos') 
       ON CONFLICT (id) DO NOTHING RETURNING id`,
      
      `INSERT INTO services (name, price, price_type, duration_minutes, category_id, description) 
       VALUES ('Coloração', 6000, 'variable', 60, 6, 'Coloração completa dos cabelos') 
       ON CONFLICT (id) DO NOTHING RETURNING id`
    ];

    // Adicionar mais produtos
    const productInserts = [
      `INSERT INTO products (name, price, description, image_url, category_id, in_stock) 
       VALUES ('Minoxidil Foxidil', 8900, 'Loção para crescimento de barba, 60ml', 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80', 1, true) 
       ON CONFLICT (id) DO NOTHING RETURNING id`,
      
      `INSERT INTO products (name, price, description, image_url, category_id, in_stock) 
       VALUES ('Pomada Matte', 3900, 'Pomada matte para cabelo, fixação média', 'https://images.unsplash.com/photo-1523293915678-d126868e96c1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80', 2, true) 
       ON CONFLICT (id) DO NOTHING RETURNING id`,
      
      `INSERT INTO products (name, price, description, image_url, category_id, in_stock) 
       VALUES ('Whisky Jack Daniels', 12000, 'Garrafa 750ml', 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80', 3, true) 
       ON CONFLICT (id) DO NOTHING RETURNING id`,
      
      `INSERT INTO products (name, price, description, image_url, category_id, in_stock) 
       VALUES ('Café Espresso', 500, 'Café espresso fresco', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1637&q=80', 4, true) 
       ON CONFLICT (id) DO NOTHING RETURNING id`,
      
      `INSERT INTO products (name, price, description, image_url, category_id, in_stock) 
       VALUES ('Sanduíche Club', 1500, 'Sanduíche com frango, bacon e salada', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1173&q=80', 5, true) 
       ON CONFLICT (id) DO NOTHING RETURNING id`,
      
      `INSERT INTO products (name, price, description, image_url, category_id, in_stock) 
       VALUES ('Pente de Madeira', 2500, 'Pente de madeira para barba', 'https://images.unsplash.com/photo-1590236541265-54ef88ab6bfb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1025&q=80', 6, true) 
       ON CONFLICT (id) DO NOTHING RETURNING id`
    ];

    // Adicionar mais profissionais
    const professionalInserts = [
      `INSERT INTO professionals (name, avatar, rating, review_count, specialties, bio) 
       VALUES ('Paulo', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80', 47, 78, ARRAY['Barba', 'Sobrancelha'], 'Especialista em barbearia tradicional com 10 anos de experiência.') 
       ON CONFLICT (id) DO NOTHING RETURNING id`,
      
      `INSERT INTO professionals (name, avatar, rating, review_count, specialties, bio) 
       VALUES ('Marcelo', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80', 50, 132, ARRAY['Coloração', 'Tratamentos'], 'Especializado em colorações e tratamentos capilares.') 
       ON CONFLICT (id) DO NOTHING RETURNING id`
    ];

    // Executar inserções
    console.log('Adicionando serviços...');
    for (const insert of serviceInserts) {
      const res = await client.query(insert);
      if (res.rows.length > 0) {
        console.log(`Serviço adicionado com ID: ${res.rows[0].id}`);
      }
    }

    console.log('Adicionando produtos...');
    for (const insert of productInserts) {
      const res = await client.query(insert);
      if (res.rows.length > 0) {
        console.log(`Produto adicionado com ID: ${res.rows[0].id}`);
      }
    }

    console.log('Adicionando profissionais...');
    for (const insert of professionalInserts) {
      const res = await client.query(insert);
      if (res.rows.length > 0) {
        console.log(`Profissional adicionado com ID: ${res.rows[0].id}`);
      }
    }

    console.log('Dados de demonstração adicionados com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar dados de demonstração:', error);
  } finally {
    await client.end();
    console.log('Conexão com o banco de dados encerrada');
  }
}

addDemoData().catch(console.error);