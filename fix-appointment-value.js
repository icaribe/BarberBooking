/**
 * Script para corrigir o valor do serviço "Acabamento (Pezinho)" na tabela cash_flow
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

async function fixAppointmentValue() {
  try {
    console.log('Iniciando correção do valor para o serviço Acabamento (Pezinho)...');
    
    // 1. Primeiro, buscar a transação específica com o valor baixo (7.00)
    console.log('Buscando transações com valores muito baixos (< R$ 10,00)...');
    
    const { data: lowValueTransactions, error: txError } = await supabase
      .from('cash_flow')
      .select('*')
      .gt('amount', 0)
      .lt('amount', 1000); // Menos de R$ 10,00 (1000 centavos)
    
    if (txError) {
      console.error('Erro ao buscar transações:', txError);
      throw txError;
    }
    
    console.log(`Encontradas ${lowValueTransactions?.length || 0} transações com valores baixos`);
    
    // Mostrar detalhes de cada transação
    for (const tx of lowValueTransactions || []) {
      console.log(`\nID: ${tx.id}`);
      console.log(`Valor: ${formatCurrency(tx.amount)} (${tx.amount} centavos)`);
      console.log(`Data: ${tx.date}`);
      console.log(`Descrição: ${tx.description}`);
      console.log(`Agendamento: ${tx.appointment_id || 'Nenhum'}`);
      
      // Se for da ordem de 7-10, vamos corrigir para 700-1000
      if (tx.amount >= 5 && tx.amount < 20) {
        console.log('Este valor parece estar em reais em vez de centavos. Corrigindo...');
        
        // Se for 7, converter para 700 centavos
        const newAmount = tx.amount * 100;
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
          
          // Verificar a atualização
          const { data: verifyData } = await supabase
            .from('cash_flow')
            .select('*')
            .eq('id', tx.id)
            .single();
          
          if (verifyData) {
            console.log(`Verificação: Valor atual = ${formatCurrency(verifyData.amount)}`);
          }
        }
      }
    }
    
    // 2. Verificar o faturamento mensal após a correção
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
    
    console.log('\nProcesso concluído!');
    return true;
  } catch (error) {
    console.error('Erro durante o processo:', error);
    throw error;
  }
}

// Executar
fixAppointmentValue()
  .then(() => {
    console.log('Script executado com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro na execução do script:', error);
    process.exit(1);
  });