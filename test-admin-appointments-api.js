/**
 * Script para testar a API de agendamentos administrativos diretamente
 */

import fetch from 'node-fetch';
import 'dotenv/config';

async function testAdminAppointmentsAPI() {
  const baseUrl = 'http://localhost:5000'; // URL da API local
  const apiEndpoint = '/api/admin/appointments';

  console.log(`🔍 Testando API: ${baseUrl}${apiEndpoint}`);
  
  try {
    // Fazer a requisição diretamente para a API
    const response = await fetch(`${baseUrl}${apiEndpoint}`);
    
    // Log do status e headers
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', response.headers.raw());
    
    // Se não for 200 OK, imprimir detalhes do erro
    if (response.status !== 200) {
      console.error('❌ Erro na resposta da API:');
      try {
        const errorText = await response.text();
        console.error('Mensagem de erro:', errorText);
      } catch (textError) {
        console.error('Não foi possível extrair o texto do erro:', textError);
      }
      
      console.log('\n🔍 Tentando verificar restrições de autenticação...');
      // Verificar se é um problema de autenticação
      if (response.status === 401 || response.status === 403) {
        console.log('✋ O endpoint requer autenticação. Você precisa estar logado para acessar essa rota.');
        
        // Testar endpoint público para comparação
        console.log('\nTentando um endpoint público para comparação...');
        try {
          const publicResponse = await fetch(`${baseUrl}/api/services`);
          console.log('Status endpoint público:', publicResponse.status);
          if (publicResponse.status === 200) {
            const publicData = await publicResponse.json();
            console.log(`✅ Endpoint público funcionando. Retornou ${publicData.length} serviços.`);
            console.log('Problema confirmado: O endpoint de agendamentos requer autenticação.');
          } else {
            console.log('❌ Endpoint público também está com problemas.');
          }
        } catch (publicError) {
          console.error('Erro ao testar endpoint público:', publicError);
        }
      }
      
      return;
    }
    
    // Se for 200 OK, mostrar os dados recebidos
    const data = await response.json();
    
    if (!data || !Array.isArray(data)) {
      console.log('⚠️ Resposta recebida não é um array:', data);
      return;
    }
    
    console.log(`✅ API retornou ${data.length} agendamentos.`);
    
    if (data.length > 0) {
      // Mostrar amostra dos dados
      console.log('\n📝 Amostra de agendamentos da API:');
      console.table(data.slice(0, 3).map(item => ({
        id: item.id,
        date: item.date,
        status: item.status,
        client_name: item.client_name || 'N/A',
        professional_name: item.professional_name || 'N/A'
      })));
    } else {
      console.log('⚠️ A API retornou um array vazio de agendamentos.');
      
      // Verificar no console logs recentes relacionados a agendamentos
      console.log('\n🔍 Sugestão: Verifique os logs do servidor para mais detalhes sobre o problema.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao fazer a requisição para a API:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️ Não foi possível conectar ao servidor. Verifique se a aplicação está rodando.');
    }
  }
}

testAdminAppointmentsAPI();