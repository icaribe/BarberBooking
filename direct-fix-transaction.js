/**
 * Script para corrigir valores incorretos na tabela de fluxo de caixa
 * Versão com acesso direto à API Supabase
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config();

// Formatar moeda
const formatCurrency = (valueInCents) => `R$ ${(valueInCents/100).toFixed(2)}`;

// Criar cliente Supabase diretamente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTransactionAmount() {
  try {
    console.log('Iniciando correção de valores de transações...');
    console.log(`Conectado ao Supabase: ${supabaseUrl}`);
    
    // Buscar todas as transações com valores muito baixos (provavelmente em reais, não centavos)
    const { data: suspiciousTransactions, error: txError } = await supabase
      .from('cash_flow')
      .select('*')
      .gt('amount', 0)
      .lt('amount', 100);
      
    if (txError) {
      console.error('Erro ao buscar transações suspeitas:', txError);
      return;
    }
    
    console.log(`\nEncontradas ${suspiciousTransactions?.length || 0} transações suspeitas (valores muito baixos)`);
    
    if (!suspiciousTransactions || suspiciousTransactions.length === 0) {
      console.log('Nenhuma transação suspeita encontrada, finalizando.');
      return;
    }
    
    // Processar cada transação suspeita
    for (const tx of suspiciousTransactions) {
      console.log(`\n--- Analisando transação ID: ${tx.id} ---`);
      console.log(`Valor atual: ${formatCurrency(tx.amount)}, Data: ${tx.date}`);
      console.log(`Descrição: ${tx.description}`);
      
      // Se está vinculada a um agendamento, podemos verificar o valor correto
      if (tx.appointment_id) {
        console.log(`Vinculada ao agendamento ID: ${tx.appointment_id}`);
        
        // Buscar serviços do agendamento
        const { data: appointmentServices, error: asError } = await supabase
          .from('appointment_services')
          .select('*')
          .eq('appointment_id', tx.appointment_id);
        
        if (asError) {
          console.log(`Erro ao buscar serviços: ${asError.message}`);
          continue;
        }
        
        if (!appointmentServices || appointmentServices.length === 0) {
          console.log(`Nenhum serviço encontrado para o agendamento ${tx.appointment_id}, pulando.`);
          continue;
        }
        
        console.log(`Serviços encontrados: ${appointmentServices.length}`);
        
        // Buscar detalhes de cada serviço
        let serviceTotal = 0;
        let serviceDetails = [];
        
        for (const as of appointmentServices) {
          const { data: service, error: svcError } = await supabase
            .from('services')
            .select('*')
            .eq('id', as.service_id)
            .single();
          
          if (svcError) {
            console.log(`Erro ao buscar serviço ${as.service_id}: ${svcError.message}`);
            continue;
          }
          
          console.log(`- ${service.name}: ${formatCurrency(service.price)}`);
          serviceTotal += service.price;
          serviceDetails.push(service);
        }
        
        console.log(`\nValor total dos serviços: ${formatCurrency(serviceTotal)}`);
        console.log(`Valor atual na transação: ${formatCurrency(tx.amount)}`);
        
        // Transações suspeitas têm valor em reais onde deveria ser centavos
        // Exemplo: 7.00 reais (valor em centavos deveria ser 700)
        if (tx.amount < 100 && serviceTotal >= 100) {
          const correctedAmount = Math.round(tx.amount * 100);
          console.log(`Valor corrigido (convertendo de reais para centavos): ${formatCurrency(correctedAmount)}`);
          
          // Se o valor corrigido se aproxima do valor total dos serviços, corrigir
          if (Math.abs(correctedAmount - serviceTotal) < serviceTotal * 0.1) { // Tolerância de 10%
            console.log('✓ Valor corrigido corresponde ao total dos serviços, atualizando...');
            
            const { data: updateResult, error: updateError } = await supabase
              .from('cash_flow')
              .update({ amount: correctedAmount })
              .eq('id', tx.id)
              .select();
            
            if (updateError) {
              console.error(`Erro ao atualizar transação: ${updateError.message}`);
            } else {
              console.log('✅ Transação atualizada com sucesso!');
              console.log(`Valor anterior: ${formatCurrency(tx.amount)}`);
              console.log(`Novo valor: ${formatCurrency(correctedAmount)}`);
            }
          } else {
            console.log('❌ Valor corrigido não corresponde ao total dos serviços, não será atualizado automaticamente.');
            console.log(`Diferença: ${formatCurrency(Math.abs(correctedAmount - serviceTotal))}`);
          }
        } else {
          console.log('Transação não parece ter um erro de conversão simples, não será corrigida automaticamente.');
        }
      }
    }
    
    console.log('\nProcesso de correção concluído.');
    return true;
  } catch (error) {
    console.error('Erro durante o processo de correção:', error);
    throw error;
  }
}

// Executar o script
fixTransactionAmount()
  .then(() => {
    console.log('\nScript finalizado com sucesso.');
    process.exit(0);
  })
  .catch(error => {
    console.error('\nErro durante a execução do script:', error);
    process.exit(1);
  });