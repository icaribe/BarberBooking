/**
 * Script para configurar usuários administrativos e profissionais
 * 
 * Este script configura Johnata como usuário administrador e cria contas
 * para todos os profissionais existentes.
 */

import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';
import { eq, sql } from 'drizzle-orm';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const DATABASE_URL = process.env.DATABASE_URL!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !DATABASE_URL) {
  console.error("Erro: Variáveis de ambiente SUPABASE_URL, SUPABASE_SERVICE_KEY ou DATABASE_URL não definidas");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
// Configure postgres with SSL
const client = postgres(DATABASE_URL, { ssl: 'require' });
const db = drizzle(client);

enum UserRole {
  USER = 'USER',
  PROFESSIONAL = 'PROFESSIONAL',
  ADMIN = 'ADMIN'
}

async function setupAdminAndProfessionals() {
  console.log("Configurando usuários administrativos e profissionais...");
  
  try {
    // Buscar o usuário Johnata (ou criar se não existir)
    console.log("Verificando se Johnata já existe como usuário...");
    const johnataUsers = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, 'johnata@example.com'))
      .limit(1);
    
    let johnataUser = johnataUsers.length > 0 ? johnataUsers[0] : null;
    
    if (!johnataUser) {
      console.log("Criando usuário para Johnata...");
      // Criar senha criptografada
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('senha123', salt);
      
      // Inserir usuário
      const insertedUsers = await db.insert(schema.users)
        .values({
          name: 'Johnata',
          email: 'johnata@example.com',
          phone: '(22) 99999-9999',
          password: hashedPassword,
          role: UserRole.ADMIN
        })
        .returning();
      
      johnataUser = insertedUsers[0];
      console.log("Usuário Johnata criado com sucesso!");
    } else {
      console.log("Johnata já existe, atualizando para ADMIN...");
      // Atualizar para role ADMIN
      const updatedUsers = await db.update(schema.users)
        .set({ role: UserRole.ADMIN })
        .where(eq(schema.users.id, johnataUser.id))
        .returning();
      
      johnataUser = updatedUsers[0];
      console.log("Usuário Johnata atualizado com sucesso!");
    }
    
    // Buscar todos os profissionais
    console.log("Buscando todos os profissionais...");
    const professionals = await db.select().from(schema.professionals);
    
    // Para cada profissional, verificar se existe um usuário
    for (const professional of professionals) {
      console.log(`Verificando usuário para profissional: ${professional.name}`);
      
      // Verificar se já existe um usuário com o e-mail do profissional
      const email = `${professional.name.toLowerCase().replace(/\s/g, '')}@losbarbeiros.com.br`;
      const professionalUsers = await db.select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);
      
      let professionalUser = professionalUsers.length > 0 ? professionalUsers[0] : null;
      
      if (!professionalUser) {
        console.log(`Criando usuário para profissional: ${professional.name}`);
        // Criar senha criptografada
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('senha123', salt);
        
        // Inserir usuário
        await db.insert(schema.users)
          .values({
            name: professional.name,
            email: email,
            phone: professional.phone || '(00) 00000-0000',
            password: hashedPassword,
            role: UserRole.PROFESSIONAL,
            professionalId: professional.id
          });
        
        console.log(`Usuário para profissional ${professional.name} criado com sucesso!`);
      } else {
        console.log(`Usuário para profissional ${professional.name} já existe, atualizando role e professionalId...`);
        // Atualizar para role PROFESSIONAL e associar ao profissional
        await db.update(schema.users)
          .set({ 
            role: UserRole.PROFESSIONAL, 
            professionalId: professional.id 
          })
          .where(eq(schema.users.id, professionalUser.id));
        
        console.log(`Usuário para profissional ${professional.name} atualizado com sucesso!`);
      }
    }
    
    console.log("Configuração de usuários concluída com sucesso!");
  } catch (error) {
    console.error("Erro ao configurar usuários:", error);
  } finally {
    // Fechar conexão com o banco
    await client.end();
  }
}

// Executar o script
setupAdminAndProfessionals();