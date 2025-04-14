/**
 * Script para corrigir todos os valores de transações na tabela cash_flow
 * Este script corrige o problema de valores armazenados em reais em vez de centavos
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config();

// Criar cliente Supabase diretamente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Formatar moeda
const formatCurrency = (valueInCents) => `R$ ${(valueInCents/100).toFixed(2)}`;

async function fixAllTransactions() {
  try {
    console.log('Iniciando correção de todos os valores de transações...');
    console.log('Este script converte valores armazenados em reais para centavos');
    
    // Buscar todas as transações com valores pequenos (provavelmente em reais em vez de centavos)
    const { data: smallTransactions, error: txError } = await supabase
      .from('cash_flow')
      .select('*')
      .lt('amount', 100);
    
    if (txError) {
      console.error('Erro ao buscar transações:', txError);
      throw txError;
    }
    
    console.log(`\nEncontradas ${smallTransactions?.length || 0} transações com valores pequenos (< 100 centavos)`);
    
    // Corrigir cada transação
    for (const tx of smallTransactions || []) {
      console.log(`\nCorrigindo transação ID: ${tx.id}`);
      console.log(`Descrição: ${tx.description}`);
      console.log(`Valor atual: ${formatCurrency(tx.amount)} (${tx.amount} centavos)`);
      
      // Multiplicar o valor por 100 para converter de reais para centavos
      const newAmount = Math.round(tx.amount * 100);
      console.log(`Novo valor: ${formatCurrency(newAmount)} (${newAmount} centavos)`);
      
      // Atualizar o valor
      const { data: updateResult, error: updateError } = await supabase
        .from('cash_flow')
        .update({ amount: newAmount })
        .eq('id', tx.id);
      
      if (updateError) {
        console.error('Erro ao atualizar valor:', updateError);
      } else {
        console.log('✅ Valor atualizado com sucesso!');
      }
    }
    
    // Verificar o faturamento mensal após a correção
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Janeiro é 0
    const currentYear = today.getFullYear();
    
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
    const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
    
    console.log(`\nVerificando faturamento do mês atual (${startOfMonth} - ${endOfMonth})...`);
    
    const { data: monthTransactions, error: monthError } = await supabase
      .from('cash_flow')
      .select('*')
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)
      .eq('type', 'INCOME');
    
    if (monthError) {
      console.error('Erro ao buscar transações do mês:', monthError);
    } else {
      let totalRevenue = 0;
      
      console.log(`Encontradas ${monthTransactions?.length || 0} transações`);
      
      for (const tx of monthTransactions || []) {
        totalRevenue += tx.amount;
        console.log(`- ${tx.date}: ${formatCurrency(tx.amount)} (ID: ${tx.id})`);
      }
      
      console.log(`\nFaturamento total do mês: ${formatCurrency(totalRevenue)}`);
    }
    
    console.log('\nProcesso de correção concluído!');
    return true;
  } catch (error) {
    console.error('Erro durante o processo:', error);
    throw error;
  }
}

// Executar
fixAllTransactions()
  .then(() => {
    console.log('Script executado com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro na execução do script:', error);
    process.exit(1);
  });