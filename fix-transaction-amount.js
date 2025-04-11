import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Criar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fixTransactionAmount() {
  try {
    console.log('Corrigindo valor da transação do agendamento #7...');
    
    // Buscar a transação
    const { data: transaction, error } = await supabase
      .from('cash_flow')
      .select('*')
      .eq('id', 7)
      .single();
    
    if (error) {
      console.error('Erro ao buscar transação:', error);
      return;
    }
    
    console.log('Transação encontrada:');
    console.log('ID:', transaction.id);
    console.log('Valor atual: R$', transaction.amount);
    
    // Corrigir o valor (30 reais em vez de 0.30)
    const { data: updatedTx, error: updateError } = await supabase
      .from('cash_flow')
      .update({ amount: 30 })
      .eq('id', 7)
      .select()
      .single();
    
    if (updateError) {
      console.error('Erro ao atualizar valor da transação:', updateError);
    } else {
      console.log('Valor da transação atualizado com sucesso!');
      console.log('Novo valor: R$', updatedTx.amount);
    }
    
  } catch (error) {
    console.error('Erro geral ao corrigir valor da transação:', error);
  }
}

fixTransactionAmount();