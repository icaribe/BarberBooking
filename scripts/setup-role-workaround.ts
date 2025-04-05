/**
 * Script para configurar a tabela user_roles
 * 
 * Este script cria uma tabela alternativa para armazenar os papéis
 * dos usuários quando não é possível modificar a tabela users.
 */

import supabase from '../server/supabase';
import { setUserRole, UserRole } from '../shared/role-workaround';
import { db } from '../server/db';

/**
 * Função para criar a tabela user_roles
 */
async function createUserRolesTable() {
  try {
    // Criar a tabela user_roles (usando IF NOT EXISTS para evitar erros se já existir)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        role TEXT NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Tabela user_roles criada ou já existente.');
    return true;
  } catch (error) {
    console.error('Erro ao criar tabela user_roles:', error);
    return false;
  }
}

/**
 * Função para definir papéis iniciais para usuários
 */
async function setupInitialRoles() {
  try {
    // Buscar todos os usuários
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, professional_id');
    
    if (usersError) {
      console.error('Erro ao buscar usuários:', usersError);
      return false;
    }
    
    if (!users || users.length === 0) {
      console.log('Nenhum usuário encontrado.');
      return true;
    }
    
    console.log(`Configurando papéis para ${users.length} usuários...`);
    
    // Identificar o administrador (Johnata)
    const adminEmail = 'johnatanlima26@gmail.com';
    const admin = users.find(user => user.email === adminEmail);
    
    if (admin) {
      console.log(`Configurando ${admin.email} como ADMIN...`);
      await setUserRole(admin.id, UserRole.ADMIN);
    } else {
      console.log(`Administrador com email ${adminEmail} não encontrado.`);
    }
    
    // Configurar profissionais
    for (const user of users) {
      if (user.professional_id) {
        console.log(`Configurando ${user.email} como PROFESSIONAL...`);
        await setUserRole(user.id, UserRole.PROFESSIONAL);
      }
    }
    
    // Os demais usuários são automaticamente clientes pelo valor padrão
    
    console.log('Configuração de papéis concluída com sucesso.');
    return true;
  } catch (error) {
    console.error('Erro ao configurar papéis iniciais:', error);
    return false;
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    console.log('Iniciando configuração do sistema de papéis alternativo...');
    
    const tableCreated = await createUserRolesTable();
    if (!tableCreated) {
      console.error('Falha ao criar tabela de papéis. Abortando...');
      return;
    }
    
    const rolesSetup = await setupInitialRoles();
    if (!rolesSetup) {
      console.error('Falha ao configurar papéis iniciais. Abortando...');
      return;
    }
    
    console.log('Configuração do sistema de papéis concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a execução do script:', error);
  }
}

main();