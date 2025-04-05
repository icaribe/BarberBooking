/**
 * Script para adicionar a coluna role à tabela users no Supabase
 */
import { sql } from 'drizzle-orm';
import { db } from '../server/db';

async function addRoleColumnToUsers() {
  try {
    console.log('Verificando se a coluna role existe na tabela users...');
    
    // Primeiro, criar o tipo enum se não existir
    try {
      await db.execute(sql`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
                CREATE TYPE user_role AS ENUM ('admin', 'professional', 'customer');
            END IF;
        END
        $$;
      `);
      console.log('Tipo enum user_role criado ou já existente');
    } catch (error) {
      console.error('Erro ao criar o tipo enum user_role:', error);
      
      // Se o erro for relacionado à falta de permissão, tente criar a coluna como TEXT
      console.log('Tentando adicionar coluna role como TEXT...');
    }
    
    // Adicionar a coluna à tabela users se não existir
    try {
      await db.execute(sql`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'users'
                AND column_name = 'role'
            ) THEN
                ALTER TABLE users ADD COLUMN role user_role DEFAULT 'customer'::user_role;
            END IF;
        END
        $$;
      `);
      console.log('Coluna role adicionada à tabela users com tipo user_role');
    } catch (error) {
      console.error('Erro ao adicionar coluna role com tipo user_role:', error);
      
      // Tentar adicionar como TEXT se o tipo enum não funcionar
      try {
        await db.execute(sql`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
        `);
        console.log('Coluna role adicionada à tabela users como TEXT');
      } catch (textError) {
        console.error('Erro ao adicionar coluna role como TEXT:', textError);
        throw textError;
      }
    }
    
    // Verificar se a coluna foi adicionada
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role';
    `);
    
    console.log('Resultado da verificação:', result);
    
    if (result && result.length > 0) {
      console.log('Coluna role adicionada com sucesso!');
      return true;
    } else {
      console.log('Não foi possível verificar se a coluna foi adicionada');
      return false;
    }
  } catch (error) {
    console.error('Erro durante o processo de adicionar coluna:', error);
    return false;
  }
}

// Executar a função e finalizar o processo
addRoleColumnToUsers()
  .then(success => {
    if (success) {
      console.log('Processo concluído com sucesso');
      process.exit(0);
    } else {
      console.error('Falha no processo');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Erro não tratado:', err);
    process.exit(1);
  });