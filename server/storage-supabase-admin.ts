/**
 * Extensão da camada de armazenamento para funcionalidades administrativas
 * 
 * Este arquivo contém funções adicionais para operações administrativas
 * utilizando o Supabase como backend.
 */

// Importado diretamente de './storage' para evitar referência cíclica
import { createClient } from '@supabase/supabase-js';
import { eq, and, or, gte, lte, desc, sql } from 'drizzle-orm';
import * as schema from '@shared/schema';
import { db } from './db';

// Funções para atualização de serviços
export async function updateService(id: number, data: Partial<schema.InsertService>) {
  try {
    const updated = await db.update(schema.services)
      .set(data)
      .where(({ id: serviceId }) => serviceId === id)
      .returning();
    
    return updated[0];
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return null;
  }
}

export async function deleteService(id: number) {
  try {
    await db.delete(schema.services)
      .where(({ id: serviceId }) => serviceId === id);
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    return false;
  }
}

// Funções para atualização de profissionais
export async function updateProfessional(id: number, data: Partial<schema.InsertProfessional>) {
  try {
    const updated = await db.update(schema.professionals)
      .set(data)
      .where(({ id: profId }) => profId === id)
      .returning();
    
    return updated[0];
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    return null;
  }
}

export async function deleteProfessional(id: number) {
  try {
    await db.delete(schema.professionals)
      .where(({ id: profId }) => profId === id);
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir profissional:', error);
    return false;
  }
}

// Funções para atualização de produtos
export async function updateProduct(id: number, data: Partial<schema.InsertProduct>) {
  try {
    const updated = await db.update(schema.products)
      .set(data)
      .where(({ id: productId }) => productId === id)
      .returning();
    
    return updated[0];
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return null;
  }
}

export async function deleteProduct(id: number) {
  try {
    await db.delete(schema.products)
      .where(({ id: productId }) => productId === id);
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return false;
  }
}

// Funções para gerenciamento de serviços por profissional
export async function getProfessionalServices(professionalId: number) {
  try {
    // Buscar na tabela de relacionamento professional_services
    const professionalServices = await db.select()
      .from(schema.professionalServices)
      .where(({ professionalId: profId }) => profId === professionalId);
    
    // Buscar os detalhes dos serviços
    const serviceIds = professionalServices.map(ps => ps.serviceId);
    
    if (serviceIds.length === 0) {
      return [];
    }
    
    const services = await db.select()
      .from(schema.services)
      .where(({ id }) => sql`${id} IN (${serviceIds.join(',')})`);
    
    return services;
  } catch (error) {
    console.error('Erro ao buscar serviços do profissional:', error);
    return [];
  }
}

export async function addServiceToProfessional(professionalId: number, serviceId: number) {
  try {
    // Verificar se já existe este relacionamento
    const existing = await db.select()
      .from(schema.professionalServices)
      .where(
        and(
          ({ professionalId: profId }) => profId === professionalId,
          ({ serviceId: svcId }) => svcId === serviceId
        )
      );
    
    if (existing.length > 0) {
      return existing[0]; // Já existe
    }
    
    // Inserir novo relacionamento
    const inserted = await db.insert(schema.professionalServices)
      .values({ professionalId, serviceId })
      .returning();
    
    return inserted[0];
  } catch (error) {
    console.error('Erro ao adicionar serviço ao profissional:', error);
    return null;
  }
}

export async function removeServiceFromProfessional(professionalId: number, serviceId: number) {
  try {
    await db.delete(schema.professionalServices)
      .where(
        and(
          ({ professionalId: profId }) => profId === professionalId,
          ({ serviceId: svcId }) => svcId === serviceId
        )
      );
    
    return true;
  } catch (error) {
    console.error('Erro ao remover serviço do profissional:', error);
    return false;
  }
}

// Funções para gerenciamento de bloqueios de agenda
export async function blockTime(professionalId: number, date: string, startTime: string, endTime: string) {
  try {
    const inserted = await db.insert(schema.blockedTimes)
      .values({
        professionalId,
        date,
        startTime,
        endTime,
        reason: 'Bloqueado pelo profissional'
      })
      .returning();
    
    return inserted[0];
  } catch (error) {
    console.error('Erro ao bloquear horário:', error);
    return null;
  }
}

export async function unblockTime(id: number) {
  try {
    await db.delete(schema.blockedTimes)
      .where(({ id: blockId }) => blockId === id);
    
    return true;
  } catch (error) {
    console.error('Erro ao desbloquear horário:', error);
    return false;
  }
}

