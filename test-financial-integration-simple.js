/**
 * Script simplificado para testar a integração financeira
 * usando os módulos existentes cash-flow-manager.ts
 */

import supabase from './server/supabase.js';

async function testCashFlowIntegration() {
  try {
    console.log('Testando integração de fluxo de caixa com agendamentos...');
    
    // 1. Buscar agendamentos com status 'completed'
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        status,
        appointment_services (
          service_id,
          services (
            id,
            name,
            price
          )
        )
      `)
      .eq('status', 'completed')
      .order('date', { ascending: false })
      .limit(5); // Limitar para exemplo
    
    if (error) {
      throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
    }
    
    console.log(`Encontrados ${appointments.length} agendamentos concluídos`);
    
    // 2. Para cada agendamento, verificar se já existe uma transação
    for (const appointment of appointments) {
      console.log(`\nVerificando agendamento #${appointment.id} (${new Date(appointment.date).toLocaleDateString()})`);
      
      // Buscar transações existentes para este agendamento
      const { data: existingTransactions } = await supabase
        .from('cash_flow')
        .select('*')
        .eq('appointment_id', appointment.id);
      
      if (existingTransactions && existingTransactions.length > 0) {
        console.log(`  ✓ Transação já existe: ID #${existingTransactions[0].id}, valor R$ ${parseFloat(existingTransactions[0].amount).toFixed(2)}`);
        continue;
      }
      
      console.log('  ✗ Nenhuma transação encontrada para este agendamento');
      
      // 3. Processar serviços e criar transação se necessário
      if (!appointment.appointment_services || appointment.appointment_services.length === 0) {
        console.log('  ✗ Nenhum serviço associado a este agendamento');
        continue;
      }
      
      // Formatar serviços para registrar transação
      const formattedServices = appointment.appointment_services.map(as => ({
        id: as.service_id,
        name: as.services?.name || 'Serviço não identificado',
        price: as.services?.price || 0
      }));
      
      // Calcular valor total
      const totalValue = formattedServices.reduce((sum, service) => sum + parseFloat(service.price), 0);
      console.log(`  Serviços: ${formattedServices.map(s => s.name).join(', ')}`);
      console.log(`  Valor total: R$ ${totalValue.toFixed(2)}`);
      
      // Criar transação
      const transactionDate = new Date(appointment.date);
      const { data: newTransaction, error: createError } = await supabase
        .from('cash_flow')
        .insert({
          date: transactionDate.toISOString().split('T')[0],
          amount: totalValue.toString(),
          type: 'income',
          description: `Serviços: ${formattedServices.map(s => s.name).join(', ')}`,
          appointment_id: appointment.id,
          category: 'service',
          created_by_id: 1 // Admin padrão
        })
        .select()
        .single();
      
      if (createError) {
        console.error(`  ✗ Erro ao criar transação: ${createError.message}`);
        continue;
      }
      
      console.log(`  ✓ Transação criada com sucesso: ID #${newTransaction.id}, Valor: R$ ${parseFloat(newTransaction.amount).toFixed(2)}`);
    }
    
    console.log('\nTeste concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o teste:', error);
  }
}

testCashFlowIntegration().catch(console.error);