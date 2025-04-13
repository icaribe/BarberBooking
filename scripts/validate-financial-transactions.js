/**
 * Script para validar e sincronizar transações financeiras dos agendamentos concluídos
 * 
 * Este script faz o seguinte:
 * 1. Busca todos os agendamentos com status "completed"
 * 2. Para cada agendamento, verifica se existe uma transação correspondente na tabela cash_flow
 * 3. Se não existir, cria a transação automaticamente com base nos serviços do agendamento
 */
const { createPool } = require('pg');
require('dotenv').config();

async function validateFinancialTransactions() {
  try {
    console.log('Iniciando validação de transações financeiras...');
    
    // Conectar ao banco de dados
    const pool = createPool({
      connectionString: process.env.DATABASE_URL,
    });
    
    // 1. Buscar todos os agendamentos com status "completed"
    const { rows: completedAppointments } = await pool.query(`
      SELECT a.id, a.date, a.status, a.user_id, a.professional_id
      FROM appointments a
      WHERE a.status = 'completed'
    `);
    
    console.log(`Encontrados ${completedAppointments.length} agendamentos concluídos.`);
    
    // 2. Para cada agendamento, verificar transações financeiras
    let createdTransactions = 0;
    
    for (const appointment of completedAppointments) {
      // Verificar se já existe uma transação para este agendamento
      const { rows: existingTransactions } = await pool.query(`
        SELECT * FROM cash_flow WHERE appointment_id = $1
      `, [appointment.id]);
      
      if (existingTransactions.length > 0) {
        console.log(`Agendamento #${appointment.id}: Transação já existe.`);
        continue;
      }
      
      // Buscar serviços do agendamento
      const { rows: appointmentServices } = await pool.query(`
        SELECT as.service_id, s.name, s.price
        FROM appointment_services as
        JOIN services s ON as.service_id = s.id
        WHERE as.appointment_id = $1
      `, [appointment.id]);
      
      if (appointmentServices.length === 0) {
        console.log(`Agendamento #${appointment.id}: Nenhum serviço encontrado.`);
        continue;
      }
      
      // Calcular valor total da transação
      const totalValue = appointmentServices.reduce((sum, service) => sum + parseFloat(service.price || 0), 0);
      
      // Criar nova transação na tabela cash_flow
      const now = new Date();
      const description = `Pagamento de serviços: ${appointmentServices.map(s => s.name).join(', ')}`;
      
      await pool.query(`
        INSERT INTO cash_flow (
          date, 
          amount, 
          type, 
          description, 
          appointment_id, 
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        appointment.date, 
        totalValue, 
        'INCOME', 
        description, 
        appointment.id, 
        now
      ]);
      
      console.log(`Agendamento #${appointment.id}: Transação criada com valor R$ ${totalValue.toFixed(2)}`);
      createdTransactions++;
    }
    
    console.log(`\nResume:`);
    console.log(`Total de agendamentos verificados: ${completedAppointments.length}`);
    console.log(`Transações criadas: ${createdTransactions}`);
    console.log('\nValidação de transações financeiras concluída com sucesso.');
    
    // Fechar conexão com banco de dados
    await pool.end();
  } catch (error) {
    console.error('Erro durante validação de transações financeiras:', error);
    process.exit(1);
  }
}

// Executar função principal
validateFinancialTransactions();