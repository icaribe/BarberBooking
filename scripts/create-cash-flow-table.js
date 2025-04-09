import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Criar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createCashFlowTable() {
  console.log('Criando tabela cash_flow no Supabase...');

  try {
    // Verificar se a tabela já existe
    console.log('Verificando se a tabela cash_flow já existe...');
    
    const { data, error } = await supabase
      .from('cash_flow')
      .select('id')
      .limit(1);
      
    if (!error) {
      console.log('A tabela cash_flow já existe.');
      return;
    }

    // Vamos usar diretamente SQL via função rpc para criar os enums e tabela
    console.log('Tabela cash_flow não encontrada. Criando tabela...');
    
    // Criar os tipos enum primeiro usando SQL direto
    const createEnumsSQL = `
      DO $$
      BEGIN
        -- Criar enum para tipo de transação se não existir
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
          CREATE TYPE transaction_type AS ENUM ('income', 'expense');
        END IF;
        
        -- Criar enum para categoria de transação se não existir
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_category') THEN
          CREATE TYPE transaction_category AS ENUM (
            'service', 'product', 'commission', 'salary', 'rent', 
            'utilities', 'supplies', 'marketing', 'other'
          );
        END IF;
      END $$;
    `;
    
    // Executar SQL para criar os enums
    const { error: enumError } = await supabase.rpc('pg_run_sql', {
      sql: createEnumsSQL
    });
    
    if (enumError) {
      console.error('Erro ao criar enums:', enumError);
      console.log('Tentando criar tabela com tipos de texto simples...');
    } else {
      console.log('Enums criados com sucesso ou já existem.');
    }

    // Criar a tabela cash_flow
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS cash_flow (
        id SERIAL PRIMARY KEY,
        type transaction_type NOT NULL,
        category transaction_category NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        date DATE NOT NULL,
        appointment_id INTEGER REFERENCES appointments(id),
        product_id INTEGER REFERENCES products(id),
        professional_id INTEGER REFERENCES professionals(id),
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const { error: createTableError } = await supabase.rpc('pg_run_sql', {
      sql: createTableSQL
    });

    if (createTableError) {
      console.error('Erro ao criar tabela cash_flow:', createTableError);
      
      // Tentar método alternativo
      const alternativeSQL = `
        CREATE TABLE IF NOT EXISTS cash_flow (
          id SERIAL PRIMARY KEY,
          type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
          category TEXT NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          description TEXT NOT NULL,
          date DATE NOT NULL,
          appointment_id INTEGER REFERENCES appointments(id),
          product_id INTEGER REFERENCES products(id),
          professional_id INTEGER REFERENCES professionals(id),
          created_by_id INTEGER NOT NULL REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      const { error: altError } = await supabase.rpc('pg_run_sql', {
        sql: alternativeSQL
      });
      
      if (altError) {
        console.error('Erro ao criar tabela cash_flow (método alternativo):', altError);
        return;
      }
    }

    console.log('Tabela cash_flow criada com sucesso!');

    // Criar relações entre tabelas se necessário
    const createReferenceSQL = `
      ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS transaction_id INTEGER REFERENCES cash_flow(id);
    `;

    const { error: createReferenceError } = await supabase.rpc('pg_run_sql', {
      sql: createReferenceSQL
    });

    if (createReferenceError) {
      console.error('Erro ao criar referência na tabela appointments:', createReferenceError);
    } else {
      console.log('Referência na tabela appointments criada com sucesso!');
    }

    // Criar índices para melhorar o desempenho das consultas
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_cash_flow_date ON cash_flow(date);
      CREATE INDEX IF NOT EXISTS idx_cash_flow_appointment_id ON cash_flow(appointment_id);
      CREATE INDEX IF NOT EXISTS idx_cash_flow_type_category ON cash_flow(type, category);
    `;

    const { error: createIndexError } = await supabase.rpc('pg_run_sql', {
      sql: createIndexSQL
    });

    if (createIndexError) {
      console.error('Erro ao criar índices na tabela cash_flow:', createIndexError);
    } else {
      console.log('Índices na tabela cash_flow criados com sucesso!');
    }

  } catch (error) {
    console.error('Erro geral ao criar tabela cash_flow:', error);
  }
}

// Executar a função
createCashFlowTable()
  .then(() => console.log('Operação completa!'))
  .catch(err => console.error('Erro na operação:', err));