/**
 * Script para validar a API do fluxo de caixa via requisições HTTP
 * Esta abordagem evita problemas de compatibilidade de módulos
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const API_ENDPOINTS = {
  auth: `${BASE_URL}/api/auth/login`,
  appointments: `${BASE_URL}/api/appointments`,
  completedAppointments: `${BASE_URL}/api/admin/appointments?status=completed`,
  cashFlow: `${BASE_URL}/api/admin/cash-flow`,
  adminAppointmentById: (id) => `${BASE_URL}/api/admin/appointments/${id}`
};

// Dados para autenticação
const AUTH_DATA = {
  username: 'admin',
  password: 'admin123'
};

async function validateApi() {
  console.log('=== VALIDANDO API DE FLUXO DE CAIXA ===\n');
  
  try {
    // 1. Tentar autenticar como admin
    console.log('Autenticando como admin...');
    let token;
    
    try {
      const authResponse = await fetch(API_ENDPOINTS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(AUTH_DATA)
      });
      
      if (!authResponse.ok) {
        console.log('Não foi possível autenticar. Continuando sem token...');
      } else {
        const authData = await authResponse.json();
        token = authData.token;
        console.log('Autenticado com sucesso!');
      }
    } catch (authError) {
      console.log('Erro na autenticação, continuando sem token...');
    }
    
    const headers = token 
      ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
    
    // 2. Buscar agendamentos concluídos
    console.log('\nBuscando agendamentos concluídos...');
    const appointmentsResponse = await fetch(API_ENDPOINTS.completedAppointments, { headers });
    
    if (!appointmentsResponse.ok) {
      console.error(`Erro ao buscar agendamentos: ${appointmentsResponse.status} ${appointmentsResponse.statusText}`);
      const errorText = await appointmentsResponse.text();
      console.error(`Detalhes: ${errorText}`);
      return;
    }
    
    const appointments = await appointmentsResponse.json();
    console.log(`Encontrados ${appointments.length} agendamentos concluídos`);
    
    if (appointments.length === 0) {
      console.log('Nenhum agendamento concluído para verificar. O teste será encerrado.');
      return;
    }
    
    // 3. Buscar transações de fluxo de caixa
    console.log('\nBuscando transações de fluxo de caixa...');
    const cashFlowResponse = await fetch(API_ENDPOINTS.cashFlow, { headers });
    
    if (!cashFlowResponse.ok) {
      console.error(`Erro ao buscar fluxo de caixa: ${cashFlowResponse.status} ${cashFlowResponse.statusText}`);
      const errorText = await cashFlowResponse.text();
      console.error(`Detalhes: ${errorText}`);
      return;
    }
    
    const transactions = await cashFlowResponse.json();
    console.log(`Encontradas ${transactions.length} transações no fluxo de caixa`);
    
    // 4. Verificar quais agendamentos concluídos têm transações associadas
    console.log('\nVerificando integração entre agendamentos e fluxo de caixa...');
    
    let appointmentsWithTransactions = 0;
    let appointmentsWithoutTransactions = 0;
    
    for (const appointment of appointments) {
      process.stdout.write(`\nAgendamento #${appointment.id} (${new Date(appointment.date).toLocaleDateString('pt-BR')}): `);
      
      const associatedTransactions = transactions.filter(t => t.appointment_id === appointment.id);
      
      if (associatedTransactions.length > 0) {
        console.log(`✓ (${associatedTransactions.length} transação(ões) encontrada(s))`);
        appointmentsWithTransactions++;
        
        // Mostrar detalhes da transação
        for (const transaction of associatedTransactions) {
          console.log(`  - ID: ${transaction.id}`);
          console.log(`  - Valor: R$ ${parseFloat(transaction.amount).toFixed(2)}`);
          console.log(`  - Data: ${new Date(transaction.date).toLocaleDateString('pt-BR')}`);
          console.log(`  - Descrição: ${transaction.description}`);
        }
      } else {
        console.log('✗ (Sem transações associadas)');
        appointmentsWithoutTransactions++;
      }
    }
    
    // 5. Resumo final
    console.log('\n=== RESUMO DA VALIDAÇÃO ===');
    console.log(`Total de agendamentos concluídos: ${appointments.length}`);
    console.log(`Agendamentos com transações: ${appointmentsWithTransactions} (${Math.round((appointmentsWithTransactions/appointments.length)*100)}%)`);
    console.log(`Agendamentos sem transações: ${appointmentsWithoutTransactions} (${Math.round((appointmentsWithoutTransactions/appointments.length)*100)}%)`);
    
    if (appointmentsWithoutTransactions > 0) {
      console.log('\nAlguns agendamentos concluídos não possuem transações associadas.');
      console.log('Isso pode indicar um problema na integração entre módulos.');
    } else if (appointments.length > 0) {
      console.log('\nTodos os agendamentos concluídos possuem transações associadas!');
      console.log('A integração entre agendamentos e fluxo de caixa parece estar funcionando corretamente.');
    }
    
  } catch (error) {
    console.error('Erro durante a validação:', error);
  }
}

// Executar validação
validateApi().catch(console.error);