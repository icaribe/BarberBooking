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
const client = postgres(DATABASE_URL);
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
    let johnataSql = `
      SELECT * FROM users WHERE email = 'johnata@example.com' LIMIT 1;
    `;
    let johnataResult = await client.query(johnataSql);
    let johnataUser = johnataResult.length > 0 ? johnataResult[0] : null;
    
    if (!johnataUser) {
      console.log("Criando usuário para Johnata...");
      // Criar senha criptografada
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('senha123', salt);
      
      // Inserir usuário
      let insertSql = `
        INSERT INTO users 
          (name, email, phone, password, role) 
        VALUES 
          ('Johnata', 'johnata@example.com', '(22) 99999-9999', $1, $2)
        RETURNING *;
      `;
      johnataResult = await client.query(insertSql, [hashedPassword, UserRole.ADMIN]);
      johnataUser = johnataResult[0];
      console.log("Usuário Johnata criado com sucesso!");
    } else {
      console.log("Johnata já existe, atualizando para ADMIN...");
      // Atualizar para role ADMIN
      let updateSql = `
        UPDATE users 
        SET role = $1
        WHERE id = $2
        RETURNING *;
      `;
      johnataResult = await client.query(updateSql, [UserRole.ADMIN, johnataUser.id]);
      johnataUser = johnataResult[0];
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
      let userSql = `
        SELECT * FROM users WHERE email = $1 LIMIT 1;
      `;
      let userResult = await client.query(userSql, [email]);
      let professionalUser = userResult.length > 0 ? userResult[0] : null;
      
      if (!professionalUser) {
        console.log(`Criando usuário para profissional: ${professional.name}`);
        // Criar senha criptografada
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('senha123', salt);
        
        // Inserir usuário
        let insertSql = `
          INSERT INTO users 
            (name, email, phone, password, role, professional_id) 
          VALUES 
            ($1, $2, $3, $4, $5, $6)
          RETURNING *;
        `;
        await client.query(
          insertSql, 
          [
            professional.name, 
            email, 
            professional.phone || '(00) 00000-0000', 
            hashedPassword, 
            UserRole.PROFESSIONAL,
            professional.id
          ]
        );
        console.log(`Usuário para profissional ${professional.name} criado com sucesso!`);
      } else {
        console.log(`Usuário para profissional ${professional.name} já existe, atualizando role e professionalId...`);
        // Atualizar para role PROFESSIONAL e associar ao profissional
        let updateSql = `
          UPDATE users 
          SET role = $1, professional_id = $2
          WHERE id = $3
          RETURNING *;
        `;
        await client.query(updateSql, [UserRole.PROFESSIONAL, professional.id, professionalUser.id]);
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