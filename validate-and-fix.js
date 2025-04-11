
import { validateAndFixTransactions } from './server/cash-flow-manager.ts';

validateAndFixTransactions()
  .then(() => {
    console.log('Processo concluído com sucesso');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro:', error);
    process.exit(1);
  });
