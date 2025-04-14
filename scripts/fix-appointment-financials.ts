/**
 * Script para corrigir os registros financeiros dos agendamentos completados
 * 
 * Este script vai verificar todos os agendamentos marcados como "COMPLETED"
 * e garantir que cada um deles tenha uma entrada correspondente na tabela de fluxo de caixa.
 */

import * as cashFlowManager from '../server/cash-flow-manager';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function main() {
  console.log('Iniciando correção de registros financeiros dos agendamentos...');
  
  try {
    // Executar a validação e correção de transações
    await cashFlowManager.validateAndFixTransactions();
    console.log('Correção concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao corrigir registros financeiros:', error);
    process.exit(1);
  }
}

main();