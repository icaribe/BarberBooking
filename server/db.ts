
import { drizzle } from 'drizzle-orm/postgres-js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import supabase from './supabase';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

let db: PostgresJsDatabase<typeof schema>;

// Conexão com o banco de dados Supabase usando pooler
const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error('❌ Erro: DATABASE_URL é necessário como variável de ambiente');
}

// Configuração do cliente Postgres com SSL necessário para Supabase
const queryClient = postgres(connectionString, {
  ssl: 'require',
  max: 10, // Número máximo de conexões no pool
  idle_timeout: 30, // Tempo em segundos para manter conexões ociosas
});

// Inicializar o Drizzle ORM com o cliente Postgres
db = drizzle(queryClient, { schema });

export { db };
