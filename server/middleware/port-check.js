/**
 * Utilitário para verificar se uma porta está em uso
 * e encontrar uma porta disponível alternativa se necessário
 */
const net = require('net');

/**
 * Verifica se uma porta está em uso
 * @param {number} port - Porta a ser verificada
 * @returns {Promise<boolean>} - true se a porta estiver em uso, false caso contrário
 */
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => {
        // A porta está em uso
        resolve(true);
      })
      .once('listening', () => {
        // A porta está livre
        server.close();
        resolve(false);
      })
      .listen(port, '0.0.0.0');
  });
}

/**
 * Encontra uma porta disponível a partir de uma porta base
 * @param {number} basePort - Porta de início para a verificação
 * @param {number} maxAttempts - Número máximo de tentativas (incrementando a porta)
 * @returns {Promise<number>} - Retorna a primeira porta disponível encontrada
 */
async function findAvailablePort(basePort, maxAttempts = 10) {
  let port = basePort;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      return port;
    }
    
    // Tentar a próxima porta
    console.log(`Porta ${port} está em uso, tentando ${port + 1}...`);
    port++;
    attempts++;
  }
  
  // Se não encontrar nenhuma porta disponível, retorna a última verificada
  console.warn(`Não foi possível encontrar uma porta disponível após ${maxAttempts} tentativas.`);
  return port;
}

module.exports = {
  isPortInUse,
  findAvailablePort
};