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

    console.log('Tabela cash_flow não encontrada. Criando tabela...');
    
    // Criar a tabela usando o cliente SQL direto
    const { error: createTableError } = await supabase
      .from('cash_flow')
      .insert([
        {
          type: 'income',
          category: 'service',
          amount: 100.00,
          description: 'Tabela inicial - teste',
          date: new Date().toISOString().split('T')[0],
          created_by_id: 1
        }
      ]);

    if (createTableError) {
      console.error('Erro ao criar tabela cash_flow:', createTableError);
      
      // Verificar se o erro é porque a tabela não existe
      if (createTableError.code === '42P01') {
        console.log('A tabela não existe, vamos usar SQL do Supabase Dashboard para criá-la.');
        console.log(`
Execute o seguinte SQL no Supabase Dashboard:

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

-- Criar índices para melhorar o desempenho das consultas
CREATE INDEX IF NOT EXISTS idx_cash_flow_date ON cash_flow(date);
CREATE INDEX IF NOT EXISTS idx_cash_flow_appointment_id ON cash_flow(appointment_id);
CREATE INDEX IF NOT EXISTS idx_cash_flow_type_category ON cash_flow(type, category);

-- Alterar a tabela appointments para ter uma referência à tabela cash_flow
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS transaction_id INTEGER REFERENCES cash_flow(id);
        `);
      }
    } else {
      console.log('Tabela cash_flow criada com sucesso!');
    }

  } catch (error) {
    console.error('Erro geral ao criar tabela cash_flow:', error);
  }
}

// Executar a função
createCashFlowTable()
  .then(() => console.log('Operação completa!'))
  .catch(err => console.error('Erro na operação:', err));