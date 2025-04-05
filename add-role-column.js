// Script para adicionar a coluna role na tabela users
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('SUPABASE_URL ou SUPABASE_SERVICE_KEY não definidos');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addRoleColumn() {
  try {
    console.log('Verificando se a coluna role já existe...');
    
    // Tentar um SELECT com a coluna role para ver se ela já existe
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .limit(1);
    
    // Se não houver erro, a coluna já existe
    if (!error) {
      console.log('A coluna role já existe na tabela users');
      return true;
    }
    
    // Se o erro for do tipo "column does not exist", adicionar a coluna
    if (error && error.code === '42703') {
      console.log('A coluna role não existe. Adicionando...');
      
      // Criar o tipo enum user_role se não existir
      const createEnumSQL = `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
            CREATE TYPE user_role AS ENUM ('admin', 'professional', 'customer');
          END IF;
        END
        $$;
      `;
      
      // Adicionar a coluna role usando o tipo enum user_role
      const addColumnSQL = `
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'customer'::user_role;
      `;
      
      // Executar as consultas SQL diretamente usando o Rest API do Supabase
      const { error: enumError } = await supabase.rpc('exec_sql', { query: createEnumSQL });
      if (enumError) {
        console.error('Erro ao criar o tipo enum user_role:', enumError);
        
        // Tentar uma abordagem alternativa - criar a coluna como texto
        console.log('Tentando criar a coluna como TEXT...');
        const addTextColumnSQL = `
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
        `;
        
        const { error: textColumnError } = await supabase.rpc('exec_sql', { query: addTextColumnSQL });
        if (textColumnError) {
          console.error('Erro ao adicionar coluna role como TEXT:', textColumnError);
          return false;
        }
        
        console.log('Coluna role adicionada como TEXT com sucesso!');
        return true;
      }
      
      const { error: columnError } = await supabase.rpc('exec_sql', { query: addColumnSQL });
      if (columnError) {
        console.error('Erro ao adicionar coluna role:', columnError);
        return false;
      }
      
      console.log('Coluna role adicionada com sucesso!');
      return true;
    }
    
    console.error('Erro ao verificar a coluna role:', error);
    return false;
  } catch (error) {
    console.error('Exceção ao adicionar coluna role:', error);
    return false;
  }
}

// Executar a função
addRoleColumn()
  .then(success => {
    if (success) {
      console.log('Processo concluído com sucesso!');
      process.exit(0);
    } else {
      console.error('Falha no processo de adição da coluna.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Erro ao executar o script:', err);
    process.exit(1);
  });