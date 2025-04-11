
import { validateAndFixTransactions } from './server/cash-flow-manager.ts';

console.log('Iniciando validação e correção de transações...');

validateAndFixTransactions()
  .then(() => {
    console.log('Processo concluído com sucesso');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro:', error);
    process.exit(1);
  });
