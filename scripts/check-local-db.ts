
import { db } from '../server/db';
import * as schema from '../shared/schema';

async function checkLocalData() {
  console.log('Verificando dados no banco local...');

  try {
    // Verificar usuários
    const users = await db.select().from(schema.users);
    console.log(`Usuários: ${users.length} registros`);
    
    // Verificar categorias de serviços
    const serviceCategories = await db.select().from(schema.serviceCategories);
    console.log(`Categorias de serviços: ${serviceCategories.length} registros`);
    
    // Verificar serviços
    const services = await db.select().from(schema.services);
    console.log(`Serviços: ${services.length} registros`);
    
    // Verificar profissionais
    const professionals = await db.select().from(schema.professionals);
    console.log(`Profissionais: ${professionals.length} registros`);
    
    // Verificar horários
    const schedules = await db.select().from(schema.schedules);
    console.log(`Horários: ${schedules.length} registros`);
    
    // Verificar agendamentos
    const appointments = await db.select().from(schema.appointments);
    console.log(`Agendamentos: ${appointments.length} registros`);
    
    // Verificar serviços de agendamento
    const appointmentServices = await db.select().from(schema.appointmentServices);
    console.log(`Serviços de agendamento: ${appointmentServices.length} registros`);
    
    // Verificar categorias de produtos
    const productCategories = await db.select().from(schema.productCategories);
    console.log(`Categorias de produtos: ${productCategories.length} registros`);
    
    // Verificar produtos
    const products = await db.select().from(schema.products);
    console.log(`Produtos: ${products.length} registros`);
    
    // Verificar recompensas de fidelidade
    const loyaltyRewards = await db.select().from(schema.loyaltyRewards);
    console.log(`Recompensas de fidelidade: ${loyaltyRewards.length} registros`);
    
    console.log('Verificação concluída!');
  } catch (error) {
    console.error('Erro ao verificar dados locais:', error);
  }
}

checkLocalData();