// Funções para fluxo de caixa
export async function createCashFlowTransaction(data: schema.InsertCashFlow) {
  try {
    const inserted = await db.insert(schema.cashFlow)
      .values(data)
      .returning();
    
    return inserted[0];
  } catch (error) {
    console.error('Erro ao criar transação de fluxo de caixa:', error);
    return null;
  }
}

export async function getCashFlowTransactions(
  startDate?: string,
  endDate?: string,
  type?: string,
  category?: string
) {
  try {
    let query = db.select().from(schema.cashFlow);
    
    const conditions = [];
    
    if (startDate) {
      conditions.push(({ date }) => date >= startDate);
    }
    
    if (endDate) {
      conditions.push(({ date }) => date <= endDate);
    }
    
    if (type) {
      conditions.push(({ transactionType }) => transactionType === type);
    }
    
    if (category) {
      conditions.push(({ category: cat }) => cat === category);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(schema.cashFlow.date));
  } catch (error) {
    console.error('Erro ao buscar transações de fluxo de caixa:', error);
    return [];
  }
}

export async function getCashFlowSummary(startDate?: string, endDate?: string) {
  try {
    // Buscar todas as transações no período
    const transactions = await getCashFlowTransactions(startDate, endDate);
    
    // Calcular totais
    const incomes = transactions
      .filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Agrupar por categoria
    const categoriesMap: Record<string, { income: number, expense: number }> = {};
    
    transactions.forEach(t => {
      if (!categoriesMap[t.category]) {
        categoriesMap[t.category] = { income: 0, expense: 0 };
      }
      
      if (t.transactionType === 'income') {
        categoriesMap[t.category].income += t.amount;
      } else {
        categoriesMap[t.category].expense += t.amount;
      }
    });
    
    const categories = Object.entries(categoriesMap).map(([category, values]) => ({
      category,
      income: values.income,
      expense: values.expense,
      balance: values.income - values.expense
    }));
    
    return {
      totalIncome: incomes,
      totalExpense: expenses,
      balance: incomes - expenses,
      categories,
      period: {
        start: startDate || 'início',
        end: endDate || 'atual'
      }
    };
  } catch (error) {
    console.error('Erro ao gerar resumo financeiro:', error);
    return null;
  }
}

// Funções para gerenciamento de fidelidade
export async function addLoyaltyPoints(userId: number, points: number) {
  try {
    // Buscar usuário atual usando o db diretamente
    const users = await db.select().from(schema.users).where(eq(schema.users.id, userId));
    const user = users[0];
    
    if (!user) {
      return null;
    }
    
    // Calcular novos pontos
    const currentPoints = user.loyaltyPoints || 0;
    const newPoints = currentPoints + points;
    
    // Atualizar usuário
    const updated = await db.update(schema.users)
      .set({
        loyaltyPoints: newPoints,
        updatedAt: new Date().toISOString()
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    // Criar registro de histórico de pontos - temporariamente comentado até schema ser atualizado
    /*
    await db.insert(schema.loyaltyHistory)
      .values({
        userId,
        points,
        description: `Pontos adicionados por serviço concluído`,
        date: new Date().toISOString()
      });
    */
    
    return updated[0];
  } catch (error) {
    console.error('Erro ao adicionar pontos de fidelidade:', error);
    return null;
  }
}

// Inicialização do sistema administrativo
export async function initializeAdminSystem(userId: number) {
  try {
    // Verificar se o usuário existe
    const users = await db.select().from(schema.users).where(eq(schema.users.id, userId));
    const user = users[0];
    
    if (!user) {
      return { success: false, message: 'Usuário não encontrado' };
    }
    
    // Atualizar o papel do usuário para administrador
    const updated = await db.update(schema.users)
      .set({
        role: 'ADMIN',
        updatedAt: new Date().toISOString()
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    if (!updated || updated.length === 0) {
      return { success: false, message: 'Erro ao atualizar o papel do usuário' };
    }
    
    return {
      success: true,
      message: 'Sistema administrativo inicializado com sucesso',
      user: updated[0]
    };
  } catch (error) {
    console.error('Erro ao inicializar sistema administrativo:', error);
    return { success: false, message: 'Erro ao inicializar o sistema administrativo' };
  }
}

// Exportação das funções administrativas
const adminFunctions = {
  updateService,
  deleteService,
  updateProfessional,
  deleteProfessional,
  updateProduct,
  deleteProduct,
  getProfessionalServices,
  addServiceToProfessional,
  removeServiceFromProfessional,
  blockTime,
  unblockTime,
  createCashFlowTransaction,
  getCashFlowTransactions,
  getCashFlowSummary,
  addLoyaltyPoints,
  initializeAdminSystem
};

export default adminFunctions;