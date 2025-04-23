/**
 * Cliente REST para Supabase
 * 
 * Este cliente é usado quando a conexão direta com PostgreSQL falha devido a problemas de DNS
 * Ele utiliza a API REST do Supabase que é mais confiável em ambientes com restrições de rede
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Verificar configuração
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_KEY são necessários no arquivo .env');
  process.exit(1);
}

// Headers padrão para autenticação
const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

/**
 * Seleciona dados de uma tabela
 */
export async function select(table: string, select: string, filters?: Record<string, any>) {
  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}`;
    
    // Adicionar filtros se fornecidos
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url += `&${key}=${value}`;
        }
      });
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error: any) {
    console.error(`Erro ao selecionar dados da tabela ${table}:`, error.message);
    return { data: null, error };
  }
}

/**
 * Insere dados em uma tabela
 */
export async function insert(table: string, data: any) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${await response.text()}`);
    }
    
    const responseData = await response.json();
    return { data: responseData[0], error: null };
  } catch (error: any) {
    console.error(`Erro ao inserir dados na tabela ${table}:`, error.message);
    return { data: null, error };
  }
}

/**
 * Atualiza dados em uma tabela
 */
export async function update(table: string, data: any, match: Record<string, any>) {
  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    
    // Adicionar cláusulas para a correspondência
    const conditions = Object.entries(match)
      .map(([key, value]) => `${key}=eq.${value}`)
      .join('&');
    
    url += `?${conditions}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${await response.text()}`);
    }
    
    const responseData = await response.json();
    return { data: responseData[0], error: null };
  } catch (error: any) {
    console.error(`Erro ao atualizar dados na tabela ${table}:`, error.message);
    return { data: null, error };
  }
}

/**
 * Remove dados de uma tabela
 */
export async function remove(table: string, match: Record<string, any>) {
  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    
    // Adicionar cláusulas para a correspondência
    const conditions = Object.entries(match)
      .map(([key, value]) => `${key}=eq.${value}`)
      .join('&');
    
    url += `?${conditions}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { ...headers, 'Prefer': 'return=representation' }
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${await response.text()}`);
    }
    
    const responseData = await response.json();
    return { data: responseData[0], error: null };
  } catch (error: any) {
    console.error(`Erro ao remover dados da tabela ${table}:`, error.message);
    return { data: null, error };
  }
}

/**
 * Executa uma contagem em uma tabela
 */
export async function count(table: string, filters?: Record<string, any>) {
  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=count`;
    
    // Adicionar filtros se fornecidos
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url += `&${key}=${value}`;
        }
      });
    }
    
    const response = await fetch(url, { 
      headers: { ...headers, 'Prefer': 'count=exact' }
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    // Extrair o valor de contagem da resposta
    const countValue = data[0]?.count || 0;
    
    return { count: countValue, error: null };
  } catch (error: any) {
    console.error(`Erro ao contar registros na tabela ${table}:`, error.message);
    return { count: 0, error };
  }
}

export default {
  select,
  insert,
  update,
  remove,
  count
};